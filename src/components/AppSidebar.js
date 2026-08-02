import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Compass,
  Crown,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
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
  ['/app/leagues/supreme', 'Supreme Leagues', Crown],
  ['/app/leagues/discover', 'Discover', Compass],
  ['/app/leagues/join', 'Join with Code', KeyRound],
  ['/app/leagues/create', 'Create League', PlusCircle],
  ['/app/team', 'My Team', Users],
  ['/app/wallet', 'Wallet', WalletCards],
  ['/app/profile', 'Profile', UserRound],
  ['/app/subscription', 'Subscription', Crown],
  ['/app/support', 'Support', LifeBuoy],
];

export default function AppSidebar() {
  const { logout } = useAuth();

  return (
    <aside className="app-sidebar">
      <div className="d-flex align-items-center gap-2 px-2 mb-4">
        <span className="sfl-brand-mark">S</span>
        <div className="sfl-brand lh-sm">Supreme<br />Fantasy League</div>
      </div>

      <Nav className="flex-column gap-1">
        {items.map(([to, label, Icon]) => (
          <Nav.Link key={to} as={NavLink} to={to}>
            <Icon size={18} />{label}
          </Nav.Link>
        ))}
      </Nav>

      <div className="mt-4 pt-3 border-top border-secondary">
        <button className="btn btn-link nav-link text-start w-100" onClick={logout}>
          <LogOut size={18} />Log Out
        </button>
      </div>
    </aside>
  );
}
