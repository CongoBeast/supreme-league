import React from 'react';
import { Alert, Badge, Button, Card, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import PublicNavbar from '../components/PublicNavbar';
import {
  COMPANY_NAME,
  COMPETITION_RULES,
  LEGAL_EFFECTIVE_DATE,
  LEGAL_VERSION,
  PLATFORM_NAME,
  PRIVACY_SECTIONS,
  SECURITY_WARNING,
  TERMS_SECTIONS,
} from '../content/legalContent';

function Shell({ eyebrow, title, intro, children }) {
  return (
    <div className="public-shell">
      <PublicNavbar />
      <main className="section-space public-info-page">
        <Container>
          <div className="public-info-hero">
            <div className="eyebrow">{eyebrow}</div>
            <h1 className="display-5 fw-bold">{title}</h1>
            {intro && <p className="lead muted mb-0">{intro}</p>}
          </div>
          {children}
        </Container>
      </main>
      <Footer />
    </div>
  );
}

function LegalDocument({ sections, title }) {
  return (
    <article className="legal-document" aria-label={title}>
      <div className="legal-meta-row">
        <Badge bg="dark">Version {LEGAL_VERSION}</Badge>
        <span>Effective {LEGAL_EFFECTIVE_DATE}</span>
        <span>{COMPANY_NAME}</span>
      </div>
      {sections.map((section) => (
        <section className="legal-section" key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph, index) => <p key={`${section.heading}-${index}`}>{paragraph}</p>)}
        </section>
      ))}
    </article>
  );
}

export function AboutPage() {
  return (
    <Shell
      eyebrow="About Supreme"
      title="Built for serious fantasy managers."
      intro="Supreme Fantasy League gives Zimbabwean FPL managers a structured place to compete, build a public record and earn from qualifying performance."
    >
      <Row className="g-4 mb-5">
        {[
          ['Competition with structure', 'Published entry terms, lock times, scoring windows, prize classifications, visible standings and a formal result-review process.'],
          ['More ways to prove your level', 'Weekly, bi-weekly, monthly, half-season, season and player-created leagues reward different kinds of management skill.'],
          ['Money movement you can follow', 'Wallet and Paynow transactions are recorded by the backend, withdrawal requests are reviewed, and status updates are sent by email.'],
          ['A record that follows you', 'Wins, FPL rank, gameweek points and total points remain available in your player profile and competition history.'],
        ].map(([heading, copy]) => (
          <Col md={6} key={heading}>
            <Card className="surface-card border-0 h-100"><Card.Body className="p-4"><h2 className="h4">{heading}</h2><p className="muted mb-0">{copy}</p></Card.Body></Card>
          </Col>
        ))}
      </Row>

      <div className="legal-callout mb-5">
        <h2 className="h4">How Supreme-operated leagues work</h2>
        <p>Eligible subscriptions place users into the competition windows included in their plan. Each league publishes its gameweeks, lock time, prize status and settlement conditions before entry. Scores come from qualifying official FPL history, are reviewed after the final gameweek, and become final only when the league is marked settled.</p>
        <p className="mb-0">Player-created leagues may be public or private and can set their own supported gameweek range, member limit, entry fee and joining deadline. The platform still controls payment confirmation, eligibility records, scoring, settlement and wallet credits.</p>
      </div>

      <Row className="g-4 align-items-stretch mb-5">
        <Col lg={7}>
          <div className="surface-card p-4 p-lg-5 h-100">
            <div className="eyebrow">Referral rewards</div>
            <h2 className="h3">Invite a manager. Earn US$1 after their first qualifying spend.</h2>
            <p className="muted">Every member receives a referral code. When a new user registers with that code and completes their first eligible purchase of any amount, the referrer receives US$1 in their Supreme wallet. Self-referrals, duplicate accounts, reversed payments and abusive activity do not qualify.</p>
            <Button as={Link} to="/register" variant="dark">Create an account</Button>
          </div>
        </Col>
        <Col lg={5}>
          <div className="security-alert h-100">
            <strong>Protect your account</strong>
            <p className="mb-0">{SECURITY_WARNING}</p>
          </div>
        </Col>
      </Row>

      <p className="muted mb-0">{PLATFORM_NAME} is operated by {COMPANY_NAME}. It is independent and is not affiliated with, endorsed by or operated by the Premier League or the official fantasy game.</p>
    </Shell>
  );
}

export function ContactPage() {
  return (
    <Shell eyebrow="Contact" title="Talk to management." intro="Account, payment, league, privacy and rules questions are handled through the official support channel.">
      <div className="surface-card p-4 p-lg-5">
        <h2 className="h4">Use the in-platform support area</h2>
        <p className="muted">Submitting a ticket from your account gives management the correct user, league and transaction references and creates an auditable resolution record.</p>
        <Button as={Link} to="/login" variant="dark">Open support</Button>
        <Alert variant="warning" className="mt-4 mb-0"><strong>Fraud warning:</strong> {SECURITY_WARNING}</Alert>
      </div>
    </Shell>
  );
}

export function CompetitionRulesPage() {
  return (
    <Shell eyebrow="Competition governance" title="Competition Rules" intro="The rules below apply to every Supreme-operated and player-created league unless a competition publishes a more specific term before entry.">
      <Alert variant="dark" className="mb-4">Questions or disputes must first be submitted to management through official support. Management reviews official data, payment records and platform audit logs before making an operational determination.</Alert>
      <LegalDocument sections={COMPETITION_RULES} title="Competition Rules" />
    </Shell>
  );
}

export function TermsPage() {
  return (
    <Shell eyebrow="Legal" title="Terms and Conditions" intro={`These Terms form the agreement between you and ${COMPANY_NAME} when you use ${PLATFORM_NAME}.`}>
      <Alert variant="warning" className="mb-4"><strong>Important:</strong> Participation does not guarantee winnings or financial return. Read the financial-risk, liability and dispute provisions carefully before accepting.</Alert>
      <LegalDocument sections={TERMS_SECTIONS} title="Terms and Conditions" />
    </Shell>
  );
}

export function PrivacyPage() {
  return (
    <Shell eyebrow="Legal" title="Privacy Policy" intro="We collect only the information needed to operate accounts, competitions, payments, security and support, and we do not sell personal user data.">
      <Alert variant="success" className="mb-4"><strong>Our privacy commitment:</strong> We do not sell, rent or trade personal user data. Any materially different third-party marketing use requires separate, explicit and informed consent.</Alert>
      <LegalDocument sections={PRIVACY_SECTIONS} title="Privacy Policy" />
    </Shell>
  );
}
