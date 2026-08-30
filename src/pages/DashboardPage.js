import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Col, Row, Tab, Tabs } from 'react-bootstrap';
import { Activity, ArrowRight, CalendarClock, Crown, Link2, Sparkles, Trophy, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, moneyFromCents } from '../services/api';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import LeagueCard from '../components/LeagueCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingScreen from '../components/LoadingScreen';
import LeaderboardTable from '../components/LeaderboardTable';
import LeaderboardShareCard from '../components/LeaderboardShareCard';
import StatusBadge from '../components/StatusBadge';
import CurrencyAmount from '../components/CurrencyAmount';

const deadline = (value) => value ? new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'Waiting for FPL';

function OnboardingDashboard({ data }) {
  const offers = data.availableCompetitions || [];
  return <>
    <div className="surface-card p-4 p-md-5 mb-4 overflow-hidden position-relative">
      <div className="sfl-kicker"><Sparkles size={16} /> Welcome to Supreme Fantasy League</div>
      <Row className="g-4 align-items-center mt-1">
        <Col lg={7}>
          <h1 className="display-6 fw-bold mb-3">Link your FPL team, then pick your first competition.</h1>
          <p className="lead text-muted mb-4">Your account is ready. We just need your public Fantasy Premier League manager ID so we can calculate your scores, captain picks, rank and league standings automatically.</p>
          <div className="d-flex flex-wrap gap-2">
            <Button as={Link} to="/app/team" size="lg"><Link2 size={18} /> Link my FPL team</Button>
            <Button as={Link} to="/app/leagues/supreme" variant="outline-dark" size="lg">See all competitions <ArrowRight size={18} /></Button>
          </div>
        </Col>
        <Col lg={5}>
          <div className="border rounded-4 p-4 bg-light">
            <div className="d-flex gap-3 mb-4"><Badge bg="dark" className="rounded-pill px-3 py-2">1</Badge><div><strong>Link your team</strong><div className="small text-muted">Paste your public FPL team URL. No password is ever required.</div></div></div>
            <div className="d-flex gap-3"><Badge bg="primary" className="rounded-pill px-3 py-2">2</Badge><div><strong>Join a league</strong><div className="small text-muted">Choose weekly, bi-weekly, monthly or September Clash competitions before the official FPL deadline.</div></div></div>
          </div>
        </Col>
      </Row>
    </div>

    <div className="surface-card p-4 mb-4">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
        <div><div className="sfl-kicker"><Trophy size={15} /> Available now</div><h2 className="h4 mb-1 mt-2">Competitions you can join after linking</h2><div className="muted small">These are already created from the official FPL schedule, so you can see what is coming before you link.</div></div>
        <Button as={Link} to="/app/team" variant="outline-primary"><Link2 size={16} /> Link team to enter</Button>
      </div>
      {offers.length ? <Row className="g-3">
        {offers.slice(0, 6).map((offer) => {
          const clash = offer.cadence === 'clash-captains';
          return <Col md={6} xl={4} key={offer.id}>
            <div className="border rounded-4 p-3 h-100 d-flex flex-column">
              <div className="d-flex justify-content-between gap-2 align-items-start mb-2"><strong>{offer.name}</strong>{clash && <Badge bg="success">September</Badge>}</div>
              <div className="small text-muted mb-3">Gameweek {offer.startGameweek}{offer.endGameweek !== offer.startGameweek ? `–${offer.endGameweek}` : ''}</div>
              <div className="d-flex justify-content-between border-top border-bottom py-2 mb-3"><span className="small text-muted">Entry</span><strong>{clash ? 'Free' : offer.entryFeeCents ? moneyFromCents(offer.entryFeeCents) : 'Subscription'}</strong></div>
              <div className="d-flex justify-content-between mb-3"><span className="small text-muted">Prize</span><strong>{moneyFromCents(offer.prizeCents)}</strong></div>
              <div className="small text-muted mt-auto"><CalendarClock size={14} className="me-1" /> Entry closes {deadline(offer.joinDeadlineAt)}</div>
            </div>
          </Col>;
        })}
      </Row> : <EmptyState icon={Trophy} title="Competitions are being prepared" description="Link your FPL team now. Upcoming Supreme competitions will appear here as soon as they are provisioned from the official FPL schedule." action={<Button as={Link} to="/app/team">Link team</Button>} />}
    </div>

    <Alert variant="light" className="border">
      <strong>What happens after linking?</strong> Supreme automatically refreshes your public FPL data in the background. You should not need to press a sync button to keep your dashboard or standings current.
    </Alert>
  </>;
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setError('');
    try { return await api('/api/dashboard'); } catch (requestError) { setError(requestError.message); return null; }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      const initial = await load();
      if (!active || !initial) return;
      setData(initial);
      if (!initial.team?.linked) return;
      setRefreshing(true);
      try {
        const refreshed = await api('/api/dashboard?refresh=1');
        if (active) setData(refreshed);
      } catch (requestError) {
        // Cached dashboard stays usable if FPL is slow or temporarily unavailable.
      } finally {
        if (active) setRefreshing(false);
      }
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const leagues = useMemo(() => !data ? [] : data.myLeagues.filter((league) => filter === 'all' || league.status === filter), [data, filter]);

  if (error && !data) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!data) return <LoadingScreen fullScreen={false} label="Loading your dashboard" />;

  if (data.onboarding?.needsTeamLink || !data.team?.linked) return <OnboardingDashboard data={data} />;

  const summary = data.summary;
  const nextDeadline = data.gameState?.nextDeadline ? new Date(data.gameState.nextDeadline).toLocaleString('en-GB') : 'Waiting for FPL';

  return <>
    <PageHeader
      eyebrow={data.gameState.currentGameweek ? `Gameweek ${data.gameState.currentGameweek}` : 'Supreme dashboard'}
      title="Dashboard"
      description={`Next FPL deadline: ${nextDeadline}. Cached data appears immediately; fresh FPL data updates automatically in the background.`}
      actions={refreshing ? <Badge bg="light" text="dark" className="border px-3 py-2">Updating FPL data…</Badge> : null}
    />
    {data.team?.providerWarning && <Alert variant="warning">{data.team.providerWarning}</Alert>}

    <Row className="g-3 mb-4">
      <Col sm={6} xl={2}><StatCard icon={Activity} label="Gameweek points" value={summary.gameweekPoints} /></Col>
      <Col sm={6} xl={2}><StatCard icon={Trophy} label="Overall rank" value={summary.overallRank?.toLocaleString() || '—'} /></Col>
      <Col sm={6} xl={2}><StatCard icon={Trophy} label="Active leagues" value={summary.activeLeagues} /></Col>
      <Col sm={6} xl={2}><StatCard icon={WalletCards} label="Wallet balance" value={moneyFromCents(summary.walletBalanceCents)} /></Col>
      <Col sm={6} xl={2}><StatCard icon={WalletCards} label="Pending balance" value={moneyFromCents(summary.pendingBalanceCents)} /></Col>
      <Col sm={6} xl={2}><StatCard icon={Crown} label="Subscription" value={summary.subscription} /></Col>
    </Row>

    <div className="surface-card p-4 mb-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <div><h2 className="h4 mb-1">My Leagues</h2><div className="muted small">Standings show immediately from the latest saved score and refresh automatically after the page appears.</div></div>
        <div className="d-flex gap-2">{['all', 'live', 'upcoming', 'settled'].map((value) => <Button size="sm" variant={filter === value ? 'dark' : 'outline-dark'} key={value} onClick={() => setFilter(value)} className="text-capitalize">{value}</Button>)}</div>
      </div>
      {leagues.length ? <Row className="g-3">{leagues.map((league) => <Col xl={6} key={league.id}><LeagueCard league={league} compact /></Col>)}</Row> : <EmptyState icon={Trophy} title="No leagues in this view" description="Join a Supreme competition or create a custom league to start tracking standings here." action={<Button as={Link} to="/app/leagues/supreme">Discover competitions</Button>} />}
    </div>

    <Row className="g-4 mb-4">
      <Col xl={8}><div className="surface-card p-4 h-100"><div className="mb-3"><h2 className="h4 mb-1">Leaderboards</h2><div className="muted small">Latest saved standings are shown immediately while score refresh continues in the background.</div></div><Tabs defaultActiveKey="earnings" className="mb-3"><Tab eventKey="earnings" title="Top Earners"><LeaderboardTable rows={data.earningsLeaderboard} earnings /></Tab>{data.leaderboards.map((board) => <Tab eventKey={board.key} title={board.name} key={board.key}><div className="d-flex justify-content-end mb-3"><LeaderboardShareCard leagueId={board.leagueId} title={board.leagueName || board.name} disabled={!board.rows.length} /></div><LeaderboardTable rows={board.rows} /></Tab>)}</Tabs></div></Col>
      <Col xl={4}><div className="surface-card p-4 h-100"><h2 className="h4">Team snapshot</h2>{data.team.linked && data.team.snapshot ? <><div className="d-flex justify-content-between py-2 border-bottom"><span className="muted">Team</span><strong>{data.team.snapshot.teamName}</strong></div><div className="d-flex justify-content-between py-2 border-bottom"><span className="muted">Points</span><strong>{data.team.snapshot.gameweekPoints}</strong></div><div className="d-flex justify-content-between py-2 border-bottom"><span className="muted">Overall rank</span><strong>{data.team.snapshot.overallRank?.toLocaleString()}</strong></div><div className="d-flex justify-content-between py-2"><span className="muted">Updated</span><strong>{data.team.snapshot.fetchedAt ? new Date(data.team.snapshot.fetchedAt).toLocaleString('en-GB') : '—'}</strong></div></> : <EmptyState title="Linked team is being prepared" description="Your team is linked. Supreme will populate the first snapshot automatically." action={<Button as={Link} to="/app/team">View team</Button>} />}</div></Col>
    </Row>

    <Row className="g-4">
      <Col xl={7}><div className="surface-card p-4"><h2 className="h4 mb-3">Recent transactions</h2>{data.transactions.length ? <div className="table-responsive"><table className="table mb-0"><tbody>{data.transactions.map((transaction) => <tr key={transaction._id}><td>{new Date(transaction.createdAt).toLocaleDateString()}</td><td><div className="fw-semibold">{transaction.description}</div><div className="small muted">{transaction.reference}</div></td><td><StatusBadge status={transaction.status} /></td><td className="text-end fw-bold"><CurrencyAmount cents={transaction.amountCents} /></td></tr>)}</tbody></table></div> : <EmptyState title="No transactions" description="Your deposits, withdrawals, entry fees, bonuses and prizes will appear here." />}</div></Col>
      <Col xl={5}><div className="surface-card p-4 h-100"><h2 className="h4">Current subscription</h2>{data.subscription ? <><div className="metric-number mt-3">{data.subscription.planName}</div><div className="muted">{data.subscription.competitionsIncluded.join(' · ')}</div><div className="mt-3"><StatusBadge status={data.subscription.status} /></div></> : <EmptyState title="No subscription" description="Weekly entry can also be purchased for $1; subscriptions unlock the competitions included in your selected plan." action={<Button as={Link} to="/app/subscription">View plans</Button>} />}</div></Col>
    </Row>
  </>;
}
