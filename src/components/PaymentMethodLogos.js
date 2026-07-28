import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { WalletCards } from 'lucide-react';

const paymentMethods = [
  { key: 'ecocash', label: 'EcoCash', src: '/images/payments/ecocash.png' },
  { key: 'onemoney', label: 'OneMoney', src: '/images/payments/onemoney.png' },
  { key: 'innbucks', label: 'InnBucks', src: '/images/payments/innbucks.png' },
  { key: 'omari', label: "O'mari", src: '/images/payments/omari.png' },
];

function PaymentLogo({ method }) {
  const [imageAvailable, setImageAvailable] = useState(true);

  return (
    <div className="soft-card p-3 text-center h-100 d-flex flex-column align-items-center justify-content-center">
      {imageAvailable ? (
        <img
          src={method.src}
          alt={`${method.label} logo`}
          loading="lazy"
          onError={() => setImageAvailable(false)}
          style={{ width: '100%', maxWidth: 130, height: 48, objectFit: 'contain' }}
        />
      ) : (
        <WalletCards size={30} aria-hidden="true" />
      )}
      <div className="fw-semibold small mt-2">{method.label}</div>
    </div>
  );
}

export default function PaymentMethodLogos() {
  return (
    <Row className="g-3">
      {paymentMethods.map((method) => (
        <Col xs={6} md={3} key={method.key}>
          <PaymentLogo method={method} />
        </Col>
      ))}
    </Row>
  );
}
