import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Row, Tab, Tabs } from 'react-bootstrap';
import { Activity, Crown, Trophy, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, moneyFromCents } from '../services/api';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import LeagueCard from '../components/LeagueCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingScreen from '../components/LoadingScreen';
import LeaderboardTable from '../components/LeaderboardTable';
import StatusBadge from '../components/StatusBadge';
import CurrencyAmount from '../components/CurrencyAmount';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setError('');
    try { setData(await api('/api/dashboard')); } catch (requestError) { setError(requestError.message); }
  };

  useEffect(() => { load(); }, []);
  const leagues = useMemo(() => !data ? [] : data.myLeagues.filter((league) => filter === 'all' || league.status === filter), [data, filter]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <LoadingScreen fullScreen={false} />;

  const summary = data.summary;
  const nextDeadline = data.gameState?.nextDeadline ? new Date(data.gameState.nextDeadline).toLocaleString('en-GB') : 'Waiting for FPL';

  return <>
    <PageHeader
      eyebrow={`Gameweek ${data.gameState.currentGameweek}`}
      title="Dashboard"
      description={`Next FPL deadline: ${nextDeadline}. Scores and team data refresh automatically when this page opens.`}
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
        <div><h2 className="h4 mb-1">My Leagues</h2><div className="muted small">Standings are recalculated from FPL automatically when relevant pages are opened.</div></div>
        <div className="d-flex gap-2">{['all', 'live', 'upcoming', 'settled'].map((value) => <Button size="sm" variant={filter === value ? 'dark' : 'outline-dark'} key={value} onClick={() => setFilter(value)} className="text-capitalize">{value}</Button>)}</div>
      </div>
      {leagues.length ? <Row className="g-3">{leagues.map((league) => <Col xl={6} key={league.id}><LeagueCard league={league} compact /></Col>)}</Row> : <EmptyState icon={Trophy} title="No leagues in this view" description="Join a Supreme competition or create a custom league to start tracking standings here." action={<Button as={Link} to="/app/leagues/discover">Discover competitions</Button>} />}
    </div>

    <Row className="g-4 mb-4">
      <Col xl={8}><div className="surface-card p-4 h-100"><div className="mb-3"><h2 className="h4 mb-1">Leaderboards</h2><div className="muted small">Fresh competition rankings plus the prize-earnings leaderboard.</div></div><Tabs defaultActiveKey="earnings" className="mb-3"><Tab eventKey="earnings" title="Top Earners"><LeaderboardTable rows={data.earningsLeaderboard} earnings /></Tab>{data.leaderboards.map((board) => <Tab eventKey={board.key} title={board.name} key={board.key}><LeaderboardTable rows={board.rows} /></Tab>)}</Tabs></div></Col>
      <Col xl={4}><div className="surface-card p-4 h-100"><h2 className="h4">Team snapshot</h2>{data.team.linked && data.team.snapshot ? <><div className="d-flex justify-content-between py-2 border-bottom"><span className="muted">Team</span><strong>{data.team.snapshot.teamName}</strong></div><div className="d-flex justify-content-between py-2 border-bottom"><span className="muted">Points</span><strong>{data.team.snapshot.gameweekPoints}</strong></div><div className="d-flex justify-content-between py-2 border-bottom"><span className="muted">Overall rank</span><strong>{data.team.snapshot.overallRank?.toLocaleString()}</strong></div><div className="d-flex justify-content-between py-2"><span className="muted">Updated</span><strong>{new Date(data.team.snapshot.fetchedAt).toLocaleString('en-GB')}</strong></div></> : <EmptyState title="No linked team" description="Link your public FPL manager ID once; Supreme then refreshes it automatically." action={<Button as={Link} to="/app/team">Link team</Button>} />}</div></Col>
    </Row>

    <Row className="g-4">
      <Col xl={7}><div className="surface-card p-4"><h2 className="h4 mb-3">Recent transactions</h2>{data.transactions.length ? <div className="table-responsive"><table className="table mb-0"><tbody>{data.transactions.map((transaction) => <tr key={transaction._id}><td>{new Date(transaction.createdAt).toLocaleDateString()}</td><td><div className="fw-semibold">{transaction.description}</div><div className="small muted">{transaction.reference}</div></td><td><StatusBadge status={transaction.status} /></td><td className="text-end fw-bold"><CurrencyAmount cents={transaction.amountCents} /></td></tr>)}</tbody></table></div> : <EmptyState title="No transactions" description="Your deposits, withdrawals, entry fees, bonuses and prizes will appear here." />}</div></Col>
      <Col xl={5}><div className="surface-card p-4 h-100"><h2 className="h4">Current subscription</h2>{data.subscription ? <><div className="metric-number mt-3">{data.subscription.planName}</div><div className="muted">{data.subscription.competitionsIncluded.join(' · ')}</div><div className="mt-3"><StatusBadge status={data.subscription.status} /></div></> : <EmptyState title="No subscription" description="Weekly entry can also be purchased for $1; subscriptions unlock the competitions included in your selected plan." action={<Button as={Link} to="/app/subscription">View plans</Button>} />}</div></Col>
    </Row>
  </>;
}
