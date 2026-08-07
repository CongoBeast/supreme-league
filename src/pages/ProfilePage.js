import React, { useEffect, useState } from 'react';
import { Alert, Button, Col, Form, Row, Tab, Tabs } from 'react-bootstrap';
import { Gift, Link2, Shield, UserRound } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import ProfilePictureUploader from '../components/ProfilePictureUploader';
import LoadingScreen from '../components/LoadingScreen';
import ErrorState from '../components/ErrorState';
import StatusBadge from '../components/StatusBadge';
import ReferralCodeCard from '../components/ReferralCodeCard';
import { extractFplManagerId } from '../utils/fplManagerLink';

export default function ProfilePage() {
  const { setUser } = useAuth();
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [managerId, setManagerId] = useState('');
  const [managerInput, setManagerInput] = useState('');
  const [managerInputError, setManagerInputError] = useState('');

  const load = async () => {
    setError('');
    try {
      const response = await api('/api/profile');
      setData(response);
      setForm({
        fullName: response.user.fullName,
        phone: response.user.phone,
        dateOfBirth: response.user.dateOfBirth ? String(response.user.dateOfBirth).slice(0, 10) : '',
        city: response.profile.city || '',
        address: response.profile.address || '',
        country: response.user.country || 'Zimbabwe',
        currency: response.user.currency || 'USD',
        contactPreference: response.profile.contactPreference || 'email',
        notificationPreferences: response.profile.notificationPreferences || {},
      });
      setManagerId(response.user.fplManagerId || '');
      setManagerInput('');
      setManagerInputError('');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (event) => {
    event?.preventDefault?.();
    setBusy(true);
    setNotice('');
    try {
      const response = await api('/api/profile', { method: 'PUT', body: form });
      setUser(response.user);
      setNotice('Profile updated successfully.');
      await load();
    } catch (requestError) {
      setNotice(requestError.message);
    } finally {
      setBusy(false);
    }
  };



  const handlePictureChanged = (response) => {
    setData((current) => ({
      ...current,
      user: response.user,
      profile: response.profile,
    }));
    setUser(response.user);
    setNotice(response.message || 'Profile picture updated.');
  };

  const handleManagerInput = (value) => {
    setManagerInput(value);
    const parsed = extractFplManagerId(value);
    setManagerId(parsed.managerId);
    setManagerInputError(parsed.error);
  };

  const linkTeam = async (event) => {
    event.preventDefault();
    if (!managerId) {
      setManagerInputError('Paste your FPL team link so we can find your manager number.');
      return;
    }
    setBusy(true);
    setNotice('');
    try {
      await api('/api/profile/link-fantasy-team', { method: 'POST', body: { managerId } });
      setNotice('Fantasy manager account linked.');
      await load();
    } catch (requestError) {
      setNotice(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!form) return <LoadingScreen fullScreen={false} />;

  const preferences = form.notificationPreferences;

  return (
    <>
      <PageHeader eyebrow="Account" title="Profile" description="Manage personal details, your referral rewards, connected accounts and preferences." />
      {notice && <Alert variant="info">{notice}</Alert>}
      <Tabs defaultActiveKey="personal" className="mb-4">
        <Tab eventKey="personal" title="Personal Details">
          <div className="surface-card p-4">
            <Form onSubmit={save}>
              <Row className="g-4">
                <Col lg={4}>
                  <ProfilePictureUploader
                    currentUrl={data.profile.profilePicture || ''}
                    userName={form.fullName}
                    onChanged={handlePictureChanged}
                  />
                </Col>
                <Col lg={8}>
                  <Row className="g-3">
                    <Col md={6}><Form.Label>Full name</Form.Label><Form.Control value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} /></Col>
                    <Col md={6}><Form.Label>Email</Form.Label><Form.Control disabled value={data.user.email} /></Col>
                    <Col md={6}><Form.Label>Phone</Form.Label><Form.Control value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} /></Col>
                    <Col md={6}><Form.Label>Date of birth</Form.Label><Form.Control type="date" value={form.dateOfBirth} onChange={(event) => setForm((current) => ({ ...current, dateOfBirth: event.target.value }))} /></Col>
                    <Col md={6}><Form.Label>City</Form.Label><Form.Control value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} /></Col>
                    <Col md={6}><Form.Label>Country</Form.Label><Form.Control value={form.country} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))} /></Col>
                    <Col xs={12}><Form.Label>Address</Form.Label><Form.Control value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} /></Col>
                    <Col md={6}><Form.Label>Currency</Form.Label><Form.Select value={form.currency} onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))}><option>USD</option></Form.Select></Col>
                    <Col md={6}><Form.Label>Preferred contact</Form.Label><Form.Select value={form.contactPreference} onChange={(event) => setForm((current) => ({ ...current, contactPreference: event.target.value }))}><option value="email">Email</option><option value="sms">SMS</option><option value="phone">Phone</option></Form.Select></Col>
                    <Col xs={12}><Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</Button></Col>
                  </Row>
                </Col>
              </Row>
            </Form>
          </div>
        </Tab>

        <Tab eventKey="referrals" title="Referrals">
          <div className="mb-3 d-flex gap-2 align-items-center"><Gift className="text-brand" /><span className="muted">Share your code. Rewards are credited after the referred member completes their first eligible purchase.</span></div>
          <ReferralCodeCard />
        </Tab>

        <Tab eventKey="connected" title="Connected Accounts">
          <div className="surface-card p-4">
            <div className="d-flex align-items-center gap-2 mb-3"><Link2 /><h2 className="h4 mb-0">Fantasy account</h2></div>
            <p className="muted mb-4">Copy the link from any page inside your Fantasy Premier League team and paste it below. We will extract the public manager number automatically. Never enter your FPL password.</p>
            <Form onSubmit={linkTeam}>
              <Row className="g-3 align-items-end">
                <Col lg={8}>
                  <Form.Label>FPL team link</Form.Label>
                  <Form.Control
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="https://fantasy.premierleague.com/en/entry/1149514/transfers"
                    value={managerInput}
                    isInvalid={Boolean(managerInputError)}
                    onChange={(event) => handleManagerInput(event.target.value)}
                    onPaste={(event) => {
                      const pasted = event.clipboardData.getData('text');
                      if (pasted) {
                        event.preventDefault();
                        handleManagerInput(pasted);
                      }
                    }}
                  />
                  <Form.Control.Feedback type="invalid">{managerInputError}</Form.Control.Feedback>
                  <Form.Text className="text-muted">Transfers, history and gameweek links all work.</Form.Text>
                </Col>
                <Col lg={4}>
                  <Form.Label>Manager ID</Form.Label>
                  <Form.Control readOnly value={managerId} placeholder="Detected automatically" />
                </Col>
                <Col xs={12} className="d-flex flex-wrap align-items-center gap-3">
                  <Button type="submit" disabled={busy || !managerId}>{busy ? 'Linking…' : 'Link account'}</Button>
                  {managerId && <span className="small text-success">Manager found: {managerId}</span>}
                </Col>
              </Row>
            </Form>
            {data.user.fantasyTeamName && <div className="soft-card p-3 mt-4"><div className="small muted">Fantasy team</div><strong>{data.user.fantasyTeamName}</strong></div>}
            <div className="soft-card p-3 mt-3"><div className="small muted">Payment references</div><strong>Displayed in masked form only</strong></div>
          </div>
        </Tab>

        <Tab eventKey="preferences" title="Preferences">
          <div className="surface-card p-4">
            <h2 className="h4">Notifications</h2>
            {[
              ['emailNotifications', 'Email notifications'],
              ['smsNotifications', 'SMS notifications'],
              ['leagueReminders', 'League reminders'],
              ['deadlineReminders', 'Deadline reminders'],
              ['transactions', 'Transactions'],
              ['results', 'Results'],
              ['marketing', 'Marketing'],
            ].map(([key, label]) => (
              <Form.Check
                className="py-2"
                key={key}
                label={label}
                checked={Boolean(preferences[key])}
                onChange={(event) => setForm((current) => ({ ...current, notificationPreferences: { ...preferences, [key]: event.target.checked } }))}
              />
            ))}
            <Button className="mt-3" onClick={save} disabled={busy}>Save preferences</Button>
          </div>
        </Tab>

        <Tab eventKey="security" title="Security">
          <div className="surface-card p-4"><div className="d-flex gap-3"><Shield /><div><h2 className="h4">Account security</h2><p className="muted">Authentication uses secure HTTP-only cookies and passwords are hashed on the server. JWTs are never stored in localStorage.</p><StatusBadge status={data.user.status} /></div></div></div>
        </Tab>

        <Tab eventKey="activity" title="Activity">
          <div className="surface-card p-4">
            <div className="d-flex gap-3"><UserRound /><div><h2 className="h4">Profile completion</h2><div className="metric-number">{data.profile.profileCompletion}%</div><p className="muted mb-0">Complete your details, link your fantasy team and add a profile picture to make your competition identity easier to recognise.</p></div></div>
            {data.subscription && <div className="soft-card p-3 mt-4"><div className="small muted">Current subscription</div><strong>{data.subscription.planName}</strong> · <StatusBadge status={data.subscription.status} /></div>}
          </div>
        </Tab>
      </Tabs>
    </>
  );
}
