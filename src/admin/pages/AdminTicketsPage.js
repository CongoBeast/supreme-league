import { useEffect, useState } from 'react';
import { Card, Col, Form, Row, Table } from 'react-bootstrap';
import { AlertTriangle, CheckCircle2, LifeBuoy, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

import { adminApi, buildQuery, dateTime, humanize } from '../adminApi';
import {
  AdminEmpty,
  AdminError,
  AdminLoading,
} from '../components/AdminDataState';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminPagination from '../components/AdminPagination';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export default function AdminTicketsPage() {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    category: '',
  });
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(async () => {
      const firstLoad = !data;
      firstLoad ? setLoading(true) : setRefreshing(true);
      setError('');

      try {
        const query = buildQuery({ ...filters, page, limit: 25 });
        setData(await adminApi(`/tickets?${query}`));
      } catch (requestError) {
        setError(requestError.message || 'The support tickets could not be loaded.');
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
    return <AdminLoading message="Loading support tickets…" />;
  }

  if (error && !data) {
    return <AdminError message={error} />;
  }

  const rows = data?.rows || [];
  const visibleOpen = rows.filter((ticket) =>
    ['open', 'in-progress', 'waiting-user'].includes(ticket.status)
  ).length;
  const visibleUrgent = rows.filter((ticket) => ticket.priority === 'urgent').length;
  const visibleClosed = rows.filter((ticket) => ticket.status === 'closed').length;

  return (
    <>
      <AdminPageHeader
        title="Support tickets"
        description="Review customer issues, prioritise urgent requests, respond to users and keep a complete closure trail."
      />

      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <StatCard
            label="Matching tickets"
            value={data?.pagination?.total || 0}
            detail="Across the current filter set"
            icon={LifeBuoy}
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="Open on this page"
            value={visibleOpen}
            icon={LifeBuoy}
            tone="warning"
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="Urgent on this page"
            value={visibleUrgent}
            icon={AlertTriangle}
            tone="danger"
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="Closed on this page"
            value={visibleClosed}
            icon={CheckCircle2}
            tone="success"
          />
        </Col>
      </Row>

      <Card className="admin-card admin-filter-card">
        <Card.Body>
          <Row className="g-3">
            <Col xl={5}>
              <Form.Label className="admin-filter-label">Search tickets</Form.Label>
              <div className="position-relative">
                <Search
                  size={17}
                  className="position-absolute top-50 translate-middle-y text-secondary"
                  style={{ left: 14 }}
                />
                <Form.Control
                  value={filters.search}
                  onChange={(event) => updateFilter('search', event.target.value)}
                  placeholder="Ticket number, subject or message"
                  style={{ paddingLeft: 42 }}
                />
              </div>
            </Col>
            <Col sm={6} xl={2}>
              <Form.Label className="admin-filter-label">Status</Form.Label>
              <Form.Select
                value={filters.status}
                onChange={(event) => updateFilter('status', event.target.value)}
              >
                <option value="">All statuses</option>
                {['open', 'in-progress', 'waiting-user', 'resolved', 'closed'].map((status) => (
                  <option key={status} value={status}>{humanize(status)}</option>
                ))}
              </Form.Select>
            </Col>
            <Col sm={6} xl={2}>
              <Form.Label className="admin-filter-label">Priority</Form.Label>
              <Form.Select
                value={filters.priority}
                onChange={(event) => updateFilter('priority', event.target.value)}
              >
                <option value="">All priorities</option>
                {['low', 'normal', 'high', 'urgent'].map((priority) => (
                  <option key={priority} value={priority}>{humanize(priority)}</option>
                ))}
              </Form.Select>
            </Col>
            <Col sm={6} xl={3}>
              <Form.Label className="admin-filter-label">Category</Form.Label>
              <Form.Control
                value={filters.category}
                onChange={(event) => updateFilter('category', event.target.value)}
                placeholder="Payment, account, league…"
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && <AdminError message={error} />}
      {refreshing && <AdminLoading compact message="Updating ticket results…" />}

      <Card className="admin-card admin-table-card mt-3">
        {rows.length ? (
          <>
            <Table responsive hover className="admin-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>User</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Last activity</th>
                  <th>Closed by</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((ticket) => (
                  <tr key={ticket._id}>
                    <td>
                      <Link className="admin-table-link" to={`/admin/tickets/${ticket._id}`}>
                        {ticket.ticketNumber}
                      </Link>
                      <div className="admin-table-secondary">{ticket.subject}</div>
                    </td>
                    <td>
                      <div className="admin-table-primary">
                        {ticket.userId?.fullName || 'Guest'}
                      </div>
                      <div className="admin-table-secondary">
                        {ticket.userId?.email || 'No account email'}
                      </div>
                    </td>
                    <td>{humanize(ticket.category)}</td>
                    <td><StatusBadge value={ticket.priority} /></td>
                    <td><StatusBadge value={ticket.status} /></td>
                    <td>{dateTime(ticket.lastActivityAt)}</td>
                    <td>{ticket.closedBy?.fullName || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <AdminPagination pagination={data.pagination} onPageChange={setPage} />
          </>
        ) : (
          <AdminEmpty
            title="No support tickets match these filters"
            message="Clear the search or choose a different status, priority or category."
          />
        )}
      </Card>
    </>
  );
}
