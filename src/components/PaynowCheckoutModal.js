import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { CheckCircle2, Copy, ExternalLink, RefreshCw, Smartphone } from 'lucide-react';
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
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }

  return `sfl-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 12)}`;
};
export default function PaynowCheckoutModal({ show, onHide, purpose, planCode = '', leagueId = '', inviteCode = '', amountCents = 0, title = 'Paynow checkout', onCompleted }) {
  const { user } = useAuth();
  const [method, setMethod] = useState('ecocash');
  const [phone, setPhone] = useState(user?.phone || '');
  const [otp, setOtp] = useState('');
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const completedReference = useRef('');
  const idempotencyKey = useRef(makeIdempotencyKey());

  const selectedMethod = useMemo(() => METHODS.find((item) => item.code === method), [method]);

  useEffect(() => {
    if (!show) return;
    setMethod('ecocash');
    setPhone(user?.phone || '');
    setOtp('');
    setPayment(null);
    setError('');
    setBusy('');
    completedReference.current = '';
    idempotencyKey.current = makeIdempotencyKey();
  }, [show, user?.phone]);

  const notifyCompleted = (nextPayment) => {
    if (!nextPayment?.completed || completedReference.current === nextPayment.reference) return;
    completedReference.current = nextPayment.reference;
    onCompleted?.(nextPayment);
  };

  const checkStatus = async (manual = false) => {
    if (!payment?.reference || terminalStatuses.has(payment.status)) return;
    if (manual) setBusy('status');
    try {
      const data = await api(`/api/payments/paynow/${encodeURIComponent(payment.reference)}/status`);
      setPayment(data.payment);
      notifyCompleted(data.payment);
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
    // checkStatus intentionally uses the latest payment through this dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment?.reference, payment?.status]);

  const initiate = async (event) => {
    event.preventDefault();
    setError('');
    setBusy('initiate');
    try {
      const path = purpose === 'subscription'
        ? '/api/payments/paynow/subscription'
        : purpose === 'league-entry'
          ? '/api/payments/paynow/league-entry'
          : '/api/payments/paynow/deposit';
      const body = purpose === 'subscription'
        ? { planCode, method, phone }
        : purpose === 'league-entry'
          ? { leagueId, inviteCode, method, phone }
          : { amount: (Number(amountCents) / 100).toFixed(2), method, phone };
      const data = await api(path, {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey.current },
        body,
      });
      setPayment(data.payment);
      notifyCompleted(data.payment);
    } catch (initError) {
      setError(initError.message);
    } finally {
      setBusy('');
    }
  };

  const submitOtp = async (event) => {
    event.preventDefault();
    setError('');
    setBusy('otp');
    try {
      const data = await api(`/api/payments/paynow/${encodeURIComponent(payment.reference)}/otp`, { method: 'POST', body: { otp } });
      setPayment(data.payment);
      notifyCompleted(data.payment);
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

  const close = () => {
    onHide?.();
  };

  return (
    <Modal show={show} onHide={close} centered>
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
            <Form.Group className="mb-3">
              <Form.Label>Payment method</Form.Label>
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
              <Smartphone size={16} className="me-2" />Payment is completed through Paynow Express Checkout without redirecting this page.
            </Alert>
            <Button type="submit" className="w-100" disabled={busy === 'initiate'}>
              {busy === 'initiate' ? <><Spinner size="sm" className="me-2" />Starting checkout…</> : `Pay with ${selectedMethod?.label}`}
            </Button>
          </Form>
        )}

        {payment && (
          <div>
            {payment.completed && <Alert variant="success"><CheckCircle2 size={18} className="me-2" />Payment confirmed successfully.</Alert>}
            {!payment.completed && !payment.terminal && <Alert variant="info">Complete the payment on your phone. This window checks the Paynow status automatically.</Alert>}
            {payment.terminal && !payment.completed && <Alert variant="danger">Payment ended with status: {payment.paynowStatus || payment.status}.</Alert>}

            <div className="small border rounded p-3 mb-3">
              <div className="d-flex justify-content-between gap-3 mb-2"><span className="muted">Reference</span><strong className="text-end">{payment.reference}</strong></div>
              <div className="d-flex justify-content-between gap-3"><span className="muted">Status</span><strong className="text-capitalize">{payment.paynowStatus || payment.status}</strong></div>
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
      {payment?.terminal && <Modal.Footer><Button variant="dark" onClick={close}>Close</Button></Modal.Footer>}
    </Modal>
  );
}
