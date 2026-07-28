import React from 'react';
import { Button, Nav, Offcanvas } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Compass,
  Crown,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  PlusCircle,
  Trophy,
  UserRound,
  Users,
  WalletCards,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const items = [
  ['/app/dashboard', 'Dashboard', LayoutDashboard],
  ['/app/leaderboards', 'Leaderboards', BarChart3],
  ['/app/leagues', 'My Leagues', Trophy],
  ['/app/leagues/discover', 'Discover', Compass],
  ['/app/leagues/join', 'Join with Code', KeyRound],
  ['/app/leagues/create', 'Create League', PlusCircle],
  ['/app/team', 'My Team', Users],
  ['/app/wallet', 'Wallet', WalletCards],
  ['/app/profile', 'Profile', UserRound],
  ['/app/subscription', 'Subscription', Crown],
  ['/app/support', 'Support', LifeBuoy],
];

export default function MobileNavigation() {
  const [show, setShow] = React.useState(false);
  const { logout } = useAuth();

  return (
    <>
      <Button
        variant="dark"
        className="d-lg-none"
        onClick={() => setShow(true)}
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </Button>

      <Offcanvas show={show} onHide={() => setShow(false)}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="sfl-brand">Supreme Fantasy League</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column gap-1">
            {items.map(([to, label, Icon]) => (
              <Nav.Link
                key={to}
                as={NavLink}
                to={to}
                onClick={() => setShow(false)}
                className="d-flex align-items-center gap-2 py-3"
              >
                <Icon size={18} />{label}
              </Nav.Link>
            ))}
            <button
              className="btn btn-link nav-link text-start d-flex align-items-center gap-2 py-3"
              onClick={logout}
            >
              <LogOut size={18} />Log Out
            </button>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
