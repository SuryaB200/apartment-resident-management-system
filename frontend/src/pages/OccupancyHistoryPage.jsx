import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function OccupancyHistoryPage() {
  const { user, isResident } = useAuth();
  const [records, setRecords] = useState([]);
  const [flats, setFlats] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedFlatId, setSelectedFlatId] = useState(null);

  // Assign Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    flat: '',
    resident: '',
    occupancy_type: 'TENANT',
    move_in_date: new Date().toISOString().split('T')[0],
    agreement_reference: '',
    rent_amount: '20000.00',
    deposit_amount: '50000.00',
    notes: 'Standard lease contract',
  });
  const [saving, setSaving] = useState(false);

  // Terminate Modal
  const [terminateModal, setTerminateModal] = useState(null);
  const [terminateData, setTerminateData] = useState({
    move_out_date: new Date().toISOString().split('T')[0],
    notes: 'Tenancy concluded on lease expiration.',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hRes, fRes, rRes] = await Promise.all([
        api.occupancy.getHistory(`?status=${statusFilter}`),
        api.properties.getFlats(''),
        api.residents.getResidents('')
      ]);
      const recList = hRes.results || hRes;
      const flatList = fRes.results || fRes;
      const resList = rRes.results || rRes;
      setRecords(recList);
      setFlats(flatList);
      setResidents(resList);
      if (flatList.length > 0 && !formData.flat) {
        setFormData(prev => ({ ...prev, flat: flatList[0].id }));
        setSelectedFlatId(flatList[0].id);
      }
      if (resList.length > 0 && !formData.resident) {
        setFormData(prev => ({ ...prev, resident: resList[0].id }));
      }
    } catch (err) {
      alert("Error loading temporal records: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleCreateOccupancy = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.occupancy.createOccupancy(formData);
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert("Failed to record move-in: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTerminateOccupancy = async (e) => {
    e.preventDefault();
    if (!terminateModal) return;
    setSaving(true);
    try {
      await api.occupancy.terminate(terminateModal.id, terminateData);
      setTerminateModal(null);
      fetchData();
    } catch (err) {
      alert("Failed to terminate tenancy: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredRecords = records.filter(r => {
    if (!search) return true;
    const term = search.toLowerCase();
    const flatNo = r.flat_number || r.flat?.flat_number || '';
    const resName = r.resident_name || r.resident?.name || '';
    return flatNo.toLowerCase().includes(term) || resName.toLowerCase().includes(term);
  });

  const activeCount = records.filter(r => r.is_active).length;
  const vacatedCount = records.filter(r => !r.is_active).length;

  return (
    <div className="space-y-space-md max-w-7xl mx-auto">
      {/* ======================================================== */}
      {/* 1. DESKTOP VIEW (Visible on md and larger screens)        */}
      {/* ======================================================== */}
      <div className="hidden md:block space-y-space-md">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-xs">
          <div>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Temporal Occupancy History</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Append-only temporal records ensuring historical auditability across tenant turnovers.
            </p>
          </div>
          {!isResident && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-inverse-surface text-on-primary text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_home</span>
              <span>+ Record Move-In / Transfer</span>
            </button>
          )}
        </div>

        {/* Life-Cycle Progress Timeline Strip */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-xs space-y-space-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-on-surface uppercase tracking-wider">
              Temporal Lifecycle State Machine
            </span>
            <span className="text-secondary font-mono text-[11px]">Constraint: move_out &gt;= move_in</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center">1</span>
                <span className="text-xs font-bold text-on-surface">Ingestion &amp; KYC</span>
              </div>
              <p className="text-[11px] text-secondary">Aadhaar/PAN verification with digital lease attachment</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">2</span>
                <span className="text-xs font-bold text-on-surface">Active Lease</span>
              </div>
              <p className="text-[11px] text-secondary">Monthly maintenance billing &amp; gate pass authorization</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-secondary text-white text-[10px] font-bold flex items-center justify-center">3</span>
                <span className="text-xs font-bold text-on-surface">Reconciliation</span>
              </div>
              <p className="text-[11px] text-secondary">Deposit settlement and move_out_date timestamp commit</p>
            </div>
          </div>
        </div>

        {/* Desktop Data Table */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs overflow-hidden">
          <div className="p-space-md flex flex-wrap items-center justify-between gap-space-sm border-b border-outline-variant/20 bg-surface-container-lowest">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-low text-on-surface w-72 border border-outline-variant/20">
              <span className="material-symbols-outlined text-secondary text-[18px]">search</span>
              <input
                type="text"
                placeholder="Search flat number, resident..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-on-surface placeholder:text-outline w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-surface-container-low text-on-surface py-1.5 px-3 rounded-xl border border-outline-variant/20 outline-none cursor-pointer"
              >
                <option value="">Status: All ({records.length})</option>
                <option value="ACTIVE">Active ({activeCount})</option>
                <option value="TERMINATED">Concluded ({vacatedCount})</option>
              </select>

              <button
                onClick={() => { setStatusFilter(''); setSearch(''); }}
                className="p-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-secondary transition cursor-pointer"
                title="Reset"
              >
                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-on-surface-variant uppercase font-semibold border-b border-outline-variant/20">
                <tr>
                  <th className="py-3 px-space-md">ID</th>
                  <th className="py-3 px-space-md">Unit</th>
                  <th className="py-3 px-space-md">Resident Name</th>
                  <th className="py-3 px-space-md">Class</th>
                  <th className="py-3 px-space-md">Move In</th>
                  <th className="py-3 px-space-md">Move Out</th>
                  <th className="py-3 px-space-md">Police KYC</th>
                  <th className="py-3 px-space-md">Status</th>
                  <th className="py-3 px-space-md text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-on-surface-variant">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                        <span>Loading temporal records...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-on-surface-variant">
                      No tenancy records found.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => {
                    const isAct = r.is_active;
                    return (
                      <tr key={r.id} className="hover:bg-surface-container-low/60 transition">
                        <td className="py-3 px-space-md font-mono text-secondary">
                          #{r.id}
                        </td>
                        <td className="py-3 px-space-md font-bold text-primary">
                          {r.flat_number || `Flat #${r.flat}`}
                        </td>
                        <td className="py-3 px-space-md font-semibold text-on-surface">
                          {r.resident_name || `Resident #${r.resident}`}
                        </td>
                        <td className="py-3 px-space-md">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-container text-secondary">
                            {r.occupancy_type || 'TENANT'}
                          </span>
                        </td>
                        <td className="py-3 px-space-md font-mono text-on-surface-variant">
                          {r.move_in_date}
                        </td>
                        <td className="py-3 px-space-md font-mono text-on-surface-variant">
                          {r.move_out_date || <span className="text-emerald-700 font-semibold">Current (Open)</span>}
                        </td>
                        <td className="py-3 px-space-md">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {r.police_verification_status || 'Verified'}
                          </span>
                        </td>
                        <td className="py-3 px-space-md">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isAct
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${isAct ? 'bg-emerald-600' : 'bg-slate-500'}`}
                            ></span>
                            {isAct ? 'Active Lease' : 'Concluded'}
                          </span>
                        </td>
                        <td className="py-3 px-space-md text-right">
                          {isAct && !isResident && (
                            <button
                              onClick={() => {
                                setTerminateModal(r);
                                setTerminateData({
                                  move_out_date: new Date().toISOString().split('T')[0],
                                  notes: 'Tenancy concluded smoothly.'
                                });
                              }}
                              className="px-2.5 py-1 rounded-lg bg-surface-container-low hover:bg-error-container/40 text-on-surface hover:text-error text-xs font-semibold border border-outline-variant/20 transition cursor-pointer"
                            >
                              Conclude
                            </button>
                          )}
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

      {/* ======================================================== */}
      {/* 2. MOBILE VIEW (Visible on < md screens)                  */}
      {/* Ported from occupancy_history_minimal_mobile/code.html    */}
      {/* ======================================================== */}
      <div className="block md:hidden space-y-space-sm pb-12">
        {/* Mobile Header & Export Action */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-xl font-bold text-on-surface tracking-tight">Occupancy History</h1>
            <p className="text-xs text-on-surface-variant">Chronological Tenancy Records</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="h-9 px-3 rounded-xl bg-primary text-on-primary text-xs font-semibold flex items-center gap-1 shadow-xs active:scale-95 transition"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>+ Lease</span>
          </button>
        </div>

        {/* Quick Stats Banner (from mobile spec) */}
        <div className="w-full bg-surface-container rounded-xl p-3 shadow-xs relative overflow-hidden border border-outline-variant/20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary shadow-xs shrink-0">
                <span className="material-symbols-outlined text-[20px]">history_edu</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Aggregate Metrics</span>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs font-bold text-on-surface">
                  <span className="font-mono">{records.length}</span>
                  <span className="text-secondary font-normal">Records</span>
                  <span className="text-outline-variant">·</span>
                  <span className="font-mono text-emerald-700">{activeCount}</span>
                  <span className="text-secondary font-normal">Active</span>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-high px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-bold text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>Live Ledger</span>
            </div>
          </div>
        </div>

        {/* Search Input Container */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search flat or resident..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline text-xs outline-none focus:bg-surface-container transition border border-outline-variant/20"
          />
        </div>

        {/* Mobile Vertical Timeline Cards List */}
        <div className="space-y-3 pt-1">
          {loading ? (
            <div className="p-8 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/20">
              <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block mr-2"></span>
              <span className="text-xs text-on-surface-variant">Loading tenancy history...</span>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-8 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/20">
              <span className="material-symbols-outlined text-secondary text-[24px]">search_off</span>
              <p className="text-xs text-on-surface-variant mt-1">No tenancy history found</p>
            </div>
          ) : (
            filteredRecords.map((r) => {
              const isAct = r.is_active;
              return (
                <div
                  key={r.id}
                  className="bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/20 shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-surface-container text-primary flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-[16px]">apartment</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-on-surface">
                          {r.flat_number || `Flat #${r.flat}`}
                        </span>
                        <div className="text-[10px] text-secondary">
                          Lease ID #{r.id} · {r.occupancy_type || 'TENANT'}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                        isAct
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${isAct ? 'bg-emerald-600' : 'bg-slate-500'}`}
                      ></span>
                      {isAct ? 'Active' : 'Concluded'}
                    </span>
                  </div>

                  {/* Timeline Node Content */}
                  <div className="relative pl-5 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container-highest">
                    <div className="relative">
                      <div className="absolute -left-5 top-1 w-4 h-4 rounded-full bg-surface-container-lowest flex items-center justify-center">
                        <span className={`w-2.5 h-2.5 rounded-full ${isAct ? 'bg-primary ring-2 ring-primary/20' : 'bg-secondary'}`}></span>
                      </div>
                      <div className="bg-surface-container-low p-2.5 rounded-xl space-y-1 border border-outline-variant/15">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-on-surface">{r.resident_name || `Resident #${r.resident}`}</span>
                          <span className="text-[10px] text-secondary font-medium">Verified KYC</span>
                        </div>
                        <div className="flex items-center text-[11px] text-on-surface-variant gap-1">
                          <span className="material-symbols-outlined text-[14px] text-secondary">calendar_month</span>
                          <span>{r.move_in_date} → {r.move_out_date || 'Present'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-secondary pt-0.5 font-mono">
                          <span className="material-symbols-outlined text-[12px]">verified_user</span>
                          <span>Police Verification: {r.police_verification_status || 'Verified'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  {isAct && !isResident && (
                    <div className="flex justify-end pt-1 border-t border-outline-variant/15">
                      <button
                        onClick={() => {
                          setTerminateModal(r);
                          setTerminateData({
                            move_out_date: new Date().toISOString().split('T')[0],
                            notes: 'Tenancy concluded on lease expiration.'
                          });
                        }}
                        className="px-3 py-1 rounded-lg bg-surface-container-low hover:bg-error-container/40 text-on-surface hover:text-error text-xs font-semibold border border-outline-variant/20 transition"
                      >
                        Conclude Tenancy
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MODALS (Used across both Desktop & Mobile)            */}
      {/* ======================================================== */}
      {/* Move-In Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-inverse-surface/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant/30 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">add_home</span>
                <h2 className="text-base font-bold text-on-surface">Record Tenancy Move-In (3NF)</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-secondary hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateOccupancy} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase mb-1">Target Flat</label>
                  <select
                    required
                    value={formData.flat}
                    onChange={(e) => setFormData({ ...formData, flat: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl outline-none"
                  >
                    {flats.map(f => (
                      <option key={f.id} value={f.id}>Flat {f.flat_number} ({f.bhk_type})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase mb-1">Resident</label>
                  <select
                    required
                    value={formData.resident}
                    onChange={(e) => setFormData({ ...formData, resident: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl outline-none"
                  >
                    {residents.map(r => (
                      <option key={r.id} value={r.id}>{r.full_name || r.name} ({r.resident_type || 'Tenant'})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase mb-1">Move-In Date</label>
                  <input
                    type="date"
                    required
                    value={formData.move_in_date}
                    onChange={(e) => setFormData({ ...formData, move_in_date: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase mb-1">Class</label>
                  <select
                    value={formData.occupancy_type}
                    onChange={(e) => setFormData({ ...formData, occupancy_type: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl outline-none"
                  >
                    <option value="TENANT">Tenant</option>
                    <option value="OWNER">Owner</option>
                    <option value="FAMILY">Family Member</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase mb-1">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.rent_amount}
                    onChange={(e) => setFormData({ ...formData, rent_amount: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase mb-1">Deposit (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.deposit_amount}
                    onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-secondary hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {saving ? 'Writing Temporal Record...' : 'Confirm Move-In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Terminate Tenancy Modal */}
      {terminateModal && (
        <div className="fixed inset-0 bg-inverse-surface/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/30 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-[22px]">logout</span>
                <h2 className="text-base font-bold text-on-surface">Conclude Tenancy</h2>
              </div>
              <button
                onClick={() => setTerminateModal(null)}
                className="p-1 rounded-full text-secondary hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleTerminateOccupancy} className="space-y-3.5">
              <div className="p-3 rounded-xl bg-surface-container-low text-xs space-y-1">
                <div>Unit: <strong className="text-on-surface">{terminateModal.flat_number || `Flat #${terminateModal.flat}`}</strong></div>
                <div>Resident: <strong className="text-on-surface">{terminateModal.resident_name || `Resident #${terminateModal.resident}`}</strong></div>
                <div>Move-In: <span className="font-mono">{terminateModal.move_in_date}</span></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary uppercase mb-1">Move-Out Date</label>
                <input
                  type="date"
                  required
                  value={terminateData.move_out_date}
                  onChange={(e) => setTerminateData({ ...terminateData, move_out_date: e.target.value })}
                  className="w-full h-9 px-3 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary uppercase mb-1">Vacate Notes</label>
                <textarea
                  rows="2"
                  value={terminateData.notes}
                  onChange={(e) => setTerminateData({ ...terminateData, notes: e.target.value })}
                  className="w-full p-2.5 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setTerminateModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-secondary hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-error text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {saving ? 'Closing Tenancy...' : 'Confirm Move-Out'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
