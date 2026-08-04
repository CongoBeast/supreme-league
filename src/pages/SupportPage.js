import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import { HelpCircle, Mail, RefreshCw, ShieldCheck } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { api } from '../services/api';

const categories = [
  ['account', 'Account'],
  ['league', 'League or competition'],
  ['payment', 'Wallet or payment'],
  ['subscription', 'Subscription'],
  ['technical', 'Technical issue'],
  ['general', 'General question'],
];

export default function SupportPage() {
  const [form, setForm] = useState({ category: 'general', subject: '', message: '' });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api('/api/support/tickets');
      setTickets(data.tickets || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTickets(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setNotice('');
    setError('');
    try {
      const data = await api('/api/support/tickets', { method: 'POST', body: form });
      setNotice(data.message || 'Your support request has been received and will be attended to shortly.');
      setForm({ category: 'general', subject: '', message: '' });
      await loadTickets();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Help" title="Support" description="Submit a tracked request and follow its progress from your account." />
      {notice && <Alert variant="success">{notice}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Row className="g-4">
        <Col xl={7}>
          <div className="surface-card p-4 mb-4">
            <h2 className="h4">Send a support request</h2>
            <p className="muted">We will email you a receipt with your ticket reference after submission.</p>
            <Form onSubmit={submit}>
              <Form.Group className="mb-3">
                <Form.Label>Topic <span className="text-danger">*</span></Form.Label>
                <Form.Select required value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
                  {categories.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Subject <span className="text-danger">*</span></Form.Label>
                <Form.Control required minLength={3} maxLength={180} value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Message <span className="text-danger">*</span></Form.Label>
                <Form.Control as="textarea" rows={6} required minLength={10} maxLength={5000} value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} />
              </Form.Group>
              <Button type="submit" disabled={busy}>{busy ? <><Spinner size="sm" className="me-2" />Submitting…</> : 'Submit request'}</Button>
            </Form>
          </div>

          <div className="surface-card p-4">
            <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
              <h2 className="h4 mb-0">My support tickets</h2>
              <Button variant="outline-dark" size="sm" onClick={loadTickets} disabled={loading}><RefreshCw size={15} /> Refresh</Button>
            </div>
            {loading ? (
              <div className="py-4 text-center"><Spinner size="sm" className="me-2" />Loading your support requests…</div>
            ) : tickets.length ? (
              <div className="d-grid gap-3">
                {tickets.map((ticket) => (
                  <div className="soft-card p-3" key={ticket._id}>
                    <div className="d-flex justify-content-between gap-3 flex-wrap">
                      <div>
                        <div className="small muted">{ticket.ticketNumber}</div>
                        <strong>{ticket.subject}</strong>
                      </div>
                      <Badge bg={ticket.status === 'closed' || ticket.status === 'resolved' ? 'dark' : 'secondary'} className="text-capitalize">{ticket.status}</Badge>
                    </div>
                    <div className="small muted mt-2">Opened {new Date(ticket.createdAt).toLocaleString('en-GB')} · {ticket.category}</div>
                    {ticket.responses?.length ? <div className="mt-3 border-top pt-3 small">Latest response: {ticket.responses[ticket.responses.length - 1].message}</div> : null}
                  </div>
                ))}
              </div>
            ) : <Alert variant="light" className="border mb-0">You have not submitted any support tickets yet.</Alert>}
          </div>
        </Col>

        <Col xl={5}>
          <div className="surface-card p-4 mb-4">
            <HelpCircle className="text-brand mb-3" />
            <h2 className="h4">Common questions</h2>
            <p><strong>Why is my payment pending?</strong><br /><span className="muted">Payment status is confirmed by Paynow on the server. Use the transaction status page before trying again.</span></p>
            <p><strong>Do I enter my fantasy password?</strong><br /><span className="muted">No. Only use your public numeric manager ID.</span></p>
          </div>
          <div className="surface-card p-4">
            <div className="d-flex gap-3"><ShieldCheck /><div><h2 className="h5">Result disputes</h2><p className="muted mb-0">Include the league name, gameweek and relevant transaction reference when raising a result dispute.</p></div></div>
            <hr />
            <div className="d-flex gap-3"><Mail /><span className="muted">A reception email is sent from the configured Supreme Fantasy League sender.</span></div>
          </div>
        </Col>
      </Row>
    </>
  );
}
