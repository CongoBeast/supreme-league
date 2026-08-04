import React, { useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Eye, EyeOff, Gift, Home } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RequiredLabel from '../components/RequiredLabel';
import RegistrationConsentFields from '../components/RegistrationConsentFields';

function AuthShell({ title, subtitle, wide = false, children }) {
  return (
    <div className="min-vh-100 d-grid align-items-center bg-light py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={wide ? 8 : 6} xl={wide ? 7 : 5}>
            <div className="text-center mb-4">
              <Link to="/" className="text-decoration-none d-inline-flex align-items-center gap-2">
                <span className="sfl-brand-mark">S</span>
                <span className="sfl-brand h4 mb-0">Supreme Fantasy League</span>
              </Link>
              <h1 className="h2 page-title mt-4">{title}</h1>
              <p className="muted mb-0">{subtitle}</p>
            </div>
            <Card className="surface-card border-0">
              <Card.Body className="p-4 p-md-5">{children}</Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { login, sessionMessage, setSessionMessage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const requestedPlan = searchParams.get('plan') || '';

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form);
      navigate(
        location.state?.from || (requestedPlan ? `/app/subscription?plan=${encodeURIComponent(requestedPlan)}` : '/app/dashboard'),
        { replace: true }
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your competitions, wallet and team.">
      {(error || sessionMessage) && (
        <Alert variant="danger" onClose={() => { setError(''); setSessionMessage(''); }} dismissible>
          {error || sessionMessage}
        </Alert>
      )}
      <Form onSubmit={submit}>
        <Form.Group className="mb-3">
          <Form.Label><RequiredLabel>Email</RequiredLabel></Form.Label>
          <Form.Control
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </Form.Group>
        <Form.Group className="mb-4">
          <Form.Label><RequiredLabel>Password</RequiredLabel></Form.Label>
          <div className="position-relative">
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
            <button
              type="button"
              className="btn position-absolute top-50 end-0 translate-middle-y"
              onClick={() => setShowPassword((value) => !value)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Form.Group>
        <Button type="submit" className="w-100" size="lg" disabled={busy}>
          {busy ? 'Signing in…' : 'Login'}
        </Button>
        <div className="text-center mt-4 small">
          New here?{' '}
          <Link to={requestedPlan ? `/register?plan=${encodeURIComponent(requestedPlan)}` : '/register'}>
            Create an account
          </Link>
        </div>
        <div className="text-center mt-2 small"><Link to="/"><Home size={14} /> Home</Link></div>
      </Form>
    </AuthShell>
  );
}

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialReferralCode = useMemo(
    () => String(searchParams.get('ref') || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, ''),
    [searchParams]
  );
  const requestedPlan = searchParams.get('plan') || '';
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '+263',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
    referralCode: initialReferralCode,
    ageConfirmed: false,
    termsAccepted: false,
    privacyAccepted: false,
    rulesAccepted: false,
    securityAcknowledged: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const setField = (name, value) => setForm((current) => ({ ...current, [name]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register({
        ...form,
        referralCode: form.referralCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''),
        ageConfirmed: form.ageConfirmed === true,
        termsAccepted: form.termsAccepted === true,
        privacyAccepted: form.privacyAccepted === true,
        rulesAccepted: form.rulesAccepted === true,
        securityAcknowledged: form.securityAcknowledged === true,
      });
      navigate(
        requestedPlan ? `/app/subscription?plan=${encodeURIComponent(requestedPlan)}` : '/app/dashboard',
        { replace: true }
      );
    } catch (requestError) {
      setError([requestError.message, ...(requestError.errors || [])].join(' '));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      wide
      title="Create your account"
      subtitle="Adults 18+ only. Review the rules, privacy and security terms before creating your account."
    >
      {error && <Alert variant="danger">{error}</Alert>}
      {initialReferralCode && (
        <Alert variant="light" className="border d-flex gap-2 align-items-center">
          <Gift size={18} className="text-brand" />
          Referral code <strong>{initialReferralCode}</strong> has been applied.
        </Alert>
      )}
      <Form onSubmit={submit}>
        <Row className="g-3">
          <Col md={6}>
            <Form.Label><RequiredLabel>Full name</RequiredLabel></Form.Label>
            <Form.Control required autoComplete="name" value={form.fullName} onChange={(event) => setField('fullName', event.target.value)} />
          </Col>
          <Col md={6}>
            <Form.Label><RequiredLabel>Email</RequiredLabel></Form.Label>
            <Form.Control type="email" required autoComplete="email" value={form.email} onChange={(event) => setField('email', event.target.value)} />
          </Col>
          <Col md={6}>
            <Form.Label><RequiredLabel>Zimbabwe phone</RequiredLabel></Form.Label>
            <Form.Control required autoComplete="tel" value={form.phone} onChange={(event) => setField('phone', event.target.value)} />
          </Col>
          <Col md={6}>
            <Form.Label><RequiredLabel>Date of birth</RequiredLabel></Form.Label>
            <Form.Control type="date" required value={form.dateOfBirth} onChange={(event) => setField('dateOfBirth', event.target.value)} />
          </Col>
          <Col md={6}>
            <Form.Label><RequiredLabel>Password</RequiredLabel></Form.Label>
            <div className="position-relative">
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                minLength={8}
                required
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => setField('password', event.target.value)}
              />
              <button
                type="button"
                className="btn position-absolute top-50 end-0 translate-middle-y"
                onClick={() => setShowPassword((value) => !value)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Col>
          <Col md={6}>
            <Form.Label><RequiredLabel>Confirm password</RequiredLabel></Form.Label>
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(event) => setField('confirmPassword', event.target.value)}
            />
          </Col>
          <Col xs={12}>
            <Form.Label>Referral code <span className="muted small">(optional)</span></Form.Label>
            <Form.Control
              value={form.referralCode}
              maxLength={20}
              onChange={(event) => setField('referralCode', event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="Enter a friend's referral code"
            />
            <Form.Text>A valid referral code links your account to the member who invited you.</Form.Text>
          </Col>
          <Col xs={12}>
            <RegistrationConsentFields values={form} onChange={setField} />
          </Col>
          <Col xs={12}>
            <Button type="submit" className="w-100" size="lg" disabled={busy}>
              {busy ? 'Creating account…' : 'Create account'}
            </Button>
          </Col>
        </Row>
        <div className="text-center mt-4 small">
          Already registered?{' '}
          <Link to={requestedPlan ? `/login?plan=${encodeURIComponent(requestedPlan)}` : '/login'}>Login</Link>
        </div>
      </Form>
    </AuthShell>
  );
}
