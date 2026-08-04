import React, { useEffect, useMemo, useState } from 'react';
import { Button, Col, Container, ProgressBar, Row } from 'react-bootstrap';
import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  CheckCircle2,
  Crown,
  Eye,
  Gauge,
  LineChart,
  LockKeyhole,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UserPlus,
  Users,
  WalletCards,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';
import PaymentMethodLogos from '../components/PaymentMethodLogos';
import { api, moneyFromCents } from '../services/api';

const fallbackPrizeSchedule = {
  weekly: 1000,
  biWeekly: 1500,
  monthly: 3000,
  halfSeason: 10000,
  season: 30000,
};

const fallbackRoadmap = [
  { activeSubscribers: 250, totalPrizeCents: 5000 },
  { activeSubscribers: 500, totalPrizeCents: 7500 },
  { activeSubscribers: 1000, totalPrizeCents: 12500 },
  { activeSubscribers: 2500, totalPrizeCents: 25000 },
];

const planCopy = {
  monthly: {
    name: 'Monthly Entry',
    copy: 'A focused route into the Supreme Monthly League.',
  },
  plus: {
    name: 'Plus',
    copy: 'Monthly competitions plus selected bi-weekly opportunities.',
  },
  'half-season': {
    name: 'Half-Season',
    copy: 'Broader access across weekly, bi-weekly, monthly and half-season competitions.',
  },
  season: {
    name: 'Supreme Season Pass',
    copy: 'The widest qualifying access across the Supreme-operated season.',
  },
};

const fallbackPlans = [
  { planCode: 'monthly', amountCents: 200 },
  { planCode: 'plus', amountCents: 500 },
  { planCode: 'half-season', amountCents: 2000 },
  { planCode: 'season', amountCents: 4000 },
];

const competitionFormats = [
  {
    name: 'Weekly pressure',
    copy: 'One qualifying gameweek. Every transfer, captain call and chip decision matters immediately.',
    icon: Zap,
  },
  {
    name: 'Bi-weekly consistency',
    copy: 'Two gameweeks reward managers who can adapt without losing momentum.',
    icon: Gauge,
  },
  {
    name: 'Monthly form',
    copy: 'A longer competitive window for managers who build repeatable performance.',
    icon: LineChart,
  },
  {
    name: 'Half-season endurance',
    copy: 'Long-form competition that rewards planning, patience and disciplined squad management.',
    icon: Target,
  },
  {
    name: 'Season supremacy',
    copy: 'The ultimate test: sustained FPL decision-making across the full campaign.',
    icon: Crown,
  },
  {
    name: 'Create your own league',
    copy: 'Launch a public or private league with clear entry terms, deadlines and visible standings.',
    icon: Users,
  },
];

const proofPoints = [
  ['Skill decides the outcome', 'Scores come from qualifying FPL performance—not random draws.', Trophy],
  ['Every rule is visible', 'Entry costs, prize conditions, standings and settlement states are shown clearly.', Eye],
  ['Money is tracked', 'Wallet and Paynow transactions are recorded by the backend and reflected immediately.', WalletCards],
  ['Built for serious managers', 'Multiple formats give strong players more than one way to prove their level.', BarChart3],
];

function formatMoney(cents) {
  return moneyFromCents(Number(cents || 0), 'USD').replace('US$', '$');
}

