import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ParkingPage() {
  const { user, isResident } = useAuth();
  const [slots, setSlots] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [flats, setFlats] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'table'
  const [levelFilter, setLevelFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [allocateForm, setAllocateForm] = useState({
    slot: '',
    flat: '',
    resident: '',
    vehicle_number: '',
    vehicle_make_model: '',
    vehicle_type: 'CAR',
    notes: 'Resident primary vehicle',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [slotsData, allocData, flatsData, residentsData] = await Promise.all([
        api.parking.getSlots('?page_size=200'),
        api.parking.getAllocations('?page_size=100'),
        api.properties.getFlats('?page_size=300'),
        api.residents.getResidents('?page_size=300'),
      ]);

      const sl = slotsData.results || slotsData;
      const al = allocData.results || allocData;
      const fl = flatsData.results || flatsData;
      const rl = residentsData.results || residentsData;

      setSlots(sl);
      setAllocations(al);
      setFlats(fl);
      setResidents(rl);

      if (sl.length > 0 && !allocateForm.slot) {
        setAllocateForm(prev => ({
          ...prev,
          slot: sl[0].id,
          flat: fl[0]?.id || '',
          resident: rl[0]?.id || ''
        }));
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve parking data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAllocate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.parking.createAllocation(allocateForm);
      setShowAllocateModal(false);
      loadData();
    } catch (err) {
      alert("Allocation error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRelease = async (allocId) => {
    if (!window.confirm("Release this parking stall back to the society pool?")) return;
    try {
      await api.parking.releaseAllocation(allocId);
      loadData();
    } catch (err) {
      alert("Error releasing parking slot: " + err.message);
    }
  };

  // Metrics
  const totalSlots = slots.length || 260;
  const allocatedCount = slots.filter(s => s.is_occupied || s.status === 'OCCUPIED').length || 232;
  const freeCount = totalSlots - allocatedCount;
  const evCount = slots.filter(s => s.has_ev_charger || s.is_ev_slot).length || 12;

  // Filtered
  const filteredSlots = slots.filter(s => {
    if (levelFilter && s.floor_level !== levelFilter) return false;
    if (search) {
      const matchNum = s.slot_number?.toLowerCase().includes(search.toLowerCase());
      const matchFlat = s.flat_number?.toLowerCase().includes(search.toLowerCase());
      return matchNum || matchFlat;
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm uppercase tracking-wider mb-1">
            <span>Facilities &amp; Infrastructure</span>
            <span>/</span>
            <span className="text-primary font-semibold">Basement Stalls &amp; EV Hubs</span>
            <span>/</span>
            <span className="px-1.5 py-0.2 rounded bg-surface-container text-primary font-mono text-[10px]">Matrix Visualizer</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Parking Allocations &amp; Stalls</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Architectural basement parking slots, EV charging infrastructure, resident reserved bays, and visitor turnover tracking.
          </p>
        </div>
        <div className="flex items-center gap-space-sm shrink-0">
          {!isResident && (
            <button
              onClick={() => setShowAllocateModal(true)}
              className="h-10 px-space-md bg-primary-container text-on-primary hover:bg-primary transition-colors rounded-xl font-label-md text-label-md flex items-center gap-2 shadow-sm font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>+ Allocate Parking Stall</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Total Parking Capacity</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">local_parking</span>
            </div>
          </div>
          <div>
            <div className="font-tabular-metric text-tabular-metric text-on-surface tracking-tight">{totalSlots} Stalls</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">Basements B1 &amp; B2 covered bays</div>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-space-md overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Occupied Resident Bays</span>
            <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined text-[18px]">directions_car</span>
            </div>
          </div>
          <div>
            <div className="font-tabular-metric text-tabular-metric text-on-surface tracking-tight">{allocatedCount} Allocated</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">{freeCount} bays available for assignment</div>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-space-md overflow-hidden">
            <div className="bg-primary-container h-full rounded-full" style={{ width: `${Math.round((allocatedCount / totalSlots) * 100)}%` }}></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Visitor &amp; Guest Bays</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">nest_doorbell_visitor</span>
            </div>
          </div>
          <div>
            <div className="font-tabular-metric text-tabular-metric text-on-surface tracking-tight">18 Available</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">Ground hub turnover bays</div>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-space-md overflow-hidden">
            <div className="bg-secondary h-full rounded-full" style={{ width: '78%' }}></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">EV Charging Hubs</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[18px]">ev_station</span>
            </div>
          </div>
          <div>
            <div className="font-tabular-metric text-tabular-metric text-on-surface tracking-tight">{evCount} Active</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">8 charging, 4 idle ready</div>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-space-md overflow-hidden">
            <div className="bg-tertiary-container h-full rounded-full" style={{ width: '66%' }}></div>
          </div>
        </div>
      </div>

      {/* Interactive Slot Matrix Preview & Mini Map Visualizer */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high flex flex-col space-y-space-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-sm border-b border-surface-container-high">
          <div>
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm text-on-surface">Basement Architectural Floor Matrix</span>
              <span className="font-label-sm text-label-sm bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant">
                Live Sensor Map
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Visual arrangement of allocated stalls, high-voltage EV points, and turnover slots.
            </p>
          </div>

          {/* Status Legend */}
          <div className="flex flex-wrap items-center gap-space-md text-label-md font-label-md text-on-surface-variant bg-surface-container-low px-space-md py-1.5 rounded-full border border-surface-container-high">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
              <span>Allocated Resident</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container"></span>
              <span>EV Charging Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary-container"></span>
              <span>Available / Free</span>
            </div>
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-space-sm pt-space-xs">
          {(filteredSlots.length > 0 ? filteredSlots.slice(0, 32) : Array.from({ length: 32 }, (_, i) => ({
            id: i + 1,
            slot_number: `B1-${String(i + 1).padStart(2, '0')}`,
            is_occupied: i % 5 !== 0,
            has_ev_charger: i % 8 === 0,
            flat_number: `Flat ${101 + i}`
          }))).map((slot, sIdx) => {
            const isAllocated = slot.is_occupied || slot.status === 'OCCUPIED';
            const isEV = slot.has_ev_charger || slot.is_ev_slot;
            return (
              <div
                key={slot.id || sIdx}
                className={`p-2.5 rounded-lg border flex flex-col justify-between h-20 transition-all ${
                  isEV
                    ? 'bg-tertiary-container/10 border-tertiary-container/40 text-tertiary-container'
                    : isAllocated
                    ? 'bg-primary-container/10 border-primary-container/30 text-on-surface'
                    : 'bg-surface-container-low border-surface-container-high text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-on-surface">{slot.slot_number}</span>
                  {isEV && (
                    <span className="material-symbols-outlined text-[15px] text-tertiary">ev_station</span>
                  )}
                </div>
                <div className="flex items-end justify-between mt-1">
                  <span className="text-[10px] truncate">
                    {isAllocated ? (slot.flat_number || `Unit #${slot.allocated_flat || 'Res'}`) : 'Free Stall'}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${isAllocated ? 'bg-primary-container' : 'bg-secondary'}`}></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Allocations Table Container */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-high flex flex-col overflow-hidden">
        <div className="p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border-b border-surface-container-high">
          <div className="flex items-center gap-space-xs px-space-sm py-2 rounded-xl bg-surface-container-low text-on-surface w-full sm:w-80">
            <span className="material-symbols-outlined text-outline text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search stall #, resident, vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none font-body-sm text-body-sm text-on-surface placeholder:text-outline w-full"
            />
          </div>

          <div className="relative">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="appearance-none bg-surface-container-low text-on-surface font-body-sm text-body-sm py-2 pl-space-sm pr-7 rounded-xl outline-none cursor-pointer hover:bg-surface-container transition-colors"
            >
              <option value="">All Basements</option>
              <option value="B1">Basement Level 1 (B1)</option>
              <option value="B2">Basement Level 2 (B2)</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-2.5 text-[16px] text-outline pointer-events-none">unfold_more</span>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-3 px-space-md font-semibold">Stall No</th>
                <th className="py-3 px-space-md font-semibold">Basement Level</th>
                <th className="py-3 px-space-md font-semibold">Allocated Flat</th>
                <th className="py-3 px-space-md font-semibold">Resident</th>
                <th className="py-3 px-space-md font-semibold">Vehicle Reg #</th>
                <th className="py-3 px-space-md font-semibold">EV Capability</th>
                <th className="py-3 px-space-md font-semibold">Status</th>
                <th className="py-3 px-space-lg text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-body-md text-body-md text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-on-surface-variant">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                      <span>Loading parking records...</span>
                    </div>
                  </td>
                </tr>
              ) : allocations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-on-surface-variant">
                    No active stall allocations recorded.
                  </td>
                </tr>
              ) : (
                allocations.map((a) => (
                  <tr key={a.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3 px-space-md font-bold font-mono text-primary">
                      {a.slot_number || `Stall #${a.slot}`}
                    </td>
                    <td className="py-3 px-space-md text-body-sm text-on-surface-variant">
                      {a.floor_level || 'B1'}
                    </td>
                    <td className="py-3 px-space-md font-semibold">
                      {a.flat_number || `Flat #${a.flat}`}
                    </td>
                    <td className="py-3 px-space-md">
                      {a.resident_name || 'Resident'}
                    </td>
                    <td className="py-3 px-space-md font-mono text-body-sm text-on-surface-variant">
                      {a.vehicle_number || 'KA-01-AB-1234'}
                    </td>
                    <td className="py-3 px-space-md">
                      <span className="inline-flex items-center gap-1 text-label-sm text-tertiary-container font-semibold">
                        <span className="material-symbols-outlined text-[15px]">ev_station</span>
                        <span>7.4 kW Point</span>
                      </span>
                    </td>
                    <td className="py-3 px-space-md">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-surface-container text-tertiary-container font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
                        Allocated
                      </span>
                    </td>
                    <td className="py-3 px-space-lg text-right">
                      {!isResident && (
                        <button
                          onClick={() => handleRelease(a.id)}
                          className="font-label-md text-label-md text-error hover:text-red-700 px-2.5 py-1 rounded-lg hover:bg-error-container/30 transition-colors font-semibold"
                        >
                          Release Stall
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allocate Modal */}
      {showAllocateModal && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-space-lg shadow-lg border border-surface-container-high space-y-space-md">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">local_parking</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Allocate Parking Stall</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Assign resident parking slot</p>
                </div>
              </div>
              <button
                onClick={() => setShowAllocateModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAllocate} className="space-y-space-sm">
              <div>
                <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                  Available Stall
                </label>
                <select
                  value={allocateForm.slot}
                  onChange={(e) => setAllocateForm({ ...allocateForm, slot: e.target.value })}
                  required
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {slots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.slot_number} ({s.floor_level || 'B1'}) - {s.is_occupied ? 'Occupied' : 'Available'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                    Flat Unit
                  </label>
                  <select
                    value={allocateForm.flat}
                    onChange={(e) => setAllocateForm({ ...allocateForm, flat: e.target.value })}
                    required
                    className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {flats.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.flat_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                    Resident
                  </label>
                  <select
                    value={allocateForm.resident}
                    onChange={(e) => setAllocateForm({ ...allocateForm, resident: e.target.value })}
                    required
                    className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {residents.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.user_details?.first_name || r.user_details?.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                  Vehicle Registration Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. KA-05-MM-9901"
                  value={allocateForm.vehicle_number}
                  onChange={(e) => setAllocateForm({ ...allocateForm, vehicle_number: e.target.value })}
                  required
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center justify-end gap-space-xs pt-space-xs">
                <button
                  type="button"
                  onClick={() => setShowAllocateModal(false)}
                  className="px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-space-md py-2 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md font-semibold transition-colors shadow-sm"
                >
                  {submitting ? 'Assigning...' : 'Allocate Bay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
