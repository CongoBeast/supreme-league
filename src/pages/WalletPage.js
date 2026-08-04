import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { ArrowDownToLine, ArrowUpFromLine, ReceiptText, WalletCards } from 'lucide-react';
import { api, moneyFromCents } from '../services/api';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import LoadingScreen from '../components/LoadingScreen';
import ErrorState from '../components/ErrorState';
import StatusBadge from '../components/StatusBadge';
import CurrencyAmount from '../components/CurrencyAmount';
import PaynowCheckoutModal from '../components/PaynowCheckoutModal';

const withdrawalMethods = ['EcoCash', 'InnBucks', "O'mari", 'OneMoney', 'Bank Transfer'];
const zimBanks = ['BancABC Zimbabwe','CBZ Bank','CABS','Ecobank Zimbabwe','FBC Bank','First Capital Bank Zimbabwe','Nedbank Zimbabwe','NMB Bank Zimbabwe','Stanbic Bank Zimbabwe','Steward Bank','ZB Bank'];

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState(null);
  const [showDepositCheckout, setShowDepositCheckout] = useState(false);
  const [filters, setFilters] = useState({ search: '', type: '', status: '', from: '', to: '' });
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawal, setWithdrawal] = useState({ amount: '', method: 'EcoCash', accountNumber: '', bankName: '', branchNumber: '', currency: 'USD', confirm: false });
  const [busy, setBusy] = useState('');

  const load = async (page = 1) => {
    setError('');
    try {
      const [walletData, transactionData] = await Promise.all([
        api('/api/wallet'),
        api(`/api/transactions?page=${page}&limit=10&search=${encodeURIComponent(filters.search)}&type=${filters.type}&status=${filters.status}&from=${filters.from}&to=${filters.to}`),
      ]);
      setWallet(walletData);
      setTransactions(transactionData.transactions);
      setPagination(transactionData.pagination);
    } catch (loadError) { setError(loadError.message); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const handleWalletUpdated = (event) => {
      const nextWallet = event.detail?.wallet;
      if (!nextWallet) return;
      setWallet((current) => current ? { ...current, wallet: nextWallet } : { wallet: nextWallet });
    };
    window.addEventListener('sfl:wallet-updated', handleWalletUpdated);
    return () => window.removeEventListener('sfl:wallet-updated', handleWalletUpdated);
  }, []);

  const openDepositCheckout = (event) => {
    event.preventDefault();
    const cents = Math.round(Number(depositAmount) * 100);
    if (!Number.isFinite(cents) || cents <= 0) {
      setNotice('Enter a valid deposit amount.');
      return;
    }
    setNotice('');
    setShowDepositCheckout(true);
  };

  const depositCompleted = async () => {
    setNotice('Deposit confirmed and credited to your wallet.');
    setDepositAmount('');
    await load();
  };

  const submitWithdrawal = async (event) => {
    event.preventDefault();
    setBusy('withdrawal');
    setNotice('');
    try {
      const data = await api('/api/withdrawals/request', {
        method: 'POST',
        headers: { 'Idempotency-Key': window.crypto?.randomUUID ? window.crypto.randomUUID() : `wdr-${Date.now()}` },
        body: withdrawal,
      });
      setNotice(data.message || 'Withdrawal request created for review.');
      setWithdrawal({ amount: '', method: 'EcoCash', accountNumber: '', bankName: '', branchNumber: '', currency: 'USD', confirm: false });
      await load();
    } catch (withdrawalError) { setNotice(withdrawalError.message); } finally { setBusy(''); }
  };

  const exportCsv = () => {
    const rows = [
      ['Date', 'Reference', 'Description', 'Type', 'Method', 'Amount', 'Status'],
      ...transactions.map((transaction) => [
        new Date(transaction.createdAt).toISOString(),
        transaction.reference,
        transaction.description,
        transaction.type,
        transaction.metadata?.method || transaction.provider,
        (transaction.amountCents / 100).toFixed(2),
        transaction.status,
      ]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'supreme-fantasy-transactions.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const maxWithdrawal = useMemo(() => wallet?.wallet?.availableBalanceCents || 0, [wallet]);
  const depositAmountCents = Math.max(0, Math.round(Number(depositAmount || 0) * 100));

  if (error) return <ErrorState message={error} onRetry={() => load()} />;
  if (!wallet) return <LoadingScreen fullScreen={false} />;
  const currentWallet = wallet.wallet;

  return (
    <>
      <PageHeader eyebrow="USD account" title="Wallet & Transactions" description="Deposit with Paynow, spend from your confirmed balance, and see completed wallet changes immediately in the immutable ledger." />
      {notice && <Alert variant="info">{notice}</Alert>}

      <div className="surface-card p-4 mb-4">
        <Row className="g-3 small">
          <Col md={4}><div className="muted">Wallet identifier</div><strong>{currentWallet.walletIdentifier}</strong></Col>
          <Col md={4}><div className="muted">Last balance update</div><strong>{currentWallet.lastBalanceUpdateAt ? new Date(currentWallet.lastBalanceUpdateAt).toLocaleString('en-GB') : '—'}</strong></Col>
          <Col md={4}><div className="muted">Update function</div><strong>{currentWallet.lastBalanceUpdateFunction || '—'}</strong></Col>
        </Row>
        {currentWallet.lastBalanceUpdateReason && <div className="small muted mt-3">Reason: {currentWallet.lastBalanceUpdateReason}</div>}
      </div>

      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}><StatCard icon={WalletCards} label="Available balance" value={moneyFromCents(currentWallet.availableBalanceCents)} /></Col>
        <Col sm={6} xl={3}><StatCard label="Pending balance" value={moneyFromCents(currentWallet.pendingBalanceCents)} /></Col>
        <Col sm={6} xl={3}><StatCard label="Chargeback balance" value={moneyFromCents(currentWallet.chargebackBalanceCents)} note="Amount still recoverable after a refunded deposit" /></Col>
        <Col sm={6} xl={3}><StatCard label="Prizes won" value={moneyFromCents(currentWallet.lifetimePrizesCents)} /></Col>
        <Col sm={6} xl={3}><StatCard label="Net spending" value={moneyFromCents(currentWallet.netSpendingCents)} note="Entry fees + subscriptions − prizes − refunds" /></Col>
        <Col sm={6} xl={3}><StatCard label="Deposits" value={moneyFromCents(currentWallet.lifetimeDepositsCents)} /></Col>
        <Col sm={6} xl={3}><StatCard label="Withdrawals" value={moneyFromCents(currentWallet.lifetimeWithdrawalsCents)} /></Col>
        <Col sm={6} xl={3}><StatCard label="Entry fees" value={moneyFromCents(currentWallet.lifetimeEntryFeesCents)} /></Col>
        <Col sm={6} xl={3}><StatCard label="Subscription fees" value={moneyFromCents(currentWallet.lifetimeSubscriptionFeesCents)} /></Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col xl={6}>
          <div className="surface-card p-4 h-100">
            <div className="d-flex align-items-center gap-2 mb-3"><ArrowDownToLine /><h2 className="h4 mb-0">Deposit with Paynow</h2></div>
            <p className="muted small">EcoCash, OneMoney, InnBucks and O'mari payments stay inside the Supreme League checkout flow.</p>
            <Form onSubmit={openDepositCheckout}>
              <Form.Label>USD amount</Form.Label>
              <Form.Control type="number" step="0.01" min="0.01" required value={depositAmount} onChange={(event) => setDepositAmount(event.target.value)} />
              <Button type="submit" className="mt-3">Continue to Paynow</Button>
            </Form>
          </div>
        </Col>

        <Col xl={6}>
          <div className="surface-card p-4 h-100">
            <div className="d-flex align-items-center gap-2 mb-3"><ArrowUpFromLine /><h2 className="h4 mb-0">Withdrawal request</h2></div>
            <Alert variant="light" className="small"><strong>USD payouts only.</strong> The minimum withdrawal is US$5.00. Approved payouts may take 3–4 business days, depending on the selected method.</Alert>
            <Form onSubmit={submitWithdrawal}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label>Amount</Form.Label>
                  <Form.Control type="number" step="0.01" min="5" max={(maxWithdrawal / 100).toFixed(2)} required value={withdrawal.amount} onChange={(event) => setWithdrawal({ ...withdrawal, amount: event.target.value })} />
                  <Form.Text>Minimum US$5.00 · Maximum {moneyFromCents(maxWithdrawal)}</Form.Text>
                </Col>
                <Col md={6}>
                  <Form.Label>Destination method</Form.Label>
                  <Form.Select value={withdrawal.method} onChange={(event) => setWithdrawal({ ...withdrawal, method: event.target.value })}>{withdrawalMethods.map((method) => <option key={method}>{method}</option>)}</Form.Select>
                </Col>
                {withdrawal.method === 'Bank Transfer' ? <>
                  <Col md={6}><Form.Label>Bank name</Form.Label><Form.Select required value={withdrawal.bankName} onChange={(event) => setWithdrawal({ ...withdrawal, bankName: event.target.value })}><option value="">Select a Zimbabwean bank</option>{zimBanks.map((bank) => <option key={bank} value={bank}>{bank}</option>)}</Form.Select></Col>
                  <Col md={6}><Form.Label>Branch number</Form.Label><Form.Control required value={withdrawal.branchNumber} onChange={(event) => setWithdrawal({ ...withdrawal, branchNumber: event.target.value })} /></Col>
                  <Col xs={12}><Form.Label>USD account number</Form.Label><Form.Control required value={withdrawal.accountNumber} onChange={(event) => setWithdrawal({ ...withdrawal, accountNumber: event.target.value })} /><Form.Text>We only pay into USD-denominated bank accounts.</Form.Text></Col>
                </> : <Col xs={12}><Form.Label>Registered mobile-money number</Form.Label><Form.Control placeholder="e.g. +263 77 123 4567" required value={withdrawal.accountNumber} onChange={(event) => setWithdrawal({ ...withdrawal, accountNumber: event.target.value })} /></Col>}
                <Col xs={12}><Form.Check required label="I confirm this withdrawal request" checked={withdrawal.confirm} onChange={(event) => setWithdrawal({ ...withdrawal, confirm: event.target.checked })} /></Col>
                <Col xs={12}><Button type="submit" variant="dark" disabled={busy === 'withdrawal'}>{busy === 'withdrawal' ? 'Submitting…' : 'Request withdrawal'}</Button></Col>
              </Row>
            </Form>
          </div>
        </Col>
      </Row>

      <div className="surface-card p-4">
        <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-3">
          <div><h2 className="h4 mb-1">Transaction history</h2><div className="muted small">Ledger records are immutable and cannot be edited.</div></div>
          <Button variant="outline-dark" onClick={exportCsv}><ReceiptText size={16} /> Export CSV</Button>
        </div>
        <Form onSubmit={(event) => { event.preventDefault(); load(1); }} className="mb-3">
          <Row className="g-2">
            <Col lg={4}><Form.Control placeholder="Search reference or description" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} /></Col>
            <Col md={4} lg={2}><Form.Select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })}><option value="">All types</option>{['deposit', 'withdrawal', 'entry-fee', 'subscription', 'prize', 'refund', 'adjustment'].map((type) => <option key={type} value={type}>{type}</option>)}</Form.Select></Col>
            <Col md={4} lg={2}><Form.Select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">All statuses</option>{['pending', 'processing', 'completed', 'rejected', 'cancelled', 'reversed'].map((status) => <option key={status}>{status}</option>)}</Form.Select></Col>
            <Col md={4} lg={1}><Form.Control type="date" aria-label="From date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} /></Col>
            <Col md={4} lg={1}><Form.Control type="date" aria-label="To date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} /></Col>
            <Col md={4} lg={2}><Button type="submit" variant="dark" className="w-100">Apply filters</Button></Col>
          </Row>
        </Form>
        <div className="table-responsive">
          <table className="table align-middle mb-3">
            <thead><tr><th>Date</th><th>Reference</th><th>Description</th><th>Type</th><th>Method</th><th className="text-end">Amount</th><th>Status</th></tr></thead>
            <tbody>{transactions.map((transaction) => (
              <tr key={transaction._id} onClick={() => setSelected(transaction)} role="button">
                <td>{new Date(transaction.createdAt).toLocaleDateString('en-GB')}</td>
                <td className="small">{transaction.reference}</td>
                <td>{transaction.description}</td>
                <td className="text-capitalize">{transaction.type}</td>
                <td>{transaction.metadata?.method || transaction.provider}</td>
                <td className="text-end fw-bold"><CurrencyAmount cents={transaction.amountCents} /></td>
                <td><StatusBadge status={transaction.status} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <Button variant="light" disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)}>Previous</Button>
          <span className="small muted">Page {pagination.page} of {pagination.pages}</span>
          <Button variant="light" disabled={pagination.page >= pagination.pages} onClick={() => load(pagination.page + 1)}>Next</Button>
        </div>
      </div>

      <Modal show={Boolean(selected)} onHide={() => setSelected(null)} centered>
        <Modal.Header closeButton><Modal.Title>Transaction details</Modal.Title></Modal.Header>
        {selected && <Modal.Body>
          <div className="d-flex justify-content-between py-2 border-bottom"><span>Reference</span><strong>{selected.reference}</strong></div>
          <div className="d-flex justify-content-between py-2 border-bottom"><span>Description</span><strong className="text-end">{selected.description}</strong></div>
          <div className="d-flex justify-content-between py-2 border-bottom"><span>Amount</span><strong><CurrencyAmount cents={selected.amountCents} /></strong></div>
          <div className="d-flex justify-content-between py-2 border-bottom"><span>Status</span><StatusBadge status={selected.status} /></div>
          <div className="d-flex justify-content-between py-2"><span>Date</span><strong>{new Date(selected.createdAt).toLocaleString('en-GB')}</strong></div>
        </Modal.Body>}
      </Modal>

      <PaynowCheckoutModal
        show={showDepositCheckout}
        onHide={() => setShowDepositCheckout(false)}
        purpose="deposit"
        amountCents={depositAmountCents}
        title="Deposit into your Supreme wallet"
        onCompleted={depositCompleted}
      />
    </>
  );
}
