import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { Clock3, LifeBuoy, MessageSquareText, UserRound } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { adminApi, dateTime, humanize } from '../adminApi';
import { AdminError, AdminLoading } from '../components/AdminDataState';
import AdminPageHeader from '../components/AdminPageHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export default function AdminTicketDetailPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await adminApi(`/tickets/${id}`);
      setTicket(result.ticket);
    } catch (requestError) {
      setError(requestError.message || 'The support ticket could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const save = async (patch, successMessage) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await adminApi(`/tickets/${id}`, { method: 'PATCH', body: patch });
      setResponse('');
      setMessage(successMessage || 'Ticket updated.');
      await load();
    } catch (requestError) {
      setError(requestError.message || 'The support ticket could not be updated.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AdminLoading message="Loading support ticket…" />;
  }

  if (error && !ticket) {
    return <AdminError message={error} onRetry={load} />;
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Support management"
        title={`${ticket.ticketNumber}: ${ticket.subject}`}
        description={`Opened ${dateTime(ticket.createdAt)} by ${ticket.userId?.email || 'a guest user'}.`}
        backTo="/admin/tickets"
        backLabel="Back to tickets"
      />

      {error && <AdminError message={error} />}
      {message && <Alert variant="success">{message}</Alert>}

      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <StatCard label="Status" value={humanize(ticket.status)} icon={LifeBuoy} />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard label="Priority" value={humanize(ticket.priority)} icon={Clock3} tone="warning" />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard label="Category" value={humanize(ticket.category)} icon={MessageSquareText} tone="info" />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="Customer"
            value={ticket.userId?.fullName || 'Guest'}
            detail={ticket.userId?.email || 'No account email'}
            icon={UserRound}
            tone="success"
          />
        </Col>
      </Row>

      <Row className="g-4">
        <Col xl={8}>
          <Card className="admin-card mb-4">
            <Card.Header>
              <h2 className="admin-card-title">Original message</h2>
              <div className="admin-card-subtitle">Submitted {dateTime(ticket.createdAt)}</div>
            </Card.Header>
            <Card.Body>
              <div className="admin-ticket-message">{ticket.message}</div>
            </Card.Body>
          </Card>

          <Card className="admin-card mb-4">
            <Card.Header>
              <h2 className="admin-card-title">Conversation history</h2>
              <div className="admin-card-subtitle">Administrator and customer responses in chronological order.</div>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-3">
                {ticket.responses?.length ? ticket.responses.map((item, index) => (
                  <div
                    key={`${item.createdAt}-${index}`}
                    className={`admin-response${item.authorRole === 'admin' ? ' admin-response-admin' : ''}`}
                  >
                    <div className="d-flex justify-content-between gap-3 mb-2">
                      <strong>{item.authorId?.fullName || humanize(item.authorRole)}</strong>
                      <span className="small text-secondary">{dateTime(item.createdAt)}</span>
                    </div>
                    <div className="admin-ticket-message">{item.message}</div>
                  </div>
                )) : (
                  <div className="text-secondary">No responses have been added yet.</div>
                )}
              </div>
            </Card.Body>
          </Card>

          <Card className="admin-card">
            <Card.Header>
              <h2 className="admin-card-title">Add administrator response</h2>
              <div className="admin-card-subtitle">The response will be recorded with the administrator identity and time.</div>
            </Card.Header>
            <Card.Body>
              <Form.Control
                as="textarea"
                rows={5}
                value={response}
                onChange={(event) => setResponse(event.target.value)}
                placeholder="Write a clear response or internal resolution update"
              />
              <Button
                className="mt-3"
                onClick={() => save({ response }, 'Administrator response added.')}
                disabled={saving || !response.trim()}
              >
                {saving ? 'Saving response…' : 'Add response'}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4}>
          <Card className="admin-card mb-4">
            <Card.Header>
              <h2 className="admin-card-title">Ticket controls</h2>
              <div className="admin-card-subtitle">Update status and priority as work progresses.</div>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label className="admin-filter-label">Status</Form.Label>
                <Form.Select
                  value={ticket.status}
                  disabled={saving}
                  onChange={(event) => save({ status: event.target.value }, 'Ticket status updated.')}
                >
                  {['open', 'in-progress', 'waiting-user', 'resolved', 'closed'].map((status) => (
                    <option key={status} value={status}>{humanize(status)}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label className="admin-filter-label">Priority</Form.Label>
                <Form.Select
                  value={ticket.priority}
                  disabled={saving}
                  onChange={(event) => save({ priority: event.target.value }, 'Ticket priority updated.')}
                >
                  {['low', 'normal', 'high', 'urgent'].map((priority) => (
                    <option key={priority} value={priority}>{humanize(priority)}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>

          <Card className="admin-card">
            <Card.Header>
              <h2 className="admin-card-title">Closure information</h2>
            </Card.Header>
            <Card.Body>
              <dl className="admin-detail-grid mb-0">
                <div className="admin-detail-item">
                  <dt>Current status</dt>
                  <dd><StatusBadge value={ticket.status} /></dd>
                </div>
                <div className="admin-detail-item">
                  <dt>Last activity</dt>
                  <dd>{dateTime(ticket.lastActivityAt)}</dd>
                </div>
                <div className="admin-detail-item">
                  <dt>Closed by</dt>
                  <dd>{ticket.closedBy?.fullName || '—'}</dd>
                </div>
                <div className="admin-detail-item">
                  <dt>Closed at</dt>
                  <dd>{dateTime(ticket.closedAt)}</dd>
                </div>
              </dl>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
