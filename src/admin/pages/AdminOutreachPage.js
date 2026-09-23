import { useEffect, useState } from 'react';
import { Badge, Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import {
  CheckCircle2,
  Link2Off,
  MessageCircle,
  Phone,
  Trophy,
  UserRoundCheck,
  UserRoundX,
} from 'lucide-react';

import { adminApi, buildQuery, dateTime } from '../adminApi';
import { AdminEmpty, AdminError, AdminLoading } from '../components/AdminDataState';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminPagination from '../components/AdminPagination';
import StatCard from '../components/StatCard';

const whatsappHref = (phone = '') => {
  const digits = String(phone).replace(/\D/g, '');
  if (/^0\d{9}$/.test(digits)) return `https://wa.me/263${digits.slice(1)}`;
  if (/^263\d{9}$/.test(digits)) return `https://wa.me/${digits}`;
  if (/^\d{9}$/.test(digits)) return `https://wa.me/263${digits}`;
  return digits ? `https://wa.me/${digits}` : '';
};

const metricDetail = (metric, totalUsers) =>
  `${Number(metric?.percentage || 0).toFixed(1)}% of ${Number(totalUsers || 0).toLocaleString('en-GB')} users`;

export default function AdminOutreachPage() {
  const [filters, setFilters] = useState({
    search: '',
    contacted: 'all',
    team: 'all',
    paidLeague: 'all',
  });
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = async ({ background = false } = {}) => {
    if (background) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const query = buildQuery({ ...filters, page, limit: 25 });
      const response = await adminApi(`/outreach?${query}`);
      setData(response);
      return response;
    } catch (requestError) {
      setError(requestError.message || 'The WhatsApp outreach list could not be loaded.');
      return null;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => load({ background: Boolean(data) }), filters.search ? 300 : 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const toggleContacted = async (user) => {
    const contacted = !user.whatsappOutreach?.contacted;
    setBusyId(user.id);
    setError('');
    try {
      await adminApi(`/outreach/${user.id}`, {
        method: 'PATCH',
        body: { contacted },
      });
      await load({ background: true });
    } catch (requestError) {
      setError(requestError.message || 'The WhatsApp contact flag could not be updated.');
    } finally {
      setBusyId('');
    }
  };

  if (loading && !data) return <AdminLoading message="Loading WhatsApp outreach…" />;
  if (error && !data) return <AdminError message={error} onRetry={() => load()} />;

  const stats = data?.stats || {};
  const totalUsers = stats.totalUsers || 0;

  return (
    <>
      <AdminPageHeader
        eyebrow="Member outreach"
        title="WhatsApp outreach"
        description="Track which members have already been contacted, open their WhatsApp chat, and focus follow-up on people who have not linked an FPL team or have never entered a paid league."
        actions={refreshing ? <Badge bg="light" text="dark" className="border px-3 py-2">Refreshing…</Badge> : null}
      />

      {error && <AdminError message={error} />}

      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <StatCard
            icon={UserRoundCheck}
            label="Contacted"
            value={Number(stats.contacted?.count || 0).toLocaleString('en-GB')}
            detail={metricDetail(stats.contacted, totalUsers)}
            tone="success"
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            icon={UserRoundX}
            label="Uncontacted"
            value={Number(stats.uncontacted?.count || 0).toLocaleString('en-GB')}
            detail={metricDetail(stats.uncontacted, totalUsers)}
            tone="warning"
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            icon={Link2Off}
            label="Team not linked"
            value={Number(stats.notLinked?.count || 0).toLocaleString('en-GB')}
            detail={metricDetail(stats.notLinked, totalUsers)}
            tone="danger"
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            icon={Trophy}
            label="Never played paid league"
            value={Number(stats.neverPaidLeague?.count || 0).toLocaleString('en-GB')}
            detail={metricDetail(stats.neverPaidLeague, totalUsers)}
            tone="info"
          />
        </Col>
      </Row>

      <Card className="admin-filter-card border-0 mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col lg={4}>
              <Form.Label>Search members</Form.Label>
              <Form.Control
                value={filters.search}
                onChange={(event) => updateFilter('search', event.target.value)}
                placeholder="Name, email or phone"
              />
            </Col>
            <Col sm={6} lg={2}>
              <Form.Label>WhatsApp status</Form.Label>
              <Form.Select value={filters.contacted} onChange={(event) => updateFilter('contacted', event.target.value)}>
                <option value="all">All</option>
                <option value="uncontacted">Uncontacted</option>
                <option value="contacted">Contacted</option>
              </Form.Select>
            </Col>
            <Col sm={6} lg={3}>
              <Form.Label>FPL team</Form.Label>
              <Form.Select value={filters.team} onChange={(event) => updateFilter('team', event.target.value)}>
                <option value="all">All team states</option>
                <option value="unlinked">Not linked</option>
                <option value="linked">Linked</option>
              </Form.Select>
            </Col>
            <Col sm={6} lg={3}>
              <Form.Label>Paid league history</Form.Label>
              <Form.Select value={filters.paidLeague} onChange={(event) => updateFilter('paidLeague', event.target.value)}>
                <option value="all">All users</option>
                <option value="never">Never played paid</option>
                <option value="played">Has played paid</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="admin-card border-0">
        <Card.Body>
          {data?.rows?.length ? (
            <>
              <div className="table-responsive">
                <Table hover align="middle" className="admin-table mb-0">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>WhatsApp</th>
                      <th>FPL team</th>
                      <th>Paid league</th>
                      <th>Contact status</th>
                      <th>Last flagged</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((user) => {
                      const chatLink = whatsappHref(user.phone);
                      const contacted = Boolean(user.whatsappOutreach?.contacted);
                      return (
                        <tr key={user.id}>
                          <td>
                            <div className="fw-semibold">{user.fullName}</div>
                            <div className="admin-table-secondary">{user.email}</div>
                          </td>
                          <td>
                            <div className="fw-semibold">{user.phone || '—'}</div>
                            {chatLink && (
                              <Button as="a" href={chatLink} target="_blank" rel="noopener noreferrer" size="sm" variant="link" className="px-0 text-decoration-none">
                                <Phone size={14} className="me-1" /> Open WhatsApp
                              </Button>
                            )}
                          </td>
                          <td>
                            {user.teamLinked
                              ? <Badge bg="success">Linked</Badge>
                              : <Badge bg="warning" text="dark">Not linked</Badge>}
                            {user.fantasyTeamName && <div className="admin-table-secondary mt-1">{user.fantasyTeamName}</div>}
                          </td>
                          <td>
                            {user.hasPlayedPaidLeague
                              ? <Badge bg="success">Played paid</Badge>
                              : <Badge bg="secondary">Never paid</Badge>}
                          </td>
                          <td>
                            {contacted
                              ? <Badge bg="success"><CheckCircle2 size={13} className="me-1" /> Contacted</Badge>
                              : <Badge bg="warning" text="dark"><MessageCircle size={13} className="me-1" /> Uncontacted</Badge>}
                          </td>
                          <td>{contacted ? dateTime(user.whatsappOutreach?.contactedAt) : '—'}</td>
                          <td className="text-end">
                            <Button
                              size="sm"
                              variant={contacted ? 'outline-secondary' : 'dark'}
                              disabled={busyId === user.id}
                              onClick={() => toggleContacted(user)}
                            >
                              {busyId === user.id ? 'Saving…' : contacted ? 'Mark uncontacted' : 'Mark contacted'}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
              <AdminPagination pagination={data.pagination} onPageChange={setPage} />
            </>
          ) : (
            <AdminEmpty
              title="No users match these outreach filters"
              message="Change the contact, team-link or paid-league filter to see more members."
            />
          )}
        </Card.Body>
      </Card>
    </>
  );
}
