import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, Modal, Row, Table } from 'react-bootstrap';
import { Activity, Gift, ShieldCheck, Trophy, UserRound, WalletCards } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { adminApi, dateTime, humanize, money } from '../adminApi';
import { AdminEmpty, AdminError, AdminLoading } from '../components/AdminDataState';
import AdminPageHeader from '../components/AdminPageHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import FplSquadPitch from '../../components/FplSquadPitch';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelForm, setCancelForm] = useState({ refundAmount: '', reason: '' });
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const [endTarget, setEndTarget] = useState(null);
  const [endForm, setEndForm] = useState({ reason: '' });
  const [endBusy, setEndBusy] = useState(false);
  const [endError, setEndError] = useState('');

  const [creditOpen, setCreditOpen] = useState(false);
  const [creditForm, setCreditForm] = useState({ amount: '', reason: '' });
  const [creditBusy, setCreditBusy] = useState(false);
  const [creditError, setCreditError] = useState('');

  const [bonusOpen, setBonusOpen] = useState(false);
  const [bonusForm, setBonusForm] = useState({ amount: '', reason: '' });
  const [bonusBusy, setBonusBusy] = useState(false);
  const [bonusError, setBonusError] = useState('');

  const load = async ({ refresh = false, background = false } = {}) => {
    if (!background) { setLoading(true); setError(''); }
    else setRefreshing(true);
    try {
      const response = await adminApi(`/users/${id}${refresh ? '?refresh=1' : ''}`);
      setData(response);
      return response;
    } catch (requestError) {
      if (!background) setError(requestError.message || 'The user account could not be loaded.');
      return null;
    } finally {
      if (!background) setLoading(false);
      else setRefreshing(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      const initial = await load();
      if (active && initial?.user?.fplManagerId) load({ refresh: true, background: true });
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateStatus = async (status) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await adminApi(`/users/${id}/status`, {
        method: 'PATCH',
        body: { status },
      });
      setMessage('User account status updated.');
      await load();
    } catch (requestError) {
      setError(requestError.message || 'The user status could not be updated.');
    } finally {
      setSaving(false);
    }
  };

  const openCancelModal = (subscription) => {
    setCancelError('');
    setCancelTarget(subscription);
    setCancelForm({
      refundAmount: (Number(subscription.amountCents || 0) / 100).toFixed(2),
      reason: '',
    });
  };

  const closeCancelModal = () => {
    if (cancelBusy) return;
    setCancelTarget(null);
  };

  const submitCancelRefund = async (event) => {
    event.preventDefault();
    if (!cancelTarget) return;
    setCancelBusy(true);
    setCancelError('');
    try {
      await adminApi(`/subscriptions/${cancelTarget._id}/cancel-refund`, {
        method: 'POST',
        body: {
          reason: cancelForm.reason,
          refundAmountCents: Math.round(Number(cancelForm.refundAmount || 0) * 100),
        },
      });
      setCancelTarget(null);
      setMessage('Subscription cancelled and refund credited to the member\'s wallet.');
      await load();
    } catch (requestError) {
      setCancelError(requestError.message || 'The subscription could not be cancelled.');
    } finally {
      setCancelBusy(false);
    }
  };

  const openEndModal = (subscription) => {
    setEndError('');
    setEndTarget(subscription);
    setEndForm({ reason: '' });
  };

  const closeEndModal = () => {
    if (endBusy) return;
    setEndTarget(null);
  };

  const submitEndSubscription = async (event) => {
    event.preventDefault();
    if (!endTarget) return;
    setEndBusy(true);
    setEndError('');
    try {
      await adminApi(`/subscriptions/${endTarget._id}/end`, {
        method: 'POST',
        body: { reason: endForm.reason },
      });
      setEndTarget(null);
      setMessage('Subscription ended immediately. No refund was issued.');
      await load();
    } catch (requestError) {
      setEndError(requestError.message || 'The subscription could not be ended.');
    } finally {
      setEndBusy(false);
    }
  };

  const openCreditModal = () => {
    setCreditError('');
    setCreditForm({ amount: '', reason: '' });
    setCreditOpen(true);
  };

  const closeCreditModal = () => {
    if (creditBusy) return;
    setCreditOpen(false);
  };

  const submitWalletCredit = async (event) => {
    event.preventDefault();
    setCreditBusy(true);
    setCreditError('');
    try {
      await adminApi(`/users/${id}/wallet/credit`, {
        method: 'POST',
        body: {
          amountCents: Math.round(Number(creditForm.amount || 0) * 100),
          reason: creditForm.reason,
        },
      });
      setCreditOpen(false);
      setMessage('Wallet credited and the member has been emailed.');
      await load();
    } catch (requestError) {
      setCreditError(requestError.message || 'The wallet could not be credited.');
    } finally {
      setCreditBusy(false);
    }
  };

  const submitPerformanceBonus = async (event) => {
    event.preventDefault();
    setBonusBusy(true);
    setBonusError('');
    try {
      await adminApi(`/users/${id}/performance-bonus`, {
        method: 'POST',
        body: {
          amountCents: Math.round(Number(bonusForm.amount || 0) * 100),
          reason: bonusForm.reason,
        },
      });
      setBonusOpen(false);
      setBonusForm({ amount: '', reason: '' });
      setMessage('Performance bonus awarded, credited to the withdrawable wallet balance, and emailed to the member.');
      await load();
    } catch (requestError) {
      setBonusError(requestError.message || 'The performance bonus could not be awarded.');
    } finally {
      setBonusBusy(false);
    }
  };

  if (loading) {
    return <AdminLoading message="Loading user information…" />;
  }

  if (error && !data) {
    return <AdminError message={error} onRetry={load} />;
  }

  const activeSubscriptions = data.subscriptions.filter((item) => item.status === 'active');

  return (
    <>
      <AdminPageHeader
        eyebrow="User management"
        title={data.user.fullName}
        description="Review personal information, fresh FPL team/rank data, subscriptions, league activity and financial history."
        backTo="/admin/users"
        backLabel="Back to users"
        actions={
          <Form.Select
            value={data.user.status}
            onChange={(event) => updateStatus(event.target.value)}
            disabled={saving}
            style={{ minWidth: 190 }}
          >
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="closed">Closed</option>
          </Form.Select>
        }
      />

      {error && <AdminError message={error} />}
      {message && <Alert variant="success">{message}</Alert>}

      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <StatCard
            label="Account status"
            value={humanize(data.user.status)}
            detail={`Joined ${dateTime(data.user.createdAt)}`}
            icon={UserRound}
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="League entries"
            value={data.entries.length}
            detail="All recorded participation"
            icon={Trophy}
            tone="warning"
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="Active subscriptions"
            value={activeSubscriptions.length}
            detail={`${data.subscriptions.length} subscriptions in history`}
            icon={ShieldCheck}
            tone="success"
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="Wallet balance"
            value={money(data.wallet?.availableBalanceCents)}
            detail={`${money(data.wallet?.pendingBalanceCents)} pending`}
            icon={WalletCards}
            tone="info"
          />
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col xl={7}>
          <Card className="admin-card h-100">
            <Card.Header>
              <h2 className="admin-card-title">Personal information</h2>
              <div className="admin-card-subtitle">Identity and contact details stored on the account.</div>
            </Card.Header>
            <Card.Body>
              <dl className="admin-detail-grid mb-0">
                <div className="admin-detail-item"><dt>Full name</dt><dd>{data.user.fullName}</dd></div>
                <div className="admin-detail-item"><dt>Email</dt><dd>{data.user.email}</dd></div>
                <div className="admin-detail-item"><dt>Phone</dt><dd>{data.user.phone || '—'}</dd></div>
                <div className="admin-detail-item"><dt>Date of birth</dt><dd>{data.user.dateOfBirth ? dateTime(data.user.dateOfBirth) : '—'}</dd></div>
                <div className="admin-detail-item"><dt>FPL manager ID</dt><dd>{data.user.fplManagerId || data.profile?.fplManagerId || '—'}</dd></div>
                <div className="admin-detail-item"><dt>Fantasy team</dt><dd>{data.user.fantasyTeamName || data.profile?.fantasyTeamName || '—'}</dd></div>
                <div className="admin-detail-item"><dt>Account created</dt><dd>{dateTime(data.user.createdAt)}</dd></div>
                <div className="admin-detail-item"><dt>Last updated</dt><dd>{dateTime(data.user.updatedAt)}</dd></div>
              </dl>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={5}>
          <Card className="admin-card h-100">
            <Card.Header className="d-flex align-items-center justify-content-between">
              <div>
                <h2 className="admin-card-title">Wallet information</h2>
                <div className="admin-card-subtitle">Current wallet balances and last balance activity.</div>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <Button size="sm" variant="primary" onClick={() => { setBonusError(''); setBonusForm({ amount: '', reason: '' }); setBonusOpen(true); }}><Gift size={15} /> Performance bonus</Button>
                <Button size="sm" variant="outline-primary" onClick={openCreditModal}>Credit wallet</Button>
              </div>
            </Card.Header>
            <Card.Body>
              <dl className="admin-detail-grid mb-0">
                <div className="admin-detail-item"><dt>Wallet ID</dt><dd>{data.wallet?.walletIdentifier || '—'}</dd></div>
                <div className="admin-detail-item"><dt>Currency</dt><dd>{data.wallet?.currency || 'USD'}</dd></div>
                <div className="admin-detail-item"><dt>Available</dt><dd>{money(data.wallet?.availableBalanceCents)}</dd></div>
                <div className="admin-detail-item"><dt>Pending</dt><dd>{money(data.wallet?.pendingBalanceCents)}</dd></div>
                <div className="admin-detail-item"><dt>Chargeback balance</dt><dd>{money(data.wallet?.chargebackBalanceCents)}</dd></div>
                <div className="admin-detail-item"><dt>Last balance update</dt><dd>{dateTime(data.wallet?.lastBalanceUpdateAt)}</dd></div>
              </dl>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="admin-card mb-4">
        <Card.Header className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div><h2 className="admin-card-title">Live FPL profile &amp; squad</h2><div className="admin-card-subtitle">Refreshed automatically from public FPL data when this admin page opens.</div></div>
          <Activity size={22} />
        </Card.Header>
        <Card.Body>
          {data.team?.snapshot ? <>
            <Row className="g-3 mb-4">
              <Col sm={6} lg={3}><div className="admin-detail-item"><dt>Gameweek</dt><dd>{data.team.snapshot.gameweek}</dd></div></Col>
              <Col sm={6} lg={3}><div className="admin-detail-item"><dt>GW points</dt><dd>{data.team.snapshot.gameweekPoints}</dd></div></Col>
              <Col sm={6} lg={3}><div className="admin-detail-item"><dt>Total points</dt><dd>{data.team.snapshot.totalPoints}</dd></div></Col>
              <Col sm={6} lg={3}><div className="admin-detail-item"><dt>Overall rank</dt><dd>{data.team.snapshot.overallRank?.toLocaleString('en-GB') || '—'}</dd></div></Col>
            </Row>
            <FplSquadPitch lineup={data.team.snapshot.lineup || []} gameweek={data.team.snapshot.gameweek} compact />
          </> : <AdminEmpty title={data.user.fplManagerId ? 'FPL squad not published yet' : 'No FPL manager linked'} message={data.team?.error || (data.user.fplManagerId ? 'The manager is linked, but FPL did not return a usable squad snapshot. Opening this page will retry automatically.' : 'Link a public FPL manager ID from the user account first.')} />}
        </Card.Body>
      </Card>

      <Card className="admin-card admin-table-card mb-4">
        <Card.Header>
          <h2 className="admin-card-title">Subscription history</h2>
          <div className="admin-card-subtitle">Every subscription linked to this user account.</div>
        </Card.Header>
        {data.subscriptions.length ? (
          <Table responsive className="admin-table">
            <thead>
              <tr><th>Plan</th><th>Status</th><th>Payment method</th><th>Activated</th><th>Valid until</th><th></th></tr>
            </thead>
            <tbody>
              {data.subscriptions.map((subscription) => (
                <tr key={subscription._id}>
                  <td>{subscription.planName || humanize(subscription.planCode)}</td>
                  <td><StatusBadge value={subscription.status} /></td>
                  <td>{humanize(subscription.paymentMethod)}</td>
                  <td>{dateTime(subscription.activatedAt || subscription.createdAt)}</td>
                  <td>{dateTime(subscription.validUntil)}</td>
                  <td className="text-end">
                    {!['cancelled', 'expired', 'replaced'].includes(subscription.status) && (
                      <div className="d-flex gap-2 justify-content-end">
                        <Button size="sm" variant="outline-secondary" onClick={() => openEndModal(subscription)}>
                          End (no refund)
                        </Button>
                        <Button size="sm" variant="outline-danger" onClick={() => openCancelModal(subscription)}>
                          Cancel &amp; refund
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <AdminEmpty title="No subscriptions recorded" message="This user has not completed a subscription." />
        )}
      </Card>

      <Card className="admin-card admin-table-card mb-4">
        <Card.Header>
          <h2 className="admin-card-title">League participation</h2>
          <div className="admin-card-subtitle">Joining time, current score and leaderboard position.</div>
        </Card.Header>
        {data.entries.length ? (
          <Table responsive className="admin-table">
            <thead>
              <tr><th>League</th><th>Type</th><th>Joined</th><th>Rank</th><th>Score</th><th>Status</th></tr>
            </thead>
            <tbody>
              {data.entries.map((entry) => (
                <tr key={entry._id}>
                  <td>{entry.leagueId?.name || 'Deleted league'}</td>
                  <td>{humanize(entry.leagueId?.competitionType)}</td>
                  <td>{dateTime(entry.joinedAt)}</td>
                  <td>{entry.currentRank || '—'}</td>
                  <td>{entry.currentScore || 0}</td>
                  <td><StatusBadge value={entry.eligibilityStatus} /></td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <AdminEmpty title="No league activity" message="This user has not joined a league." />
        )}
      </Card>

      <Card className="admin-card admin-table-card">
        <Card.Header>
          <h2 className="admin-card-title">Financial transactions</h2>
          <div className="admin-card-subtitle">The latest 200 transactions recorded for this user.</div>
        </Card.Header>
        {data.transactions.length ? (
          <Table responsive className="admin-table">
            <thead>
              <tr><th>Date</th><th>Reference</th><th>Purpose</th><th>Status</th><th>Amount</th></tr>
            </thead>
            <tbody>
              {data.transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td>{dateTime(transaction.createdAt)}</td>
                  <td>{transaction.reference}</td>
                  <td>{transaction.metadata?.purpose === 'performance-bonus' ? 'Performance bonus' : humanize(transaction.type)}</td>
                  <td><StatusBadge value={transaction.status} /></td>
                  <td>{money(transaction.amountCents)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <AdminEmpty title="No transactions recorded" message="This user has no financial activity." />
        )}
      </Card>

      <Modal show={Boolean(cancelTarget)} onHide={closeCancelModal} centered>
        <Form onSubmit={submitCancelRefund}>
          <Modal.Header closeButton>
            <Modal.Title>Cancel subscription &amp; refund</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {cancelError && <Alert variant="danger">{cancelError}</Alert>}
            <p className="text-muted small mb-3">
              Cancelling <strong>{cancelTarget?.planName || humanize(cancelTarget?.planCode)}</strong> will end it
              immediately and credit the refund below to the member&apos;s wallet. Use this when a subscription
              was made too late for the league or cycle it targeted.
            </p>
            <Form.Group className="mb-3">
              <Form.Label>Refund amount (USD)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.01"
                max={(Number(cancelTarget?.amountCents || 0) / 100).toFixed(2)}
                value={cancelForm.refundAmount}
                onChange={(event) => setCancelForm((current) => ({ ...current, refundAmount: event.target.value }))}
                required
              />
              <Form.Text className="text-muted">
                Defaults to the full amount paid ({money(cancelTarget?.amountCents)}). Lower it for a partial refund.
              </Form.Text>
            </Form.Group>
            <Form.Group>
              <Form.Label>Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="e.g. Joined the league after the joining deadline"
                value={cancelForm.reason}
                onChange={(event) => setCancelForm((current) => ({ ...current, reason: event.target.value }))}
                required
              />
              <Form.Text className="text-muted">Included in the email sent to the member.</Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={closeCancelModal} disabled={cancelBusy}>
              Close
            </Button>
            <Button type="submit" variant="danger" disabled={cancelBusy}>
              {cancelBusy ? 'Cancelling…' : 'Cancel subscription & refund'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={Boolean(endTarget)} onHide={closeEndModal} centered>
        <Form onSubmit={submitEndSubscription}>
          <Modal.Header closeButton>
            <Modal.Title>End subscription</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {endError && <Alert variant="danger">{endError}</Alert>}
            <p className="text-muted small mb-3">
              Ending <strong>{endTarget?.planName || humanize(endTarget?.planCode)}</strong> stops it immediately —
              no refund is issued and it is not marked as cancelled. Use this when a subscription ran past where
              it should have (for example a reconciliation lag) rather than one being refunded.
            </p>
            <Form.Group>
              <Form.Label>Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="e.g. Manually ending a stale subscription that ran over its cycle"
                value={endForm.reason}
                onChange={(event) => setEndForm((current) => ({ ...current, reason: event.target.value }))}
                required
              />
              <Form.Text className="text-muted">Recorded in the admin audit log.</Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={closeEndModal} disabled={endBusy}>
              Close
            </Button>
            <Button type="submit" variant="secondary" disabled={endBusy}>
              {endBusy ? 'Ending…' : 'End subscription'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={bonusOpen} onHide={() => !bonusBusy && setBonusOpen(false)} centered>
        <Form onSubmit={submitPerformanceBonus}>
          <Modal.Header closeButton><Modal.Title>Award performance bonus</Modal.Title></Modal.Header>
          <Modal.Body>
            {bonusError && <Alert variant="danger">{bonusError}</Alert>}
            <p className="text-muted small">This creates a dedicated performance-bonus transaction, credits the user&apos;s available/withdrawable wallet balance, and emails the reward amount and reason to the member.</p>
            <Form.Group className="mb-3"><Form.Label>Bonus amount (USD)</Form.Label><Form.Control type="number" min="0.01" step="0.01" value={bonusForm.amount} onChange={(event) => setBonusForm((current) => ({ ...current, amount: event.target.value }))} required /></Form.Group>
            <Form.Group><Form.Label>Performance / reward reason</Form.Label><Form.Control as="textarea" rows={3} placeholder="Example: Highest September improvement bonus" value={bonusForm.reason} onChange={(event) => setBonusForm((current) => ({ ...current, reason: event.target.value }))} required /><Form.Text className="text-muted">This reason is included in the reward email and transaction audit.</Form.Text></Form.Group>
          </Modal.Body>
          <Modal.Footer><Button variant="outline-secondary" onClick={() => setBonusOpen(false)} disabled={bonusBusy}>Close</Button><Button type="submit" disabled={bonusBusy}>{bonusBusy ? 'Awarding…' : 'Award bonus & email user'}</Button></Modal.Footer>
        </Form>
      </Modal>

      <Modal show={creditOpen} onHide={closeCreditModal} centered>
        <Form onSubmit={submitWalletCredit}>
          <Modal.Header closeButton>
            <Modal.Title>Credit wallet</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {creditError && <Alert variant="danger">{creditError}</Alert>}
            <p className="text-muted small mb-3">
              Adds funds directly to this member&apos;s wallet — for example, to compensate the price difference
              when they replaced or upgraded a subscription or league entry.
            </p>
            <Form.Group className="mb-3">
              <Form.Label>Credit amount (USD)</Form.Label>
              <Form.Control
                type="number"
                min="0.01"
                step="0.01"
                value={creditForm.amount}
                onChange={(event) => setCreditForm((current) => ({ ...current, amount: event.target.value }))}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="e.g. Compensation for upgrading from Monthly Entry to Plus"
                value={creditForm.reason}
                onChange={(event) => setCreditForm((current) => ({ ...current, reason: event.target.value }))}
                required
              />
              <Form.Text className="text-muted">Included in the email sent to the member.</Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={closeCreditModal} disabled={creditBusy}>
              Close
            </Button>
            <Button type="submit" variant="primary" disabled={creditBusy}>
              {creditBusy ? 'Crediting…' : 'Credit wallet'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
