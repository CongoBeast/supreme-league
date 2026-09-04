import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { Copy, KeyRound, PlusCircle, RefreshCw, Search, Trophy } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, moneyFromCents } from '../services/api';
import PageHeader from '../components/PageHeader';
import LeagueCard from '../components/LeagueCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingScreen from '../components/LoadingScreen';
import StatusBadge from '../components/StatusBadge';
import CurrencyAmount from '../components/CurrencyAmount';
import LeaderboardTable from '../components/LeaderboardTable';
import LeaderboardShareCard from '../components/LeaderboardShareCard';
import PaynowCheckoutModal from '../components/PaynowCheckoutModal';
import LeagueAccessFields from '../components/LeagueAccessFields';

const toLocalDateTimeInput = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  const pad = (part) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const makeInviteCode = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let value = 'SFL-';
  for (let index = 0; index < 8; index += 1) {
    value += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return value;
};

const normalizeInviteCode = (value = '') => String(value)
  .toUpperCase()
  .replace(/[^A-Z0-9-]/g, '')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');

function LeagueBreadcrumbs({ current, parentLabel = 'Leagues', parentTo = '/app/leagues/discover' }) {
  return (
    <nav aria-label="breadcrumb" className="mb-3">
      <ol className="breadcrumb small mb-0">
        <li className="breadcrumb-item"><Link to="/app/dashboard">Dashboard</Link></li>
        <li className="breadcrumb-item"><Link to={parentTo}>{parentLabel}</Link></li>
        <li className="breadcrumb-item active" aria-current="page">{current}</li>
      </ol>
    </nav>
  );
}

function deadlineTime(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : Number.MAX_SAFE_INTEGER;
}

function sortLeagueCards(leagues = []) {
  return [...leagues].sort((a, b) => {
    if (Boolean(a.joinOpen) !== Boolean(b.joinOpen)) return a.joinOpen ? -1 : 1;
    if (a.joinOpen && b.joinOpen) {
      const deadlineDelta = deadlineTime(a.joinDeadlineAt) - deadlineTime(b.joinDeadlineAt);
      if (deadlineDelta) return deadlineDelta;
      const gwDelta = Number(a.startGameweek || 99) - Number(b.startGameweek || 99);
      if (gwDelta) return gwDelta;
    }
    const aLive = ['live', 'awaiting-review'].includes(a.status);
    const bLive = ['live', 'awaiting-review'].includes(b.status);
    if (aLive !== bLive) return aLive ? -1 : 1;
    return Number(a.startGameweek || 0) - Number(b.startGameweek || 0);
  });
}

function filterLabel(value) {
  if (value === 'joinable') return 'Join now';
  if (value === 'head-to-head') return 'Head to head';
  return String(value).replace(/-/g, ' ');
}

