import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.auth.me()
        .then((userData) => {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password) => {
    const res = await api.auth.login(username, password);
    setToken(res.access);
    setUser(res.user);
    localStorage.setItem('token', res.access);
    localStorage.setItem('user', JSON.stringify(res.user));
    return res.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Helper to quickly demonstrate the 3 stakeholder roles during Capstone Reviews
  const switchDemoAccount = async (roleName) => {
    let creds = { username: 'admin', password: 'Admin@123' };
    if (roleName === 'RESIDENT') {
      creds = { username: 'resident_arun', password: 'Resident@123' };
    } else if (roleName === 'STAFF') {
      creds = { username: 'guard_ramesh', password: 'Staff@123' };
    }
    return await login(creds.username, creds.password);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      switchDemoAccount,
      isAuthenticated: !!token,
      isAdmin: user?.role === 'ADMIN',
      isStaff: user?.role === 'STAFF' || user?.role === 'ADMIN',
      isResident: user?.role === 'RESIDENT',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
