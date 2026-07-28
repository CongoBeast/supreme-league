import { Navigate, Route } from 'react-router-dom';

import './admin.css';
import AdminShell from './components/AdminShell';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminSignupPage from './pages/AdminSignupPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLeaguesPage from './pages/AdminLeaguesPage';
import AdminLeagueDetailPage from './pages/AdminLeagueDetailPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminUserDetailPage from './pages/AdminUserDetailPage';
import AdminFinancesPage from './pages/AdminFinancesPage';
import AdminTicketsPage from './pages/AdminTicketsPage';
import AdminTicketDetailPage from './pages/AdminTicketDetailPage';

export const adminRouteElements = (
  <>
    <Route path="/admin/login" element={<AdminLoginPage />} />
    <Route path="/admin/enrol" element={<AdminSignupPage />} />

    <Route path="/admin" element={<AdminShell />}>
      <Route index element={<AdminDashboardPage />} />
      <Route path="leagues" element={<AdminLeaguesPage />} />
      <Route path="leagues/:id" element={<AdminLeagueDetailPage />} />
      <Route path="users" element={<AdminUsersPage />} />
      <Route path="users/:id" element={<AdminUserDetailPage />} />
      <Route path="finances" element={<AdminFinancesPage />} />
      <Route path="tickets" element={<AdminTicketsPage />} />
      <Route path="tickets/:id" element={<AdminTicketDetailPage />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Route>
  </>
);
