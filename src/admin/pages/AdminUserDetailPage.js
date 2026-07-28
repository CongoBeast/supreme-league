import { useEffect, useState } from 'react';
import { Alert, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { ShieldCheck, Trophy, UserRound, WalletCards } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { adminApi, dateTime, humanize, money } from '../adminApi';
import { AdminEmpty, AdminError, AdminLoading } from '../components/AdminDataState';
import AdminPageHeader from '../components/AdminPageHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setData(await adminApi(`/users/${id}`));
    } catch (requestError) {
      setError(requestError.message || 'The user account could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
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
        description="Review personal information, subscriptions, league activity and financial history."
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
            <Card.Header>
              <h2 className="admin-card-title">Wallet information</h2>
              <div className="admin-card-subtitle">Current wallet balances and last balance activity.</div>
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

      <Card className="admin-card admin-table-card mb-4">
        <Card.Header>
          <h2 className="admin-card-title">Subscription history</h2>
          <div className="admin-card-subtitle">Every subscription linked to this user account.</div>
        </Card.Header>
        {data.subscriptions.length ? (
          <Table responsive className="admin-table">
            <thead>
              <tr><th>Plan</th><th>Status</th><th>Payment method</th><th>Activated</th><th>Valid until</th></tr>
            </thead>
            <tbody>
              {data.subscriptions.map((subscription) => (
                <tr key={subscription._id}>
                  <td>{subscription.planName || humanize(subscription.planCode)}</td>
                  <td><StatusBadge value={subscription.status} /></td>
                  <td>{humanize(subscription.paymentMethod)}</td>
                  <td>{dateTime(subscription.activatedAt || subscription.createdAt)}</td>
                  <td>{dateTime(subscription.validUntil)}</td>
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
                  <td>{humanize(transaction.type)}</td>
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
    </>
  );
}
