import React, { useEffect, useState } from 'react';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import { Link2, ShieldCheck, Users } from 'lucide-react';
import { api } from '../services/api';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingScreen from '../components/LoadingScreen';
import FplSquadPitch from '../components/FplSquadPitch';
import { extractFplManagerId } from '../utils/fplManagerLink';

export default function TeamPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [managerId, setManagerId] = useState('');
  const [managerInput, setManagerInput] = useState('');
  const [managerInputError, setManagerInputError] = useState('');
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    setError('');
    try { setData(await api('/api/team')); } catch (requestError) { setError(requestError.message); }
  };
  useEffect(() => { load(); }, []);

  const handleManagerInput = (value) => {
    setManagerInput(value);
    const parsed = extractFplManagerId(value);
    setManagerId(parsed.managerId);
    setManagerInputError(parsed.error);
  };

  const link = async (event) => {
    event?.preventDefault();
    if (!managerId) { setManagerInputError('Paste your FPL team link so we can find your manager number.'); return; }
    setBusy('link'); setNotice('');
    try {
      await api('/api/profile/link-fantasy-team', { method: 'POST', body: { managerId } });
      setNotice('FPL account linked. Supreme will now refresh your public team automatically.');
      setManagerId(''); setManagerInput(''); setManagerInputError('');
      await load();
    } catch (requestError) { setNotice(requestError.message); } finally { setBusy(''); }
  };

  const confirm = async () => {
    setBusy('confirm'); setNotice('');
    try {
      const result = await api('/api/team/confirm-gameweek', { method: 'POST', body: {} });
      setNotice(result.message);
      await load();
    } catch (requestError) { setNotice(requestError.message); } finally { setBusy(''); }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <LoadingScreen fullScreen={false} />;

  if (!data.linked) {
    return <>
      <PageHeader eyebrow="My Team" title="Connect your Fantasy Premier League team" description="Link your public manager ID once. After that Supreme refreshes your FPL profile, squad, rank and points automatically on page visits and during the daily maintenance run." />
      {notice && <Alert variant="info">{notice}</Alert>}
      <div className="surface-card p-4 p-md-5">
        <EmptyState icon={Users} title="No fantasy team linked" description="Paste a link from any page inside your public FPL team. We only extract the public manager number; never enter your FPL password." action={(
          <Form onSubmit={link} className="mx-auto" style={{ maxWidth: 460 }}>
            <Form.Group className="text-start mb-3">
              <Form.Label>Paste your FPL team link</Form.Label>
              <Form.Control type="text" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="https://fantasy.premierleague.com/en/entry/1149514/transfers" required value={managerInput} isInvalid={Boolean(managerInputError)} onChange={(event) => handleManagerInput(event.target.value)} onPaste={(event) => { const pasted = event.clipboardData.getData('text'); if (pasted) { event.preventDefault(); handleManagerInput(pasted); } }} />
              <Form.Control.Feedback type="invalid">{managerInputError}</Form.Control.Feedback>
              <Form.Text className="text-muted">Copy the URL while viewing your FPL team, transfers, history or gameweek page.</Form.Text>
            </Form.Group>
            <Form.Group className="text-start mb-3"><Form.Label>Manager ID</Form.Label><Form.Control value={managerId} readOnly placeholder="Detected automatically" />{managerId && <Form.Text className="text-success">Manager found: {managerId}</Form.Text>}</Form.Group>
            <Button type="submit" disabled={busy === 'link' || !managerId}><Link2 size={16} /> {busy === 'link' ? 'Linking…' : 'Link FPL Account'}</Button>
          </Form>
        )} />
      </div>
    </>;
  }

  if (!data.snapshot) {
    const manager = data.manager || {};
    return <>
      <PageHeader eyebrow="My Team" title={manager.teamName || 'FPL account linked'} description={`Manager ID ${manager.managerId || data.managerId || 'Linked'} · Supreme refreshes this automatically.`} />
      {notice && <Alert variant="info">{notice}</Alert>}
      {data.providerWarning && <Alert variant="warning">{data.providerWarning}</Alert>}
      <div className="surface-card p-4 p-md-5"><EmptyState icon={ShieldCheck} title="FPL account linked" description="FPL has not published a usable gameweek squad for this manager yet. You do not need to press a sync button: Supreme retries when this page is opened and during daily maintenance." /></div>
    </>;
  }

  const snapshot = data.snapshot;
  const lastSynced = snapshot.lastSuccessfulSyncAt || snapshot.fetchedAt;
  return <>
    <PageHeader
      eyebrow={`Gameweek ${snapshot.gameweek}`}
      title={snapshot.teamName}
      description={`${snapshot.managerName} · Manager ID ${snapshot.fantasyManagerId} · refreshed automatically from public FPL data`}
      actions={<Button onClick={confirm} disabled={Boolean(busy)}><ShieldCheck size={16} /> {busy === 'confirm' ? 'Confirming…' : 'Confirm Team'}</Button>}
    />
    {notice && <Alert variant="info">{notice}</Alert>}
    {data.providerWarning && <Alert variant="warning">{data.providerWarning}</Alert>}
    {data.inactivityStreak >= 2 && <Alert variant={data.inactivityStreak >= 3 ? 'danger' : 'warning'}>{data.inactivityStreak >= 3 ? 'You may be ineligible for applicable subscription-based prizes after three missed confirmations.' : 'Warning: two consecutive applicable team confirmations have been missed.'}</Alert>}

    <Row className="g-3 mb-4">
      <Col sm={6} lg={3}><StatCard label="Gameweek points" value={snapshot.gameweekPoints} /></Col>
      <Col sm={6} lg={3}><StatCard label="Total points" value={snapshot.totalPoints} /></Col>
      <Col sm={6} lg={3}><StatCard label="Overall rank" value={snapshot.overallRank?.toLocaleString('en-GB') || '—'} /></Col>
      <Col sm={6} lg={3}><StatCard label="Gameweek rank" value={snapshot.gameweekRank?.toLocaleString('en-GB') || '—'} /></Col>
      <Col sm={6} lg={3}><StatCard label="Team value" value={`£${Number(snapshot.teamValue || 0).toFixed(1)}m`} /></Col>
      <Col sm={6} lg={3}><StatCard label="Bank" value={`£${Number(snapshot.bank || 0).toFixed(1)}m`} /></Col>
      <Col sm={6} lg={3}><StatCard label="Captain" value={snapshot.captain || '—'} /></Col>
      <Col sm={6} lg={3}><StatCard label="Vice captain" value={snapshot.viceCaptain || '—'} /></Col>
    </Row>

    <div className="surface-card p-3 p-md-4 mb-4">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3"><div><h2 className="h4 mb-1">Gameweek squad</h2><div className="small muted">Positioned on the pitch by FPL role. Captain and vice-captain are shown directly on their players.</div></div>{snapshot.activeChip && snapshot.activeChip !== 'None' && <span className="badge text-bg-dark">{snapshot.activeChip}</span>}</div>
      <FplSquadPitch lineup={snapshot.lineup || []} gameweek={snapshot.gameweek} />
    </div>

    <Row className="g-4">
      <Col xl={8}><div className="surface-card p-4"><h2 className="h4">Recent gameweek history</h2><div className="table-responsive"><table className="table mb-0"><thead><tr><th>GW</th><th>Points</th><th>Total</th><th className="text-end">Overall rank</th></tr></thead><tbody>{(data.history || []).map((history) => <tr key={history.gameweek}><td>{history.gameweek}</td><td>{history.points}</td><td>{history.totalPoints}</td><td className="text-end">{history.rank ? history.rank.toLocaleString('en-GB') : '—'}</td></tr>)}</tbody></table></div></div></Col>
      <Col xl={4}><div className="surface-card p-4 h-100"><h2 className="h4">Automatic refresh</h2><div className="d-flex justify-content-between py-2 border-bottom"><span className="muted">Data source</span><strong>{snapshot.providerMode === 'public' ? 'Official FPL data' : 'Configured data source'}</strong></div><div className="d-flex justify-content-between py-2 border-bottom"><span className="muted">Last refresh</span><strong>{lastSynced ? new Date(lastSynced).toLocaleString('en-GB') : 'Not recorded'}</strong></div><div className="d-flex justify-content-between py-2 border-bottom"><span className="muted">Last confirmation</span><strong>{data.lastConfirmation || 'None yet'}</strong></div><p className="small muted mt-3 mb-0">Supreme refreshes linked users every day and also refreshes the relevant data when team, dashboard, profile, league and admin pages are opened.</p></div></Col>
    </Row>
  </>;
}
