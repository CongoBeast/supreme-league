import React, { useEffect, useState } from 'react';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import { RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { api } from '../services/api';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingScreen from '../components/LoadingScreen';
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
    try {
      setData(await api('/api/team'));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleManagerInput = (value) => {
    setManagerInput(value);
    const parsed = extractFplManagerId(value);
    setManagerId(parsed.managerId);
    setManagerInputError(parsed.error);
  };

  const sync = async (event) => {
    event?.preventDefault();
    if (!data?.linked && !managerId) {
      setManagerInputError('Paste your FPL team link so we can find your manager number.');
      return;
    }
    setBusy('sync');
    setNotice('');
    try {
      const result = await api('/api/team/sync', {
        method: 'POST',
        body: { managerId: managerId || undefined },
      });
      setNotice(result.message || 'Team synced successfully.');
      setManagerId('');
      setManagerInput('');
      setManagerInputError('');
      await load();
    } catch (requestError) {
      setNotice(requestError.message);
    } finally {
      setBusy('');
    }
  };

  const confirm = async () => {
    setBusy('confirm');
    setNotice('');
    try {
      const result = await api('/api/team/confirm-gameweek', { method: 'POST', body: {} });
      setNotice(result.message);
      await load();
    } catch (requestError) {
      setNotice(requestError.message);
    } finally {
      setBusy('');
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <LoadingScreen fullScreen={false} />;

  if (!data.linked) {
    const description = data.providerMode === 'public'
      ? 'Paste a link from your Fantasy Premier League team and we will find your manager number automatically.'
      : 'Paste a link from your Fantasy Premier League team to connect it to Supreme.';

    return (
      <>
        <PageHeader
          eyebrow="My Team"
          title="Connect your Fantasy Premier League team"
          description="Copy the link from any page inside your FPL team and paste it below. We will extract your public manager number automatically. Never enter your FPL password."
        />
        {notice && <Alert variant="info">{notice}</Alert>}
        <div className="surface-card p-4 p-md-5">
          <EmptyState
            icon={Users}
            title="No fantasy team linked"
            description={description}
            action={(
              <Form onSubmit={sync} className="mx-auto" style={{ maxWidth: 420 }}>
                <Form.Group className="text-start mb-3">
                  <Form.Label>Paste your FPL team link</Form.Label>
                  <Form.Control
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="https://fantasy.premierleague.com/en/entry/1149514/transfers"
                    required
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
                  <Form.Text className="text-muted">
                    Copy the URL while viewing your FPL team, transfers, history or gameweek page.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="text-start mb-3">
                  <Form.Label>Manager ID</Form.Label>
                  <Form.Control
                    value={managerId}
                    readOnly
                    placeholder="Detected automatically"
                    aria-label="Detected FPL manager ID"
                  />
                  {managerId && <Form.Text className="text-success">Manager found: {managerId}</Form.Text>}
                </Form.Group>

                <Button type="submit" disabled={busy === 'sync' || !managerId}>
                  {busy === 'sync' ? 'Linking…' : 'Link and Sync Team'}
                </Button>
              </Form>
            )}
          />
        </div>
      </>
    );
  }

  const snapshot = data.snapshot;
  const starters = (snapshot.lineup || []).filter((player) => player.starter);
  const bench = (snapshot.lineup || []).filter((player) => !player.starter);
  const lastSynced = snapshot.lastSuccessfulSyncAt || snapshot.fetchedAt;

  return (
    <>
      <PageHeader
        eyebrow={`Gameweek ${snapshot.gameweek}`}
        title={snapshot.teamName}
        description={`${snapshot.managerName} · Manager ID ${snapshot.fantasyManagerId}`}
        actions={(
          <>
            <Button variant="outline-dark" onClick={sync} disabled={Boolean(busy)}>
              <RefreshCw size={16} /> Sync Team
            </Button>
            <Button onClick={confirm} disabled={Boolean(busy)}>
              <ShieldCheck size={16} /> Confirm Team
            </Button>
          </>
        )}
      />

      {notice && <Alert variant="info">{notice}</Alert>}
      {data.providerWarning && <Alert variant="warning">{data.providerWarning}</Alert>}
      {data.inactivityStreak >= 2 && (
        <Alert variant={data.inactivityStreak >= 3 ? 'danger' : 'warning'}>
          {data.inactivityStreak >= 3
            ? 'You may be ineligible for applicable subscription-based prizes after three missed confirmations.'
            : 'Warning: two consecutive applicable team confirmations have been missed.'}
        </Alert>
      )}

      <Row className="g-3 mb-4">
        <Col sm={6} lg={3}><StatCard label="Gameweek points" value={snapshot.gameweekPoints} /></Col>
        <Col sm={6} lg={3}><StatCard label="Total points" value={snapshot.totalPoints} /></Col>
        <Col sm={6} lg={3}><StatCard label="Overall rank" value={snapshot.overallRank?.toLocaleString('en-GB') || '—'} /></Col>
        <Col sm={6} lg={3}><StatCard label="Gameweek rank" value={snapshot.gameweekRank?.toLocaleString('en-GB') || '—'} /></Col>
        <Col sm={6} lg={3}><StatCard label="Team value" value={`£${Number(snapshot.teamValue || 0).toFixed(1)}m`} /></Col>
        <Col sm={6} lg={3}><StatCard label="Bank" value={`£${Number(snapshot.bank || 0).toFixed(1)}m`} /></Col>
        <Col sm={6} lg={3}><StatCard label="Captain" value={snapshot.captain || '—'} /></Col>
        <Col sm={6} lg={3}><StatCard label="Active chip" value={snapshot.activeChip || 'None'} /></Col>
      </Row>

      <div className="surface-card p-4 mb-4">
        <h2 className="h4 mb-3">Starting lineup</h2>
        <div className="lineup-pitch">
          <div className="d-flex flex-wrap justify-content-center gap-3">
            {starters.map((player) => (
              <div className="player-chip" key={player.elementId || player.name}>
                <div className="small muted">{player.position}{player.club ? ` · ${player.club}` : ''}</div>
                <strong>{player.name}</strong>
                <div className="small">
                  {player.points} pts
                  {player.multiplier > 1 ? ` · ×${player.multiplier}` : ''}
                  {player.isCaptain ? ' · Captain' : player.isViceCaptain ? ' · Vice' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        <h3 className="h6 mt-4">Bench</h3>
        <div className="d-flex flex-wrap gap-3">
          {bench.map((player) => (
            <div className="player-chip" key={player.elementId || player.name}>
              <div className="small muted">{player.position}{player.club ? ` · ${player.club}` : ''}</div>
              <strong>{player.name}</strong>
              <div className="small muted">{player.points} pts</div>
            </div>
          ))}
        </div>
      </div>

      <Row className="g-4">
        <Col xl={8}>
          <div className="surface-card p-4">
            <h2 className="h4">Recent gameweek history</h2>
            <div className="table-responsive">
              <table className="table mb-0">
                <thead>
                  <tr><th>GW</th><th>Points</th><th>Total</th><th className="text-end">Overall rank</th></tr>
                </thead>
                <tbody>
                  {(data.history || []).map((history) => (
                    <tr key={history.gameweek}>
                      <td>{history.gameweek}</td>
                      <td>{history.points}</td>
                      <td>{history.totalPoints}</td>
                      <td className="text-end">{history.rank ? history.rank.toLocaleString('en-GB') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Col>
        <Col xl={4}>
          <div className="surface-card p-4 h-100">
            <h2 className="h4">Sync and confirmation</h2>
            <div className="d-flex justify-content-between py-2 border-bottom">
              <span className="muted">Data source</span>
              <strong>{snapshot.providerMode === 'public' ? 'Official FPL data' : 'Configured data source'}</strong>
            </div>
            <div className="d-flex justify-content-between py-2 border-bottom">
              <span className="muted">Last sync</span>
              <strong>{lastSynced ? new Date(lastSynced).toLocaleString('en-GB') : 'Not recorded'}</strong>
            </div>
            <div className="d-flex justify-content-between py-2 border-bottom">
              <span className="muted">Last confirmation</span>
              <strong>{data.lastConfirmation || 'None yet'}</strong>
            </div>
            <div className="d-flex justify-content-between py-2">
              <span className="muted">Inactivity streak</span>
              <strong>{data.inactivityStreak}</strong>
            </div>
            <p className="small muted mt-3 mb-0">
              Public FPL lineups become available according to the provider’s gameweek publication timing. Confirmation means you actively reviewed your team; a transfer is not required.
            </p>
          </div>
        </Col>
      </Row>
    </>
  );
}
