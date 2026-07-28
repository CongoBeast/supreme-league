import React from 'react';
import { Button, Container, Nav, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function PublicNavbar() {
  return <Navbar expand="lg" sticky="top" className="public-nav"><Container><Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2"><span className="sfl-brand-mark">S</span><span className="sfl-brand">Supreme Fantasy League</span></Navbar.Brand><Navbar.Toggle aria-controls="public-nav" /><Navbar.Collapse id="public-nav"><Nav className="ms-auto align-items-lg-center gap-lg-2"><Nav.Link as={Link} to="/about">About</Nav.Link><Nav.Link href="/#competitions">Competitions</Nav.Link><Nav.Link href="/#plans">Plans</Nav.Link><Nav.Link href="/#how-it-works">How It Works</Nav.Link><Nav.Link as={Link} to="/contact">Contact</Nav.Link><Nav.Link as={Link} to="/login">Login</Nav.Link><Button as="a" href="/#waitlist" variant="primary" className="ms-lg-2">Join Waitlist</Button></Nav></Navbar.Collapse></Container></Navbar>;
}
