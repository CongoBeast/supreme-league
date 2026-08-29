import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { CalendarClock, RefreshCw, ShieldCheck, Siren, Trophy, UsersRound } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { adminApi, dateTime, humanize, money } from '../adminApi';
import { AdminEmpty, AdminError, AdminLoading } from '../components/AdminDataState';
import AdminPageHeader from '../components/AdminPageHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

const statuses = ['draft', 'open', 'full', 'upcoming', 'live', 'awaiting-review', 'cancelled'];

export default function AdminLeagueDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [manualReason, setManualReason] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { setData(await adminApi(`/leagues/${id}`)); } catch (requestError) { setError(requestError.message || 'The league could not be loaded.'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  const runAction = async (path, body, successMessage) => {
    setSaving(true); setError(''); setMessage('');
    try { await adminApi(`/leagues/${id}${path}`, { method: 'POST', body: body || {} }); setMessage(successMessage); await load(); return true; }
    catch (requestError) { setError(requestError.message || 'The operation could not be completed.'); return false; }
    finally { setSaving(false); }
  };

  const updateStatus = async (status) => {
    setSaving(true); setError(''); setMessage('');
    try { await adminApi(`/leagues/${id}/status`, { method: 'PATCH', body: { status } }); setMessage('League status updated.'); await load(); }
    catch (requestError) { setError(requestError.message || 'The league status could not be updated.'); }
    finally { setSaving(false); }
  };

  const addMember = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    try { await adminApi(`/leagues/${id}/members`, { method: 'POST', body: { email } }); setEmail(''); setMessage('Member added to the league.'); await load(); }
    catch (requestError) { setError(requestError.message || 'The member could not be added.'); }
    finally { setSaving(false); }
  };

  const removeMember = async (userId, memberName) => {
    if (!userId || !window.confirm(`Remove ${memberName || 'this member'} from the league?`)) return;
    setSaving(true); setError(''); setMessage('');
    try { await adminApi(`/leagues/${id}/members/${userId}`, { method: 'DELETE' }); setMessage('Member removed from the league.'); await load(); }
    catch (requestError) { setError(requestError.message || 'The member could not be removed.'); }
    finally { setSaving(false); }
  };

  const manualSettle = async () => {
    if (!manualReason.trim()) { setError('Enter a reason before using the manual settlement override.'); return; }
    if (!window.confirm('Manual settlement may bypass FPL data_checked, but never the football-finished verification. Continue?')) return;
    const ok = await runAction('/settlement/manual', { reason: manualReason }, 'League settled, prizes credited, and winner emails queued.');
    if (ok) setManualReason('');
  };

  if (loading) return <AdminLoading message="Refreshing FPL scores and league information…" />;
  if (error && !data) return <AdminError message={error} onRetry={load} />;

  const league = data.league;
  const members = data.leaderboard || [];
  const settlement = data.settlement || {};
  const verified = settlement.verified || {};

  return <>
    <AdminPageHeader eyebrow="League management" title={league.name} description={`${league.description || 'No league description has been provided.'} Scores refresh automatically whenever this page opens.`} backTo="/admin/leagues" backLabel="Back to leagues" actions={<Form.Select aria-label="League status" value={league.status} onChange={(event) => updateStatus(event.target.value)} disabled={saving || league.status === 'settled'} style={{ minWidth: 220 }}><option value="settled" disabled>Settled (use settlement controls)</option>{statuses.map((status) => <option key={status} value={status}>{humanize(status)}</option>)}</Form.Select>} />
    {error && <AdminError message={error} />}
    {message && <Alert variant="success">{message}</Alert>}

    <Row className="g-3 mb-4">
      <Col sm={6} xl={3}><StatCard label="Competition type" value={humanize(league.competitionType)} detail={humanize(league.ruleType)} icon={Trophy} /></Col>
      <Col sm={6} xl={3}><StatCard label="Members" value={`${members.length}/${league.maximumParticipants}`} detail={`${settlement.eligibleParticipants ?? members.length} eligible for settlement`} icon={UsersRound} tone="success" /></Col>
      <Col sm={6} xl={3}><StatCard label="Entry / prize" value={`${money(league.entryFeeCents)} / ${money(league.displayedPrizeCents)}`} detail="Displayed prize" icon={ShieldCheck} tone="warning" /></Col>
      <Col sm={6} xl={3}><StatCard label="Gameweek window" value={`${league.startGameweek}–${league.endGameweek}`} detail={`Created ${dateTime(league.createdAt)}`} icon={CalendarClock} tone="info" /></Col>
    </Row>

    <Card className="admin-card mb-4 border-warning">
      <Card.Header className="d-flex flex-wrap justify-content-between gap-3 align-items-center"><div><h2 className="admin-card-title">Settlement control &amp; diagnostics</h2><div className="admin-card-subtitle">This is the payment path. Changing a status field never pays a prize.</div></div><Siren size={24} /></Card.Header>
      <Card.Body>
        <Row className="g-3 mb-4">
          <Col md={3}><div className="admin-detail-item"><dt>Football verified finished</dt><dd><StatusBadge value={verified.finished ? 'yes' : 'no'} /></dd></div></Col>
          <Col md={3}><div className="admin-detail-item"><dt>FPL data_checked</dt><dd><StatusBadge value={verified.dataChecked ? 'yes' : 'no'} /></dd></div></Col>
          <Col md={3}><div className="admin-detail-item"><dt>Eligible entries</dt><dd>{settlement.eligibleParticipants ?? '—'}</dd></div></Col>
          <Col md={3}><div className="admin-detail-item"><dt>Successfully scored</dt><dd>{settlement.successfullyScored ?? '—'}</dd></div></Col>
        </Row>
        {settlement.meta?.lastError && <Alert variant="danger"><strong>Last settlement error:</strong> {settlement.meta.lastError}</Alert>}
        {settlement.scoreFailures?.length > 0 && <Alert variant="danger">{settlement.scoreFailures.join(' · ')}</Alert>}
        {verified.fixtureStates?.length > 0 && <div className="table-responsive mb-3"><Table size="sm" className="mb-0"><thead><tr><th>GW</th><th>Event finished</th><th>All fixtures finished</th><th>Fixtures</th><th>data_checked</th></tr></thead><tbody>{verified.fixtureStates.map((row) => <tr key={row.gameweek}><td>{row.gameweek}</td><td>{row.eventFinished ? 'Yes' : 'No'}</td><td>{row.fixturesFinished ? 'Yes' : 'No'}</td><td>{row.fixtureCount ?? '—'}</td><td>{row.dataChecked ? 'Yes' : 'No'}</td></tr>)}</tbody></Table></div>}
        <div className="d-flex flex-wrap gap-2 mb-3"><Button variant="outline-primary" disabled={saving} onClick={() => runAction('/refresh-scores', {}, 'Scores refreshed from FPL.')}><RefreshCw size={16} /> Refresh diagnostics</Button><Button variant="primary" disabled={saving || league.status === 'settled'} onClick={() => runAction('/settlement/retry', {}, 'Automatic settlement retry completed.')}><Trophy size={16} /> Retry automatic settlement</Button></div>
        <Form.Group><Form.Label>Manual settlement override reason</Form.Label><Form.Control as="textarea" rows={2} value={manualReason} onChange={(event) => setManualReason(event.target.value)} placeholder="Example: FPL data_checked is delayed; I reviewed every final score and am authorising settlement." /><Form.Text className="text-muted">The override can bypass <code>data_checked</code> only. Backend verification still refuses to settle while any FPL event/fixture is unfinished.</Form.Text></Form.Group>
        <Button variant="danger" className="mt-2" disabled={saving || league.status === 'settled'} onClick={manualSettle}>Manually settle &amp; pay prizes</Button>
      </Card.Body>
    </Card>

    <Row className="g-4 mb-4"><Col xl={7}><Card className="admin-card h-100"><Card.Header><h2 className="admin-card-title">League information</h2><div className="admin-card-subtitle">Configuration, ownership and FPL timing.</div></Card.Header><Card.Body><dl className="admin-detail-grid mb-0"><div className="admin-detail-item"><dt>Status</dt><dd><StatusBadge value={league.status} /></dd></div><div className="admin-detail-item"><dt>Created by</dt><dd>{league.createdBy?.fullName || league.createdBy?.email || 'System'}</dd></div><div className="admin-detail-item"><dt>Start gameweek</dt><dd>{league.startGameweek}</dd></div><div className="admin-detail-item"><dt>End gameweek</dt><dd>{league.endGameweek}</dd></div><div className="admin-detail-item"><dt>Join deadline</dt><dd>{dateTime(league.fplJoinDeadlineAt)}</dd></div><div className="admin-detail-item"><dt>Football finished at</dt><dd>{dateTime(league.fplFinishedAt)}</dd></div><div className="admin-detail-item"><dt>FPL data checked at</dt><dd>{dateTime(league.fplDataCheckedAt)}</dd></div><div className="admin-detail-item"><dt>Official league</dt><dd>{league.officialSupremeLeague ? 'Yes' : 'No'}</dd></div></dl></Card.Body></Card></Col><Col xl={5}><Card className="admin-card h-100"><Card.Header><h2 className="admin-card-title">League rules</h2></Card.Header><Card.Body>{league.rules?.length ? <ul className="admin-rule-list">{league.rules.map((rule, index) => <li key={`${rule}-${index}`}>{rule}</li>)}</ul> : <AdminEmpty title="No league rules recorded" message="This league has no custom rule list." />}</Card.Body></Card></Col></Row>

    <Card className="admin-card mb-4"><Card.Header><h2 className="admin-card-title">Add league member</h2><div className="admin-card-subtitle">Add an existing user account by email address.</div></Card.Header><Card.Body><Form onSubmit={addMember}><Row className="g-3 align-items-end"><Col lg={9}><Form.Label className="admin-filter-label">User email</Form.Label><Form.Control type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="member@example.com" /></Col><Col lg={3}><Button type="submit" className="w-100" disabled={saving}>{saving ? 'Updating league…' : 'Add member'}</Button></Col></Row></Form></Card.Body></Card>

    <Card className="admin-card admin-table-card">{members.length ? <Table responsive hover className="admin-table"><thead><tr><th>Rank</th><th>Member</th><th>Joined</th><th>Eligibility</th><th>Score</th><th>Score detail</th><th>Prize</th><th>Action</th></tr></thead><tbody>{members.map((entry) => <tr key={entry.entryId}><td>{entry.rank || '—'}</td><td><div className="admin-table-primary">{entry.user?.fullName || 'Unknown user'}</div><div className="admin-table-secondary">{entry.user?.email || '—'}</div></td><td>{dateTime(entry.joinedAt)}</td><td><StatusBadge value={entry.eligibilityStatus} /></td><td>{entry.score || 0}</td><td className="small">{entry.scoreDetails?.captain ? `${entry.scoreDetails.captain.name} ${entry.scoreDetails.captain.points} + ${entry.scoreDetails.viceCaptain?.name || 'Vice'} ${entry.scoreDetails.viceCaptain?.points || 0}` : 'FPL GW points'}</td><td>{money(entry.prizeCents)}</td><td><Button size="sm" variant="outline-danger" disabled={saving || league.status === 'settled'} onClick={() => removeMember(entry.user?._id, entry.user?.fullName)}>Remove</Button></td></tr>)}</tbody></Table> : <AdminEmpty title="This league has no members" message="Use the form above to add an existing user." />}</Card>
  </>;
}
