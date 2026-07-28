import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Footer() {
  return <footer className="bg-black text-white py-5"><Container><div className="row g-4"><div className="col-lg-6"><div className="sfl-brand h4">Supreme Fantasy League</div><p className="text-white-50 mb-0">A prototype skill-based fantasy-management competition platform. Not affiliated with the Premier League or its fantasy game. Final legal wording requires professional review.</p></div><div className="col-lg-6 d-flex flex-wrap gap-3 justify-content-lg-end align-items-start"><Link to="/competition-rules">Competition Rules</Link><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link><Link to="/contact">Contact</Link></div></div></Container></footer>;
}
