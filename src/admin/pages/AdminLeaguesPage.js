import { useEffect, useState } from 'react';
import { Card, Col, Form, Row, Table } from 'react-bootstrap';
import { Layers3, Search, Trophy, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';

import { adminApi, buildQuery, dateTime, humanize, money } from '../adminApi';
import {
  AdminEmpty,
  AdminError,
  AdminLoading,
} from '../components/AdminDataState';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminPagination from '../components/AdminPagination';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

const statuses = [
  'draft',
  'open',
  'full',
  'upcoming',
  'live',
  'awaiting-review',
  'settled',
  'cancelled',
];

export default function AdminLeaguesPage() {
  const [filters, setFilters] = useState({ search: '', status: '', type: '' });
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
        setData(await adminApi(`/leagues?${query}`));
      } catch (requestError) {
        setError(requestError.message || 'The leagues could not be loaded.');
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
    return <AdminLoading message="Loading leagues…" />;
  }

  if (error && !data) {
    return <AdminError message={error} />;
  }

  const leagueTypes = dashboard?.leagues?.byType || [];

  return (
    <>
      <AdminPageHeader
        title="Manage leagues"
        description="Search every competition, review capacity and status, and open a league to manage its members, rules and leaderboard."
      />

      {dashboard && (
        <Row className="g-3 mb-4">
          <Col sm={6} xl={3}>
            <StatCard
              label="All leagues"
              value={dashboard.leagues.total}
              detail="Across every competition type"
              icon={Trophy}
            />
          </Col>
          <Col sm={6} xl={3}>
            <StatCard
              label="Active leagues"
              value={dashboard.leagues.active}
              detail="Open, upcoming or live"
              icon={UsersRound}
              tone="success"
            />
          </Col>
          <Col sm={6} xl={3}>
            <StatCard
              label="Inactive leagues"
              value={Math.max(dashboard.leagues.total - dashboard.leagues.active, 0)}
              detail="Draft, settled or cancelled"
              icon={Layers3}
              tone="warning"
            />
          </Col>
          <Col sm={6} xl={3}>
            <StatCard
              label="League types"
              value={leagueTypes.length}
              detail="Distinct competition formats"
              icon={Layers3}
              tone="info"
            />
          </Col>
        </Row>
      )}

      <Card className="admin-card admin-filter-card">
        <Card.Body>
          <Row className="g-3">
            <Col lg={6}>
              <Form.Label className="admin-filter-label">Search leagues</Form.Label>
              <div className="position-relative">
                <Search
                  size={17}
                  className="position-absolute top-50 translate-middle-y text-secondary"
                  style={{ left: 14 }}
                />
                <Form.Control
                  value={filters.search}
                  onChange={(event) => updateFilter('search', event.target.value)}
                  placeholder="Search by name, type or status"
                  style={{ paddingLeft: 42 }}
                />
              </div>
            </Col>
            <Col sm={6} lg={3}>
              <Form.Label className="admin-filter-label">Status</Form.Label>
              <Form.Select
                value={filters.status}
                onChange={(event) => updateFilter('status', event.target.value)}
              >
                <option value="">All statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {humanize(status)}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col sm={6} lg={3}>
              <Form.Label className="admin-filter-label">Competition type</Form.Label>
              <Form.Select
                value={filters.type}
                onChange={(event) => updateFilter('type', event.target.value)}
              >
                <option value="">All types</option>
                {leagueTypes.map((item) => (
                  <option key={item._id} value={item._id}>
                    {humanize(item._id)}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && <AdminError message={error} />}
      {refreshing && <AdminLoading compact message="Updating league results…" />}

      <Card className="admin-card admin-table-card mt-3">
        {data?.rows?.length ? (
          <>
            <Table responsive hover className="admin-table">
              <thead>
                <tr>
                  <th>League</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Members</th>
                  <th>Entry fee</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((league) => (
                  <tr key={league._id}>
                    <td>
                      <Link className="admin-table-link" to={`/admin/leagues/${league._id}`}>
                        {league.name}
                      </Link>
                      <div className="admin-table-secondary">
                        Gameweeks {league.startGameweek}–{league.endGameweek}
                      </div>
                    </td>
                    <td>{humanize(league.competitionType)}</td>
                    <td><StatusBadge value={league.status} /></td>
                    <td>
                      {league.memberCount}/{league.maximumParticipants}
                    </td>
                    <td>{money(league.entryFeeCents)}</td>
                    <td>{dateTime(league.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <AdminPagination pagination={data.pagination} onPageChange={setPage} />
          </>
        ) : (
          <AdminEmpty
            title="No leagues match these filters"
            message="Clear the search or select a different status or competition type."
          />
        )}
      </Card>
    </>
  );
}
