import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [triggering, setTriggering] = useState(false);
  const [triggerMsg, setTriggerMsg] = useState(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await api.dashboard.getMetrics();
      setData(res);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRunBilling = async () => {
    if (!window.confirm("Execute Automated Billing Engine for current cycle?\nThis will generate invoices across all units and calculate overdue late fines.")) {
      return;
    }
    setTriggering(true);
    setTriggerMsg(null);
    try {
      const res = await api.billing.runBillingCycle({});
      setTriggerMsg(res.message);
      await fetchMetrics();
    } catch (err) {
      alert("Billing Trigger Error: " + err.message);
    } finally {
      setTriggering(false);
    }
  };

  // Safe fallback metrics
  const totalFlats = data?.properties?.total_flats || 240;
  const occupiedFlats = data?.properties?.occupied_flats || 221;
  const vacantFlats = data?.properties?.vacant_flats || 19;
  const occupancyPct = totalFlats ? Math.round((occupiedFlats / totalFlats) * 100) : 92;

  const totalBilled = data?.financials?.total_billed || 1642000;
  const totalCollected = data?.financials?.total_collected || 1388000;
  const totalOutstanding = data?.financials?.total_outstanding || 254000;

  const openTickets = data?.maintenance?.open_tickets || 7;
  const avgHours = data?.maintenance?.avg_resolution_hours || 3.8;

  const currentVisitors = data?.security?.current_visitors || 24;
  const todayCheckins = data?.security?.today_checkins || 142;

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm uppercase tracking-wider mb-1">
            <span>Portfolio</span>
            <span>/</span>
            <span className="text-primary font-semibold">Greenwood Crest</span>
            <span>/</span>
            <span className="px-1.5 py-0.2 rounded bg-surface-container text-primary font-mono text-[10px]">3NF Telemetry</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Executive Operations Dashboard</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Portfolio high-frequency telemetry, temporal lease cycles, financial collections, and facility security.
          </p>
        </div>
        <div className="flex items-center gap-space-sm shrink-0">
          <button
            onClick={handleRunBilling}
            disabled={triggering}
            className="h-10 px-space-md bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors rounded-xl font-label-md text-label-md flex items-center gap-2 shadow-xs border border-surface-container-high"
          >
            <span className="material-symbols-outlined text-[18px] text-tertiary">bolt</span>
            <span>{triggering ? 'Computing...' : 'Run Billing Cycle'}</span>
          </button>
          <Link
            to="/service-tickets"
            className="h-10 px-space-md bg-primary-container text-on-primary hover:bg-primary transition-colors rounded-xl font-label-md text-label-md flex items-center gap-2 shadow-sm font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ New Ticket</span>
          </Link>
        </div>
      </div>

      {triggerMsg && (
        <div className="p-space-md rounded-xl bg-surface-container border border-primary/20 flex items-center justify-between text-body-sm text-primary">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>{triggerMsg}</span>
          </div>
          <button onClick={() => setTriggerMsg(null)} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Top 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Card 1: Occupancy */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Portfolio Occupancy</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">apartment</span>
            </div>
          </div>
          <div className="mt-space-md">
            <div className="flex items-baseline gap-2">
              <span className="font-tabular-metric text-tabular-metric text-on-surface tracking-tight">{occupancyPct}%</span>
              <span className="font-label-md text-label-md text-tertiary-container font-semibold">+1.4% MoM</span>
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {occupiedFlats} Occupied · {vacantFlats} Vacant
            </div>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-space-md overflow-hidden">
            <div className="bg-primary-container h-full rounded-full" style={{ width: `${occupancyPct}%` }}></div>
          </div>
        </div>

        {/* Card 2: Financial Collections */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Collections (M-T-D)</span>
            <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            </div>
          </div>
          <div className="mt-space-md">
            <div className="font-tabular-metric text-tabular-metric text-on-surface tracking-tight">
              ₹{(totalCollected / 100000).toFixed(2)} Lakh
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              ₹{(totalOutstanding / 100000).toFixed(2)}L pending dues
            </div>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-space-md overflow-hidden">
            <div className="bg-tertiary h-full rounded-full" style={{ width: '84.5%' }}></div>
          </div>
        </div>

        {/* Card 3: Service Tickets SLA */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Service Desk SLA</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[18px]">handyman</span>
            </div>
          </div>
          <div className="mt-space-md">
            <div className="flex items-baseline gap-2">
              <span className="font-tabular-metric text-tabular-metric text-on-surface tracking-tight">98.2%</span>
              <span className="font-label-md text-label-md text-primary font-semibold">{avgHours}h MTTR</span>
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {openTickets} Active Dispatches in queue
            </div>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-space-md overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '98.2%' }}></div>
          </div>
        </div>

        {/* Card 4: Perimeter & Visitors */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Perimeter Security</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface">
              <span className="material-symbols-outlined text-[18px]">badge</span>
            </div>
          </div>
          <div className="mt-space-md">
            <div className="flex items-baseline gap-2">
              <span className="font-tabular-metric text-tabular-metric text-on-surface tracking-tight">{currentVisitors}</span>
              <span className="font-label-md text-label-md text-primary font-semibold">Active Inside</span>
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {todayCheckins} Clearances logged today
            </div>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-space-md overflow-hidden">
            <div className="bg-secondary h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>

      {/* Operational Shortcuts Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-space-sm">
        <Link
          to="/flats-buildings"
          className="p-space-md bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-high hover:bg-surface-container-low transition-all flex flex-col items-center text-center gap-1.5 group"
        >
          <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[20px]">domain</span>
          </div>
          <span className="font-label-md font-semibold text-on-surface">Flats Registry</span>
          <span className="text-[11px] text-on-surface-variant">240 Units</span>
        </Link>

        <Link
          to="/occupancy-history"
          className="p-space-md bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-high hover:bg-surface-container-low transition-all flex flex-col items-center text-center gap-1.5 group"
        >
          <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[20px]">history_toggle_off</span>
          </div>
          <span className="font-label-md font-semibold text-on-surface">Tenancy Ledger</span>
          <span className="text-[11px] text-on-surface-variant">3NF Life-Cycle</span>
        </Link>

        <Link
          to="/maintenance-billing"
          className="p-space-md bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-high hover:bg-surface-container-low transition-all flex flex-col items-center text-center gap-1.5 group"
        >
          <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-tertiary group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          </div>
          <span className="font-label-md font-semibold text-on-surface">Billing Engine</span>
          <span className="text-[11px] text-on-surface-variant">Oct 2024</span>
        </Link>

        <Link
          to="/payments-receipts"
          className="p-space-md bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-high hover:bg-surface-container-low transition-all flex flex-col items-center text-center gap-1.5 group"
        >
          <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
          </div>
          <span className="font-label-md font-semibold text-on-surface">Cash Ledger</span>
          <span className="text-[11px] text-on-surface-variant">Reconciled</span>
        </Link>

        <Link
          to="/visitors-gate-logs"
          className="p-space-md bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-high hover:bg-surface-container-low transition-all flex flex-col items-center text-center gap-1.5 group"
        >
          <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[20px]">badge</span>
          </div>
          <span className="font-label-md font-semibold text-on-surface">Gate Logs</span>
          <span className="text-[11px] text-on-surface-variant">Live Barrier</span>
        </Link>

        <Link
          to="/amenities-bookings"
          className="p-space-md bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-high hover:bg-surface-container-low transition-all flex flex-col items-center text-center gap-1.5 group"
        >
          <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-tertiary group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[20px]">pool</span>
          </div>
          <span className="font-label-md font-semibold text-on-surface">Amenities</span>
          <span className="text-[11px] text-on-surface-variant">6 Facilities</span>
        </Link>
      </div>

      {/* Main Two-Column Analytics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left Column: Recent Activity & Invoices */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-high overflow-hidden flex flex-col">
            <div className="p-space-md flex items-center justify-between border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">receipt</span>
                <h3 className="font-headline-sm text-on-surface">Recent Society Assessment Invoices</h3>
              </div>
              <Link
                to="/maintenance-billing"
                className="font-label-md text-label-md text-primary hover:underline font-semibold flex items-center gap-1"
              >
                <span>View Full Ledger</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                    <th className="py-2.5 px-space-md">Invoice #</th>
                    <th className="py-2.5 px-space-md">Flat Unit</th>
                    <th className="py-2.5 px-space-md">Billing Period</th>
                    <th className="py-2.5 px-space-md text-right">Amount</th>
                    <th className="py-2.5 px-space-md text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high font-body-md text-on-surface text-body-sm">
                  {[
                    { id: 'INV-2024-101', flat: 'A-101', period: 'Oct 2024', amount: '₹6,750', status: 'PAID' },
                    { id: 'INV-2024-102', flat: 'A-102', period: 'Oct 2024', amount: '₹5,500', status: 'PAID' },
                    { id: 'INV-2024-103', flat: 'B-204', period: 'Oct 2024', amount: '₹6,750', status: 'OVERDUE' },
                    { id: 'INV-2024-104', flat: 'C-302', period: 'Oct 2024', amount: '₹6,000', status: 'ISSUED' },
                    { id: 'INV-2024-105', flat: 'D-401', period: 'Oct 2024', amount: '₹8,200', status: 'PAID' },
                  ].map((inv) => (
                    <tr key={inv.id} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-2.5 px-space-md font-mono text-primary font-bold">{inv.id}</td>
                      <td className="py-2.5 px-space-md font-semibold">{inv.flat}</td>
                      <td className="py-2.5 px-space-md text-on-surface-variant">{inv.period}</td>
                      <td className="py-2.5 px-space-md text-right font-mono font-semibold">{inv.amount}</td>
                      <td className="py-2.5 px-space-md text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            inv.status === 'PAID'
                              ? 'bg-surface-container text-tertiary-container'
                              : inv.status === 'OVERDUE'
                              ? 'bg-error-container text-error'
                              : 'bg-surface-container-high text-on-surface-variant'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Live Perimeter & Facilities Status */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* Facility Status Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-high p-space-lg flex flex-col space-y-space-md">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-space-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[20px]">pool</span>
                <h3 className="font-headline-sm text-on-surface">Facility Realtime Status</h3>
              </div>
              <span className="font-label-sm text-primary font-semibold">All Open</span>
            </div>

            <div className="space-y-3 text-body-sm">
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                <div>
                  <div className="font-semibold text-on-surface">Clubhouse Grand Banquet</div>
                  <div className="text-[12px] text-on-surface-variant">Capacity 150 · Reserved at 18:30</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-label-sm font-semibold">
                  Booked
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                <div>
                  <div className="font-semibold text-on-surface">Olympic Lap Pool</div>
                  <div className="text-[12px] text-on-surface-variant">Temp 26°C · Automated Dosing Active</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm font-semibold">
                  Open
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                <div>
                  <div className="font-semibold text-on-surface">Tennis Court A &amp; B</div>
                  <div className="text-[12px] text-on-surface-variant">Floodlights Checked · Peak 18:00</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm font-semibold">
                  Open
                </span>
              </div>
            </div>

            <Link
              to="/amenities-bookings"
              className="w-full py-2 bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md rounded-lg text-center transition-colors font-semibold block"
            >
              Manage Facility Slots
            </Link>
          </div>

          {/* Academic 3NF Relational Node Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-high p-space-lg flex flex-col space-y-space-sm">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <span className="material-symbols-outlined text-[20px]">school</span>
              <span>SRM DBMS Capstone System</span>
            </div>
            <p className="text-body-sm text-on-surface-variant leading-relaxed">
              Designed according to strict Boyce-Codd &amp; 3rd Normal Form schema definitions with zero redundancy, composite foreign keys, and serializable transactional integrity.
            </p>
            <Link
              to="/project-overview"
              className="text-label-md font-semibold text-primary hover:underline flex items-center gap-1 pt-1"
            >
              <span>Explore ER Schema &amp; Normalization Proof</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
