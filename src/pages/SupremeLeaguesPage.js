import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Row, Spinner, Tab, Tabs } from 'react-bootstrap';
import { Crown, History, RefreshCw, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const formatMoney = (amountCents) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'USD' }).format((amountCents || 0) / 100);

function CompetitionCard({ item }) {
  const league = item.league || {};
  const entry = item.myEntry;
  const settled = item.settlementStatus === 'settled';
  return (
    <Card className="h-100 border-0 shadow-sm sfl-supreme-card">
      <Card.Body>
        <div className="d-flex justify-content-between gap-3 align-items-start">
          <div>
            <div className="sfl-kicker"><Crown size={15} /> Supreme competition</div>
            <h2 className="h5 mt-2 mb-1">{league.name || item.periodLabel}</h2>
            <p className="text-muted mb-0">Gameweeks {item.startGameweek}–{item.endGameweek}</p>
          </div>
          <Badge bg={settled ? 'dark' : 'success'}>{settled ? 'Settled' : 'Active'}</Badge>
        </div>
        <div className="sfl-supreme-metrics my-4">
          <div><span>Prize</span><strong>{formatMoney(item.prizeCents)}</strong></div>
          <div><span>My rank</span><strong>{entry?.currentRank || '—'}</strong></div>
          <div><span>My score</span><strong>{entry?.currentScore ?? '—'}</strong></div>
          <div><span>My prize</span><strong>{formatMoney(entry?.prizeCents || 0)}</strong></div>
        </div>
        <Alert variant="light" className="border small">{item.tieRule}</Alert>
        <Button as={Link} to={`/app/leagues/${item.leagueId}`} variant="outline-dark">View standings</Button>
      </Card.Body>
    </Card>
  );
}

export default function SupremeLeaguesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    api('/api/supreme-leagues')
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((requestError) => setError(requestError.message || 'Unable to load Supreme competitions.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  const active = useMemo(() => items.filter((item) => item.settlementStatus !== 'settled'), [items]);
  const past = useMemo(() => items.filter((item) => item.settlementStatus === 'settled'), [items]);

  if (loading) return <div className="py-5 text-center"><Spinner className="me-2" /> Loading Supreme competitions and outcomes…</div>;
  if (error) return <Alert variant="danger">{error}<div className="mt-3"><Button variant="outline-danger" onClick={load}><RefreshCw size={16} className="me-2" />Retry</Button></div></Alert>;

  const grid = (list, emptyText) => list.length ? (
    <Row className="g-4">{list.map((item) => <Col lg={6} key={item._id}><CompetitionCard item={item} /></Col>)}</Row>
  ) : <Alert variant="light" className="border">{emptyText}</Alert>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-4">
        <div>
          <div className="sfl-kicker"><Trophy size={16} /> Subscription competitions</div>
          <h1 className="mt-2 mb-2">Supreme Leagues</h1>
          <p className="text-muted mb-0">Your active subscription determines which weekly, bi-weekly, monthly, half-season and season competitions you enter automatically.</p>
        </div>
      </div>
      <Tabs defaultActiveKey="active" className="mb-4">
        <Tab eventKey="active" title={`Active (${active.length})`}>{grid(active, 'There are no active Supreme competitions assigned to your subscription yet.')}</Tab>
        <Tab eventKey="past" title={<span><History size={15} className="me-1" /> Past outcomes ({past.length})</span>}>{grid(past, 'No settled Supreme competition outcomes are available yet.')}</Tab>
      </Tabs>
    </div>
  );
}
