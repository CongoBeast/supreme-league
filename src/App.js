import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';

import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';

import LandingPage from './pages/LandingPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import {
  AboutPage,
  ContactPage,
  CompetitionRulesPage,
  PrivacyPage,
  TermsPage,
} from './pages/PublicInfoPages';
import DashboardPage from './pages/DashboardPage';
import {
  CreateLeaguePage,
  DiscoverLeaguesPage,
  LeagueDetailsPage,
  JoinLeagueByCodePage,
  MyLeaguesPage,
} from './pages/LeaguePages';
import TeamPage from './pages/TeamPage';
import WalletPage from './pages/WalletPage';
import ProfilePage from './pages/ProfilePage';
import SubscriptionPage from './pages/SubscriptionPage';
import SupportPage from './pages/SupportPage';
import LeaderboardsPage from './pages/LeaderboardsPage';

import { adminRouteElements } from './admin/AdminRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public website */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/competition-rules" element={<CompetitionRulesPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* Public-only authentication pages */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Authenticated user application */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/app/dashboard" element={<DashboardPage />} />
              <Route path="/app/leaderboards" element={<LeaderboardsPage />} />
              <Route path="/app/leagues" element={<MyLeaguesPage />} />
              <Route
                path="/app/leagues/discover"
                element={<DiscoverLeaguesPage />}
              />
              <Route
                path="/app/leagues/create"
                element={<CreateLeaguePage />}
              />
              <Route
                path="/app/leagues/join"
                element={<JoinLeagueByCodePage />}
              />
              <Route
                path="/app/leagues/:leagueId"
                element={<LeagueDetailsPage />}
              />
              <Route path="/app/team" element={<TeamPage />} />
              <Route path="/app/wallet" element={<WalletPage />} />
              <Route path="/app/profile" element={<ProfilePage />} />
              <Route
                path="/app/subscription"
                element={<SubscriptionPage />}
              />
              <Route path="/app/support" element={<SupportPage />} />
            </Route>
          </Route>

          {/* Hidden admin application. Access is enforced by backend roles. */}
          {adminRouteElements}

          {/* Unknown public/user routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
