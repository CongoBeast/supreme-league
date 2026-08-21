import { useEffect, useState } from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import {
  CircleDollarSign,
  LifeBuoy,
  RefreshCw,
  Trophy,
  UserPlus,
  UsersRound,
  WalletCards,
} from 'lucide-react';

import { adminApi, humanize, money } from '../adminApi';
import { AdminError, AdminLoading } from '../components/AdminDataState';
import AdminAnalyticsPanel from '../components/AdminAnalyticsPanel';
import AdminPageHeader from '../components/AdminPageHeader';
import StatCard from '../components/StatCard';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);

  const load = async (forceRefresh = false) => {
    if (data && forceRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const suffix = forceRefresh ? `?refresh=${Date.now()}` : '';
      setData(await adminApi(`/dashboard${suffix}`));
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
            label="Cash inflow — 30 months"
            value={money(data.finances.cashInCents)}
            detail="Completed external funds received"
            icon={CircleDollarSign}
            tone="success"
          />
        </Col>
      </Row>

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

      <AdminAnalyticsPanel refreshToken={refreshToken} />
    </>
  );
}
