'use client';

// lib/auth-context.js
// ------------------------------------------------------------
// Provides current-user state across the app. On mount, calls
// GET /api/auth/me (which reads the httpOnly JWT cookie) to
// determine if the user is logged in. Exposes login/signup/
// logout helpers that update this state.
// ------------------------------------------------------------

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, ApiError } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user } = await api.get('/auth/me');
      setUser(user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (identifier, password) => {
    const { user } = await api.post('/auth/login', { identifier, password });
    setUser(user);
    return user;
  };

  const signup = async (username, email, password) => {
    const { user, message } = await api.post('/auth/signup', { username, email, password });
    setUser(user);
    return { user, message };
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { ApiError };
