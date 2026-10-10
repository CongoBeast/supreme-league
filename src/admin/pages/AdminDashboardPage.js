import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Row, Table } from 'react-bootstrap';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CircleDollarSign,
  LifeBuoy,
  RefreshCw,
  Trophy,
  UserPlus,
  UsersRound,
  WalletCards,
} from 'lucide-react';

import { adminApi, dateTime, humanize, money } from '../adminApi';
import { AdminError, AdminLoading } from '../components/AdminDataState';
import AdminAnalyticsPanel from '../components/AdminAnalyticsPanel';
import AdminMetaAdsPanel from '../components/AdminMetaAdsPanel';
import AdminPageHeader from '../components/AdminPageHeader';
import StatCard from '../components/StatCard';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);
  const [emailHealth, setEmailHealth] = useState(null);

  const load = async (forceRefresh = false) => {
    if (data && forceRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const suffix = forceRefresh ? `?refresh=${Date.now()}` : '';
      const [dashboardResult, healthResult] = await Promise.allSettled([
        adminApi(`/dashboard${suffix}`),
        adminApi('/notifications/health'),
      ]);
      if (dashboardResult.status === 'rejected') throw dashboardResult.reason;
      setData(dashboardResult.value);
      setEmailHealth(healthResult.status === 'fulfilled' ? healthResult.value : null);
      if (forceRefresh) setRefreshToken((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message || 'The dashboard could not be loaded.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <AdminLoading message="Loading administration dashboard…" />;
  }

  if (error && !data) {
    return <AdminError message={error} onRetry={() => load(true)} />;
  }

  return (
    <>
      <AdminPageHeader
        title="Administration dashboard"
        description="A live operational view of users, leagues, cash inflows, revenue, payouts and support workload."
        actions={(
          <Button
            variant="outline-dark"
            onClick={() => load(true)}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'admin-spin' : ''} />
            <span className="ms-2">{refreshing ? 'Refreshing…' : 'Refresh database'}</span>
          </Button>
        )}
      />

      {error && <AdminError message={error} />}
      {emailHealth && (!emailHealth.enabled || !emailHealth.senderConfigured || !emailHealth.adminInboxConfigured) && (
        <Alert variant="warning">
          <strong>Operations email alerts need configuration.</strong> Check EMAILS_ENABLED, RESENDER_API_KEY,
          SENDING_EMAIL and ADMIN_NOTIFICATION_EMAIL in the backend deployment. Transactional and marketing
          emails cannot be relied on until the service is configured and a real delivery test succeeds.
        </Alert>
      )}
      {emailHealth?.failedCount > 0 && (
        <Alert variant="warning">The email-delivery log contains {emailHealth.failedCount} failed message(s) since tracking began. Review the email provider and notification records.</Alert>
      )}

      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <StatCard
            label="Total users"
            value={data.users}
            detail={`${data.newUsers} new this month`}
            icon={UsersRound}
            tone="primary"
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="Active subscriptions"
            value={data.activeSubscriptions}
            detail={`${data.usersInLeagues} users in leagues`}
            icon={UserPlus}
            tone="success"
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="Active leagues"
            value={data.leagues.active}
            detail={`${data.leagues.total} leagues in total`}
            icon={Trophy}
            tone="warning"
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="Cash received — since launch"
            value={money(data.cashAccounting?.lifetime?.collectedCents)}
            detail="Completed live Paynow receipts (no wallet transfers or tests)"
            icon={CircleDollarSign}
            tone="success"
          />
        </Col>
      </Row>

      <Card className="admin-card mb-4">
        <Card.Header>
          <h2 className="admin-card-title">Cash collected versus paid out</h2>
          <div className="admin-card-subtitle">Actual recorded Paynow collections and completed cash withdrawals, in USD. Uses UTC calendar months. Prize credits inside wallets are not cash paid out.</div>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            {[
              ['Since launch', data.cashAccounting?.lifetime],
              ['This month', data.cashAccounting?.thisMonth],
              ['Last month', data.cashAccounting?.lastMonth],
            ].map(([label, totals]) => <Col md={4} key={label}>
              <div className="border rounded-4 p-3 h-100">
                <h3 className="h6 mb-3">{label}</h3>
                <div className="d-flex align-items-center justify-content-between mb-2"><span><ArrowDownToLine size={15} className="me-2" />Collected</span><strong>{money(totals?.collectedCents)}</strong></div>
                <div className="d-flex align-items-center justify-content-between mb-2"><span><ArrowUpFromLine size={15} className="me-2" />Paid out</span><strong>{money(totals?.paidOutCents)}</strong></div>
                <div className="d-flex align-items-center justify-content-between border-top pt-2"><span>Net cash movement</span><strong>{money(totals?.netCashMovementCents)}</strong></div>
                <div className="text-secondary small mt-2">{totals?.collectionsCount ?? 0} receipts · {totals?.withdrawalsCount ?? 0} completed withdrawals</div>
              </div>
            </Col>)}
          </Row>
          <p className="text-secondary small mt-3 mb-0">These are application ledger figures, not a verified bank balance. Reconcile with your Paynow and withdrawal provider statements, especially historic/manual payments.</p>
        </Card.Body>
      </Card>

      {Number(data.missingWalletCount || 0) > 0 && <Alert variant="warning"><strong>Missing wallet records:</strong> {data.missingWalletCount} user account(s) have no wallet document. Their balances are shown as missing in the player list; investigate before making adjustments.</Alert>}

      <Card className="admin-card mb-4">
        <Card.Header><h2 className="admin-card-title">Recent financial transactions</h2><div className="admin-card-subtitle">Latest 15 recorded transactions, including pending and failed attempts. These are not all cash movements.</div></Card.Header>
        <Card.Body>
          <Table responsive hover className="admin-table mb-0"><thead><tr><th>When</th><th>User</th><th>Transaction</th><th>Amount</th><th>Status</th><th>Provider</th></tr></thead>
            <tbody>{(data.recentTransactions || []).map((transaction) => <tr key={transaction._id}>
              <td>{dateTime(transaction.createdAt)}</td>
              <td>{transaction.userId?.fullName || transaction.userId?.email || 'Unknown'}</td>
              <td>{humanize(transaction.type)}<div className="small text-secondary">{transaction.reference}</div></td>
              <td>{transaction.direction === 'debit' ? '−' : '+'}{money(transaction.amountCents)}</td>
              <td>{humanize(transaction.status)}</td>
              <td>{transaction.provider || '—'}</td>
            </tr>)}</tbody>
          </Table>
          {!data.recentTransactions?.length && <div className="text-secondary small">No transactions recorded yet.</div>}
        </Card.Body>
      </Card>

      <Row className="g-4">
        <Col xl={7}>
          <Card className="admin-card h-100">
            <Card.Header>
              <h2 className="admin-card-title">League portfolio</h2>
              <div className="admin-card-subtitle">
                Distribution of all competitions by league type.
              </div>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-3">
                {data.leagues.byType.map((item) => {
                  const percentage = data.leagues.total
                    ? Math.round((item.count / data.leagues.total) * 100)
                    : 0;

                  return (
                    <div key={item._id}>
                      <div className="d-flex justify-content-between gap-3 mb-2">
                        <span className="fw-semibold">{humanize(item._id)}</span>
                        <span className="text-secondary small">
                          {item.count} · {percentage}%
                        </span>
                      </div>
                      <div className="progress" style={{ height: 8 }}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{ width: `${percentage}%` }}
                          aria-valuenow={percentage}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={5}>
          <Card className="admin-card h-100">
            <Card.Header>
              <h2 className="admin-card-title">Operations snapshot</h2>
              <div className="admin-card-subtitle">
                Items that may need administrator attention.
              </div>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-3">
                <div className="d-flex align-items-center gap-3 p-3 rounded-4 bg-light">
                  <span className="admin-stat-icon admin-stat-icon-primary">
                    <UsersRound size={20} />
                  </span>
                  <div className="flex-grow-1">
                    <div className="fw-semibold">League participants</div>
                    <div className="small text-secondary">Distinct users with league entries</div>
                  </div>
                  <strong>{data.usersInLeagues}</strong>
                </div>

                <div className="d-flex align-items-center gap-3 p-3 rounded-4 bg-light">
                  <span className="admin-stat-icon admin-stat-icon-warning">
                    <LifeBuoy size={20} />
                  </span>
                  <div className="flex-grow-1">
                    <div className="fw-semibold">Open support tickets</div>
                    <div className="small text-secondary">Unresolved customer requests</div>
                  </div>
                  <strong>{data.openTickets}</strong>
                </div>

                <div className="d-flex align-items-center gap-3 p-3 rounded-4 bg-light">
                  <span className="admin-stat-icon admin-stat-icon-danger">
                    <WalletCards size={20} />
                  </span>
                  <div className="flex-grow-1">
                    <div className="fw-semibold">Payouts due</div>
                    <div className="small text-secondary">Pending prizes and withdrawals</div>
                  </div>
                  <strong>{money(data.finances.payoutsDueCents)}</strong>
                </div>

                <div className="d-flex align-items-center gap-3 p-3 rounded-4 bg-light">
                  <span className="admin-stat-icon admin-stat-icon-success">
                    <CircleDollarSign size={20} />
                  </span>
                  <div className="flex-grow-1">
                    <div className="fw-semibold">Revenue — 30 months</div>
                    <div className="small text-secondary">Subscriptions, league fees and platform fees</div>
                  </div>
                  <strong>{money(data.finances.revenueCents)}</strong>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <AdminMetaAdsPanel refreshToken={refreshToken} />
      <AdminAnalyticsPanel refreshToken={refreshToken} />
    </>
  );
}
