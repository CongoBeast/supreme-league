import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import LegalAcceptanceModal from './LegalAcceptanceModal';

export default function AppLayout() {
  const { user } = useAuth();
  return (
    <div className="app-shell">
      <AppSidebar />
      <main className="app-main">
        <AppHeader />
        <div className="app-content">
          {user?.legalAcceptanceRequired ? (
            <div className="surface-card p-5 text-center">
              <h1 className="h3">Legal acceptance required</h1>
              <p className="muted mb-0">Review the current documents in the secure acknowledgement window to continue.</p>
            </div>
          ) : <Outlet />}
        </div>
      </main>
      <LegalAcceptanceModal />
    </div>
  );
}
