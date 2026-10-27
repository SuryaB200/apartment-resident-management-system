import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('financial'); // 'financial' | 'occupancy' | 'sla' | 'visitors'
  const [metrics, setMetrics] = useState(null);
  const [defaulters, setDefaulters] = useState([]);
  const [slaData, setSlaData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      try {
        const [metricRes, defRes, slaRes] = await Promise.all([
          api.dashboard.getMetrics(),
          api.reporting.getDefaulters(),
          api.reporting.getSLA(),
        ]);
        setMetrics(metricRes);
        setDefaulters(defRes.defaulters || defRes.results || defRes || []);
        setSlaData(slaRes.staff_performance || slaRes.results || slaRes || []);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm uppercase tracking-wider mb-1">
            <span>System &amp; Regulatory</span>
            <span>/</span>
            <span className="text-primary font-semibold">Fiscal &amp; Security Audits</span>
            <span>/</span>
            <span className="px-1.5 py-0.2 rounded bg-surface-container text-primary font-mono text-[10px]">Statutory Ready</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Reports &amp; Regulatory Statements</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Society financial statements, occupancy ledgers, and operational compliance exports.
          </p>
        </div>
        <div className="flex items-center gap-space-sm shrink-0">
          <button
            onClick={() => window.print()}
            className="h-10 px-space-md bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors rounded-xl font-label-md text-label-md flex items-center gap-2 shadow-xs border border-surface-container-high"
          >
            <span className="material-symbols-outlined text-[18px] text-outline">print</span>
            <span>Print Report View</span>
          </button>
          <button
            onClick={() => alert("Regulatory audit bundle exported as CSV / PDF package.")}
            className="h-10 px-space-md bg-primary-container text-on-primary hover:bg-primary transition-colors rounded-xl font-label-md text-label-md flex items-center gap-2 shadow-sm font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">archive</span>
            <span>Export Audit Bundle (.zip)</span>
          </button>
        </div>
      </div>

      {/* 3 Featured Statutory Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        {/* Card 1: Monthly Financial Statement */}
        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-xs border border-surface-container-high flex flex-col justify-between relative overflow-hidden group hover:shadow-sm transition-all">
          <div>
            <div className="flex items-start justify-between mb-space-md">
              <div className="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">account_balance</span>
              </div>
              <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container tracking-wider uppercase font-semibold">
                Statutory Ready
              </span>
            </div>
            <div className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-1">Fiscal Clearance</div>
            <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight mb-2">Monthly Financial Statement</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Comprehensive operational ledger, revenue reconciliations, and vendor debits.
            </p>
            <div className="grid grid-cols-2 gap-space-sm p-space-sm rounded-lg bg-surface-container-low mb-space-md">
              <div>
                <div className="font-label-sm text-label-sm text-outline">Collections</div>
                <div className="font-tabular-metric text-headline-sm text-on-surface font-semibold">₹16.42L</div>
              </div>
              <div>
                <div className="font-label-sm text-label-sm text-outline">Arrears</div>
                <div className="font-tabular-metric text-headline-sm text-error font-semibold">₹2.54L</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-space-xs pt-space-xs">
            <button
              onClick={() => window.print()}
              className="flex-1 py-1.5 px-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-1 transition-colors font-semibold"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              PDF
            </button>
            <button
              onClick={() => alert("Downloading spreadsheet (.xlsx)...")}
              className="flex-1 py-1.5 px-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-1 transition-colors font-semibold"
            >
              <span className="material-symbols-outlined text-[16px]">table_chart</span>
              Excel (.xlsx)
            </button>
          </div>
        </div>

        {/* Card 2: Occupancy & Tenancy Register */}
        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-xs border border-surface-container-high flex flex-col justify-between relative overflow-hidden group hover:shadow-sm transition-all">
          <div>
            <div className="flex items-start justify-between mb-space-md">
              <div className="w-10 h-10 rounded-lg bg-surface-container text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">domain</span>
              </div>
              <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-primary tracking-wider uppercase font-semibold">
                3NF Verified
              </span>
            </div>
            <div className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-1">Tenancy Registry</div>
            <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight mb-2">Occupancy &amp; Tenancy Register</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              FY 2024–25 chronological directory with verified lease deeds, active tenure, and deposit holdings.
            </p>
            <div className="grid grid-cols-2 gap-space-sm p-space-sm rounded-lg bg-surface-container-low mb-space-md">
              <div>
                <div className="font-label-sm text-label-sm text-outline">Audited Units</div>
                <div className="font-tabular-metric text-headline-sm text-on-surface font-semibold">240 / 240</div>
              </div>
              <div>
                <div className="font-label-sm text-label-sm text-outline">Occupancy</div>
                <div className="font-tabular-metric text-headline-sm text-tertiary-container font-semibold">96.8%</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-space-xs pt-space-xs">
            <button
              onClick={() => window.print()}
              className="flex-1 py-1.5 px-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-1 transition-colors font-semibold"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              PDF
            </button>
            <button
              onClick={() => alert("Downloading CSV roster...")}
              className="flex-1 py-1.5 px-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-1 transition-colors font-semibold"
            >
              <span className="material-symbols-outlined text-[16px]">csv</span>
              CSV Raw
            </button>
          </div>
        </div>

        {/* Card 3: Gate & Perimeter Security Audit */}
        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-xs border border-surface-container-high flex flex-col justify-between relative overflow-hidden group hover:shadow-sm transition-all">
          <div>
            <div className="flex items-start justify-between mb-space-md">
              <div className="w-10 h-10 rounded-lg bg-surface-container-low text-tertiary flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">shield</span>
              </div>
              <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container tracking-wider uppercase font-semibold">
                0 Incidents
              </span>
            </div>
            <div className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-1">Premise Surveillance</div>
            <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight mb-2">Gate &amp; Perimeter Security Audit</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Comprehensive physical barrier logs, automated RFID tags, and authenticated visitor passes.
            </p>
            <div className="grid grid-cols-2 gap-space-sm p-space-sm rounded-lg bg-surface-container-low mb-space-md">
              <div>
                <div className="font-label-sm text-label-sm text-outline">Monthly Scans</div>
                <div className="font-tabular-metric text-headline-sm text-on-surface font-semibold">4,280 Events</div>
              </div>
              <div>
                <div className="font-label-sm text-label-sm text-outline">Anomalies</div>
                <div className="font-tabular-metric text-headline-sm text-tertiary-container font-semibold">0 Detected</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-space-xs pt-space-xs">
            <button
              onClick={() => window.print()}
              className="w-full py-1.5 px-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-1 transition-colors font-semibold"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              Export Security Dossier
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Report View */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-high flex flex-col overflow-hidden">
        <div className="p-space-md flex items-center justify-between border-b border-surface-container-high">
          <div className="flex items-center gap-space-xs bg-surface-container-low p-1 rounded-xl self-start">
            <button
              onClick={() => setActiveReport('financial')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-all ${
                activeReport === 'financial'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Fiscal Ledger Audit
            </button>
            <button
              onClick={() => setActiveReport('defaulters')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-all ${
                activeReport === 'defaulters'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Defaulter Aging Schedule
            </button>
            <button
              onClick={() => setActiveReport('sla')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-all ${
                activeReport === 'sla'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              SLA Performance Matrix
            </button>
          </div>
        </div>

        <div className="p-space-lg">
          {activeReport === 'financial' && (
            <div className="space-y-4">
              <h3 className="font-headline-sm text-on-surface">Income &amp; Expenditure Summary (Oct 2024)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-surface-container-low">
                  <div className="text-label-sm text-outline uppercase font-semibold">Maintenance Invoiced</div>
                  <div className="text-xl font-bold font-mono text-on-surface mt-1">₹16,42,000.00</div>
                </div>
                <div className="p-4 rounded-lg bg-surface-container-low">
                  <div className="text-label-sm text-outline uppercase font-semibold">Realized Collections</div>
                  <div className="text-xl font-bold font-mono text-tertiary-container mt-1">₹13,88,000.00</div>
                </div>
                <div className="p-4 rounded-lg bg-surface-container-low">
                  <div className="text-label-sm text-outline uppercase font-semibold">Cumulative Arrears</div>
                  <div className="text-xl font-bold font-mono text-error mt-1">₹2,54,000.00</div>
                </div>
              </div>
            </div>
          )}

          {activeReport === 'defaulters' && (
            <div className="space-y-4">
              <h3 className="font-headline-sm text-on-surface">Active Defaulter Accounts Schedule</h3>
              <div className="divide-y divide-surface-container-high border border-surface-container-high rounded-lg overflow-hidden">
                {defaulters.length === 0 ? (
                  <div className="p-4 text-center text-on-surface-variant">No overdue accounts currently logged.</div>
                ) : (
                  defaulters.map((d, i) => (
                    <div key={i} className="p-3 flex items-center justify-between text-body-sm hover:bg-surface-container-low">
                      <div>
                        <span className="font-bold text-primary mr-2">{d.flat_code}</span>
                        <span className="text-on-surface font-medium">{d.resident_name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-error font-mono">{d.overdue_days} days overdue</span>
                        <span className="font-bold font-mono">₹{parseFloat(d.total_outstanding || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeReport === 'sla' && (
            <div className="space-y-4">
              <h3 className="font-headline-sm text-on-surface">Technician SLA Resolution Rates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-surface-container-low">
                  <div className="text-label-sm text-outline uppercase font-semibold">Overall SLA Compliance</div>
                  <div className="text-2xl font-bold text-primary mt-1">98.2%</div>
                  <div className="text-body-sm text-on-surface-variant mt-0.5">Target: 95.0% compliance threshold</div>
                </div>
                <div className="p-4 rounded-lg bg-surface-container-low">
                  <div className="text-label-sm text-outline uppercase font-semibold">Mean Time to Resolve (MTTR)</div>
                  <div className="text-2xl font-bold text-on-surface mt-1">3.8 Hours</div>
                  <div className="text-body-sm text-on-surface-variant mt-0.5">Standard SLA Window: 6.0 Hours</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
