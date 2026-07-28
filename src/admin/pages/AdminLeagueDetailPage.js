import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { CalendarClock, ShieldCheck, Trophy, UsersRound } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { adminApi, dateTime, humanize, money } from '../adminApi';
import { AdminEmpty, AdminError, AdminLoading } from '../components/AdminDataState';
import AdminPageHeader from '../components/AdminPageHeader';
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

export default function AdminLeagueDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setData(await adminApi(`/leagues/${id}`));
    } catch (requestError) {
      setError(requestError.message || 'The league could not be loaded.');
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
      await adminApi(`/leagues/${id}/status`, {
        method: 'PATCH',
        body: { status },
      });
      setMessage('League status updated.');
      await load();
    } catch (requestError) {
      setError(requestError.message || 'The league status could not be updated.');
    } finally {
      setSaving(false);
    }
  };

  const addMember = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await adminApi(`/leagues/${id}/members`, {
        method: 'POST',
        body: { email },
      });
      setEmail('');
      setMessage('Member added to the league.');
      await load();
    } catch (requestError) {
      setError(requestError.message || 'The member could not be added.');
    } finally {
      setSaving(false);
    }
  };

  const removeMember = async (userId, memberName) => {
    if (!userId) return;
    if (!window.confirm(`Remove ${memberName || 'this member'} from the league?`)) return;

    setSaving(true);
    setError('');
    setMessage('');
    try {
      await adminApi(`/leagues/${id}/members/${userId}`, { method: 'DELETE' });
      setMessage('Member removed from the league.');
      await load();
    } catch (requestError) {
      setError(requestError.message || 'The member could not be removed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AdminLoading message="Loading league information…" />;
  }

  if (error && !data) {
    return <AdminError message={error} onRetry={load} />;
  }

  const league = data.league;
  const members = data.leaderboard || [];

  return (
    <>
      <AdminPageHeader
        eyebrow="League management"
        title={league.name}
        description={league.description || 'No league description has been provided.'}
        backTo="/admin/leagues"
        backLabel="Back to leagues"
        actions={
          <Form.Select
            aria-label="League status"
            value={league.status}
            onChange={(event) => updateStatus(event.target.value)}
            disabled={saving}
            style={{ minWidth: 220 }}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>{humanize(status)}</option>
            ))}
          </Form.Select>
        }
      />

      {error && <AdminError message={error} />}
      {message && <Alert variant="success">{message}</Alert>}

      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <StatCard
            label="Competition type"
            value={humanize(league.competitionType)}
            detail={humanize(league.ruleType)}
            icon={Trophy}
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="Members"
            value={`${members.length}/${league.maximumParticipants}`}
            detail={`${league.minimumParticipants} minimum participants`}
            icon={UsersRound}
            tone="success"
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="Entry fee"
            value={money(league.entryFeeCents)}
            detail={`${money(league.displayedPrizeCents)} displayed prize`}
            icon={ShieldCheck}
            tone="warning"
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="Gameweek window"
            value={`${league.startGameweek}–${league.endGameweek}`}
            detail={`Created ${dateTime(league.createdAt)}`}
            icon={CalendarClock}
            tone="info"
          />
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col xl={7}>
          <Card className="admin-card h-100">
            <Card.Header>
              <h2 className="admin-card-title">League information</h2>
              <div className="admin-card-subtitle">Configuration, ownership and competition timing.</div>
            </Card.Header>
            <Card.Body>
              <dl className="admin-detail-grid mb-0">
                <div className="admin-detail-item">
                  <dt>Status</dt>
                  <dd><StatusBadge value={league.status} /></dd>
                </div>
                <div className="admin-detail-item">
                  <dt>Created by</dt>
                  <dd>{league.createdBy?.fullName || league.createdBy?.email || 'System'}</dd>
                </div>
                <div className="admin-detail-item">
                  <dt>Created</dt>
                  <dd>{dateTime(league.createdAt)}</dd>
                </div>
                <div className="admin-detail-item">
                  <dt>Last updated</dt>
                  <dd>{dateTime(league.updatedAt)}</dd>
                </div>
                <div className="admin-detail-item">
                  <dt>Start gameweek</dt>
                  <dd>{league.startGameweek}</dd>
                </div>
                <div className="admin-detail-item">
                  <dt>Expiry gameweek</dt>
                  <dd>{league.endGameweek}</dd>
                </div>
                <div className="admin-detail-item">
                  <dt>Invite only</dt>
                  <dd>{league.inviteOnly ? 'Yes' : 'No'}</dd>
                </div>
                <div className="admin-detail-item">
                  <dt>Official league</dt>
                  <dd>{league.officialSupremeLeague ? 'Yes' : 'No'}</dd>
                </div>
              </dl>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={5}>
          <Card className="admin-card h-100">
            <Card.Header>
              <h2 className="admin-card-title">League rules</h2>
              <div className="admin-card-subtitle">Rules currently applied to this competition.</div>
            </Card.Header>
            <Card.Body>
              {league.rules?.length ? (
                <ul className="admin-rule-list">
                  {league.rules.map((rule, index) => <li key={`${rule}-${index}`}>{rule}</li>)}
                </ul>
              ) : (
                <AdminEmpty title="No league rules recorded" message="This league has no custom rule list." />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="admin-card mb-4">
        <Card.Header>
          <h2 className="admin-card-title">Add league member</h2>
          <div className="admin-card-subtitle">Add an existing user account by email address.</div>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={addMember}>
            <Row className="g-3 align-items-end">
              <Col lg={9}>
                <Form.Label className="admin-filter-label">User email</Form.Label>
                <Form.Control
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="member@example.com"
                />
              </Col>
              <Col lg={3}>
                <Button type="submit" className="w-100" disabled={saving}>
                  {saving ? 'Updating league…' : 'Add member'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Card className="admin-card admin-table-card">
        {members.length ? (
          <Table responsive hover className="admin-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Member</th>
                <th>Joined</th>
                <th>Eligibility</th>
                <th>Score</th>
                <th>Prize</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {members.map((entry) => (
                <tr key={entry.entryId}>
                  <td>{entry.rank || '—'}</td>
                  <td>
                    <div className="admin-table-primary">{entry.user?.fullName || 'Unknown user'}</div>
                    <div className="admin-table-secondary">{entry.user?.email || '—'}</div>
                  </td>
                  <td>{dateTime(entry.joinedAt)}</td>
                  <td><StatusBadge value={entry.eligibilityStatus} /></td>
                  <td>{entry.score || 0}</td>
                  <td>{money(entry.prizeCents)}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      disabled={saving}
                      onClick={() => removeMember(entry.user?._id, entry.user?.fullName)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <AdminEmpty title="This league has no members" message="Use the form above to add an existing user." />
        )}
      </Card>
    </>
  );
}
