import { useEffect, useState } from 'react';
import { Card, Col, Form, Row, Table } from 'react-bootstrap';
import { Search, ShieldCheck, UserPlus, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';

import { adminApi, buildQuery, dateTime, money } from '../adminApi';
import {
  AdminEmpty,
  AdminError,
  AdminLoading,
} from '../components/AdminDataState';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminPagination from '../components/AdminPagination';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export default function AdminUsersPage() {
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi('/dashboard').then(setDashboard).catch(() => null);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const firstLoad = !data;
      firstLoad ? setLoading(true) : setRefreshing(true);
      setError('');

      try {
        const query = buildQuery({ ...filters, page, limit: 25 });
        setData(await adminApi(`/users?${query}`));
      } catch (requestError) {
        setError(requestError.message || 'The users could not be loaded.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, filters.search ? 300 : 0);

    return () => clearTimeout(timer);
  }, [filters, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  if (loading) {
    return <AdminLoading message="Loading users…" />;
  }

  if (error && !data) {
    return <AdminError message={error} />;
  }

  return (
    <>
      <AdminPageHeader
        title="Manage users"
        description="Find user accounts, review subscription and league participation, then open a profile for complete activity and financial history."
      />

      {dashboard && (
        <Row className="g-3 mb-4">
          <Col sm={6} xl={3}>
            <StatCard label="Total users" value={dashboard.users} icon={UsersRound} />
          </Col>
          <Col sm={6} xl={3}>
            <StatCard
              label="New this month"
              value={dashboard.newUsers}
              detail="Accounts created this calendar month"
              icon={UserPlus}
              tone="success"
            />
          </Col>
          <Col sm={6} xl={3}>
            <StatCard
              label="Active subscriptions"
              value={dashboard.activeSubscriptions}
              icon={ShieldCheck}
              tone="info"
            />
          </Col>
          <Col sm={6} xl={3}>
            <StatCard
              label="League participants"
              value={dashboard.usersInLeagues}
              detail="Distinct users with league entries"
              icon={UsersRound}
              tone="warning"
            />
          </Col>
        </Row>
      )}

      <Card className="admin-card admin-filter-card">
        <Card.Body>
          <Row className="g-3">
            <Col lg={9}>
              <Form.Label className="admin-filter-label">Search users</Form.Label>
              <div className="position-relative">
                <Search
                  size={17}
                  className="position-absolute top-50 translate-middle-y text-secondary"
                  style={{ left: 14 }}
                />
                <Form.Control
                  value={filters.search}
                  onChange={(event) => updateFilter('search', event.target.value)}
                  placeholder="Search by name, email or phone"
                  style={{ paddingLeft: 42 }}
                />
              </div>
            </Col>
            <Col lg={3}>
              <Form.Label className="admin-filter-label">Account status</Form.Label>
              <Form.Select
                value={filters.status}
                onChange={(event) => updateFilter('status', event.target.value)}
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="closed">Closed</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && <AdminError message={error} />}
      {refreshing && <AdminLoading compact message="Updating user results…" />}

      <Card className="admin-card admin-table-card mt-3">
        {data?.rows?.length ? (
          <>
            <Table responsive hover className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Subscription</th>
                  <th>Leagues</th>
                  <th>Wallet</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <Link className="admin-table-link" to={`/admin/users/${user.id}`}>
                        {user.fullName}
                      </Link>
                      <div className="admin-table-secondary">{user.email}</div>
                    </td>
                    <td><StatusBadge value={user.status} /></td>
                    <td>{dateTime(user.createdAt)}</td>
                    <td>{user.subscription?.planName || 'No active subscription'}</td>
                    <td>{user.leagueCount}</td>
                    <td>{money(user.wallet?.availableBalanceCents)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <AdminPagination pagination={data.pagination} onPageChange={setPage} />
          </>
        ) : (
          <AdminEmpty
            title="No users match these filters"
            message="Clear the search or choose another account status."
          />
        )}
      </Card>
    </>
  );
}
