import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

const TERMS_SECTIONS = [
  ['Eligibility', 'You must be at least 18 years old and provide accurate account information.'],
  ['Competition rules', 'Every competition is governed by its published dates, scoring basis, eligibility conditions, tie-breaks and result-review process.'],
  ['Payments and wallets', 'Entry fees, subscriptions, prizes, refunds and adjustments are recorded in USD. Real-money functionality remains subject to provider, legal and operational approval.'],
  ['Fair prize splits', 'When a Supreme-operated competition ends in a tie for the highest score, the published prize is split fairly among all tied winners.'],
  ['Account conduct', 'You may not create duplicate accounts, link a fantasy team that belongs to another person, manipulate payments or interfere with standings.'],
  ['Prototype notice', 'This product copy requires professional legal review before a commercial launch.'],
];

const PRIVACY_SECTIONS = [
  ['Information collected', 'We process account details, contact information, linked fantasy manager IDs, competition activity, wallet records, transactions and support communications.'],
  ['How information is used', 'Information is used to operate accounts, competitions, payments, security checks, customer support and requested notifications.'],
  ['Data sharing', 'Data may be shared with infrastructure, email and payment providers only where needed to provide the service, investigate issues or meet legal obligations.'],
  ['Sensitive information', 'Do not send passwords, OTPs, wallet PINs, CVVs or full card numbers through profile fields, support tickets or email.'],
  ['Retention and rights', 'Financial and audit records may need to be retained. Other account information should be managed according to the final approved privacy policy and applicable law.'],
  ['Review notice', 'This prototype privacy wording requires professional legal review before production use.'],
];

function PolicyModal({ show, onHide, title, sections }) {
  return (
    <Modal show={show} onHide={onHide} centered size="lg" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {sections.map(([heading, text]) => (
          <section key={heading} className="mb-4">
            <h3 className="h6 mb-2">{heading}</h3>
            <p className="text-muted mb-0">{text}</p>
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
      <Form.Check
        id="ageConfirmed"
        type="checkbox"
        required
        checked={Boolean(values.ageConfirmed)}
        onChange={update('ageConfirmed')}
        label={<span>I confirm that I am at least 18 years old <span className="text-danger">*</span></span>}
      />
      <Form.Check
        id="termsAccepted"
        type="checkbox"
        required
        checked={Boolean(values.termsAccepted)}
        onChange={update('termsAccepted')}
        label={(
          <span>
            I accept the{' '}
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
            I accept the{' '}
            <Button variant="link" className="p-0 align-baseline" onClick={(event) => { event.preventDefault(); setModal('privacy'); }}>
              Privacy Policy
            </Button>{' '}
            <span className="text-danger">*</span>
          </span>
        )}
      />
      <PolicyModal show={modal === 'terms'} onHide={() => setModal(null)} title="Terms and Conditions" sections={TERMS_SECTIONS} />
      <PolicyModal show={modal === 'privacy'} onHide={() => setModal(null)} title="Privacy Policy" sections={PRIVACY_SECTIONS} />
    </div>
  );
}
