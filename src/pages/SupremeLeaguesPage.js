import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Row, Spinner, Tab, Tabs } from 'react-bootstrap';
import { Clock3, Crown, History, Sparkles, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import PaynowCheckoutModal from '../components/PaynowCheckoutModal';

const formatMoney = (amountCents) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'USD' }).format((amountCents || 0) / 100);
const formatDateTime = (value) => value ? new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'Waiting for FPL';

function competitionStatus(item) {
  if (item.settlementStatus === 'settled') return { label: 'Settled', bg: 'dark' };
  if (item.footballFinished && !item.scoringFinalized) return { label: 'Awaiting FPL check', bg: 'warning', text: 'dark' };
  if (item.joined) return { label: 'Joined', bg: 'success' };
  if (item.joinOpen) return { label: 'Entry open', bg: 'success' };
  if (new Date(item.joinDeadlineAt) > new Date()) return { label: 'Scheduled', bg: 'info', text: 'dark' };
  return { label: 'Live', bg: 'secondary' };
}

function supremeDeadline(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : Number.MAX_SAFE_INTEGER;
}

function sortSupremeItems(list = []) {
  return [...list].sort((a, b) => {
    if (Boolean(a.joinOpen) !== Boolean(b.joinOpen)) return a.joinOpen ? -1 : 1;
    if (a.joinOpen && b.joinOpen) {
      const deadlineDelta = supremeDeadline(a.joinDeadlineAt) - supremeDeadline(b.joinDeadlineAt);
      if (deadlineDelta) return deadlineDelta;
      return Number(a.startGameweek || 99) - Number(b.startGameweek || 99);
    }
    if (Boolean(a.joined) !== Boolean(b.joined)) return a.joined ? -1 : 1;
    return Number(a.startGameweek || 0) - Number(b.startGameweek || 0);
  });
}

