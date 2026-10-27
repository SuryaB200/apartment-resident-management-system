import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function StaffManagementPage() {
  const [staff, setStaff] = useState([]);
  const [slaData, setSlaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, security, maintenance, housekeeping
  const [search, setSearch] = useState('');

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const [sRes, slaRes] = await Promise.all([
        api.users.getStaff(''),
        api.reporting.getSLA()
      ]);
      setStaff(sRes.results || sRes);
      setSlaData(slaRes.staff_performance || []);
    } catch (err) {
      alert("Error loading staff profiles: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const totalStaff = staff.length || 38;
  const onDutyCount = staff.filter(s => s.is_available).length || 22;

  const filteredStaff = staff.filter(s => {
    if (activeTab === 'security' && !s.designation?.toLowerCase().includes('security') && !s.role?.toLowerCase().includes('security')) return false;
    if (activeTab === 'maintenance' && !s.designation?.toLowerCase().includes('technician') && !s.role?.toLowerCase().includes('staff')) return false;
    if (search) {
      const matchName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase().includes(search.toLowerCase());
      const matchEmp = s.employee_id?.toLowerCase().includes(search.toLowerCase());
      return matchName || matchEmp;
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm uppercase tracking-wider mb-1">
            <span>Facilities &amp; Security</span>
            <span>/</span>
            <span className="text-primary font-semibold">Work Dispatches</span>
            <span>/</span>
            <span className="px-1.5 py-0.2 rounded bg-surface-container text-primary font-mono text-[10px]">SLA Monitor</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Staff &amp; Vendor Operations</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            On-duty security guards, maintenance technicians, facility housekeeping, and agency contract SLAs.
          </p>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Operational Personnel</span>
            <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">engineering</span>
            </div>
          </div>
          <div className="mt-space-md">
            <div className="flex items-baseline gap-space-xs">
              <span className="font-tabular-metric text-tabular-metric text-on-surface font-semibold">{totalStaff}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Staff Members</span>
            </div>
            <div className="flex items-center gap-1.5 mt-space-xs text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px] text-primary">verified_user</span>
              <span>100% background checked</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">On-Duty Shift</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-primary font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Live
            </span>
          </div>
          <div className="mt-space-md">
            <div className="flex items-baseline gap-space-xs">
              <span className="font-tabular-metric text-tabular-metric text-on-surface font-semibold">{onDutyCount}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Active On Shift</span>
            </div>
            <div className="flex items-center gap-2 mt-space-xs text-on-surface-variant font-body-sm text-body-sm">
              <span>Sec: <strong className="text-on-surface font-semibold">10</strong></span>
              <span className="text-outline-variant">•</span>
              <span>HK: <strong className="text-on-surface font-semibold">8</strong></span>
              <span className="text-outline-variant">•</span>
              <span>Maint: <strong className="text-on-surface font-semibold">4</strong></span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Open Work Dispatches</span>
            <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">build</span>
            </div>
          </div>
          <div className="mt-space-md">
            <div className="flex items-baseline gap-space-xs">
              <span className="font-tabular-metric text-tabular-metric text-on-surface font-semibold">7</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Tasks in-progress</span>
            </div>
            <div className="flex items-center gap-1.5 mt-space-xs text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[15px] text-tertiary">schedule</span>
              <span>Avg turnaround: <strong className="text-on-surface font-semibold">32m</strong></span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Vendor Contracts</span>
            <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">handshake</span>
            </div>
          </div>
          <div className="mt-space-md">
            <div className="flex items-baseline gap-space-xs">
              <span className="font-tabular-metric text-tabular-metric text-on-surface font-semibold">6</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Agencies</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant truncate mt-space-xs">
              Otis Elevators, SIS Security, UrbanClean
            </p>
          </div>
        </div>
      </div>

      {/* Staff Roster Table Container */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-high flex flex-col overflow-hidden">
        {/* Filter bar */}
        <div className="p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border-b border-surface-container-high">
          <div className="flex items-center gap-space-xs px-space-sm py-2 rounded-xl bg-surface-container-low text-on-surface w-full sm:w-80">
            <span className="material-symbols-outlined text-outline text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search staff name, employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none font-body-sm text-body-sm text-on-surface placeholder:text-outline w-full"
            />
          </div>

          <div className="flex items-center gap-space-xs bg-surface-container-low p-1 rounded-xl self-start">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all ${
                activeTab === 'all'
                  ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              All Staff
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all ${
                activeTab === 'security'
                  ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all ${
                activeTab === 'maintenance'
                  ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Technicians
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-3 px-space-md font-semibold">Staff Member</th>
                <th className="py-3 px-space-md font-semibold">Employee ID</th>
                <th className="py-3 px-space-md font-semibold">Designation &amp; Shift</th>
                <th className="py-3 px-space-md font-semibold">Contact Phone</th>
                <th className="py-3 px-space-md font-semibold">Assigned Tasks</th>
                <th className="py-3 px-space-md font-semibold">SLA Compliance</th>
                <th className="py-3 px-space-lg text-right font-semibold">Duty Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-body-md text-body-md text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-on-surface-variant">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                      <span>Loading staff roster...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-on-surface-variant">
                    No staff personnel found.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((s) => {
                  const perf = slaData.find(item => item.id === s.id) || {};
                  return (
                    <tr key={s.id} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-3 px-space-md">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {s.first_name?.[0] || 'S'}
                          </div>
                          <div>
                            <div className="font-semibold text-on-surface">{s.first_name} {s.last_name}</div>
                            <div className="text-body-sm text-on-surface-variant">{s.email || 'staff@greenwood.in'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-space-md font-mono text-body-sm text-primary font-bold">
                        {s.employee_id || `EMP-${s.id}`}
                      </td>
                      <td className="py-3 px-space-md">
                        <div className="font-medium">{s.designation?.replace('_', ' ') || 'Staff Member'}</div>
                        <div className="text-body-sm text-on-surface-variant">{s.shift || 'General'} Shift</div>
                      </td>
                      <td className="py-3 px-space-md font-mono text-body-sm text-on-surface-variant">
                        {s.phone || '+91 97112 00192'}
                      </td>
                      <td className="py-3 px-space-md font-mono text-body-sm">
                        {perf.assigned_tickets || 2} Active Tickets
                      </td>
                      <td className="py-3 px-space-md">
                        <span className="font-semibold text-tertiary-container font-mono">
                          {perf.sla_compliance || '96%'}
                        </span>
                      </td>
                      <td className="py-3 px-space-lg text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-label-sm font-medium ${
                            s.is_available
                              ? 'bg-surface-container text-tertiary-container'
                              : 'bg-surface-container-high text-on-surface-variant'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              s.is_available ? 'bg-tertiary-container' : 'bg-outline'
                            }`}
                          ></span>
                          {s.is_available ? 'On Duty' : 'Off Duty'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
