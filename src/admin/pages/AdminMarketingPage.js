import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { Mail, RefreshCw, Send } from 'lucide-react';

import { adminApi, dateTime, humanize } from '../adminApi';
import AdminMetaAdsPanel from '../components/AdminMetaAdsPanel';
import AdminPageHeader from '../components/AdminPageHeader';

const blank = { subject: '', headline: '', preheader: '', message: '' };

export default function AdminMarketingPage() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [campaigns, setCampaigns] = useState([]);
  const [optedInCount, setOptedInCount] = useState(0);
  const [email, setEmail] = useState(null);
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = async () => {
    try {
      const result = await adminApi('/marketing/campaigns');
      setCampaigns(result.campaigns || []);
      setOptedInCount(result.optedInCount || 0);
      setEmail(result.email);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load marketing campaigns.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true); setError(''); setNotice('');
    try {
      await adminApi('/marketing/campaigns', { method: 'POST', body: form });
      setForm(blank);
      setNotice('Campaign saved as a draft. No email is sent until you activate it.');
      await refresh();
    } catch (requestError) {
      setError(requestError.message || 'Unable to save campaign.');
    } finally { setBusy(false); }
  };

  const changeStatus = async (campaign, status) => {
    if (status === 'active' && !window.confirm(`Activate the campaign “${campaign.subject}”? Promotional emails will be sent only to opted-in members.`)) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await adminApi(`/marketing/campaigns/${campaign._id}`, { method: 'PATCH', body: { status } });
      setNotice(`Campaign ${status === 'active' ? 'activated' : 'paused'}.`);
      await refresh();
    } catch (requestError) { setError(requestError.message || 'Could not change campaign status.'); }
    finally { setBusy(false); }
  };

  const sendTest = async () => {
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await adminApi('/notifications/test-admin-email', { method: 'POST' });
      const status = result.notification?.status;
      if (status === 'sent') setNotice('Test message accepted by Resend. Check the operations mailbox and provider activity log to confirm delivery.');
      else setError(result.notification?.error || result.notification?.reason || 'Test email could not be submitted.');
    } catch (requestError) { setError(requestError.message || 'The test email request failed.'); }
    finally { setBusy(false); }
  };

  const sendBatch = async () => {
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await adminApi('/marketing/campaigns/run', { method: 'POST' });
      setNotice(result.skipped || `Campaign batch processed: ${result.sent || 0} sent, ${result.skipped || 0} skipped.${result.failed ? ` Provider error: ${result.failed}` : ''}`);
      await refresh();
    } catch (requestError) { setError(requestError.message || 'Could not process the campaign batch.'); }
    finally { setBusy(false); }
  };

  return (
    <>
      <AdminPageHeader
        title="Marketing and promotional emails"
        description="Compose promotional campaigns, activate them deliberately, and track deliveries to customers who enabled Marketing email in their profile."
        actions={<Button type="button" variant="outline-dark" onClick={() => { setRefreshToken((value) => value + 1); refresh(); }}><RefreshCw size={16} className="me-2" />Refresh</Button>}
      />
      {error && <Alert variant="danger">{error}</Alert>}
      {notice && <Alert variant="success">{notice}</Alert>}
      {email && !email.enabled && <Alert variant="warning">Email delivery is disabled. Set EMAILS_ENABLED=true and the Resend credentials in the backend before activating a campaign.</Alert>}
      {email?.enabled && !email.adminInboxConfigured && <Alert variant="warning">Admin notification email is not configured. Marketing can still be managed, but critical operations alerts will not reach the admin inbox.</Alert>}
      <div className="mb-3"><Button variant="outline-dark" type="button" disabled={busy || !email?.enabled || !email?.adminInboxConfigured} onClick={sendTest}><Mail size={16} className="me-2" />Send test to admin inbox</Button></div>
      <Alert variant="light" className="border"><Mail size={18} className="me-2" /><strong>{optedInCount}</strong> opted-in profile(s). Promotional emails require explicit Marketing consent and are sent in small, idempotent batches during daily maintenance or with “Send next batch”. Users can opt out in Profile.</Alert>
      <Row className="g-4 mb-4">
        <Col lg={5}>
          <Card className="admin-card h-100"><Card.Header><h2 className="admin-card-title">New promotional email</h2><div className="admin-card-subtitle">Save a draft before activating. Plain text is safely formatted in the email template.</div></Card.Header>
            <Card.Body>
              <Form onSubmit={submit}>
                <Form.Group className="mb-3"><Form.Label>Email subject</Form.Label><Form.Control required maxLength={160} value={form.subject} onChange={(e) => setForm((current) => ({ ...current, subject: e.target.value }))} /></Form.Group>
                <Form.Group className="mb-3"><Form.Label>Headline</Form.Label><Form.Control required maxLength={160} value={form.headline} onChange={(e) => setForm((current) => ({ ...current, headline: e.target.value }))} /></Form.Group>
                <Form.Group className="mb-3"><Form.Label>Preview line (optional)</Form.Label><Form.Control maxLength={240} value={form.preheader} onChange={(e) => setForm((current) => ({ ...current, preheader: e.target.value }))} /></Form.Group>
                <Form.Group className="mb-3"><Form.Label>Message</Form.Label><Form.Control as="textarea" rows={7} required maxLength={4000} value={form.message} onChange={(e) => setForm((current) => ({ ...current, message: e.target.value }))} /></Form.Group>
                <Button type="submit" disabled={busy}>Save campaign draft</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={7}>
          <Card className="admin-card h-100"><Card.Header className="d-flex align-items-center justify-content-between gap-3 flex-wrap"><div><h2 className="admin-card-title">Campaigns</h2><div className="admin-card-subtitle">Up to 100 recent campaigns. Paused campaigns can be resumed.</div></div><Button size="sm" variant="outline-primary" onClick={sendBatch} disabled={busy || !email?.enabled}><Send size={15} className="me-1" />Send next batch</Button></Card.Header>
            <Card.Body>
              {loading ? <div className="text-secondary">Loading campaigns…</div> : campaigns.length ? (
                <Table responsive hover className="admin-table"><thead><tr><th>Subject</th><th>Status</th><th>Sent / skipped</th><th>Created</th><th>Action</th></tr></thead><tbody>
                  {campaigns.map((campaign) => <tr key={campaign._id}>
                    <td><strong>{campaign.subject}</strong><div className="text-secondary small">{campaign.headline}</div></td>
                    <td>{humanize(campaign.status)}</td>
                    <td>{campaign.sentCount || 0} / {campaign.skippedCount || 0}</td>
                    <td>{dateTime(campaign.createdAt)}</td>
                    <td>{campaign.status === 'active' ? <Button size="sm" variant="outline-warning" disabled={busy} onClick={() => changeStatus(campaign, 'paused')}>Pause</Button> : ['draft', 'paused'].includes(campaign.status) ? <Button size="sm" variant="outline-primary" disabled={busy || !email?.enabled} onClick={() => changeStatus(campaign, 'active')}>Activate</Button> : 'Complete'}</td>
                  </tr>)}
                </tbody></Table>
              ) : <p className="text-secondary mb-0">No promotional campaigns created yet.</p>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <AdminMetaAdsPanel refreshToken={refreshToken} />
    </>
  );
}
