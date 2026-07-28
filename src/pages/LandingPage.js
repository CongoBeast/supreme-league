import React from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  ShieldCheck,
  Trophy,
  WalletCards,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';
import PaymentMethodLogos from '../components/PaymentMethodLogos';

const formats = [
  ['Wildcard Week', 'A focused weekly competition based on the selected qualifying gameweek.'],
  ['Double or Nothing', 'A published progression format where the winner can qualify for the next applicable round.'],
  ['Best of Three', 'Compete across three gameweeks with the highest qualifying cumulative score winning.'],
  ['Band for Band', 'A private two-person challenge where both users enter the same amount.'],
  ['Supreme Mini Leagues', 'Weekly, bi-weekly, monthly, half-season and full-season competitions.'],
];

const plans = [
  {
    planCode: 'monthly',
    name: 'Monthly Entry',
    price: '$1',
    copy: 'Supreme Monthly League access',
  },
  {
    planCode: 'plus',
    name: 'Plus',
    price: '$5',
    copy: 'Monthly and selected bi-weekly competitions',
  },
  {
    planCode: 'half-season',
    name: 'Half-Season',
    price: '$20',
    copy: 'Applicable weekly, bi-weekly, monthly and half-season competitions',
  },
  {
    planCode: 'season',
    name: 'Supreme Season Pass',
    price: '$40',
    copy: 'Qualifying Supreme-operated season-pass competitions',
  },
];