async function copyText(value) {
  if (!value) return false;
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function LeagueGrid({ scope, title, description, discover = false }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setError('');
    try {
      setData(await api(`/api/leagues?scope=${scope}`));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  const sortedLeagues = useMemo(() => sortLeagueCards(data?.leagues || []), [data]);
  const filters = useMemo(() => {
    if (!data) return ['all'];
    const dynamic = new Set();
    for (const league of data.leagues || []) {
      const cadence = league.cadence || league.competitionType;
      if (cadence && !['custom', 'band-for-band'].includes(cadence)) dynamic.add(cadence);
    }
    if (discover) return ['all', 'joinable', ...dynamic];
    return ['all', 'active', 'past', 'custom', 'supreme', 'head-to-head', ...dynamic];
  }, [data, discover]);

  const filtered = useMemo(() => sortedLeagues.filter((league) => {
    if (filter === 'all') return true;
    if (filter === 'joinable') return Boolean(league.joinOpen);
    if (filter === 'active') return !league.isPast && ['draft', 'open', 'upcoming', 'live', 'full', 'awaiting-review'].includes(league.status);
    if (filter === 'past') return league.isPast;
    if (filter === 'custom') return league.customLeague;
    if (filter === 'supreme') return league.officialSupremeLeague;
    if (filter === 'head-to-head') return league.competitionType === 'band-for-band';
    return league.status === filter || league.competitionType === filter || league.cadence === filter;
  }), [sortedLeagues, filter]);

  const nextJoinable = discover ? sortedLeagues.find((league) => league.joinOpen) : null;

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <LoadingScreen fullScreen={false} />;

  return (
    <>
      <LeagueBreadcrumbs current={title} />
      <PageHeader
        eyebrow="Competitions"
        title={title}
        description={description}
        actions={(
          <div className="d-flex flex-wrap gap-2">
            <Button as={Link} to="/app/leagues/join" variant="outline-dark"><KeyRound size={16} /> Join with code</Button>
            <Button as={Link} to="/app/leagues/create"><PlusCircle size={16} /> Create League</Button>
          </div>
        )}
      />

      {nextJoinable && (
        <Alert variant="primary" className="border-0 shadow-sm mb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <div className="small text-uppercase fw-semibold mb-1">Next competition to join</div>
              <div className="h5 mb-1">{nextJoinable.name}</div>
              <div className="small">Gameweek {nextJoinable.startGameweek}{nextJoinable.endGameweek !== nextJoinable.startGameweek ? `–${nextJoinable.endGameweek}` : ''} · entry closes {nextJoinable.joinDeadlineAt ? new Date(nextJoinable.joinDeadlineAt).toLocaleString('en-GB') : 'at the official FPL deadline'}</div>
            </div>
            <Button as={Link} to={`/app/leagues/${nextJoinable.id}`} variant="dark">View & join</Button>
          </div>
        </Alert>
      )}

      <div className="d-flex flex-wrap gap-2 mb-4">
        {filters.map((item) => <Button key={item} size="sm" variant={filter === item ? 'dark' : 'outline-dark'} onClick={() => setFilter(item)} className="text-capitalize">{filterLabel(item)}</Button>)}
      </div>

      {filtered.length ? (
        <Row className="g-4">
          {filtered.map((league) => <Col md={6} xl={4} key={league.id}><LeagueCard league={league} /></Col>)}
        </Row>
      ) : (
        <EmptyState
          icon={discover ? Search : Trophy}
          title={discover ? 'No competitions match this filter' : 'No leagues yet'}
          description={discover ? 'Try another competition format or use a private league code.' : 'Join with a code, discover a public competition or create your own league.'}
          action={<Button as={Link} to={discover ? '/app/leagues/join' : '/app/leagues/discover'}>{discover ? 'Join with code' : 'Discover competitions'}</Button>}
        />
      )}
    </>
  );
}

export function MyLeaguesPage() {
  return (
    <LeagueGrid
      scope="mine"
      title="My Leagues"
      description="Track active and past leagues, copy creator codes, refresh FPL standings and complete pending entry payments."
    />
  );
}

export function DiscoverLeaguesPage() {
  return (
    <LeagueGrid
      scope="discover"
      title="Discover Competitions"
      description="Review public competitions, or use a private code to join a creator-managed league."
      discover
    />
  );
}

export function CreateLeaguePage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [createdLeague, setCreatedLeague] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [gameweekSchedule, setGameweekSchedule] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    competitionType: 'weekly',
    startGameweek: '',
    endGameweek: '',
    entryAmount: 2,
    maximumParticipants: 10,
    inviteCode: makeInviteCode(),
    tieBreak: 'overall-rank',
    rulesAcknowledged: false,
    opponentEmail: '',
    visibility: 'private',
    joinDeadlineAt: '',
    allowLateJoin: false,
  });

  useEffect(() => {
    let active = true;
    setScheduleLoading(true);
    setScheduleError('');
    api('/api/fpl/gameweeks')
      .then((data) => {
        if (!active) return;
        const gameweeks = Array.isArray(data?.gameweeks) ? data.gameweeks : [];
        setGameweekSchedule(gameweeks);
        const suggested = gameweeks.find((item) => Number(item.id) === Number(data?.suggestedStartGameweek))
          || gameweeks.find((item) => item.deadlineAt && new Date(item.deadlineAt) > new Date());
        if (!suggested) {
          setScheduleError('FPL has not published a future gameweek deadline yet.');
          return;
        }
        setForm((current) => ({
          ...current,
          startGameweek: Number(suggested.id),
          endGameweek: Number(suggested.id),
          joinDeadlineAt: toLocalDateTimeInput(suggested.deadlineAt),
          allowLateJoin: false,
        }));
      })
      .catch((requestError) => {
        if (active) setScheduleError(requestError.message || 'Unable to load the official FPL gameweek schedule.');
      })
      .finally(() => {
        if (active) setScheduleLoading(false);
      });
    return () => { active = false; };
  }, []);

  const selectedStartGameweek = useMemo(
    () => gameweekSchedule.find((item) => Number(item.id) === Number(form.startGameweek)) || null,
    [gameweekSchedule, form.startGameweek]
  );

  const entry = Math.max(0, Number(form.entryAmount) || 0);
  const max = form.competitionType === 'band-for-band'
    ? 2
    : Math.max(2, Number(form.maximumParticipants) || 2);
  const gross = entry * max;
  const fee = gross * 0.10;
  const prize = gross - fee;

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const setStartGameweek = (value) => {
    const nextStart = Number(value);
    const schedule = gameweekSchedule.find((item) => Number(item.id) === nextStart);
    setForm((current) => {
      const currentEnd = Number(current.endGameweek || 0);
      const forceSingleWeek = ['weekly', 'band-for-band'].includes(current.competitionType);
      return {
        ...current,
        startGameweek: nextStart,
        endGameweek: forceSingleWeek || currentEnd < nextStart ? nextStart : current.endGameweek,
        joinDeadlineAt: toLocalDateTimeInput(schedule?.deadlineAt),
        allowLateJoin: false,
      };
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await api('/api/leagues', {
        method: 'POST',
        body: {
          ...form,
          inviteCode: normalizeInviteCode(form.inviteCode),
          joinDeadlineAt: form.joinDeadlineAt ? new Date(form.joinDeadlineAt).toISOString() : '',
        },
      });
      setCreatedLeague(data.league);
      setCheckoutOpen(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const closeCheckout = () => {
    setCheckoutOpen(false);
    if (createdLeague?.id) navigate(`/app/leagues/${createdLeague.id}`);
  };

  return (
    <>
      <LeagueBreadcrumbs current="Create league" />
      <PageHeader
        eyebrow="Custom competitions"
        title="Create League"
        description="Choose a unique invitation code and gameweek range. Joining deadlines are loaded from the live FPL schedule, not estimated locally."
      />

      {error && <Alert variant="danger">{error}</Alert>}
      {scheduleLoading && <Alert variant="info">Loading official gameweek deadlines from FPL…</Alert>}
      {scheduleError && <Alert variant="danger">{scheduleError} League creation is disabled because the app will not guess FPL dates.</Alert>}

      <Row className="g-4">
        <Col xl={8}>
          <div className="surface-card p-4">
            <Form onSubmit={submit}>
              <Row className="g-3">
                <Col md={8}>
                  <Form.Label>League name</Form.Label>
                  <Form.Control
                    required
                    value={form.name}
                    onChange={(event) => setField('name', event.target.value)}
                  />
                </Col>

                <Col md={4}>
                  <Form.Label>Format</Form.Label>
                  <Form.Select
                    value={form.competitionType}
                    onChange={(event) => {
                      const value = event.target.value;
                      setForm((current) => ({
                        ...current,
                        competitionType: value,
                        maximumParticipants: value === 'band-for-band' ? 2 : current.maximumParticipants,
                        endGameweek: ['weekly', 'band-for-band'].includes(value) ? current.startGameweek : current.endGameweek,
                        allowLateJoin: false,
                      }));
                    }}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="best-of-three">Best of Three</option>
                    <option value="band-for-band">Band for Band</option>
                    <option value="monthly">Monthly</option>
                    <option value="half-season">Half-season</option>
                    <option value="season">Season</option>
                  </Form.Select>
                </Col>

                <Col xs={12}>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={form.description}
                    onChange={(event) => setField('description', event.target.value)}
                  />
                </Col>

                <Col xs={12}>
                  <Form.Label>Unique league code</Form.Label>
                  <InputGroup>
                    <Form.Control
                      required
                      minLength={6}
                      maxLength={16}
                      value={form.inviteCode}
                      onChange={(event) => setField('inviteCode', normalizeInviteCode(event.target.value))}
                      aria-describedby="league-code-help"
                    />
                    <Button
                      type="button"
                      variant="outline-dark"
                      onClick={() => setField('inviteCode', makeInviteCode())}
                    >
                      <RefreshCw size={16} /> New code
                    </Button>
                  </InputGroup>
                  <Form.Text id="league-code-help">
                    Use 6–16 letters, numbers or hyphens. Codes are case-insensitive and must be unique.
                  </Form.Text>
                </Col>

                <Col md={4}>
                  <Form.Label>Start gameweek</Form.Label>
                  <Form.Select
                    required
                    disabled={scheduleLoading || Boolean(scheduleError)}
                    value={form.startGameweek}
                    onChange={(event) => setStartGameweek(event.target.value)}
                  >
                    <option value="">Select gameweek</option>
                    {gameweekSchedule
                      .filter((item) => item.deadlineAt && new Date(item.deadlineAt) > new Date())
                      .map((item) => (
                        <option value={item.id} key={item.id}>
                          {item.name} · {new Date(item.deadlineAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                        </option>
                      ))}
                  </Form.Select>
                  <Form.Text>
                    {selectedStartGameweek?.deadlineAt
                      ? `Official FPL deadline: ${new Date(selectedStartGameweek.deadlineAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}`
                      : 'Choose a future gameweek published by FPL.'}
                  </Form.Text>
                </Col>

                <Col md={4}>
                  <Form.Label>End gameweek</Form.Label>
                  <Form.Select
                    required
                    disabled={scheduleLoading || Boolean(scheduleError) || ['weekly', 'band-for-band'].includes(form.competitionType)}
                    value={form.endGameweek}
                    onChange={(event) => setField('endGameweek', Number(event.target.value))}
                  >
                    <option value="">Select gameweek</option>
                    {gameweekSchedule
                      .filter((item) => Number(item.id) >= Number(form.startGameweek || 0))
                      .map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
                  </Form.Select>
                </Col>

                <Col md={4}>
                  <Form.Label>Entry amount (USD)</Form.Label>
                  <Form.Control
                    type="number"
                    min="2"
                    step="0.01"
                    required
                    value={form.entryAmount}
                    onChange={(event) => setField('entryAmount', event.target.value)}
                  />
                  <Form.Text>$2 minimum. Every member, including the creator, pays this amount.</Form.Text>
                </Col>

                <Col md={6}>
                  <Form.Label>Maximum participants</Form.Label>
                  <Form.Control
                    type="number"
                    min="2"
                    disabled={form.competitionType === 'band-for-band'}
                    value={max}
                    onChange={(event) => setField('maximumParticipants', event.target.value)}
                  />
                </Col>

                <Col md={6}>
                  <Form.Label>Tie-break</Form.Label>
                  <Form.Select
                    value={form.tieBreak}
                    onChange={(event) => setField('tieBreak', event.target.value)}
                  >
                    <option value="overall-rank">Best overall rank</option>
                    <option value="goals-scored">Most goals scored</option>
                    <option value="captain-points">Most captain points</option>
                  </Form.Select>
                </Col>

                <Col xs={12}>
                  <LeagueAccessFields
                    values={form}
                    onChange={setField}
                    fplDeadlineAt={selectedStartGameweek?.deadlineAt || ''}
                    lockLateJoin
                  />
                </Col>

                {form.competitionType === 'band-for-band' && (
                  <Col xs={12}>
                    <Form.Label>Friend email</Form.Label>
                    <Form.Control
                      type="email"
                      required
                      placeholder="friend@example.com"
                      value={form.opponentEmail}
                      onChange={(event) => setField('opponentEmail', event.target.value)}
                    />
                    <Form.Text>
                      The challenge remains private and activates only after both registered users pay.
                    </Form.Text>
                  </Col>
                )}

                <Col xs={12}>
                  <Alert variant="light" className="small">
                    {form.visibility === 'public'
                      ? 'This league is public and will appear in Discover, but the invite code is still required to join.'
                      : 'This league is private. Share its code only with people you want to invite.'}
                    {' '}The league remains a draft until your wallet or Paynow entry payment succeeds.
                  </Alert>
                  <Form.Check
                    required
                    label="I acknowledge the published rules and financial breakdown"
                    checked={form.rulesAcknowledged}
                    onChange={(event) => setField('rulesAcknowledged', event.target.checked)}
                  />
                </Col>

                <Col xs={12}>
                  <Button type="submit" disabled={busy || scheduleLoading || Boolean(scheduleError) || !form.startGameweek || !form.endGameweek || !form.joinDeadlineAt}>
                    {busy ? 'Creating draft…' : `Create and pay ${moneyFromCents(entry * 100)}`}
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        </Col>

        <Col xl={4}>
          <div className="surface-card p-4 position-sticky" style={{ top: 96 }}>
            <div className="eyebrow">Live preview</div>
            <h2 className="h4">Financial breakdown</h2>
            <div className="d-flex justify-content-between py-2 border-bottom">
              <span>Your checkout</span>
              <strong>{moneyFromCents(entry * 100)}</strong>
            </div>
            <div className="d-flex justify-content-between py-2 border-bottom">
              <span>Entry per member</span>
              <strong>{moneyFromCents(entry * 100)}</strong>
            </div>
            <div className="d-flex justify-content-between py-2 border-bottom">
              <span>Max participants</span>
              <strong>{max}</strong>
            </div>
            <div className="d-flex justify-content-between py-2 border-bottom">
              <span>Projected gross pool</span>
              <strong>{moneyFromCents(gross * 100)}</strong>
            </div>
            <div className="d-flex justify-content-between py-2 border-bottom">
              <span>10% platform fee</span>
              <strong>{moneyFromCents(fee * 100)}</strong>
            </div>
            <div className="d-flex justify-content-between py-2">
              <span>Projected prize</span>
              <strong>{moneyFromCents(prize * 100)}</strong>
            </div>
            <p className="small muted mt-3 mb-0">
              The server recalculates the authoritative values. Only confirmed payments count toward the pool.
            </p>
          </div>
        </Col>
      </Row>

      <PaynowCheckoutModal
        show={checkoutOpen}
        onHide={closeCheckout}
        purpose="league-entry"
        leagueId={createdLeague?.id || ''}
        inviteCode={createdLeague?.inviteCode || form.inviteCode}
        amountCents={createdLeague?.entryFeeCents || Math.round(entry * 100)}
        title="Activate your league"
        onCompleted={() => navigate(`/app/leagues/${createdLeague.id}`)}
      />
    </>
  );
}

export function JoinLeagueByCodePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [league, setLeague] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const lookup = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setLeague(null);
    try {
      const normalized = normalizeInviteCode(code);
      const data = await api(`/api/leagues/invite/${encodeURIComponent(normalized)}`);
      setCode(normalized);
      setLeague(data.league);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <LeagueBreadcrumbs current="Join with code" />
      <PageHeader
        eyebrow="Private leagues"
        title="Join with a League Code"
        description="Enter the code supplied by the league creator, then choose your Supreme wallet or Paynow at checkout."
      />

      <Row className="g-4">
        <Col xl={7}>
          <div className="surface-card p-4 mb-4">
            <Form onSubmit={lookup}>
              <Form.Label>League code</Form.Label>
              <InputGroup>
                <Form.Control
                  autoFocus
                  required
                  minLength={6}
                  maxLength={16}
                  value={code}
                  onChange={(event) => setCode(normalizeInviteCode(event.target.value))}
                  placeholder="SFL-ABCD2345"
                />
                <Button type="submit" disabled={busy}>
                  <Search size={16} /> {busy ? 'Finding…' : 'Find league'}
                </Button>
              </InputGroup>
            </Form>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          {league && (
            <div className="surface-card p-4">
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                <div>
                  <div className="eyebrow">{league.competitionType}</div>
                  <h2 className="h3 mb-1">{league.name}</h2>
                  <p className="muted mb-0">{league.description}</p>
                </div>
                <StatusBadge status={league.joined ? 'joined' : league.status} />
              </div>

              <Row className="g-3 small mb-4">
                <Col sm={6}>
                  <div className="muted">Entry fee</div>
                  <strong><CurrencyAmount cents={league.entryFeeCents} /></strong>
                </Col>
                <Col sm={6}>
                  <div className="muted">Participants</div>
                  <strong>{league.participantCount}/{league.maximumParticipants}</strong>
                </Col>
                <Col sm={6}>
                  <div className="muted">Gameweeks</div>
                  <strong>{league.startGameweek}–{league.endGameweek}</strong>
                </Col>
                <Col sm={6}>
                  <div className="muted">Projected prize</div>
                  <strong><CurrencyAmount cents={league.projectedPrizeCents} /></strong>
                </Col>
              </Row>

              {league.joined ? (
                <Button onClick={() => navigate(`/app/leagues/${league.id}`)}>
                  View joined league
                </Button>
              ) : (
                <Button
                  disabled={!league.canJoinWithCode}
                  onClick={() => setCheckoutOpen(true)}
                >
                  Join and pay {moneyFromCents(league.entryFeeCents)}
                </Button>
              )}
            </div>
          )}
        </Col>

        <Col xl={5}>
          <div className="surface-card p-4">
            <KeyRound size={28} className="mb-3" />
            <h2 className="h4">How private entry works</h2>
            <ol className="muted mb-0 ps-3">
              <li className="mb-2">Enter the exact code shared by the creator.</li>
              <li className="mb-2">Review the entry fee, format and dates.</li>
              <li className="mb-2">Choose your Supreme wallet balance or Paynow Express Checkout.</li>
              <li>Your membership appears only after payment is confirmed.</li>
            </ol>
          </div>
        </Col>
      </Row>

      <PaynowCheckoutModal
        show={checkoutOpen}
        onHide={() => setCheckoutOpen(false)}
        purpose="league-entry"
        leagueId={league?.id || ''}
        inviteCode={code}
        amountCents={league?.entryFeeCents || 0}
        title={`Join ${league?.name || 'league'}`}
        onCompleted={() => navigate(`/app/leagues/${league.id}`)}
      />
    </>
  );
}

export function LeagueDetailsPage() {
  const { leagueId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [joinBusy, setJoinBusy] = useState(false);

  const load = async ({ refresh = false, background = false } = {}) => {
    if (!background) setError('');
    try {
      const response = await api(`/api/leagues/${leagueId}${refresh ? '?refresh=1' : ''}`);
      setData(response);
      return response;
    } catch (requestError) {
      if (!background) setError(requestError.message);
      return null;
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
  }, [leagueId]);

  // Free leagues (e.g. Clash of the Captains, entryFeeCents === 0) have nothing
  // to charge, so joining never goes through the wallet/Paynow checkout — it
  // hits the plain join endpoint directly. Routing a $0 entry through the
  // payment gateway is what produced the "not enough balance" error, since
  // the wallet debit path treats any non-positive amount as invalid rather
  // than as "nothing to pay".
  const joinFreeLeague = async () => {
    setJoinBusy(true);
    setError('');
    try {
      await api(`/api/leagues/${leagueId}/join`, { method: 'POST' });
      setNotice('You have joined this free league.');
      await load();
    } catch (requestError) {
      setNotice('');
      setError(requestError.message);
    } finally {
      setJoinBusy(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <LoadingScreen fullScreen={false} />;

  const league = data.league;
  // freeEntry comes from the backend's SupremeLeagueMeta.entryMode check —
  // NOT entryFeeCents. Several subscription-gated Supreme leagues (Bi-weekly,
  // Monthly, Half-season, Season) also have entryFeeCents === 0 without being
  // free for everyone, so entryFeeCents can't be used here.
  const isFreeEntry = Boolean(league.freeEntry);
  let headerAction = <StatusBadge status={league.joined ? 'joined' : league.status} />;
  if (isFreeEntry && !league.joined && !league.inviteOnly && ['open', 'upcoming'].includes(league.status)) {
    headerAction = (
      <Button onClick={joinFreeLeague} disabled={joinBusy}>
        {joinBusy ? 'Joining…' : 'Join for free'}
      </Button>
    );
  } else if (league.canPayEntry) {
    headerAction = (
      <Button onClick={() => setCheckoutOpen(true)}>
        Complete payment {moneyFromCents(league.entryFeeCents)}
      </Button>
    );
  } else if (!league.joined && !league.inviteOnly && ['open', 'upcoming'].includes(league.status)) {
    headerAction = (
      <Button onClick={() => setCheckoutOpen(true)}>
        Choose payment method · {moneyFromCents(league.entryFeeCents)}
      </Button>
    );
  }

  const copyCode = async () => {
    const successful = await copyText(league.inviteCode);
    if (successful) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <>
      <LeagueBreadcrumbs current={league.name} />
      <PageHeader
        eyebrow={league.competitionType}
        title={league.name}
        description={league.description}
        actions={headerAction}
      />

      {notice && <Alert variant={notice.toLowerCase().includes('failed') || notice.toLowerCase().includes('cannot') ? 'danger' : 'info'}>{notice}</Alert>}
      {league.canPayEntry && (
        <Alert variant="warning">
          Your place is not active yet. Complete payment from your wallet or Paynow before sharing the league as ready to join.
        </Alert>
      )}

      <Row className="g-4">
        <Col xl={8}>
          {league.createdByCurrentUser && league.inviteCode && (
            <div className="surface-card p-4 mb-4">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div>
                  <div className="muted small">League invitation code</div>
                  <div className="fs-3 fw-bold letter-spacing">{league.inviteCode}</div>
                  <div className="small muted">Share this code with the people you want to invite.</div>
                </div>
                <Button variant="outline-dark" onClick={copyCode}>
                  <Copy size={16} /> {copied ? 'Copied' : 'Copy code'}
                </Button>
              </div>
            </div>
          )}

          <div className="surface-card p-4 mb-4">
            <div className="d-flex flex-wrap gap-4">
              <div>
                <div className="muted small">Status</div>
                <StatusBadge status={league.status} />
              </div>
              <div>
                <div className="muted small">Your payment</div>
                <StatusBadge status={league.entry?.paymentStatus || 'not-started'} />
              </div>
              <div>
                <div className="muted small">Gameweeks</div>
                <strong>{league.startGameweek}–{league.endGameweek}</strong>
              </div>
              <div>
                <div className="muted small">Created</div>
                <strong>{league.createdAt ? new Date(league.createdAt).toLocaleDateString('en-GB') : '—'}</strong>
              </div>
              <div>
                <div className="muted small">Join cutoff</div>
                <strong>{league.joinDeadlineAt ? new Date(league.joinDeadlineAt).toLocaleString('en-GB') : 'Waiting for FPL'}</strong>
              </div>
              <div>
                <div className="muted small">Competition end</div>
                <strong>
                  {league.fplFinishedAt
                    ? new Date(league.fplFinishedAt).toLocaleString('en-GB')
                    : `When FPL marks Gameweek ${league.endGameweek} finished`}
                </strong>
                {!league.fplFinishedAt && league.fplLastFixtureKickoffAt && (
                  <div className="muted small">Last scheduled fixture starts {new Date(league.fplLastFixtureKickoffAt).toLocaleString('en-GB')}</div>
                )}
              </div>
              <div>
                <div className="muted small">Entry fee</div>
                <strong><CurrencyAmount cents={league.entryFeeCents} /></strong>
              </div>
              <div>
                <div className="muted small">Paid participants</div>
                <strong>{league.participantCount}/{league.maximumParticipants}</strong>
              </div>
              <div>
                <div className="muted small">Prize type</div>
                <strong className="text-capitalize">{league.prizeType}</strong>
              </div>
            </div>
          </div>

          <div className="surface-card p-4 mb-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
              <div>
                <h2 className="h4 mb-1">Leaderboard</h2>
                <div className="small muted">
                  {league.lastScoredAt
                    ? `Refreshed ${new Date(league.lastScoredAt).toLocaleString('en-GB')} through Gameweek ${league.scoreThroughGameweek || '—'}`
                    : 'Scores refresh automatically from FPL when this page is opened.'}
                </div>
              </div>
              <LeaderboardShareCard leagueId={league.id} title={league.name} disabled={!data.leaderboard.length} />
            </div>
            {data.leaderboard.length ? (
              <LeaderboardTable rows={data.leaderboard} />
            ) : (
              <EmptyState
                title="No paid standings yet"
                description="The leaderboard appears when payments are confirmed and qualifying scores are available."
              />
            )}
          </div>

          <div className="surface-card p-4">
            <h2 className="h4">Published rules</h2>
            <ul className="mb-0">
              {league.rules.map((rule) => <li className="mb-2" key={rule}>{rule}</li>)}
            </ul>
          </div>
        </Col>

        <Col xl={4}>
          <div className="surface-card p-4 mb-4">
            <h2 className="h4">Financial breakdown</h2>
            <div className="d-flex justify-content-between py-2 border-bottom">
              <span>Confirmed gross pool</span>
              <strong><CurrencyAmount cents={league.grossPoolCents} /></strong>
            </div>
            <div className="d-flex justify-content-between py-2 border-bottom">
              <span>Platform fee</span>
              <strong><CurrencyAmount cents={league.platformFeeCents} /></strong>
            </div>
            <div className="d-flex justify-content-between py-2">
              <span>Current projected prize</span>
              <strong><CurrencyAmount cents={league.projectedPrizeCents} /></strong>
            </div>
          </div>

          <div className="surface-card p-4">
            <h2 className="h4">Your position</h2>
            {league.joined ? (
              <>
                <div className="metric-number">#{league.entry.currentRank || '—'}</div>
                <div className="muted">Score: {league.entry.currentScore || 0}</div>
                <div className="mt-3"><StatusBadge status={league.entry.eligibilityStatus} /></div>
                {league.entry.eligibilityReason && (
                  <p className="small muted mt-2">{league.entry.eligibilityReason}</p>
                )}
              </>
            ) : (
              <p className="muted mb-0">
                Your position becomes active when the league entry payment is confirmed.
              </p>
            )}
          </div>
        </Col>
      </Row>

      <PaynowCheckoutModal
        show={checkoutOpen}
        onHide={() => setCheckoutOpen(false)}
        purpose="league-entry"
        leagueId={league.id}
        inviteCode={league.inviteCode || ''}
        amountCents={league.entryFeeCents}
        title={league.createdByCurrentUser ? 'Activate your league' : `Join ${league.name}`}
        onCompleted={async () => {
          setCheckoutOpen(false);
          setNotice('Payment confirmed. Your league entry is active, your wallet balance is current, and a receipt email has been sent.');
          await load();
        }}
      />
    </>
  );
}
