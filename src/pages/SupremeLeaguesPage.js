import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Row, Spinner, Tab, Tabs } from 'react-bootstrap';
import { Clock3, Crown, History, RefreshCw, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import PaynowCheckoutModal from '../components/PaynowCheckoutModal';

const formatMoney = (amountCents) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'USD' }).format((amountCents || 0) / 100);
const formatDateTime = (value) => value
  ? new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
  : 'Waiting for FPL';

function competitionStatus(item) {
  if (item.settlementStatus === 'settled') return { label: 'Settled', bg: 'dark' };
  if (item.footballFinished && !item.scoringFinalized) return { label: 'Awaiting FPL check', bg: 'warning', text: 'dark' };
  if (item.scoringFinalized) return { label: 'Finalising', bg: 'info', text: 'dark' };
  if (item.joinOpen) return { label: 'Entry open', bg: 'success' };
  if (item.joined) return { label: 'Joined', bg: 'success' };
  return { label: 'Live', bg: 'secondary' };
}

function CompetitionCard({ item, onJoin }) {
  const league = item.league || {};
  const entry = item.myEntry;
  const status = competitionStatus(item);
  const weeklyPaidEntry = item.cadence === 'weekly' && Number(item.entryFeeCents || 0) > 0;

  return (
    <Card className="h-100 border-0 shadow-sm sfl-supreme-card">
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between gap-3 align-items-start">
          <div>
            <div className="sfl-kicker"><Crown size={15} /> Supreme competition</div>
            <h2 className="h5 mt-2 mb-1">{league.name || item.periodLabel}</h2>
            <p className="text-muted mb-0">Gameweeks {item.startGameweek}–{item.endGameweek}</p>
          </div>
          <Badge bg={status.bg} text={status.text}>{status.label}</Badge>
        </div>

        <div className="sfl-supreme-metrics my-4">
          <div><span>Prize</span><strong>{formatMoney(item.prizeCents)}</strong></div>
          <div><span>Entry</span><strong>{weeklyPaidEntry ? formatMoney(item.entryFeeCents) : 'Plan access'}</strong></div>
          <div><span>My rank</span><strong>{entry?.currentRank || '—'}</strong></div>
          <div><span>My score</span><strong>{entry?.currentScore ?? '—'}</strong></div>
        </div>

        <div className="border rounded p-3 small mb-3">
          <div className="d-flex gap-2 align-items-start">
            <Clock3 size={16} className="mt-1 flex-shrink-0" />
            <div>
              <strong>Join deadline</strong>
              <div className="text-muted">{formatDateTime(item.joinDeadlineAt)}</div>
            </div>
          </div>
          {item.lastFixtureKickoffAt && (
            <div className="text-muted mt-2">
              Last scheduled fixture starts {formatDateTime(item.lastFixtureKickoffAt)}. The league closes only when FPL marks the gameweek <code>finished</code>.
            </div>
          )}
        </div>

        {item.footballFinished && !item.scoringFinalized && (
          <Alert variant="warning" className="small">
            The football is finished and entries are closed. Prize payment is waiting for FPL to mark the scoring data as checked.
          </Alert>
        )}

        {weeklyPaidEntry && item.includedWithSubscription && (
          <Alert variant="success" className="small">Your active subscription already includes this weekly entry, so no $1 payment is required.</Alert>
        )}

        <Alert variant="light" className="border small">{item.tieRule}</Alert>

        <div className="d-flex gap-2 flex-wrap mt-auto">
          {item.joinOpen && (
            <Button onClick={() => onJoin(item)}>
              Join weekly league · {formatMoney(item.entryFeeCents)}
            </Button>
          )}
          <Button as={Link} to={`/app/leagues/${item.leagueId}`} variant="outline-dark">View standings</Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default function SupremeLeaguesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutItem, setCheckoutItem] = useState(null);

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
    <Row className="g-4">
      {list.map((item) => (
        <Col lg={6} key={item._id}>
          <CompetitionCard item={item} onJoin={setCheckoutItem} />
        </Col>
      ))}
    </Row>
  ) : <Alert variant="light" className="border">{emptyText}</Alert>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-4">
        <div>
          <div className="sfl-kicker"><Trophy size={16} /> Supreme competitions</div>
          <h1 className="mt-2 mb-2">Supreme Leagues</h1>
          <p className="text-muted mb-0">
            The weekly Supreme league costs $1 per gameweek and pays a guaranteed $10 prize. Eligible subscriptions can still include weekly entry automatically.
          </p>
        </div>
      </div>

      <Alert variant="light" className="border mb-4">
        Competition timing comes from the FPL API: new entries close at the official gameweek deadline, the league remains live until FPL reports <code>finished</code>, and prizes wait for <code>data_checked</code> before settlement.
      </Alert>

      <Tabs defaultActiveKey="active" className="mb-4">
        <Tab eventKey="active" title={`Active (${active.length})`}>{grid(active, 'There are no active Supreme competitions available yet.')}</Tab>
        <Tab eventKey="past" title={<span><History size={15} className="me-1" /> Past outcomes ({past.length})</span>}>{grid(past, 'No settled Supreme competition outcomes are available yet.')}</Tab>
      </Tabs>

      <PaynowCheckoutModal
        show={Boolean(checkoutItem)}
        onHide={() => setCheckoutItem(null)}
        purpose="league-entry"
        leagueId={checkoutItem?.leagueId || ''}
        amountCents={checkoutItem?.entryFeeCents || 0}
        title={`Join ${checkoutItem?.league?.name || 'weekly Supreme league'}`}
        onCompleted={() => {
          setCheckoutItem(null);
          load();
        }}
      />
    </div>
  );
}