export default function LandingPage() {
  return (
    <div className="public-shell">
      <PublicNavbar />

      <section className="hero">
        <Container>
          <div className="eyebrow mb-3">Transparent fantasy-management competitions</div>
          <h1>Play Smart. Compete Often. Win Transparently.</h1>
          <p className="hero-copy mt-4">
            Supreme Fantasy League is a Zimbabwe-focused fantasy-football competition platform with published rules,
            visible standings, clear entry costs, USD-based accounts and transparent result review.
          </p>
          <div className="d-flex flex-wrap gap-3 mt-4">
            <Button as={Link} to="/register" size="lg">Join Now</Button>
            <Button as={Link} to="/login" variant="outline-dark" size="lg">
              Explore Competitions <ArrowRight size={18} />
            </Button>
          </div>

          <div className="preview-shell mt-5">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="sfl-brand">Supreme Dashboard</div>
              <span className="small text-white-50">Product preview</span>
            </div>
            <div className="preview-body">
              <Row className="g-3">
                <Col lg={3}>
                  <div className="preview-sidebar p-3">
                    <div className="small text-white-50 mb-3">Navigation</div>
                    {['Dashboard', 'My Leagues', 'My Team', 'Wallet', 'Profile'].map((item) => (
                      <div key={item} className="py-2 text-white small">{item}</div>
                    ))}
                  </div>
                </Col>
                <Col lg={9}>
                  <Row className="g-3">
                    {[
                      ['Gameweek points', '68'],
                      ['Overall rank', '701,245'],
                      ['Active leagues', '4'],
                      ['Wallet balance', '$48.00'],
                    ].map(([label, value]) => (
                      <Col sm={6} xl={3} key={label}>
                        <div className="preview-stat">
                          <div className="small muted">{label}</div>
                          <div className="metric-number">{value}</div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                  <div className="surface-card p-4 mt-3">
                    <div className="d-flex justify-content-between">
                      <strong>Weekly Cup standings</strong>
                      <span className="status-badge live">Live</span>
                    </div>
                    <hr />
                    {['Tariro M.', 'Kuda N.', 'Rudo P.'].map((name, index) => (
                      <div className="d-flex justify-content-between py-2" key={name}>
                        <span>{index + 1}. {name}</span>
                        <strong>{94 - index * 7} pts</strong>
                      </div>
                    ))}
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-space" id="how-it-works">
        <Container>
          <div className="eyebrow">How it works</div>
          <h2 className="display-5 fw-bold mb-4">Simple entry. Visible rules. Clear results.</h2>
          <Row className="g-4">
            {[
              'Create an account.',
              'Link your unique public FPL manager ID.',
              'Select or create a competition.',
              'Follow database-backed standings and reviewed results.',
            ].map((item, index) => (
              <Col md={6} lg={3} key={item}>
                <div className="soft-card p-4 h-100">
                  <div className="sfl-brand-mark mb-3">{index + 1}</div>
                  <h3 className="h5">{item}</h3>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="section-space bg-light" id="competitions">
        <Container>
          <div className="eyebrow">Competition formats</div>
          <h2 className="display-5 fw-bold mb-4">Built for different ways to compete.</h2>
          <Row className="g-4">
            {formats.map(([name, copy]) => (
              <Col md={6} lg={4} key={name}>
                <Card className="soft-card h-100">
                  <Card.Body className="p-4">
                    <Trophy size={24} className="text-brand mb-3" />
                    <h3 className="h5">{name}</h3>
                    <p className="muted mb-0">{copy}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="section-space" id="plans">
        <Container>
          <div className="eyebrow">Plans</div>
          <h2 className="display-5 fw-bold mb-2">Competition access from $1.</h2>
          <p className="muted mb-4">Subscriptions are separate from custom-league entry fees.</p>
          <Row className="g-4">
            {plans.map((plan) => (
              <Col md={6} xl={3} key={plan.planCode}>
                <div className="surface-card p-4 h-100 d-flex flex-column">
                  <div className="muted small">{plan.name}</div>
                  <div className="display-5 fw-bold my-2">{plan.price}</div>
                  <p className="muted flex-grow-1">{plan.copy}</p>
                  <div className="d-flex align-items-center gap-2 text-brand small fw-semibold mb-4">
                    <CheckCircle2 size={18} /> Pay securely with Paynow
                  </div>
                  <Button as={Link} to={`/register?plan=${plan.planCode}`} className="w-100">
                    Join Now
                  </Button>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="section-space bg-light">
        <Container>
          <Row className="g-4">
            <Col lg={6}>
              <div className="surface-card p-4 h-100">
                <div className="d-flex gap-3">
                  <ShieldCheck className="text-brand" />
                  <div>
                    <h2 className="h3">Prize schedule</h2>
                    <p className="muted mb-0">
                      Weekly $10 · Bi-weekly $15 · Monthly $30 · Half-season $100 · Season $300. Each competition
                      clearly labels prizes as guaranteed, promotional, projected, or dependent on minimum participation.
                    </p>
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="surface-card p-4 h-100">
                <div className="d-flex gap-3">
                  <WalletCards className="text-brand" />
                  <div>
                    <h2 className="h3">Custom leagues</h2>
                    <p className="muted mb-0">
                      $2 minimum entry. The server calculates the standard 10% platform administration fee and shows
                      the gross pool, platform fee and projected prize pool before entry.
                    </p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="section-space">
        <Container>
          <div className="eyebrow">Payment methods</div>
          <h2 className="display-6 fw-bold mb-2">Pay using supported Zimbabwe-focused options.</h2>
          <p className="muted mb-4">The application currently supports Paynow Express Checkout for these methods.</p>
          <PaymentMethodLogos />
        </Container>
      </section>

      <section className="section-space bg-black text-white">
        <Container>
          <Row className="g-4 align-items-center">
            <Col lg={8}>
              <div className="eyebrow">Participation</div>
              <h2 className="display-5 fw-bold">Skill-based fantasy-management performance, not random prize draws.</h2>
              <p className="text-white-50">
                Adults 18+ only. Published scoring and tie-break rules apply. Final legal wording and the operational
                rules for paid competitions require professional approval before a production launch.
              </p>
            </Col>
            <Col lg={4}>
              <div className="p-4 rounded-4 border border-secondary">
                <Eye className="mb-3" />
                <strong className="d-block">Visible by design</strong>
                <span className="text-white-50 small">
                  Rules, standings, entry costs, fees, transaction status and result-review state.
                </span>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="section-space bg-light">
        <Container>
          <Row className="g-4">
            <Col lg={6}>
              <div className="eyebrow">About the platform</div>
              <h2 className="display-6 fw-bold">Built around visible competition administration.</h2>
              <p className="muted">
                Supreme Fantasy League is designed to make fees, standings, prize conditions and result review easier
                to understand before and during a competition.
              </p>
              <Button as={Link} to="/about" variant="outline-dark">Read about the platform</Button>
            </Col>
            <Col lg={6}>
              <div className="surface-card p-4">
                <div className="eyebrow">FAQ</div>
                <h3 className="h5 mt-2">Is this official FPL?</h3>
                <p className="muted">No. Supreme Fantasy League is not affiliated with the Premier League or its fantasy game.</p>
                <h3 className="h5">How do payments work?</h3>
                <p className="muted">Supported payments are initiated using Paynow Express Checkout and confirmed server-side.</p>
                <h3 className="h5">How are winners decided?</h3>
                <p className="muted mb-0">
                  Stored league-member FPL IDs are used to sync qualifying gameweek scores. Published tie-break rules
                  apply, followed by result review and settlement.
                </p>
              </div>
            </Col>
          </Row>
          <div className="surface-card p-4 mt-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <div className="eyebrow">Ready to compete?</div>
              <h3 className="h4 mb-0">Create an account and choose your first competition.</h3>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Button as={Link} to="/register">Join Now</Button>
              <Button as={Link} to="/contact" variant="outline-dark">Contact us</Button>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
}