function cadenceLabel(value) {
  if (value === 'all') return 'All';
  if (value === 'joinable') return 'Join now';
  if (value === 'clash-captains') return 'Clash';
  return String(value || '').replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function SupremeBreadcrumbs() {
  return <nav aria-label="breadcrumb" className="mb-3"><ol className="breadcrumb small mb-0"><li className="breadcrumb-item"><Link to="/app/dashboard">Dashboard</Link></li><li className="breadcrumb-item"><Link to="/app/leagues/discover">Leagues</Link></li><li className="breadcrumb-item active" aria-current="page">Supreme Leagues</li></ol></nav>;
}

function CompetitionCard({ item, onJoin }) {
  const league = item.league || {};
  const entry = item.myEntry;
  const status = competitionStatus(item);
  const weeklyFlex = item.paymentOptions?.includes('one-off') || (item.cadence === 'weekly' && Number(item.entryFeeCents || 0) > 0);
  const clash = item.cadence === 'clash-captains' || item.scoringMode === 'captain-vice';

  return <Card className="h-100 border-0 shadow-sm sfl-supreme-card"><Card.Body className="d-flex flex-column">
    <div className="d-flex justify-content-between gap-3 align-items-start"><div><div className="sfl-kicker">{clash ? <Sparkles size={15} /> : <Crown size={15} />} {clash ? 'September special' : 'Supreme competition'}</div><h2 className="h5 mt-2 mb-1">{league.name || item.periodLabel}</h2><p className="text-muted mb-0">Gameweeks {item.startGameweek}–{item.endGameweek}</p></div><Badge bg={status.bg} text={status.text}>{status.label}</Badge></div>

    <div className="sfl-supreme-metrics my-4"><div><span>Prize</span><strong>{formatMoney(item.prizeCents)}</strong></div><div><span>Entry</span><strong>{clash ? 'FREE' : weeklyFlex ? `${formatMoney(item.entryFeeCents)} / plan` : 'Plan access'}</strong></div><div><span>My rank</span><strong>{entry?.currentRank || '—'}</strong></div><div><span>My score</span><strong>{entry?.currentScore ?? '—'}</strong></div></div>

    {clash && <Alert variant="success" className="small"><strong>Clash of the Captains:</strong> free for linked users during FPL’s September gameweeks. Your captain’s raw points + vice-captain’s raw points make your Clash score. Highest score wins {formatMoney(item.prizeCents)}.</Alert>}

    <div className="border rounded p-3 small mb-3"><div className="d-flex gap-2 align-items-start"><Clock3 size={16} className="mt-1 flex-shrink-0" /><div><strong>Official FPL entry deadline</strong><div className="text-muted">{formatDateTime(item.joinDeadlineAt)}</div></div></div>{item.lastFixtureKickoffAt && <div className="text-muted mt-2">Last scheduled fixture starts {formatDateTime(item.lastFixtureKickoffAt)}. Football completion is verified against FPL event and fixture completion.</div>}</div>

    {item.footballFinished && !item.scoringFinalized && <Alert variant="warning" className="small">Football is verified finished. Prize settlement is waiting for FPL <code>data_checked</code>.</Alert>}
    {weeklyFlex && item.includedWithSubscription && <Alert variant="success" className="small">Your subscription has already entered you. No $1 payment is required.</Alert>}
    {weeklyFlex && !item.joined && <Alert variant="light" className="border small mb-3">Choose either an eligible subscription or a one-off {formatMoney(item.entryFeeCents)} weekly entry. Both play in the same leaderboard for the same {formatMoney(item.prizeCents)} prize.</Alert>}

    <div className="d-flex gap-2 flex-wrap mt-auto">
      {item.joinOpen && <Button onClick={() => onJoin(item)}>Pay {formatMoney(item.entryFeeCents)} &amp; play</Button>}
      {weeklyFlex && !item.joined && new Date(item.joinDeadlineAt) > new Date() && <Button as={Link} to="/app/subscription" variant="outline-primary">Use a subscription</Button>}
      <Button as={Link} to={`/app/leagues/${item.leagueId}`} variant="outline-dark">View standings</Button>
    </div>
  </Card.Body></Card>;
}

export default function SupremeLeaguesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutItem, setCheckoutItem] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = async ({ refresh = false, background = false } = {}) => {
    if (!background) { setLoading(true); setError(''); }
    else setRefreshing(true);
    try {
      const data = await api(`/api/supreme-leagues${refresh ? '?refresh=1' : ''}`);
      setItems(Array.isArray(data) ? data : []);
      return data;
    } catch (requestError) {
      if (!background) setError(requestError.message || 'Unable to load Supreme competitions.');
      return null;
    } finally {
      if (!background) setLoading(false);
      else setRefreshing(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      const initial = await load();
      if (active && initial) load({ refresh: true, background: true });
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = useMemo(() => sortSupremeItems(items.filter((item) => item.settlementStatus !== 'settled')), [items]);
  const past = useMemo(() => [...items.filter((item) => item.settlementStatus === 'settled')].sort((a, b) => Number(b.startGameweek || 0) - Number(a.startGameweek || 0)), [items]);
  const filterOptions = useMemo(() => ['all', 'joinable', ...new Set(active.map((item) => item.cadence).filter(Boolean))], [active]);
  const filteredActive = useMemo(() => active.filter((item) => filter === 'all' || (filter === 'joinable' ? item.joinOpen : item.cadence === filter)), [active, filter]);
  const nextJoinable = useMemo(() => active.find((item) => item.joinOpen) || null, [active]);
  const clash = useMemo(() => filteredActive.filter((item) => item.cadence === 'clash-captains'), [filteredActive]);
  const standard = useMemo(() => filteredActive.filter((item) => item.cadence !== 'clash-captains'), [filteredActive]);

  if (loading) return <div className="py-5 text-center"><Spinner className="me-2" /> Loading Supreme competitions…</div>;
  if (error) return <Alert variant="danger">{error}<div className="mt-3"><Button variant="outline-danger" onClick={load}>Retry</Button></div></Alert>;
  const grid = (list, emptyText) => list.length ? <Row className="g-4">{list.map((item) => <Col lg={6} key={item._id}><CompetitionCard item={item} onJoin={setCheckoutItem} /></Col>)}</Row> : <Alert variant="light" className="border">{emptyText}</Alert>;

  return <div>
    <SupremeBreadcrumbs />
    <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-4"><div><div className="sfl-kicker"><Trophy size={16} /> Supreme competitions</div><h1 className="mt-2 mb-2">Supreme Leagues</h1><p className="text-muted mb-0">The nearest joinable competition is always shown first. Use the live filters to narrow the competitions already provisioned from FPL.</p></div>{refreshing && <Badge bg="light" text="dark" className="border px-3 py-2">Updating from FPL…</Badge>}</div>
    <Alert variant="light" className="border mb-4">Weekly: <strong>$1 one-off or eligible subscription</strong> · guaranteed <strong>$10 prize</strong>. Entry closes at FPL <code>deadline_time</code>; football completion is verified from the event plus all fixtures; payout normally waits for <code>data_checked</code>.</Alert>

    {nextJoinable && <Alert variant="primary" className="border-0 shadow-sm mb-4"><div className="d-flex flex-wrap justify-content-between align-items-center gap-3"><div><div className="small text-uppercase fw-semibold mb-1">Next Supreme competition to join</div><div className="h5 mb-1">{nextJoinable.league?.name || nextJoinable.periodLabel}</div><div className="small">Gameweek {nextJoinable.startGameweek}{nextJoinable.endGameweek !== nextJoinable.startGameweek ? `–${nextJoinable.endGameweek}` : ''} · closes {formatDateTime(nextJoinable.joinDeadlineAt)}</div></div><Button as={Link} to={`/app/leagues/${nextJoinable.leagueId}`} variant="dark">View & join</Button></div></Alert>}

    <div className="d-flex flex-wrap gap-2 mb-4">{filterOptions.map((value) => <Button key={value} size="sm" variant={filter === value ? 'dark' : 'outline-dark'} onClick={() => setFilter(value)}>{cadenceLabel(value)}</Button>)}</div>

    <Tabs key={filter} defaultActiveKey={clash.length ? 'clash' : 'active'} className="mb-4">
      {clash.length > 0 && <Tab eventKey="clash" title={`Clash of the Captains (${clash.length})`}>{grid(clash, 'No September Clash competitions are currently scheduled.')}</Tab>}
      <Tab eventKey="active" title={`Upcoming & active (${standard.length})`}>{grid(standard, 'There are no open or active Supreme competitions.')}</Tab>
      <Tab eventKey="past" title={<span><History size={15} className="me-1" /> Results ({past.length})</span>}>{grid(past, 'No settled Supreme competition outcomes are available yet.')}</Tab>
    </Tabs>

    <PaynowCheckoutModal show={Boolean(checkoutItem)} onHide={() => setCheckoutItem(null)} purpose="league-entry" leagueId={checkoutItem?.leagueId || ''} amountCents={checkoutItem?.entryFeeCents || 0} title={`Join ${checkoutItem?.league?.name || 'weekly Supreme league'}`} onCompleted={() => { setCheckoutItem(null); load(); load({ refresh: true, background: true }); }} />
  </div>;
}
