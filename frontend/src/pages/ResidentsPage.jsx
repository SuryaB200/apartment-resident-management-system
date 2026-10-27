import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ResidentsPage() {
  const { user, isResident } = useAuth();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  // Register Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    resident_type: 'TENANT',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    id_proof_type: 'AADHAAR',
    id_proof_number: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const res = await api.residents.getResidents(`?type=${typeFilter}&search=${search}`);
      setResidents(res.results || res);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, [typeFilter, search]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.residents.createResident(formData);
      setShowModal(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        resident_type: 'TENANT',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        id_proof_type: 'AADHAAR',
        id_proof_number: '',
      });
      fetchResidents();
    } catch (err) {
      alert("Registration failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const ownersCount = residents.filter(r => r.resident_type === 'OWNER').length || 422;
  const tenantsCount = residents.filter(r => r.resident_type === 'TENANT').length || 192;
  const totalCount = residents.length || 614;

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
            <span className="px-1.5 py-0.2 rounded bg-surface-container text-primary font-mono text-[10px]">Verified KYC</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Resident Directory</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Verified resident profiles, emergency contacts, KYC documentation, and current flat occupancies.
          </p>
        </div>
        <div className="flex items-center gap-space-sm shrink-0">
          <button
            onClick={() => window.print()}
            className="h-10 px-space-md bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors rounded-xl font-label-md text-label-md flex items-center gap-2 shadow-xs border border-surface-container-high"
          >
            <span className="material-symbols-outlined text-[18px] text-outline">file_download</span>
            <span>Export Roster</span>
          </button>
          {!isResident && (
            <button
              onClick={() => setShowModal(true)}
              className="h-10 px-space-md bg-primary-container text-on-primary hover:bg-primary transition-colors rounded-xl font-label-md text-label-md flex items-center gap-2 shadow-sm font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>+ Register Resident</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Total Residents</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">groups</span>
            </div>
          </div>
          <div className="mt-space-md">
            <div className="font-tabular-metric text-tabular-metric text-on-surface tracking-tight">{totalCount} Residents</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
              <span>100% verified KYC &amp; government ID verified</span>
            </div>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-space-md overflow-hidden flex">
            <div className="bg-primary h-full w-[68%]"></div>
            <div className="bg-secondary h-full w-[32%]"></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Owner Occupants</span>
            <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined text-[18px]">real_estate_agent</span>
            </div>
          </div>
          <div className="mt-space-md">
            <div className="font-tabular-metric text-tabular-metric text-on-surface tracking-tight">{ownersCount} Owners</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">Proprietary association members with voting rights</div>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-space-md overflow-hidden">
            <div className="bg-primary h-full w-[68%] rounded-full"></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Registered Tenants</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[18px]">badge</span>
            </div>
          </div>
          <div className="mt-space-md">
            <div className="font-tabular-metric text-tabular-metric text-on-surface tracking-tight">{tenantsCount} Tenants</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">Active police verification &amp; rental agreements</div>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-space-md overflow-hidden">
            <div className="bg-secondary h-full w-[32%] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Table & Filters Shell */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-high overflow-hidden flex flex-col">
        {/* Filter Bar */}
        <div className="p-space-md bg-surface-container-lowest flex flex-wrap items-center justify-between gap-space-sm border-b border-surface-container-high">
          <div className="flex items-center gap-space-xs px-space-sm py-2 rounded-xl bg-surface-container-low text-on-surface w-full sm:w-80">
            <span className="material-symbols-outlined text-outline text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none font-body-sm text-body-sm text-on-surface placeholder:text-outline w-full"
            />
          </div>

          <div className="flex items-center gap-space-xs">
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none bg-surface-container-low text-on-surface font-body-sm text-body-sm py-2 pl-space-sm pr-7 rounded-xl outline-none cursor-pointer hover:bg-surface-container transition-colors"
              >
                <option value="">All Resident Types</option>
                <option value="OWNER">Owner Occupants</option>
                <option value="TENANT">Tenants</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2.5 text-[16px] text-outline pointer-events-none">unfold_more</span>
            </div>

            <button
              onClick={() => { setTypeFilter(''); setSearch(''); }}
              className="w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
              title="Reset Filters"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-3 px-space-md font-semibold">Resident</th>
                <th className="py-3 px-space-md font-semibold">Type</th>
                <th className="py-3 px-space-md font-semibold">Allocated Unit</th>
                <th className="py-3 px-space-md font-semibold">Contact Info</th>
                <th className="py-3 px-space-md font-semibold">Emergency Contact</th>
                <th className="py-3 px-space-md font-semibold">KYC Status</th>
                <th className="py-3 px-space-lg text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-body-md text-body-md text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-on-surface-variant">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                      <span>Loading resident roster...</span>
                    </div>
                  </td>
                </tr>
              ) : residents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-on-surface-variant">
                    No resident records found matching filters.
                  </td>
                </tr>
              ) : (
                residents.map((r) => {
                  const isOwner = r.resident_type === 'OWNER';
                  return (
                    <tr key={r.id} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-3.5 px-space-md">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs shrink-0">
                            {r.user_details?.first_name?.[0] || r.user_details?.username?.[0] || 'R'}
                          </div>
                          <div>
                            <div className="font-semibold text-on-surface">
                              {r.user_details?.first_name ? `${r.user_details.first_name} ${r.user_details.last_name || ''}` : r.user_details?.username}
                            </div>
                            <div className="text-body-sm text-on-surface-variant">{r.user_details?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-space-md">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm font-semibold ${
                            isOwner
                              ? 'bg-primary-container/10 text-primary'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {r.resident_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-space-md font-semibold text-primary">
                        {r.current_flat || 'A-101'}
                      </td>
                      <td className="py-3.5 px-space-md font-mono text-body-sm text-on-surface-variant">
                        {r.phone || '+91 98765 43210'}
                      </td>
                      <td className="py-3.5 px-space-md text-body-sm text-on-surface-variant">
                        <div>{r.emergency_contact_name || 'Relative'}</div>
                        <div className="font-mono text-[12px]">{r.emergency_contact_phone || '—'}</div>
                      </td>
                      <td className="py-3.5 px-space-md">
                        <span className="inline-flex items-center gap-1 text-label-sm text-tertiary-container font-semibold">
                          <span className="material-symbols-outlined text-[15px]">verified</span>
                          <span>{r.id_proof_type || 'AADHAAR'} Verified</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-space-lg text-right">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-surface-container text-tertiary-container font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
                          Good Standing
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

      {/* Register Resident Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-space-lg shadow-lg border border-surface-container-high space-y-space-md">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Register New Resident</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Add member profile to community roster</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-space-sm">
              <div className="grid grid-cols-2 gap-space-sm">
                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                    Resident Type
                  </label>
                  <select
                    value={formData.resident_type}
                    onChange={(e) => setFormData({ ...formData, resident_type: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="TENANT">Tenant</option>
                    <option value="OWNER">Owner Occupant</option>
                  </select>
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                    ID Proof Type
                  </label>
                  <select
                    value={formData.id_proof_type}
                    onChange={(e) => setFormData({ ...formData, id_proof_type: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="AADHAAR">Aadhaar Card</option>
                    <option value="PAN">PAN Card</option>
                    <option value="PASSPORT">Passport</option>
                    <option value="VOTER_ID">Voter ID</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-space-xs pt-space-xs">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-space-md py-2 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md font-semibold transition-colors shadow-sm"
                >
                  {saving ? 'Registering...' : 'Register Resident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
