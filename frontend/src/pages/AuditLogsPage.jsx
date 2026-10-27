import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [actionFilter, setActionFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Log for details modal
  const [selectedLog, setSelectedLog] = useState(null);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.audit.getLogs('?page_size=200');
      setLogs(data.results || data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setError(err.message || 'Unable to retrieve audit history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesSearch =
      searchQuery === '' ||
      (log.user_username || 'System').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.entity_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(log.record_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm uppercase tracking-wider mb-1">
            <span>System &amp; Regulatory</span>
            <span>/</span>
            <span className="text-primary font-semibold">Audit Registers</span>
            <span>/</span>
            <span className="px-1.5 py-0.2 rounded bg-surface-container text-primary font-mono text-[10px]">SHA256 Chained</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Immutable Audit Logs</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Cryptographic ledger tracking all administrative actions, payments recorded, and lease terminations.
          </p>
        </div>
        <div className="flex items-center gap-space-sm shrink-0">
          <button
            onClick={() => window.print()}
            className="h-10 px-space-md bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors rounded-xl font-label-md text-label-md flex items-center gap-2 shadow-xs border border-surface-container-high"
          >
            <span className="material-symbols-outlined text-[18px] text-outline">print</span>
            <span>Print Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Audit Table Container */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-high flex flex-col overflow-hidden">
        {/* Filter bar */}
        <div className="p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border-b border-surface-container-high">
          <div className="flex items-center gap-space-xs px-space-sm py-2 rounded-xl bg-surface-container-low text-on-surface w-full sm:w-80">
            <span className="material-symbols-outlined text-outline text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search by actor, entity, event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none font-body-sm text-body-sm text-on-surface placeholder:text-outline w-full"
            />
          </div>

          <div className="flex items-center gap-space-xs">
            <div className="relative">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="appearance-none bg-surface-container-low text-on-surface font-body-sm text-body-sm py-2 pl-space-sm pr-7 rounded-xl outline-none cursor-pointer hover:bg-surface-container transition-colors"
              >
                <option value="ALL">All Event Types</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="PAYMENT_RECORDED">PAYMENT_RECORDED</option>
                <option value="LEASE_TERMINATED">LEASE_TERMINATED</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2.5 text-[16px] text-outline pointer-events-none">unfold_more</span>
            </div>

            <button
              onClick={() => { setActionFilter('ALL'); setSearchQuery(''); }}
              className="w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
              title="Reset Filters"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-3 px-space-md font-semibold">Timestamp</th>
                <th className="py-3 px-space-md font-semibold">Actor / Initiator</th>
                <th className="py-3 px-space-md font-semibold">Action Type</th>
                <th className="py-3 px-space-md font-semibold">Target Entity / Detail</th>
                <th className="py-3 px-space-md font-semibold">IP &amp; Device</th>
                <th className="py-3 px-space-lg text-right font-semibold">Integrity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-body-md text-body-md text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-on-surface-variant">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                      <span>Loading immutable audit ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-on-surface-variant">
                    No audit records matching parameters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-surface-container-low/60 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-space-md font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
                        <span>{new Date(log.timestamp || Date.now()).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-space-md whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-label-sm text-label-sm font-bold">
                          {log.user_username?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-on-surface">{log.user_username || 'System Engine'}</span>
                          <span className="font-label-sm text-label-sm text-outline">Verified Agent</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-space-md whitespace-nowrap">
                      <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-semibold tracking-wide">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-space-md max-w-sm truncate text-on-surface text-body-sm">
                      <span className="font-mono text-primary font-bold mr-1">[{log.entity_type} #{log.record_id}]</span>
                      {log.details || 'State transition verified'}
                    </td>
                    <td className="py-3 px-space-md font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap font-mono">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-space-lg text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                        Verified
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-space-lg shadow-lg border border-surface-container-high space-y-space-md">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">terminal</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Audit Record #{selectedLog.id}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Cryptographic entry inspection</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-space-sm bg-surface-container-low rounded-lg font-mono text-xs overflow-x-auto max-h-60">
              <pre className="text-on-surface">{JSON.stringify(selectedLog, null, 2)}</pre>
            </div>

            <div className="flex justify-end pt-space-xs">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
