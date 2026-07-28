import { useState } from 'react';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import { ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { adminApi } from '../adminApi';

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await adminApi('/auth/login', { method: 'POST', body: form });
      navigate('/admin', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Administrator sign-in failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-auth-page">
      <section className="admin-auth-visual">
        <div className="admin-auth-logo">
          <span className="admin-brand-mark"><ShieldCheck size={24} /></span>
          Supreme Fantasy League
        </div>
        <div className="admin-auth-copy">
          <div className="admin-eyebrow text-info">Restricted operations portal</div>
          <h1>Manage the competition with confidence.</h1>
          <p>
            Review leagues, users, financial activity and support operations from one secure administrator workspace.
          </p>
        </div>
        <div className="small text-white-50">Administrator access is monitored and audited.</div>
      </section>

      <section className="admin-auth-panel">
        <Card className="admin-auth-card">
          <Card.Body className="p-0">
            <h2>Administrator sign in</h2>
            <p className="text-secondary mb-4">Use your authorised administrator account.</p>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={submit}>
              <Form.Group className="mb-3">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))}
                />
              </Form.Group>

              <Button type="submit" className="admin-auth-submit w-100" disabled={busy}>
                {busy ? 'Signing in…' : 'Sign in securely'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </section>
    </div>
  );
}
