import { useState } from 'react';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import { ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { adminApi } from '../adminApi';

export default function AdminSignupPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    setupKey: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(false);
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await adminApi('/auth/register', { method: 'POST', body: form });
      setCreated(true);
    } catch (requestError) {
      setError(requestError.message || 'The administrator account could not be created.');
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
          <div className="admin-eyebrow text-info">Private administrator enrolment</div>
          <h1>Create an authorised operations account.</h1>
          <p>
            This route is intentionally excluded from the customer application. A valid setup key is required to create an administrator.
          </p>
        </div>
        <div className="small text-white-50">Remove or rotate the setup key after enrolment.</div>
      </section>

      <section className="admin-auth-panel">
        <Card className="admin-auth-card">
          <Card.Body className="p-0">
            <h2>Administrator enrolment</h2>
            <p className="text-secondary mb-4">Create a restricted management account.</p>

            {error && <Alert variant="danger">{error}</Alert>}
            {created && (
              <Alert variant="success">
                Administrator created successfully. You may now sign in.
              </Alert>
            )}

            {!created ? (
              <Form onSubmit={submit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full name</Form.Label>
                  <Form.Control
                    required
                    value={form.fullName}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      fullName: event.target.value,
                    }))}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    required
                    value={form.email}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone number</Form.Label>
                  <Form.Control
                    value={form.phone}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    minLength={12}
                    required
                    value={form.password}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))}
                  />
                  <Form.Text className="text-secondary">Use at least 12 characters.</Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Administrator setup key</Form.Label>
                  <Form.Control
                    type="password"
                    required
                    value={form.setupKey}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      setupKey: event.target.value,
                    }))}
                  />
                </Form.Group>

                <Button type="submit" className="admin-auth-submit w-100" disabled={busy}>
                  {busy ? 'Creating administrator…' : 'Create administrator'}
                </Button>
              </Form>
            ) : (
              <Button
                type="button"
                className="admin-auth-submit w-100"
                onClick={() => navigate('/admin/login', { replace: true })}
              >
                Continue to sign in
              </Button>
            )}
          </Card.Body>
        </Card>
      </section>
    </div>
  );
}
