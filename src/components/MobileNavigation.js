import React, { useEffect, useState } from 'react';
import { Offcanvas } from 'react-bootstrap';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  ChevronRight,
  Compass,
  Crown,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Plus,
  PlusCircle,
  Sparkles,
  Trophy,
  UserRound,
  Users,
  WalletCards,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProfileAvatar from './ProfileAvatar';
import './mobile-navigation.css';

const navigationSections = [
  {
    label: 'Overview',
    items: [
      ['/app/dashboard', 'Dashboard', 'Your competition overview', LayoutDashboard],
      ['/app/leaderboards', 'Leaderboards', 'Rankings, wins and earnings', BarChart3],
    ],
  },
  {
    label: 'Leagues',
    items: [
      ['/app/leagues', 'My Leagues', 'Active and past competitions', Trophy],
      ['/app/leagues/supreme', 'Supreme Leagues', 'Subscription competitions and outcomes', Crown],
      ['/app/leagues/discover', 'Discover', 'Browse open competitions', Compass],
      ['/app/leagues/join', 'Join with Code', 'Enter a private league code', KeyRound],
      ['/app/leagues/create', 'Create League', 'Start a new competition', PlusCircle],
    ],
  },
  {
    label: 'My Account',
    items: [
      ['/app/team', 'My Team', 'FPL squad and gameweek points', Users],
      ['/app/wallet', 'Wallet', 'Balance and transactions', WalletCards],
      ['/app/profile', 'Profile', 'Personal and FPL details', UserRound],
      ['/app/subscription', 'Subscription', 'Plans and membership status', Crown],
      ['/app/support', 'Support', 'Get help with your account', LifeBuoy],
    ],
  },
];

export default function MobileNavigation() {
  const [show, setShow] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    setShow(false);
  }, [location.pathname]);

  const closeNavigation = () => setShow(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();
      closeNavigation();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="mobile-nav-trigger d-lg-none"
        onClick={() => setShow(true)}
        aria-label="Open application navigation"
        aria-expanded={show}
      >
        <span className="mobile-nav-trigger__icon">
          <Menu size={20} strokeWidth={2.4} />
        </span>
        <span className="mobile-nav-trigger__label d-none d-sm-inline">Menu</span>
      </button>

      <Offcanvas
        show={show}
        onHide={closeNavigation}
        placement="start"
        scroll={false}
        backdrop
        keyboard
        className="sfl-mobile-drawer d-lg-none"
        aria-labelledby="sfl-mobile-navigation-title"
      >
        <div className="mobile-drawer-hero">
          <div className="mobile-drawer-hero__glow" aria-hidden="true" />

          <div className="mobile-drawer-topline">
            <div className="mobile-drawer-brand">
              <span className="mobile-drawer-brand__mark">S</span>
              <div>
                <div id="sfl-mobile-navigation-title" className="mobile-drawer-brand__name">
                  Supreme Fantasy League
                </div>
                <div className="mobile-drawer-brand__tagline">Play. Compete. Win.</div>
              </div>
            </div>

            <button
              type="button"
              className="mobile-drawer-close"
              onClick={closeNavigation}
              aria-label="Close application navigation"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mobile-profile-card">
            <ProfileAvatar
              src={user?.profilePicture}
              name={user?.fullName || 'Supreme member'}
              className="mobile-profile-card__avatar"
            />

            <div className="mobile-profile-card__identity">
              <div className="mobile-profile-card__name">
                {user?.fullName || 'Supreme member'}
              </div>
              <div className="mobile-profile-card__email">
                {user?.email || 'Signed-in account'}
              </div>
            </div>

            <NavLink
              to="/app/profile"
              className="mobile-profile-card__action"
              onClick={closeNavigation}
              aria-label="Open profile"
            >
              <ChevronRight size={18} />
            </NavLink>
          </div>

          <div className="mobile-quick-actions">
            <NavLink
              to="/app/leagues/create"
              className="mobile-quick-action mobile-quick-action--primary"
              onClick={closeNavigation}
            >
              <Plus size={18} />
              Create league
            </NavLink>

            <NavLink
              to="/app/leagues/join"
              className="mobile-quick-action mobile-quick-action--secondary"
              onClick={closeNavigation}
            >
              <KeyRound size={17} />
              Join code
            </NavLink>
          </div>
        </div>

        <Offcanvas.Body className="mobile-drawer-body">
          <nav className="mobile-drawer-navigation" aria-label="Application navigation">
            {navigationSections.map((section) => (
              <section className="mobile-nav-section" key={section.label}>
                <div className="mobile-nav-section__label">{section.label}</div>

                <div className="mobile-nav-section__links">
                  {section.items.map(([to, label, description, Icon]) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={closeNavigation}
                      className={({ isActive }) =>
                        `mobile-nav-link${isActive ? ' mobile-nav-link--active' : ''}`
                      }
                    >
                      <span className="mobile-nav-link__icon">
                        <Icon size={19} strokeWidth={2.15} />
                      </span>

                      <span className="mobile-nav-link__content">
                        <span className="mobile-nav-link__title">{label}</span>
                        <span className="mobile-nav-link__description">{description}</span>
                      </span>

                      <ChevronRight className="mobile-nav-link__chevron" size={17} />
                    </NavLink>
                  ))}
                </div>
              </section>
            ))}
          </nav>

          <div className="mobile-drawer-footer">
            <div className="mobile-drawer-footer__message">
              <span className="mobile-drawer-footer__icon">
                <Sparkles size={17} />
              </span>
              <div>
                <div className="mobile-drawer-footer__title">Supreme member area</div>
                <div className="mobile-drawer-footer__copy">
                  Your leagues, wallet and FPL activity in one place.
                </div>
              </div>
            </div>

            <button
              type="button"
              className="mobile-logout-button"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut size={18} />
              {loggingOut ? 'Logging out…' : 'Log out'}
            </button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
