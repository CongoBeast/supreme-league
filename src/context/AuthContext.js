import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionMessage, setSessionMessage] = useState('');

  const refreshUser = useCallback(async () => {
    try {
      const data = await api('/api/auth/me');
      setUser(data.user);
      return data.user;
    } catch (error) {
      if (error.status !== 401) console.error(error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      setSessionMessage('Your session expired. Please log in again.');
    };
    window.addEventListener('sfl:session-expired', handleExpired);
    return () => window.removeEventListener('sfl:session-expired', handleExpired);
  }, []);

  const login = async (credentials) => {
    const data = await api('/api/auth/login', { method: 'POST', body: credentials });
    setUser(data.user);
    setSessionMessage('');
    return data.user;
  };

  const register = async (values) => {
    const data = await api('/api/auth/register', { method: 'POST', body: values });
    setUser(data.user);
    setSessionMessage('');
    return data.user;
  };

  const logout = async () => {
    try { await api('/api/auth/logout', { method: 'POST' }); } finally { setUser(null); }
  };

  const value = useMemo(() => ({ user, setUser, loading, login, register, logout, refreshUser, sessionMessage, setSessionMessage }), [user, loading, refreshUser, sessionMessage]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