export default function LandingPage() {
  const [marketing, setMarketing] = useState(null);
  const [metricsUnavailable, setMetricsUnavailable] = useState(false);

  useEffect(() => {
    let mounted = true;
    api('/api/public/marketing-metrics')
      .then((data) => {
        if (mounted) setMarketing(data);
      })
      .catch(() => {
        if (mounted) setMetricsUnavailable(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const prizeSchedule = marketing?.prizeSchedule || fallbackPrizeSchedule;
  const roadmap = marketing?.monthlyPrizeRoadmap?.length
    ? marketing.monthlyPrizeRoadmap
    : fallbackRoadmap.map((milestone) => ({
        ...milestone,
        additionalPrizeCents: Math.max(0, milestone.totalPrizeCents - fallbackPrizeSchedule.monthly),
      }));

  const plans = useMemo(() => {
    const source = marketing?.plans?.length ? marketing.plans : fallbackPlans;
    return fallbackPlans.map((fallback) => {
      const live = source.find((plan) => plan.planCode === fallback.planCode) || fallback;
      return {
        ...fallback,
        ...live,
        ...planCopy[fallback.planCode],
      };
    });
  }, [marketing]);

  const illustrativePath = marketing?.illustrativeSeasonPath || [
    { label: '4 weekly wins', count: 4, unitPrizeCents: prizeSchedule.weekly, totalCents: prizeSchedule.weekly * 4 },
    { label: '2 bi-weekly wins', count: 2, unitPrizeCents: prizeSchedule.biWeekly, totalCents: prizeSchedule.biWeekly * 2 },
    { label: '1 monthly win', count: 1, unitPrizeCents: prizeSchedule.monthly, totalCents: prizeSchedule.monthly },
    { label: '1 half-season win', count: 1, unitPrizeCents: prizeSchedule.halfSeason, totalCents: prizeSchedule.halfSeason },
    { label: 'Season title', count: 1, unitPrizeCents: prizeSchedule.season, totalCents: prizeSchedule.season },
  ];
  const illustrativeTotal = marketing?.illustrativeSeasonPathTotalCents
    || illustrativePath.reduce((sum, item) => sum + Number(item.totalCents || 0), 0);

  const activeSubscribers = Number.isFinite(Number(marketing?.activeSubscribers))
    ? Number(marketing.activeSubscribers)
    : null;
  const nextMilestone = marketing?.nextMilestone
    || (activeSubscribers === null ? roadmap[0] : roadmap.find((item) => item.activeSubscribers > activeSubscribers));
  const progressPercent = Number.isFinite(Number(marketing?.progressPercent))
    ? Number(marketing.progressPercent)
    : 0;
  const referralRewardCents = Number.isFinite(Number(marketing?.referralRewardCents))
    ? Number(marketing.referralRewardCents)
    : 100;

  const prizeCards = [
    ['Weekly', prizeSchedule.weekly, 'One sharp gameweek'],
    ['Bi-weekly', prizeSchedule.biWeekly, 'Two-week consistency'],
    ['Monthly', prizeSchedule.monthly, 'Sustained monthly form'],
    ['Half-season', prizeSchedule.halfSeason, 'Long-range management'],
    ['Season', prizeSchedule.season, 'The headline title'],
  ];

  return (
    <div className="public-shell">
      <PublicNavbar />

      <section className="hero hero-premium">
        <Container>
          <Row className="g-5 align-items-center">
            <Col lg={7}>
              <div className="eyebrow mb-3">Zimbabwe&apos;s competitive FPL stage</div>
              <h1>Your FPL decisions deserve a bigger stage.</h1>
              <p className="hero-copy mt-4">
                You already make the hard calls: transfers, captaincy, chips and timing. Supreme Fantasy League turns
                that judgement into structured competition with published rules, management-reviewed results, live standings and USD prize
                opportunities for managers who consistently outperform the field.
              </p>
              <div className="d-flex flex-wrap gap-3 mt-4">
                <Button as={Link} to="/register" size="lg" className="hero-cta">
                  Start competing from $2 <ArrowRight size={18} />
                </Button>
                <Button as="a" href="#prize-roadmap" variant="outline-dark" size="lg">
                  See the prize roadmap
                </Button>
              </div>
              <div className="hero-proof-row mt-4" aria-label="Platform benefits">
                {['Skill-based results', 'Published prize terms', 'USD wallet', 'Wallet or Paynow'].map((item) => (
                  <span className="proof-pill" key={item}><CheckCircle2 size={15} /> {item}</span>
                ))}
              </div>
            </Col>

            <Col lg={5}>
              <div className="hero-prize-board">
                <div className="prize-board-topline">
                  <span><Sparkles size={16} /> Current headline opportunities</span>
                  <span className="status-badge live">Skill decides</span>
                </div>
                <div className="prize-board-main">
                  <div>
                    <span className="small text-white-50">Season title opportunity</span>
                    <div className="hero-prize-number">{formatMoney(prizeSchedule.season)}</div>
                    <span className="small text-white-50">Subject to the published competition classification and rules.</span>
                  </div>
                  <Crown size={48} aria-hidden="true" />
                </div>
                <div className="prize-board-list">
                  {prizeCards.slice(0, 4).map(([label, amount]) => (
                    <div className="prize-board-row" key={label}>
                      <span>{label}</span>
                      <strong>{formatMoney(amount)}</strong>
                    </div>
                  ))}
                </div>
                <div className="prize-board-note">
                  <ShieldCheck size={18} />
                  <span>Standings, result review and settlement status remain visible from entry to payout.</span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="market-position-band">
        <Container>
          <Row className="g-4 align-items-center">
            <Col lg={5}>
              <div className="eyebrow">The Supreme standard</div>
              <h2 className="display-6 fw-bold mb-0">Not another chat-group league. A complete competition platform.</h2>
            </Col>
            <Col lg={7}>
              <p className="lead muted mb-0">
                Supreme is built to become the benchmark for competitive fantasy football in Zimbabwe: stronger
                administration, more ways to compete, clearer prize information and a public record of performance.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="section-space" id="why-supreme">
        <Container>
          <div className="eyebrow">Why managers choose Supreme</div>
          <h2 className="section-heading">A platform designed around performance—not hype.</h2>
          <Row className="g-4 mt-1">
            {proofPoints.map(([title, copy, Icon]) => (
              <Col md={6} xl={3} key={title}>
                <div className="feature-panel h-100">
                  <div className="feature-icon"><Icon size={23} /></div>
                  <h3 className="h5">{title}</h3>
                  <p className="muted mb-0">{copy}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="section-space prize-opportunity-section" id="prizes">
        <Container>
          <Row className="g-4 align-items-end mb-4">
            <Col lg={8}>
              <div className="eyebrow">Prize opportunities</div>
              <h2 className="section-heading mb-2">One great gameweek can stand out. A great season can build.</h2>
              <p className="muted mb-0">
                Strong managers are not limited to one final table. Supreme creates weekly, bi-weekly, monthly and
                long-form opportunities so consistent skill can show up more than once.
              </p>
            </Col>
            <Col lg={4} className="text-lg-end">
              <span className="transparency-chip"><ShieldCheck size={17} /> Prize status shown before entry</span>
            </Col>
          </Row>

          <div className="prize-strip">
            {prizeCards.map(([label, amount, copy]) => (
              <div className="prize-opportunity-card" key={label}>
                <span className="small muted">{label}</span>
                <strong>{formatMoney(amount)}</strong>
                <span className="small muted">{copy}</span>
              </div>
            ))}
          </div>

          <Row className="g-4 mt-4 align-items-stretch">
            <Col lg={7}>
              <div className="scenario-card h-100">
                <div>
                  <div className="eyebrow">Illustrative championship run</div>
                  <h3 className="h2 mt-2">What a standout season could add up to</h3>
                  <p className="muted">
                    This example combines selected wins across the current headline schedule. It demonstrates potential,
                    not a promise of results.
                  </p>
                </div>
                <div className="scenario-list">
                  {illustrativePath.map((item) => (
                    <div className="scenario-row" key={item.label}>
                      <span>{item.label}</span>
                      <strong>{formatMoney(item.totalCents)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
            <Col lg={5}>
              <div className="scenario-total-card h-100">
                <span className="eyebrow text-white-50">Illustrative total</span>
                <div className="scenario-total">{formatMoney(illustrativeTotal)}</div>
                <p className="text-white-50">
                  A manager would need to win every competition listed in the example. Competition availability,
                  eligibility and prize classification apply. No earnings are guaranteed.
                </p>
                <Button as={Link} to="/register" variant="light" className="mt-auto">
                  Build your record <ArrowRight size={17} />
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="section-space" id="prize-roadmap">
        <Container>
          <div className="roadmap-shell">
            <Row className="g-5 align-items-center">
              <Col lg={5}>
                <div className="eyebrow">Community prize roadmap</div>
                <h2 className="section-heading mb-3">As the serious player base grows, the prize ceiling can grow with it.</h2>
                <p className="muted">
                  Our planned roadmap increases the monthly headline prize at clear active-subscriber milestones. The
                  live count is aggregated by the backend—no personal account information is exposed.
                </p>

                <div className="growth-meter-card">
                  <div className="d-flex justify-content-between align-items-end gap-3 mb-2">
                    <div>
                      <span className="small muted d-block">Active qualifying subscribers</span>
                      <strong className="growth-count">
                        {activeSubscribers === null ? 'Live count loading' : activeSubscribers.toLocaleString('en-GB')}
                      </strong>
                    </div>
                    {nextMilestone && (
                      <span className="small text-end muted">
                        Next target<br /><strong>{nextMilestone.activeSubscribers.toLocaleString('en-GB')}</strong>
                      </span>
                    )}
                  </div>
                  <ProgressBar now={activeSubscribers === null ? 0 : progressPercent} aria-label="Progress to the next prize milestone" />
                  <div className="small muted mt-2">
                    {metricsUnavailable
                      ? 'Live progress is temporarily unavailable; the published targets remain visible below.'
                      : nextMilestone
                        ? `${Math.max(0, nextMilestone.activeSubscribers - Number(activeSubscribers || 0)).toLocaleString('en-GB')} more qualifying subscribers to the next target.`
                        : 'The highest published roadmap milestone has been reached.'}
                  </div>
                </div>
              </Col>

              <Col lg={7}>
                <Row className="g-3">
                  {roadmap.map((milestone) => {
                    const reached = activeSubscribers !== null && activeSubscribers >= milestone.activeSubscribers;
                    const additional = Number.isFinite(Number(milestone.additionalPrizeCents))
                      ? Number(milestone.additionalPrizeCents)
                      : Math.max(0, milestone.totalPrizeCents - prizeSchedule.monthly);
                    return (
                      <Col sm={6} key={`${milestone.activeSubscribers}-${milestone.totalPrizeCents}`}>
                        <div className={`milestone-card ${reached ? 'is-reached' : ''}`}>
                          <div className="d-flex justify-content-between align-items-center gap-2">
                            <span className="milestone-target">{milestone.activeSubscribers.toLocaleString('en-GB')} active</span>
                            {reached && <span className="status-badge completed">Reached</span>}
                          </div>
                          <span className="small muted">Planned monthly headline prize</span>
                          <strong>{formatMoney(milestone.totalPrizeCents)}</strong>
                          <span className="milestone-uplift">+{formatMoney(additional)} above today&apos;s base</span>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </Col>
            </Row>
            <div className="roadmap-disclosure mt-4">
              <LockKeyhole size={17} />
              <span>
                Roadmap values are planned promotional targets. A higher prize becomes binding only when it is marked
                confirmed on the relevant competition card before entry; published eligibility and settlement rules apply.
              </span>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-space referral-section" id="referrals">
        <Container>
          <div className="referral-landing-card">
            <Row className="g-5 align-items-center">
              <Col lg={6}>
                <div className="eyebrow text-white-50">Refer &amp; earn</div>
                <h2 className="section-heading text-white mb-3">Bring a serious manager. Earn {formatMoney(referralRewardCents)} after their first spend.</h2>
                <p className="text-white-50 mb-4">
                  Every member gets a personal referral code. When a new user signs up with your code and completes
                  their first qualifying purchase of any amount, your reward is credited to your Supreme wallet.
                </p>
                <Button as={Link} to="/register" variant="light">Get your referral code <ArrowRight size={17} /></Button>
              </Col>
              <Col lg={6}>
                <div className="referral-steps">
                  {[
                    [UserPlus, 'Share your code', 'Your personal code and referral link are available from your profile.'],
                    [BadgeDollarSign, 'They make a qualifying purchase', 'The new member must complete a genuine subscription or league-entry purchase of any amount.'],
                    [WalletCards, 'Your wallet receives the reward', `${formatMoney(referralRewardCents)} is credited after the qualifying transaction is confirmed.`],
                  ].map(([Icon, title, copy]) => (
                    <div className="referral-step" key={title}>
                      <span><Icon size={20} /></span>
                      <div><strong>{title}</strong><p>{copy}</p></div>
                    </div>
                  ))}
                </div>
              </Col>
            </Row>
            <div className="referral-terms-note mt-4">
              Self-referrals, duplicate accounts, reversed or refunded payments, fraudulent activity and transactions
              created only to obtain a reward do not qualify. Referral eligibility is determined by the backend record.
            </div>
          </div>
        </Container>
      </section>

      <section className="section-space bg-light" id="competitions">
        <Container>
          <div className="eyebrow">Competition formats</div>
          <h2 className="section-heading">Different windows. The same demand for good decisions.</h2>
          <Row className="g-4 mt-1">
            {competitionFormats.map(({ name, copy, icon: Icon }) => (
              <Col md={6} lg={4} key={name}>
                <div className="soft-card competition-format-card h-100">
                  <Icon size={25} className="text-brand mb-3" />
                  <h3 className="h5">{name}</h3>
                  <p className="muted mb-0">{copy}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="section-space" id="rules">
        <Container>
          <Row className="g-5 align-items-start">
            <Col lg={5}>
              <div className="eyebrow">Rules you can read before you enter</div>
              <h2 className="section-heading mb-3">Clear competition terms. Formal management review.</h2>
              <p className="muted">
                Every league publishes its scoring window, lock time, entry cost, prize classification and eligibility
                conditions. Live standings remain provisional until final review and settlement.
              </p>
              <Button as={Link} to="/competition-rules" variant="dark">Read the full Competition Rules</Button>
            </Col>
            <Col lg={7}>
              <div className="rules-grid">
                {[
                  ['Official scoring source', 'Qualifying scores come from official FPL history and may be corrected if the source corrects or delays data.'],
                  ['Eligibility at the lock', 'Payment, subscription status, age, account integrity and linked FPL ownership must be valid at the published deadline.'],
                  ['Fair ties', 'Unless a league publishes another tie-break, the highest tied managers share the confirmed prize without exceeding the prize pool.'],
                  ['Management review', 'Questions must be raised through official support. Management reviews data, payments and audit logs before an operational decision is final.'],
                ].map(([title, copy]) => (
                  <div className="rule-summary-card" key={title}>
                    <Scale size={21} className="text-brand" />
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
          <div className="rules-disclosure mt-4">
            Competition-specific terms shown before entry take priority where they are more specific. Management may
            pause, recalculate, reschedule, cancel, refund or otherwise adjust an affected competition when official data,
            payment providers or essential services fail, subject to applicable law and the published rules.
          </div>
        </Container>
      </section>

      <section className="section-space" id="how-it-works">
        <Container>
          <div className="eyebrow">How it works</div>
          <h2 className="section-heading">From FPL manager ID to verified result.</h2>
          <Row className="g-4 mt-1">
            {[
              ['Create your account', 'Register, verify your details and connect your public FPL manager ID.'],
              ['Choose your route', 'Select a Supreme plan or enter a qualifying public or private league.'],
              ['Make your FPL decisions', 'Your actual qualifying FPL scores power the standings.'],
              ['See the result settle', 'Final scores are reviewed, winners are recorded and eligible prizes are credited.'],
            ].map(([title, copy], index) => (
              <Col md={6} lg={3} key={title}>
                <div className="how-step h-100">
                  <span className="how-step-number">0{index + 1}</span>
                  <h3 className="h5">{title}</h3>
                  <p className="muted mb-0">{copy}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="section-space bg-black text-white" id="plans">
        <Container>
          <Row className="g-4 align-items-end mb-4">
            <Col lg={8}>
              <div className="eyebrow">Choose your level</div>
              <h2 className="section-heading text-white mb-2">Start at $2. Scale your access when you are ready.</h2>
              <p className="text-white-50 mb-0">Pay from your Supreme wallet or complete checkout through Paynow.</p>
            </Col>
            <Col lg={4} className="text-lg-end">
              <span className="plan-trust-line"><ShieldCheck size={17} /> Backend-confirmed payments</span>
            </Col>
          </Row>
          <Row className="g-4">
            {plans.map((plan, index) => (
              <Col md={6} xl={3} key={plan.planCode}>
                <div className={`dark-plan-card h-100 ${index === 1 ? 'is-featured' : ''}`}>
                  {index === 1 && <span className="plan-ribbon">Popular step-up</span>}
                  <span className="small text-white-50">{plan.name}</span>
                  <div className="plan-price">{formatMoney(plan.amountCents)}</div>
                  <p className="text-white-50 flex-grow-1">{plan.copy}</p>
                  <div className="plan-check"><CheckCircle2 size={17} /> Clear qualifying access</div>
                  <Button as={Link} to={`/register?plan=${plan.planCode}`} variant={index === 1 ? 'primary' : 'light'} className="w-100 mt-4">
                    Choose {plan.name}
                  </Button>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="section-space">
        <Container>
          <Row className="g-5 align-items-center">
            <Col lg={5}>
              <div className="eyebrow">Payments and payouts</div>
              <h2 className="section-heading mb-3">Clear money movement from checkout to wallet.</h2>
              <p className="muted">
                Use your available Supreme wallet balance or Paynow for qualifying purchases. Completed transactions
                update the backend wallet immediately and trigger a confirmation email.
              </p>
              <div className="trust-list">
                <span><CheckCircle2 size={18} /> USD-denominated balances</span>
                <span><CheckCircle2 size={18} /> Immediate completed-payment confirmation</span>
                <span><CheckCircle2 size={18} /> Withdrawal review and status emails</span>
                <span><CheckCircle2 size={18} /> USD bank payouts typically take 3–4 business days</span>
              </div>
              <div className="fraud-warning mt-4">
                <ShieldAlert size={22} />
                <div>
                  <strong>Supreme will never ask for your security codes.</strong>
                  <p>We will never contact you by SMS, WhatsApp, email or telephone to request an OTP, password, PIN, CVC or a direct transfer of funds. Start payments only inside the official platform and approve only prompts you initiated.</p>
                </div>
              </div>
            </Col>
            <Col lg={7}>
              <div className="surface-card p-4 p-lg-5">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="feature-icon"><WalletCards size={23} /></div>
                  <div>
                    <strong className="d-block">Supported Zimbabwe-focused checkout options</strong>
                    <span className="small muted">Availability can depend on the Paynow configuration.</span>
                  </div>
                </div>
                <PaymentMethodLogos />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="section-space bg-light">
        <Container>
          <Row className="g-4">
            <Col lg={6}>
              <div className="surface-card p-4 p-lg-5 h-100">
                <div className="eyebrow">No random outcome</div>
                <h2 className="h2 mt-2">Your score comes from your FPL management.</h2>
                <p className="muted mb-0">
                  Supreme Fantasy League does not use prize draws to select winners. Qualifying FPL performance,
                  published scoring rules and tie handling determine the result.
                </p>
              </div>
            </Col>
            <Col lg={6}>
              <div className="surface-card p-4 p-lg-5 h-100">
                <div className="eyebrow">FAQ</div>
                <h3 className="h5 mt-3">Are prizes guaranteed?</h3>
                <p className="muted">Only prizes explicitly labelled guaranteed or confirmed are binding. Other amounts may be projected, promotional or participation-dependent.</p>
                <h3 className="h5">Is Supreme official FPL?</h3>
                <p className="muted">No. Supreme Fantasy League is an independent platform and is not affiliated with the Premier League or its fantasy game.</p>
                <h3 className="h5">Can strong players win more than once?</h3>
                <p className="muted">Yes—when eligible, a manager can compete across different qualifying windows. Each competition is settled independently.</p>
                <h3 className="h5">What happens if there is a scoring or payment issue?</h3>
                <p className="muted mb-0">Submit the issue through official support. Management reviews the authoritative FPL data, transaction record and audit trail before making an operational determination under the published rules.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="closing-cta-section">
        <Container>
          <div className="closing-cta-card">
            <div>
              <div className="eyebrow">Your rank already tells a story</div>
              <h2 className="display-5 fw-bold mb-2">Now give it a stage, a record and something worth chasing.</h2>
              <p className="muted mb-0">Join from $2, connect your FPL manager ID and enter the next qualifying competition.</p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Button as={Link} to="/register" size="lg">Create your account</Button>
              <Button as={Link} to="/about" variant="outline-dark" size="lg">Why Supreme</Button>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
}
