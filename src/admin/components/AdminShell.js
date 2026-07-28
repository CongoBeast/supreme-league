import { useEffect, useMemo, useState } from 'react';
import { Button, Offcanvas } from 'react-bootstrap';
import {
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  ShieldCheck,
  Trophy,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { api } from '../../services/api';
import { adminApi } from '../adminApi';
import { AdminError, AdminLoading } from './AdminDataState';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/leagues', label: 'Leagues', icon: Trophy },
  { to: '/admin/users', label: 'Users', icon: UsersRound },
  { to: '/admin/finances', label: 'Finances', icon: WalletCards },
  { to: '/admin/tickets', label: 'Support tickets', icon: LifeBuoy },
];

function SidebarContent({ admin, onNavigate, onLogout, loggingOut }) {
  const initials = String(admin?.fullName || admin?.email || 'A')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="admin-sidebar-inner">
      <div className="admin-brand">
        <span className="admin-brand-mark">
          <ShieldCheck size={24} />
        </span>
        <div>
          <div className="admin-brand-name">Supreme Admin</div>
          <div className="admin-brand-caption">Operations portal</div>
        </div>
      </div>

      <nav className="admin-sidebar-nav" aria-label="Administrator navigation">
        <div className="admin-nav-label">Management</div>
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `admin-nav-link${isActive ? ' admin-nav-link-active' : ''}`
            }
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="admin-profile-chip">
          <span className="admin-avatar">{initials}</span>
          <div className="admin-profile-copy">
            <strong>{admin?.fullName || 'Administrator'}</strong>
            <span>{admin?.email}</span>
          </div>
        </div>
        <Button
          type="button"
          variant="link"
          className="admin-logout-button"
          onClick={onLogout}
          disabled={loggingOut}
        >
          <LogOut size={18} />
          {loggingOut ? 'Signing out…' : 'Sign out'}
        </Button>
      </div>
    </div>
  );
}

export default function AdminShell() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentSection = useMemo(() => {
    const match = links
      .slice()
      .reverse()
      .find((item) =>
        item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
      );
    return match?.label || 'Administration';
  }, [location.pathname]);

  const loadSession = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await adminApi('/session');
      setAdmin(data.admin);
    } catch (requestError) {
      if (requestError.status === 401 || requestError.status === 403) {
        navigate('/admin/login', { replace: true });
        return;
      }
      setError(requestError.message || 'The administrator session could not be verified.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const logout = async () => {
    setLoggingOut(true);
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch {
      // The local session should still be cleared from the UI when logout fails.
    } finally {
      navigate('/admin/login', { replace: true });
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-session-state">
        <AdminLoading
          message="Opening the administration portal…"
          detail="Your administrator session is being verified."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-session-state">
        <AdminError message={error} onRetry={loadSession} />
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar d-none d-lg-flex">
        <SidebarContent
          admin={admin}
          onLogout={logout}
          loggingOut={loggingOut}
        />
      </aside>

      <Offcanvas
        show={mobileOpen}
        onHide={() => setMobileOpen(false)}
        placement="start"
        className="admin-mobile-sidebar"
      >
        <Offcanvas.Body className="p-0">
          <SidebarContent
            admin={admin}
            onNavigate={() => setMobileOpen(false)}
            onLogout={logout}
            loggingOut={loggingOut}
          />
        </Offcanvas.Body>
      </Offcanvas>

      <main className="admin-main">
        <header className="admin-mobile-header">
          <Button
            type="button"
            variant="light"
            className="admin-menu-button d-lg-none"
            onClick={() => setMobileOpen(true)}
            aria-label="Open administrator navigation"
          >
            <Menu size={21} />
          </Button>
          <div>
            <div className="admin-mobile-section">{currentSection}</div>
            <div className="admin-mobile-context">Supreme Fantasy League</div>
          </div>
          <span className="admin-mobile-avatar d-lg-none">
            {String(admin?.fullName || 'A').charAt(0).toUpperCase()}
          </span>
        </header>

        <div className="admin-content">
          <Outlet context={{ admin }} />
        </div>
      </main>
    </div>
  );
}
