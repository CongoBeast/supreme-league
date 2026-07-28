import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MobileNavigation from './MobileNavigation';
import ProfileAvatar from './ProfileAvatar';

export default function AppHeader() {
  const { user } = useAuth();
  return <header className="app-header"><div className="d-flex align-items-center justify-content-between gap-3"><div className="d-flex align-items-center gap-3"><MobileNavigation /><div><div className="small muted">Supreme Fantasy League</div><div className="fw-bold">Compete with clarity</div></div></div><Link to="/app/profile" className="text-decoration-none d-flex align-items-center gap-2"><div className="text-end d-none d-sm-block"><div className="fw-semibold small">{user?.fullName}</div><div className="muted" style={{fontSize:12}}>USD account</div></div><ProfileAvatar src={user?.profilePicture} name={user?.fullName} /></Link></div></header>;
}
