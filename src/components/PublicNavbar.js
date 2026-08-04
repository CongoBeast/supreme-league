import React from 'react';
import { Button, Container, Nav, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function PublicNavbar() {
  return (
    <Navbar expand="lg" sticky="top" className="public-nav">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <span className="sfl-brand-mark">S</span>
          <span className="sfl-brand">Supreme Fantasy League</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="public-nav" />
        <Navbar.Collapse id="public-nav">
          <Nav className="ms-auto align-items-lg-center gap-lg-2">
            <Nav.Link href="/#why-supreme">Why Supreme</Nav.Link>
            <Nav.Link href="/#prizes">Prizes</Nav.Link>
            <Nav.Link href="/#prize-roadmap">Prize Roadmap</Nav.Link>
            <Nav.Link href="/#competitions">Competitions</Nav.Link>
            <Nav.Link href="/#rules">Rules</Nav.Link>
            <Nav.Link href="/#referrals">Refer & Earn</Nav.Link>
            <Nav.Link href="/#plans">Plans</Nav.Link>
            <Nav.Link as={Link} to="/login">Login</Nav.Link>
            <Button as={Link} to="/register" variant="primary" className="ms-lg-2">Join Now</Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
