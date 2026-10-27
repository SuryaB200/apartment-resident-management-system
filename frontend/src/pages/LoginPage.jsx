import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials against the database.');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Decorative architectural background accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-surface-container rounded-full blur-3xl opacity-60 pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-surface-container-high rounded-full blur-3xl opacity-60 pointer-events-none"></div>

      {/* Institutional Capstone Top Header */}
      <div className="mb-6 text-center max-w-lg relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-lowest border border-outline-variant/30 text-xs font-semibold text-on-surface shadow-xs mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>SRM Institute of Science and Technology • Tiruchirappalli</span>
          <span className="text-outline-variant">|</span>
          <span className="text-secondary font-mono">B.Tech AI (2024–2028)</span>
        </div>
        <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">
          Tenancy OS • CivicQuarters
        </h1>
        <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
          Residential Property Management System with Strict 3NF Relational Normalization &amp; ACID Transactional Controls
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-7 shadow-sm relative z-10">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-5 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold shadow-xs">
              <span className="material-symbols-outlined text-[22px]">apartment</span>
            </div>
            <div>
              <h2 className="font-bold text-base text-on-surface leading-tight">CivicQuarters Portal</h2>
              <p className="text-xs text-on-surface-variant">Sign in to access property management ledger</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-surface-container text-secondary text-[10px] font-mono font-semibold border border-outline-variant/20">
            3NF Strict
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 bg-error-container/40 border border-error/20 rounded-xl text-xs text-error flex items-start gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
            <div className="flex-1">{error}</div>
            <button
              onClick={() => setError(null)}
              className="text-error hover:opacity-80 material-symbols-outlined text-[14px]"
            >
              close
            </button>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
              Username or Stakeholder ID
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-secondary text-[18px]">
                badge
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-xs bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition shadow-2xs"
                placeholder="e.g. admin or resident_arun"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-secondary text-[18px]">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 pl-9 pr-9 text-xs bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition shadow-2xs"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="material-symbols-outlined absolute right-3 text-secondary text-[18px] hover:text-on-surface transition cursor-pointer"
              >
                {showPassword ? 'visibility_off' : 'visibility'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-primary hover:bg-inverse-surface text-on-primary text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Authenticating with SQL Database...</span>
              </span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">lock_open</span>
                <span>Sign In to System</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Stakeholder Selector */}
        <div className="mt-6 pt-5 border-t border-outline-variant/20">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
              Instant Capstone Demo Accounts
            </span>
            <span className="text-[10px] text-secondary font-medium">Click to populate</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickFill('admin', 'Admin@123')}
              className={`p-2.5 text-left rounded-xl border transition cursor-pointer ${
                username === 'admin'
                  ? 'bg-surface-container-high border-primary text-primary'
                  : 'bg-surface-container-low border-outline-variant/30 hover:bg-surface-container text-on-surface'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
                <span className="text-xs font-bold">Admin</span>
              </div>
              <div className="text-[10px] text-secondary mt-0.5 truncate">Full Society Control</div>
            </button>

            <button
              type="button"
              onClick={() => quickFill('resident_arun', 'Resident@123')}
              className={`p-2.5 text-left rounded-xl border transition cursor-pointer ${
                username === 'resident_arun'
                  ? 'bg-surface-container-high border-primary text-primary'
                  : 'bg-surface-container-low border-outline-variant/30 hover:bg-surface-container text-on-surface'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">person</span>
                <span className="text-xs font-bold">Resident</span>
              </div>
              <div className="text-[10px] text-secondary mt-0.5 truncate">Dues &amp; Gate Passes</div>
            </button>

            <button
              type="button"
              onClick={() => quickFill('guard_ramesh', 'Staff@123')}
              className={`p-2.5 text-left rounded-xl border transition cursor-pointer ${
                username === 'guard_ramesh'
                  ? 'bg-surface-container-high border-primary text-primary'
                  : 'bg-surface-container-low border-outline-variant/30 hover:bg-surface-container text-on-surface'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">shield_person</span>
                <span className="text-xs font-bold">Gate Guard</span>
              </div>
              <div className="text-[10px] text-secondary mt-0.5 truncate">Visitor Check-In</div>
            </button>
          </div>
        </div>
      </div>

      {/* Security & Architecture Metadata */}
      <div className="mt-5 text-center text-xs text-secondary flex flex-wrap items-center justify-center gap-3 relative z-10">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px] text-primary">verified</span>
          <span>3NF Normalization</span>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px] text-primary">key</span>
          <span>JWT Access Tokens</span>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px] text-primary">lock</span>
          <span>ACID Serializability</span>
        </span>
      </div>
    </div>
  );
}
