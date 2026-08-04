import React, { useState } from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RegistrationConsentFields from './RegistrationConsentFields';

export default function LegalAcceptanceModal() {
  const { user, setUser } = useAuth();
  const [values, setValues] = useState({
    ageConfirmed: false,
    termsAccepted: false,
    privacyAccepted: false,
    rulesAccepted: false,
    securityAcknowledged: false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!user?.legalAcceptanceRequired) return null;

  const setField = (name, value) => setValues((current) => ({ ...current, [name]: value }));
  const allAccepted = Object.values(values).every(Boolean);

  const submit = async () => {
    if (!allAccepted || busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await api('/api/auth/accept-legal', { method: 'POST', body: values });
      setUser(result.user);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal show backdrop="static" keyboard={false} centered size="lg" scrollable>
      <Modal.Header>
        <div>
          <Modal.Title>Review and accept the current platform terms</Modal.Title>
          <div className="small text-muted">Your account remains protected while acceptance is pending.</div>
        </div>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <p className="text-muted">
          Supreme Fantasy League has updated its Terms, Privacy Policy, Competition Rules and fraud-prevention notice.
          Review each document and confirm every item below to continue using account, league and wallet features.
        </p>
        <RegistrationConsentFields values={values} onChange={setField} />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={submit} disabled={!allAccepted || busy}>
          {busy ? 'Recording acceptance…' : 'Agree and continue'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
