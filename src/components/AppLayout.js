import React from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';

export default function AppLayout() {
  return <div className="app-shell"><AppSidebar /><main className="app-main"><AppHeader /><div className="app-content"><Outlet /></div></main></div>;
}
