import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { CheckCircle2, Copy, ExternalLink, RefreshCw, Smartphone, WalletCards } from 'lucide-react';
import { api, moneyFromCents } from '../services/api';
import { useAuth } from '../context/AuthContext';

const METHODS = [
  { code: 'ecocash', label: 'EcoCash', help: 'Approve the mobile wallet prompt sent to your Econet number.' },
  { code: 'onemoney', label: 'OneMoney', help: 'Approve the mobile wallet prompt sent to your NetOne number.' },
  { code: 'innbucks', label: 'InnBucks', help: 'Use the authorization code or open the InnBucks app link.' },
  { code: 'omari', label: "O'mari", help: "Enter the OTP sent to the O'mari mobile number." },
];

const terminalStatuses = new Set(['completed', 'rejected', 'cancelled', 'reversed']);

const makeIdempotencyKey = () => {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
  return `sfl-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
};

function normalizeWallet(payload) {
  if (!payload) return null;
  if (payload.wallet?.availableBalanceCents !== undefined) return payload.wallet;
  if (payload.availableBalanceCents !== undefined) return payload;
  return null;
}

export default function PaynowCheckoutModal({
  show,
  onHide,
  purpose,
  planCode = '',
  leagueId = '',
  inviteCode = '',
  amountCents = 0,
  title = 'Payment checkout',
  onCompleted,
}) {
  const { user } = useAuth();
  const walletAllowed = purpose === 'subscription' || purpose === 'league-entry';
  const [paymentSource, setPaymentSource] = useState(walletAllowed ? 'wallet' : 'paynow');
  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletConfirmed, setWalletConfirmed] = useState(false);
  const [method, setMethod] = useState('ecocash');
  const [phone, setPhone] = useState(user?.phone || '');
  const [otp, setOtp] = useState('');
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const completedReference = useRef('');
  const idempotencyKey = useRef(makeIdempotencyKey());

  const selectedMethod = useMemo(() => METHODS.find((item) => item.code === method), [method]);
  const availableBalanceCents = Number(wallet?.availableBalanceCents || 0);
  const balanceAfterCents = availableBalanceCents - Number(amountCents || 0);
  const walletHasFunds = availableBalanceCents >= Number(amountCents || 0);

  const publishWallet = (value) => {
    const normalized = normalizeWallet(value);
    if (!normalized) return null;
    setWallet(normalized);
    window.dispatchEvent(new CustomEvent('sfl:wallet-updated', { detail: { wallet: normalized } }));
    return normalized;
  };

  const loadWallet = async () => {
    if (!walletAllowed) return null;
    setWalletLoading(true);
    try {
      const data = await api('/api/wallet');
      return publishWallet(data);
    } catch (loadError) {
      setError(loadError.message);
      return null;
    } finally {
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    if (!show) return;
    setPaymentSource(walletAllowed ? 'wallet' : 'paynow');
    setMethod('ecocash');
    setPhone(user?.phone || '');
    setOtp('');
    setPayment(null);
    setWalletConfirmed(false);
    setError('');
    setBusy('');
    completedReference.current = '';
    idempotencyKey.current = makeIdempotencyKey();
    if (walletAllowed) loadWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, user?.phone, walletAllowed]);

  const notifyCompleted = async (nextPayment, responseData = {}) => {
    if (!nextPayment?.completed || completedReference.current === nextPayment.reference) return;
    completedReference.current = nextPayment.reference;
    let latestWallet = publishWallet(responseData.wallet);
    if (!latestWallet) {
      try {
        const walletData = await api('/api/wallet');
        latestWallet = publishWallet(walletData);
      } catch {
        // The transaction is already complete. The destination page will retry its own data load.
      }
    }
    onCompleted?.(nextPayment, { ...responseData, wallet: latestWallet });
  };

  const checkStatus = async (manual = false) => {
    if (!payment?.reference || terminalStatuses.has(payment.status)) return;
    if (manual) setBusy('status');
    try {
      const data = await api(`/api/payments/paynow/${encodeURIComponent(payment.reference)}/status`);
      setPayment(data.payment);
      publishWallet(data.wallet);
      await notifyCompleted(data.payment, data);
    } catch (statusError) {
      if (manual) setError(statusError.message);
    } finally {
      if (manual) setBusy('');
    }
  };

  useEffect(() => {
    if (!payment?.reference || terminalStatuses.has(payment.status)) return undefined;
    const timer = window.setInterval(() => checkStatus(false), 5000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment?.reference, payment?.status]);

  const initiate = async (event) => {
    event.preventDefault();
    setError('');
    setBusy('initiate');
    try {
      let path;
      let body;
      if (paymentSource === 'wallet' && walletAllowed) {
        if (!walletConfirmed) throw new Error('Confirm that you want to use your Supreme wallet balance.');
        if (!walletHasFunds) throw new Error('Your wallet balance is not enough for this payment. Choose Paynow or deposit into your wallet.');
        path = purpose === 'subscription'
          ? '/api/payments/wallet/subscription'
          : '/api/payments/wallet/league-entry';
        body = purpose === 'subscription'
          ? { planCode, confirmWallet: true }
          : { leagueId, inviteCode, confirmWallet: true };
      } else {
        path = purpose === 'subscription'
          ? '/api/payments/paynow/subscription'
          : purpose === 'league-entry'
            ? '/api/payments/paynow/league-entry'
            : '/api/payments/paynow/deposit';
        body = purpose === 'subscription'
          ? { planCode, method, phone }
          : purpose === 'league-entry'
            ? { leagueId, inviteCode, method, phone }
            : { amount: (Number(amountCents) / 100).toFixed(2), method, phone };
      }

      const data = await api(path, {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey.current },
        body,
      });
      setPayment(data.payment);
      publishWallet(data.wallet);
      await notifyCompleted(data.payment, data);
    } catch (initError) {
      setError(initError.message);
      if (/balance/i.test(initError.message || '')) loadWallet();
    } finally {
      setBusy('');
    }
  };

  const submitOtp = async (event) => {
    event.preventDefault();
    setError('');
    setBusy('otp');
    try {
      const data = await api(`/api/payments/paynow/${encodeURIComponent(payment.reference)}/otp`, {
        method: 'POST',
        body: { otp },
      });
      setPayment(data.payment);
      publishWallet(data.wallet);
      await notifyCompleted(data.payment, data);
    } catch (otpError) {
      setError(otpError.message);
    } finally {
      setBusy('');
    }
  };

  const copyCode = async () => {
    if (!payment?.authorizationCode) return;
    try { await navigator.clipboard.writeText(payment.authorizationCode); } catch { /* Browser may block clipboard access. */ }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="muted">Amount</span>
          <strong className="fs-4">{moneyFromCents(amountCents)}</strong>
        </div>
        {error && <Alert variant="danger">{error}</Alert>}

        {!payment && (
          <Form onSubmit={initiate}>
            {walletAllowed && (
              <Form.Group className="mb-3">
                <Form.Label>How would you like to pay?</Form.Label>
                <div className="d-grid gap-2">
                  <Button
                    type="button"
                    variant={paymentSource === 'wallet' ? 'dark' : 'outline-dark'}
                    className="text-start d-flex justify-content-between align-items-center"
                    onClick={() => { setPaymentSource('wallet'); setWalletConfirmed(false); setError(''); }}
                  >
                    <span><WalletCards size={17} className="me-2" />Supreme wallet balance</span>
                    <span>{walletLoading ? 'Loading…' : moneyFromCents(availableBalanceCents)}</span>
                  </Button>
                  <Button
                    type="button"
                    variant={paymentSource === 'paynow' ? 'dark' : 'outline-dark'}
                    className="text-start"
                    onClick={() => { setPaymentSource('paynow'); setWalletConfirmed(false); setError(''); }}
                  >
                    <Smartphone size={17} className="me-2" />Paynow Express Checkout
                  </Button>
                </div>
              </Form.Group>
            )}

            {paymentSource === 'wallet' && walletAllowed ? (
              <>
                <div className="border rounded p-3 mb-3">
                  <div className="d-flex justify-content-between gap-3 mb-2"><span className="muted">Available balance</span><strong>{moneyFromCents(availableBalanceCents)}</strong></div>
                  <div className="d-flex justify-content-between gap-3 mb-2"><span className="muted">This payment</span><strong>− {moneyFromCents(amountCents)}</strong></div>
                  <div className="d-flex justify-content-between gap-3 border-top pt-2"><span>Balance after payment</span><strong className={walletHasFunds ? '' : 'text-danger'}>{moneyFromCents(Math.max(0, balanceAfterCents))}</strong></div>
                </div>
                {!walletHasFunds && (
                  <Alert variant="warning">Your wallet does not have enough funds. Choose Paynow, or deposit into the wallet first.</Alert>
                )}
                <Form.Check
                  className="mb-3"
                  checked={walletConfirmed}
                  onChange={(event) => setWalletConfirmed(event.target.checked)}
                  label={`I confirm that ${moneyFromCents(amountCents)} will be deducted from my Supreme wallet.`}
                  required
                />
                <Alert variant="light" className="small">
                  The server verifies the current balance and price before deducting anything. Your updated balance appears immediately and a transaction email is sent when the payment completes.
                </Alert>
                <Button type="submit" className="w-100" disabled={busy === 'initiate' || walletLoading || !walletHasFunds || !walletConfirmed}>
                  {busy === 'initiate' ? <><Spinner size="sm" className="me-2" />Confirming wallet payment…</> : `Pay ${moneyFromCents(amountCents)} from wallet`}
                </Button>
              </>
            ) : (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Paynow method</Form.Label>
                  <Form.Select value={method} onChange={(event) => setMethod(event.target.value)}>
                    {METHODS.map((item) => <option value={item.code} key={item.code}>{item.label}</option>)}
                  </Form.Select>
                  <Form.Text>{selectedMethod?.help}</Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Zimbabwe mobile number</Form.Label>
                  <Form.Control value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+263771234567" required />
                </Form.Group>
                <Alert variant="light" className="small">
                  <Smartphone size={16} className="me-2" />Payment is completed through Paynow Express Checkout. Once Paynow confirms it, your wallet, subscription, or league entry refreshes immediately and an email is sent.
                </Alert>
                <Button type="submit" className="w-100" disabled={busy === 'initiate'}>
                  {busy === 'initiate' ? <><Spinner size="sm" className="me-2" />Starting checkout…</> : `Pay with ${selectedMethod?.label}`}
                </Button>
              </>
            )}
          </Form>
        )}

        {payment && (
          <div>
            {payment.completed && <Alert variant="success"><CheckCircle2 size={18} className="me-2" />Payment confirmed successfully. Your balance and account records are up to date.</Alert>}
            {!payment.completed && !payment.terminal && <Alert variant="info">Complete the payment on your phone. This window checks the Paynow status automatically.</Alert>}
            {payment.terminal && !payment.completed && <Alert variant="danger">Payment ended with status: {payment.paynowStatus || payment.status}.</Alert>}

            <div className="small border rounded p-3 mb-3">
              <div className="d-flex justify-content-between gap-3 mb-2"><span className="muted">Reference</span><strong className="text-end">{payment.reference}</strong></div>
              <div className="d-flex justify-content-between gap-3 mb-2"><span className="muted">Status</span><strong className="text-capitalize">{payment.paynowStatus || payment.status}</strong></div>
              {wallet && <div className="d-flex justify-content-between gap-3 border-top pt-2"><span className="muted">Current wallet balance</span><strong>{moneyFromCents(wallet.availableBalanceCents)}</strong></div>}
            </div>

            {payment.instructions && <Alert variant="secondary" className="mb-3">{payment.instructions}</Alert>}

            {payment.authorizationCode && (
              <div className="border rounded p-3 mb-3">
                <div className="muted small">InnBucks authorization code</div>
                <div className="d-flex align-items-center justify-content-between gap-2 mt-1">
                  <strong className="fs-3 letter-spacing">{payment.authorizationCode}</strong>
                  <Button variant="outline-dark" size="sm" onClick={copyCode}><Copy size={15} /></Button>
                </div>
                {payment.authorizationExpires && <div className="small muted mt-2">Expires: {payment.authorizationExpires}</div>}
                {payment.deepLink && <Button as="a" href={payment.deepLink} variant="dark" className="mt-3 w-100"><ExternalLink size={16} /> Open InnBucks</Button>}
              </div>
            )}

            {payment.requiresOtp && (
              <Form onSubmit={submitOtp} className="border rounded p-3 mb-3">
                <Form.Label>O'mari OTP</Form.Label>
                <Form.Control value={otp} onChange={(event) => setOtp(event.target.value)} inputMode="numeric" autoComplete="one-time-code" required />
                {payment.otpReference && <Form.Text>OTP reference: {payment.otpReference}</Form.Text>}
                <Button type="submit" className="w-100 mt-3" disabled={busy === 'otp'}>{busy === 'otp' ? 'Submitting OTP…' : 'Confirm OTP'}</Button>
              </Form>
            )}

            {!payment.terminal && (
              <Button variant="outline-dark" className="w-100" onClick={() => checkStatus(true)} disabled={busy === 'status'}>
                <RefreshCw size={16} className="me-2" />{busy === 'status' ? 'Checking…' : 'Check payment status'}
              </Button>
            )}
          </div>
        )}
      </Modal.Body>
      {payment?.terminal && <Modal.Footer><Button variant="dark" onClick={onHide}>Close</Button></Modal.Footer>}
    </Modal>
  );
}
