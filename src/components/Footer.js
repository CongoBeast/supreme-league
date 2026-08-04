import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-black text-white py-5">
      <Container>
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="sfl-brand h4">Supreme Fantasy League</div>
            <p className="text-white-50 mb-2">A skill-based fantasy-management competition platform operated by Vista Novum Private Limited.</p>
            <p className="text-white-50 small mb-0">Independent of and not affiliated with, endorsed by or operated by the Premier League or the official fantasy game.</p>
          </div>
          <div className="col-lg-6 d-flex flex-wrap gap-3 justify-content-lg-end align-items-start">
            <Link to="/about">About</Link>
            <Link to="/competition-rules">Competition Rules</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
        <div className="footer-security-note mt-4 pt-4 border-top border-secondary">
          Supreme will never contact you by SMS, WhatsApp, email or telephone to request an OTP, password, PIN, CVC or a direct transfer of funds. Initiate payments only inside the official platform.
        </div>
      </Container>
    </footer>
  );
}
