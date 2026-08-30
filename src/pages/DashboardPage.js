import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Row, Tab, Tabs } from 'react-bootstrap';
import { Activity, Crown, RefreshCw, ShieldCheck, Trophy, WalletCards } from 'lucide-react';
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

export default function DashboardPage() {
  const [data,setData]=useState(null); const [error,setError]=useState(''); const [busy,setBusy]=useState(''); const [filter,setFilter]=useState('all'); const [notice,setNotice]=useState('');
  const load=async()=>{setError('');try{setData(await api('/api/dashboard'));}catch(e){setError(e.message)}};
  useEffect(()=>{load()},[]);
  const action=async(path,label)=>{setBusy(label);setNotice('');try{const result=await api(path,{method:'POST',body:{}});setNotice(result.message||`${label} complete.`);await load();}catch(e){setNotice(e.message)}finally{setBusy('')}};
  const leagues=useMemo(()=>!data?[]:data.myLeagues.filter(l=>filter==='all'||l.status===filter),[data,filter]);
  if(error) return <ErrorState message={error} onRetry={load}/>; if(!data) return <LoadingScreen fullScreen={false}/>;
  const s=data.summary;
  return <><PageHeader eyebrow={`Gameweek ${data.gameState.currentGameweek}`} title="Dashboard" description={`Next deadline: ${new Date(data.gameState.nextDeadline).toLocaleString()}`} actions={<><Button variant="outline-dark" onClick={()=>action('/api/team/sync','Sync Team')} disabled={busy}><RefreshCw size={16}/> Sync Team</Button><Button onClick={()=>action('/api/team/confirm-gameweek','Confirm Team')} disabled={busy}><ShieldCheck size={16}/> Confirm Team</Button></>}/>
    {notice&&<Alert variant={notice.toLowerCase().includes('error')?'danger':'info'}>{notice}</Alert>}
    <Row className="g-3 mb-4"><Col sm={6} xl={2}><StatCard icon={Activity} label="Gameweek points" value={s.gameweekPoints}/></Col><Col sm={6} xl={2}><StatCard icon={Trophy} label="Overall rank" value={s.overallRank?.toLocaleString()||'—'}/></Col><Col sm={6} xl={2}><StatCard icon={Trophy} label="Active leagues" value={s.activeLeagues}/></Col><Col sm={6} xl={2}><StatCard icon={WalletCards} label="Wallet balance" value={moneyFromCents(s.walletBalanceCents)}/></Col><Col sm={6} xl={2}><StatCard icon={WalletCards} label="Pending balance" value={moneyFromCents(s.pendingBalanceCents)}/></Col><Col sm={6} xl={2}><StatCard icon={Crown} label="Subscription" value={s.subscription}/></Col></Row>

    <div className="surface-card p-4 mb-4"><div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3"><div><h2 className="h4 mb-1">My Leagues</h2><div className="muted small">Your active, upcoming and settled competitions.</div></div><div className="d-flex gap-2">{['all','live','upcoming','settled'].map(x=><Button size="sm" variant={filter===x?'dark':'outline-dark'} key={x} onClick={()=>setFilter(x)} className="text-capitalize">{x}</Button>)}</div></div>{leagues.length?<Row className="g-3">{leagues.map(l=><Col xl={6} key={l.id}><LeagueCard league={l} compact/></Col>)}</Row>:<EmptyState icon={Trophy} title="No leagues in this view" description="Join a Supreme competition or create a custom league to start tracking standings here." action={<Button as={Link} to="/app/leagues/discover">Discover competitions</Button>}/>}</div>

    <Row className="g-4 mb-4"><Col xl={8}><div className="surface-card p-4 h-100"><div className="d-flex justify-content-between align-items-center mb-3"><div><h2 className="h4 mb-1">Leaderboards</h2><div className="muted small">Competition rankings plus the new prize-earnings leaderboard.</div></div></div><Tabs defaultActiveKey="earnings" className="mb-3"><Tab eventKey="earnings" title="Top Earners"><LeaderboardTable rows={data.earningsLeaderboard} earnings/></Tab>{data.leaderboards.map(board=><Tab eventKey={board.key} title={board.name} key={board.key}><LeaderboardShareCard leagueId={board.leagueId} title={board.leagueName || board.name} disabled={!board.rows.length}/><LeaderboardTable rows={board.rows}/></Tab>)}</Tabs></div></Col>
      <Col xl={4}><div className="surface-card p-4 h-100"><h2 className="h4">Team snapshot</h2>{data.team.linked?<><div className="d-flex justify-content-between py-2 border-bottom"><span className="muted">Team</span><strong>{data.team.snapshot.teamName}</strong></div><div className="d-flex justify-content-between py-2 border-bottom"><span className="muted">Points</span><strong>{data.team.snapshot.gameweekPoints}</strong></div><div className="d-flex justify-content-between py-2 border-bottom"><span className="muted">Overall rank</span><strong>{data.team.snapshot.overallRank?.toLocaleString()}</strong></div><div className="d-flex justify-content-between py-2"><span className="muted">Last sync</span><strong>{new Date(data.team.snapshot.fetchedAt).toLocaleDateString()}</strong></div></>:<EmptyState title="No linked team" description="Link your public fantasy manager ID to show your team snapshot." action={<Button as={Link} to="/app/team">Link team</Button>}/>}</div></Col></Row>

    <Row className="g-4"><Col xl={7}><div className="surface-card p-4"><h2 className="h4 mb-3">Recent transactions</h2>{data.transactions.length?<div className="table-responsive"><table className="table mb-0"><tbody>{data.transactions.map(t=><tr key={t._id}><td>{new Date(t.createdAt).toLocaleDateString()}</td><td><div className="fw-semibold">{t.description}</div><div className="small muted">{t.reference}</div></td><td><StatusBadge status={t.status}/></td><td className="text-end fw-bold"><CurrencyAmount cents={t.amountCents}/></td></tr>)}</tbody></table></div>:<EmptyState title="No transactions" description="Your deposits, withdrawals, entry fees and prizes will appear here."/>}</div></Col><Col xl={5}><div className="surface-card p-4 h-100"><h2 className="h4">Current subscription</h2>{data.subscription?<><div className="metric-number mt-3">{data.subscription.planName}</div><div className="muted">{data.subscription.competitionsIncluded.join(' · ')}</div><div className="mt-3"><StatusBadge status={data.subscription.status}/></div></>:<EmptyState title="No subscription" description="Choose a plan to access qualifying Supreme-operated competitions." action={<Button as={Link} to="/app/subscription">View plans</Button>}/>}</div></Col></Row>
  </>;
}
