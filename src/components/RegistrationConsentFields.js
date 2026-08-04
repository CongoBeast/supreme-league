import React, { useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import {
  COMPETITION_RULES,
  LEGAL_EFFECTIVE_DATE,
  LEGAL_VERSION,
  PRIVACY_SECTIONS,
  SECURITY_WARNING,
  TERMS_SECTIONS,
} from '../content/legalContent';

function PolicyModal({ show, onHide, title, sections }) {
  return (
    <Modal show={show} onHide={onHide} centered size="lg" scrollable>
      <Modal.Header closeButton>
        <div>
          <Modal.Title>{title}</Modal.Title>
          <div className="small text-muted">Version {LEGAL_VERSION} · Effective {LEGAL_EFFECTIVE_DATE}</div>
        </div>
      </Modal.Header>
      <Modal.Body className="legal-modal-body">
        {sections.map((section) => (
          <section key={section.heading} className="mb-4">
            <h3 className="h6 mb-2">{section.heading}</h3>
            {section.paragraphs.map((paragraph, index) => <p className="text-muted" key={`${section.heading}-${index}`}>{paragraph}</p>)}
          </section>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="dark" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default function RegistrationConsentFields({ values, onChange }) {
  const [modal, setModal] = useState(null);
  const update = (name) => (event) => onChange(name, event.target.checked);

  return (
    <div className="registration-consents">
      <Alert variant="warning" className="small">
        <strong>Account security:</strong> {SECURITY_WARNING}
      </Alert>
      <Form.Check
        id="ageConfirmed"
        type="checkbox"
        required
        checked={Boolean(values.ageConfirmed)}
        onChange={update('ageConfirmed')}
        label={<span>I confirm that I am at least 18 years old and the information I provided is accurate <span className="text-danger">*</span></span>}
      />
      <Form.Check
        id="termsAccepted"
        type="checkbox"
        required
        checked={Boolean(values.termsAccepted)}
        onChange={update('termsAccepted')}
        label={(
          <span>
            I have read and agree to the{' '}
            <Button variant="link" className="p-0 align-baseline" onClick={(event) => { event.preventDefault(); setModal('terms'); }}>
              Terms and Conditions
            </Button>{' '}
            <span className="text-danger">*</span>
          </span>
        )}
      />
      <Form.Check
        id="privacyAccepted"
        type="checkbox"
        required
        checked={Boolean(values.privacyAccepted)}
        onChange={update('privacyAccepted')}
        label={(
          <span>
            I have read and agree to the{' '}
            <Button variant="link" className="p-0 align-baseline" onClick={(event) => { event.preventDefault(); setModal('privacy'); }}>
              Privacy Policy
            </Button>{' '}
            <span className="text-danger">*</span>
          </span>
        )}
      />
      <Form.Check
        id="rulesAccepted"
        type="checkbox"
        required
        checked={Boolean(values.rulesAccepted)}
        onChange={update('rulesAccepted')}
        label={(
          <span>
            I accept the{' '}
            <Button variant="link" className="p-0 align-baseline" onClick={(event) => { event.preventDefault(); setModal('rules'); }}>
              Competition Rules and management review process
            </Button>{' '}
            <span className="text-danger">*</span>
          </span>
        )}
      />
      <Form.Check
        id="securityAcknowledged"
        type="checkbox"
        required
        checked={Boolean(values.securityAcknowledged)}
        onChange={update('securityAcknowledged')}
        label={<span>I understand that Supreme will never ask me by SMS, WhatsApp, email or telephone for an OTP, password, PIN, CVC or direct transfer of funds <span className="text-danger">*</span></span>}
      />
      <p className="small text-muted mt-3 mb-0">By creating an account, you electronically accept version {LEGAL_VERSION} of the Terms, Privacy Policy and Competition Rules.</p>
      <PolicyModal show={modal === 'terms'} onHide={() => setModal(null)} title="Terms and Conditions" sections={TERMS_SECTIONS} />
      <PolicyModal show={modal === 'privacy'} onHide={() => setModal(null)} title="Privacy Policy" sections={PRIVACY_SECTIONS} />
      <PolicyModal show={modal === 'rules'} onHide={() => setModal(null)} title="Competition Rules" sections={COMPETITION_RULES} />
    </div>
  );
}
