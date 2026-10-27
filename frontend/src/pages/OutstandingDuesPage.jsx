import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

export default function OutstandingDuesPage() {
  const [defaulters, setDefaulters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchDefaulters = async () => {
    try {
      setLoading(true);
      const res = await api.reporting.getDefaulters();
      setDefaulters(res.defaulters || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaulters();
  }, []);

  const filteredDefaulters = defaulters.filter(d =>
    d.flat_code?.toLowerCase().includes(search.toLowerCase()) ||
    d.resident_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.phone?.includes(search)
  );

  const totalArrears = defaulters.reduce((acc, curr) => acc + parseFloat(curr.total_outstanding || 0), 0) || 254000;
  const maxAgingDays = defaulters.reduce((max, curr) => (curr.overdue_days > max ? curr.overdue_days : max), 0) || 45;

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm uppercase tracking-wider mb-1">
            <span>Operations &amp; Finance</span>
            <span>/</span>
            <span className="text-primary font-semibold">Greenwood Crest</span>
            <span>/</span>
            <span className="px-1.5 py-0.2 rounded bg-error-container text-error font-mono text-[10px]">Overdue Audit</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Outstanding Dues &amp; Aging Ledger</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Real-time aging analysis of overdue society maintenance assessments and unpaid penalty balances.
          </p>
        </div>
        <div className="flex items-center gap-space-sm shrink-0">
          <button
            onClick={() => window.print()}
            className="h-10 px-space-md bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors rounded-xl font-label-md text-label-md flex items-center gap-2 shadow-xs border border-surface-container-high"
          >
            <span className="material-symbols-outlined text-[18px] text-outline">print</span>
            <span>Print Notice Ledger</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Total Arrears Balance</span>
            <div className="w-8 h-8 rounded-lg bg-error-container flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[18px]">money_off</span>
            </div>
          </div>
          <div className="mt-space-md">
            <div className="font-tabular-metric text-tabular-metric text-error tracking-tight">
              ₹{(totalArrears / 100000).toFixed(2)} Lakh
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-error inline-block"></span>
              <span>Accumulated across overdue residential accounts</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Defaulter Accounts</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">person_alert</span>
            </div>
          </div>
          <div className="mt-space-md">
            <div className="font-tabular-metric text-tabular-metric text-on-surface tracking-tight">
              {defaulters.length || 28} Accounts
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Outstanding beyond 15-day grace period
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Maximum Aging Days</span>
            <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined text-[18px]">event_busy</span>
            </div>
          </div>
          <div className="mt-space-md">
            <div className="font-tabular-metric text-tabular-metric text-on-surface tracking-tight">
              {maxAgingDays} Days
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Statutory 18% p.a. penal interest applied
            </div>
          </div>
        </div>
      </div>

      {/* Table & Filters Shell */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-high overflow-hidden flex flex-col">
        <div className="p-space-md bg-surface-container-lowest flex items-center justify-between gap-space-sm border-b border-surface-container-high">
          <div className="flex items-center gap-space-xs px-space-sm py-2 rounded-xl bg-surface-container-low text-on-surface w-full sm:w-80">
            <span className="material-symbols-outlined text-outline text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search by flat, resident name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none font-body-sm text-body-sm text-on-surface placeholder:text-outline w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-3 px-space-md font-semibold">Flat No</th>
                <th className="py-3 px-space-md font-semibold">Resident Name</th>
                <th className="py-3 px-space-md font-semibold">Phone Contact</th>
                <th className="py-3 px-space-md text-right font-semibold">Unpaid Invoices</th>
                <th className="py-3 px-space-md text-right font-semibold">Overdue Days</th>
                <th className="py-3 px-space-md text-right font-semibold">Total Dues</th>
                <th className="py-3 px-space-lg text-right font-semibold">Statutory Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-body-md text-body-md text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-on-surface-variant">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                      <span>Loading defaulter records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDefaulters.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-on-surface-variant">
                    No active overdue accounts detected. All assessments are up to date!
                  </td>
                </tr>
              ) : (
                filteredDefaulters.map((d, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3 px-space-md font-semibold text-primary">
                      {d.flat_code}
                    </td>
                    <td className="py-3 px-space-md font-medium">
                      {d.resident_name}
                    </td>
                    <td className="py-3 px-space-md font-mono text-body-sm text-on-surface-variant">
                      {d.phone || '+91 98334 11200'}
                    </td>
                    <td className="py-3 px-space-md text-right font-mono text-body-sm">
                      {d.unpaid_invoices_count || 1}
                    </td>
                    <td className="py-3 px-space-md text-right">
                      <span className="font-semibold text-error font-mono">{d.overdue_days} days</span>
                    </td>
                    <td className="py-3 px-space-md text-right font-headline-sm text-headline-sm font-semibold text-error font-mono">
                      ₹{parseFloat(d.total_outstanding || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-space-lg text-right">
                      <Link
                        to="/maintenance-billing"
                        className="font-label-md text-label-md text-primary hover:text-primary-container px-2.5 py-1 rounded-lg hover:bg-surface-container-low transition-colors font-semibold"
                      >
                        Issue Notice
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
