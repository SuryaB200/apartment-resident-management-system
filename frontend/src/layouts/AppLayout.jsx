import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const { user, logout, switchDemoAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [switching, setSwitching] = useState(false);
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  const handleRoleSwitch = async (role) => {
    setSwitching(true);
    try {
      await switchDemoAccount(role);
      navigate('/dashboard');
    } catch (e) {
      alert('Error switching role: ' + e.message);
    } finally {
      setSwitching(false);
      setProfileDrawerOpen(false);
      setMoreDrawerOpen(false);
    }
  };

  const navItems = [
    {
      category: 'Main',
      links: [
        { path: '/dashboard', label: 'Dashboard', icon: 'grid_view' },
        { path: '/flats-buildings', label: 'Flats & Buildings', icon: 'apartment', roles: ['ADMIN', 'STAFF'] },
        { path: '/residents', label: 'Residents', icon: 'group', roles: ['ADMIN', 'STAFF'] },
        { path: '/occupancy-history', label: 'Occupancy History', icon: 'history_toggle_off' },
      ]
    },
    {
      category: 'Operations & Finance',
      links: [
        { path: '/maintenance-billing', label: 'Maintenance Billing', icon: 'receipt_long' },
        { path: '/payments-receipts', label: 'Payments & Ledgers', icon: 'account_balance_wallet' },
        { path: '/outstanding-dues', label: 'Outstanding Dues', icon: 'money_off', roles: ['ADMIN', 'STAFF'] },
        { path: '/service-tickets', label: 'Service Tickets (SLA)', icon: 'confirmation_number' },
        { path: '/visitors-gate-logs', label: 'Visitors & Gate Logs', icon: 'badge' },
      ]
    },
    {
      category: 'Facilities',
      links: [
        { path: '/amenities-bookings', label: 'Amenities & Bookings', icon: 'pool' },
        { path: '/parking-management', label: 'Parking Allocations', icon: 'local_parking' },
        { path: '/staff-management', label: 'Staff Management', icon: 'engineering', roles: ['ADMIN'] },
      ]
    },
    {
      category: 'System & Audit',
      links: [
        { path: '/reports', label: 'Reports & Analytics', icon: 'terminal', roles: ['ADMIN', 'STAFF'] },
        { path: '/audit-logs', label: 'Audit Logs (SHA256)', icon: 'verified_user', roles: ['ADMIN'] },
        { path: '/user-management', label: 'User RBAC Matrix', icon: 'manage_accounts', roles: ['ADMIN'] },
        { path: '/settings', label: 'Settings', icon: 'tune', roles: ['ADMIN'] },
        { path: '/project-overview', label: 'Project Overview (SRM)', icon: 'school' },
      ]
    }
  ];

  // Mobile Bottom Tab items
  const mobileTabs = [
    { path: '/dashboard', label: 'Dashboard', icon: 'grid_view' },
    { path: '/flats-buildings', label: 'Flats', icon: 'apartment' },
    { path: '/maintenance-billing', label: 'Billing', icon: 'receipt_long' },
    { path: '/service-tickets', label: 'Tickets', icon: 'confirmation_number' },
  ];

  return (
    <div className="min-h-screen bg-surface font-body-md text-body-md text-on-surface antialiased flex flex-col selection:bg-primary-container selection:text-on-primary">
      {/* 1. Academic Capstone Sub-Ribbon (Desktop & Tablet) */}
      <div className="w-full bg-surface-container-low border-b border-outline-variant/30 px-space-md py-1.5 hidden md:flex flex-wrap items-center justify-between text-xs text-on-surface z-50">
        <div className="flex items-center gap-space-md flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-semibold uppercase tracking-wider text-[11px] text-on-surface">
              Capstone Node: SRM-TRP-2024-DBMS-R1
            </span>
          </div>
          <span className="text-outline-variant">|</span>
          <div className="flex items-center gap-1 text-on-surface-variant font-mono">
            <span className="material-symbols-outlined text-[15px] text-primary">database</span>
            <span>Schema Engine: MySQL 8.0.36-InnoDB (Strict 3NF)</span>
          </div>
          <span className="text-outline-variant">|</span>
          <div className="flex items-center gap-1 text-primary font-semibold">
            <span className="material-symbols-outlined text-[15px]">verified</span>
            <span>ACID Serializability: VERIFIED</span>
          </div>
        </div>

        {/* Demo Stakeholder Switcher */}
        <div className="flex items-center gap-1.5">
          <span className="text-secondary text-[11px] font-semibold">Role Switcher:</span>
          <button
            onClick={() => handleRoleSwitch('ADMIN')}
            disabled={switching}
            className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
              user?.role === 'ADMIN'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-lowest text-on-surface border border-outline-variant/30 hover:bg-surface-container'
            }`}
          >
            Admin (SRM)
          </button>
          <button
            onClick={() => handleRoleSwitch('RESIDENT')}
            disabled={switching}
            className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
              user?.role === 'RESIDENT'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-lowest text-on-surface border border-outline-variant/30 hover:bg-surface-container'
            }`}
          >
            Resident
          </button>
          <button
            onClick={() => handleRoleSwitch('STAFF')}
            disabled={switching}
            className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
              user?.role === 'STAFF'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-lowest text-on-surface border border-outline-variant/30 hover:bg-surface-container'
            }`}
          >
            Gate Guard
          </button>
          <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold text-[10px]">
            Review 1 &amp; 2 Ready
          </span>
        </div>
      </div>

      {/* 2. Mobile Top Header (Tenancy OS Mobile Spec) */}
      <header className="md:hidden sticky top-0 w-full z-40 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/20 px-space-sm h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold shrink-0">
            <span className="material-symbols-outlined text-[18px]">apartment</span>
          </div>
          <div className="flex flex-col truncate">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider leading-none">
              CivicQuarters
            </span>
            <button
              onClick={() => setProfileDrawerOpen(true)}
              className="flex items-center gap-0.5 text-left group focus:outline-none mt-0.5"
            >
              <span className="text-xs font-bold text-on-surface truncate max-w-[170px]">
                Greenwood Crest Residency
              </span>
              <span className="material-symbols-outlined text-secondary text-[16px]">unfold_more</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleRoleSwitch(user?.role === 'ADMIN' ? 'RESIDENT' : user?.role === 'RESIDENT' ? 'STAFF' : 'ADMIN')}
            className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-bold text-[10px] border border-outline-variant/20"
          >
            {user?.role || 'ADMIN'}
          </button>

          <button
            onClick={() => setProfileDrawerOpen(true)}
            className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs"
          >
            {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || 'U'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* 3. Left Sidebar Navigation (Tenancy OS Desktop Spec) */}
        <aside className="hidden lg:flex flex-col sticky top-0 h-screen w-64 bg-surface-container-lowest z-40 border-r border-outline-variant/30 flex-shrink-0 select-none">
          {/* Brand Header */}
          <div className="h-16 px-space-lg flex items-center justify-between border-b border-outline-variant/20 flex-shrink-0">
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[20px]">apartment</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-on-surface tracking-tight leading-tight">Tenancy OS</span>
                <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider leading-none">CivicQuarters</span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-secondary text-[9px] font-mono font-bold border border-outline-variant/20">
              v2.4 3NF
            </span>
          </div>

          {/* Quick DB Status Bar */}
          <div className="px-space-md py-1.5 bg-surface-container-low flex items-center justify-between text-[11px] border-b border-outline-variant/20">
            <span className="text-secondary font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              DBMS: MySQL 8.0
            </span>
            <span className="text-secondary text-[10px] uppercase font-bold">3NF Strict</span>
          </div>

          {/* Nav Links */}
          <div className="flex-1 px-space-sm py-space-md space-y-space-md overflow-y-auto">
            {navItems.map((group, gIdx) => {
              const visibleLinks = group.links.filter(
                (item) => !item.roles || (user && item.roles.includes(user.role))
              );
              if (visibleLinks.length === 0) return null;
              return (
                <nav key={gIdx} className="space-y-0.5">
                  <div className="px-space-sm pb-1 text-[10px] uppercase tracking-wider text-secondary font-bold">
                    {group.category}
                  </div>
                  {visibleLinks.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-space-sm py-2 rounded-xl transition text-xs ${
                          isActive
                            ? 'bg-primary text-on-primary font-bold shadow-xs'
                            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-medium'
                        }`
                      }
                    >
                      <span className="material-symbols-outlined text-[18px]">{link.icon}</span>
                      <span>{link.label}</span>
                    </NavLink>
                  ))}
                </nav>
              );
            })}
          </div>

          {/* User Profile Card & Version Footer */}
          <div className="p-space-md border-t border-outline-variant/20 bg-surface-container-lowest flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs shrink-0">
                  {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-on-surface truncate">
                    {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username || 'Administrator'}
                  </div>
                  <div className="text-[10px] text-secondary uppercase font-mono font-semibold">
                    {user?.role || 'Guest'}
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                title="Log Out"
                className="p-1.5 rounded-lg hover:bg-error-container/40 text-on-surface-variant hover:text-error transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
            <div className="flex items-center justify-between text-secondary text-[11px] pt-1.5 border-t border-outline-variant/15 font-mono">
              <span>CivicQuarters ERP</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            </div>
          </div>
        </aside>

        {/* 4. Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar Header (Desktop only) */}
          <header className="hidden lg:flex sticky top-0 h-16 bg-surface-container-lowest/90 backdrop-blur-md z-30 border-b border-outline-variant/30 px-space-lg items-center justify-between shadow-xs">
            <div className="flex items-center gap-space-md flex-1 max-w-xl">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors cursor-pointer border border-outline-variant/20">
                <span className="material-symbols-outlined text-secondary text-[18px]">location_city</span>
                <span className="text-xs font-bold text-on-surface">Greenwood Crest Residency - Block A to D</span>
                <span className="material-symbols-outlined text-secondary text-[16px]">arrow_drop_down</span>
              </div>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-low text-on-surface-variant w-72 border border-outline-variant/20">
                <span className="material-symbols-outlined text-secondary text-[18px]">search</span>
                <input
                  type="text"
                  placeholder="Universal search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs text-on-surface placeholder:text-outline w-full"
                />
                <kbd className="px-1.5 py-0.5 text-[10px] bg-surface-container-lowest rounded text-secondary font-mono border border-outline-variant/30">
                  ⌘K
                </kbd>
              </div>
            </div>

            <div className="flex items-center gap-space-md">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold transition border border-outline-variant/20 cursor-pointer"
                title="Print current page"
              >
                <span className="material-symbols-outlined text-[16px] text-secondary">print</span>
                <span>Print</span>
              </button>

              <button className="w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition relative border border-outline-variant/20 cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error"></span>
              </button>

              <div className="h-6 w-px bg-outline-variant/30"></div>

              <div className="flex items-center gap-space-sm">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-on-surface leading-tight">
                    {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username || 'Admin'}
                  </span>
                  <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider font-mono">
                    {user?.role || 'Admin'}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs shadow-xs">
                  {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
            </div>
          </header>

          {/* Primary Main View Container (with bottom padding for mobile tab bar) */}
          <main className="flex-1 w-full bg-surface px-3 sm:px-space-md lg:px-space-xl py-space-md pb-24 md:pb-12">
            <Outlet context={{ searchQuery }} />
          </main>
        </div>
      </div>

      {/* 5. Mobile Bottom Navigation Bar (Tenancy OS Minimal Mobile Spec) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-surface/95 backdrop-blur-xl border-t border-outline-variant/30 shadow-[0_-2px_12px_rgba(19,27,46,0.06)] pb-safe">
        <div className="h-16 px-1 flex items-center justify-around">
          {mobileTabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path);
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition ${
                  isActive
                    ? 'text-primary font-bold'
                    : 'text-on-surface-variant hover:text-on-surface font-medium'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {tab.icon}
                </span>
                <span className="text-[11px] leading-tight">{tab.label}</span>
              </NavLink>
            );
          })}

          {/* "More" Trigger for Drawer */}
          <button
            onClick={() => setMoreDrawerOpen(true)}
            className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
              moreDrawerOpen ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface font-medium'
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: moreDrawerOpen ? "'FILL' 1" : "'FILL' 0" }}
            >
              widgets
            </span>
            <span className="text-[11px] leading-tight">More</span>
          </button>
        </div>
      </nav>

      {/* 6. Mobile "More" Slide-up Drawer */}
      {moreDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-inverse-surface/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMoreDrawerOpen(false)}
          />
          <div className="relative bg-surface-container-lowest rounded-t-3xl p-5 shadow-2xl border-t border-outline-variant/30 max-h-[85vh] flex flex-col z-10 animate-slideUp">
            {/* Drawer Drag Pill */}
            <div className="w-12 h-1.5 bg-outline-variant/50 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-3">
              <div>
                <h3 className="font-bold text-base text-on-surface">All Modules</h3>
                <p className="text-[11px] text-secondary">CivicQuarters 3NF Relational System</p>
              </div>
              <button
                onClick={() => setMoreDrawerOpen(false)}
                className="p-1 rounded-full text-secondary hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-6">
              {navItems.map((group, idx) => {
                const visibleLinks = group.links.filter(
                  (item) => !item.roles || (user && item.roles.includes(user.role))
                );
                if (visibleLinks.length === 0) return null;
                return (
                  <div key={idx}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1.5">
                      {group.category}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {visibleLinks.map((link) => (
                        <NavLink
                          key={link.path}
                          to={link.path}
                          onClick={() => setMoreDrawerOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-2 p-2.5 rounded-xl border transition text-xs ${
                              isActive
                                ? 'bg-primary text-on-primary border-primary font-bold shadow-xs'
                                : 'bg-surface-container-low border-outline-variant/30 text-on-surface hover:bg-surface-container font-medium'
                            }`
                          }
                        >
                          <span className="material-symbols-outlined text-[18px]">{link.icon}</span>
                          <span className="truncate">{link.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Demo Role Switcher in Mobile Drawer */}
              <div className="pt-3 border-t border-outline-variant/20">
                <div className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">
                  Instant Demo Persona
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleRoleSwitch('ADMIN')}
                    className={`p-2 rounded-xl text-center text-xs font-bold border transition ${
                      user?.role === 'ADMIN'
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-surface-container-low border-outline-variant/30 text-on-surface'
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('RESIDENT')}
                    className={`p-2 rounded-xl text-center text-xs font-bold border transition ${
                      user?.role === 'RESIDENT'
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-surface-container-low border-outline-variant/30 text-on-surface'
                    }`}
                  >
                    Resident
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('STAFF')}
                    className={`p-2 rounded-xl text-center text-xs font-bold border transition ${
                      user?.role === 'STAFF'
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-surface-container-low border-outline-variant/30 text-on-surface'
                    }`}
                  >
                    Guard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Mobile Profile & Role Modal */}
      {profileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-inverse-surface/50 backdrop-blur-xs"
            onClick={() => setProfileDrawerOpen(false)}
          />
          <div className="relative bg-surface-container-lowest rounded-t-3xl p-5 shadow-2xl border-t border-outline-variant/30 max-h-[70vh] z-10">
            <div className="w-12 h-1.5 bg-outline-variant/50 rounded-full mx-auto mb-4" />
            <div className="flex items-center gap-3 pb-4 border-b border-outline-variant/20 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-bold text-lg shadow-xs">
                {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-on-surface truncate">
                  {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username || 'Administrator'}
                </h3>
                <p className="text-xs text-secondary font-mono">{user?.email || 'admin@greenwoodcrest.org'}</p>
                <span className="inline-block px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold mt-1">
                  Active Persona: {user?.role || 'ADMIN'}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-secondary">Switch Demo Role</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleRoleSwitch('ADMIN')}
                  className={`p-2 rounded-xl text-center text-xs font-bold border transition ${
                    user?.role === 'ADMIN'
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container-low border-outline-variant/30 text-on-surface'
                  }`}
                >
                  Admin
                </button>
                <button
                  onClick={() => handleRoleSwitch('RESIDENT')}
                  className={`p-2 rounded-xl text-center text-xs font-bold border transition ${
                    user?.role === 'RESIDENT'
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container-low border-outline-variant/30 text-on-surface'
                  }`}
                >
                  Resident
                </button>
                <button
                  onClick={() => handleRoleSwitch('STAFF')}
                  className={`p-2 rounded-xl text-center text-xs font-bold border transition ${
                    user?.role === 'STAFF'
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container-low border-outline-variant/30 text-on-surface'
                  }`}
                >
                  Guard
                </button>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full h-10 rounded-xl bg-error-container/40 text-error hover:bg-error-container font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Sign Out of Tenancy OS</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
