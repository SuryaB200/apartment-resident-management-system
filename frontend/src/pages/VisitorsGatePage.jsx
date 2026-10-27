import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function VisitorsGatePage() {
  const { user, isResident } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState('all'); // all, active, deliveries, guests
  const [purposeFilter, setPurposeFilter] = useState('');
  const [search, setSearch] = useState('');

  // Fast Check-In Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    visitor_name: '',
    phone_number: '',
    destination_flat: '',
    purpose: 'GUEST',
    vehicle_number: '',
    gate_name: 'Main Gate 01',
    notes: 'Intercom cleared by resident',
  });
  const [checkingIn, setCheckingIn] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = `?purpose=${purposeFilter}&search=${search}`;
      const [vRes, fRes] = await Promise.all([
        api.visitors.getLogs(params),
        api.properties.getFlats('')
      ]);
      setVisitors(vRes.results || vRes);
      const fl = fRes.results || fRes;
      setFlats(fl);
      if (fl.length > 0 && !formData.destination_flat) {
        setFormData(prev => ({ ...prev, destination_flat: fl[0].id }));
      }
    } catch (err) {
      alert("Error loading visitor logs: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [purposeFilter, search]);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setCheckingIn(true);
    try {
      await api.visitors.checkin(formData);
      setShowModal(false);
      setFormData({
        visitor_name: '',
        phone_number: '',
        destination_flat: flats[0]?.id || '',
        purpose: 'GUEST',
        vehicle_number: '',
        gate_name: 'Main Gate 01',
        notes: 'Intercom cleared by resident',
      });
      fetchData();
    } catch (err) {
      alert("Check-in error: " + err.message);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await api.visitors.checkout(id);
      fetchData();
    } catch (err) {
      alert("Check-out error: " + err.message);
    }
  };

  const activeVisitors = visitors.filter(v => v.status === 'CHECKED_IN');
  const deliveryVisitors = visitors.filter(v => v.purpose === 'DELIVERY');
  const guestVisitors = visitors.filter(v => v.purpose === 'GUEST');

  const filteredVisitors = visitors.filter(v => {
    if (activeTab === 'active') return v.status === 'CHECKED_IN';
    if (activeTab === 'deliveries') return v.purpose === 'DELIVERY';
    if (activeTab === 'guests') return v.purpose === 'GUEST';
    return true;
  });

  return (
    <div className="space-y-space-md max-w-7xl mx-auto">
      {/* ======================================================== */}
      {/* 1. DESKTOP VIEW (Visible on md and larger screens)        */}
      {/* ======================================================== */}
      <div className="hidden md:block space-y-space-md">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-xs">
          <div>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Visitors &amp; Gate Control</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Physical perimeter security telemetry, guard attribution, and digital guest pass authorization.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-inverse-surface text-on-primary text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">badge</span>
            <span>+ Fast Check-In Pass</span>
          </button>
        </div>

        {/* 4 Metric Bento Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Inside Campus</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Live
              </span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-primary">{activeVisitors.length} Visitors</div>
              <div className="text-xs text-on-surface-variant mt-0.5">Checked in, not yet checked out</div>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[45%]"></div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Today's Entries</span>
              <span className="p-1 rounded bg-surface-container text-secondary">
                <span className="material-symbols-outlined text-[16px]">today</span>
              </span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-on-surface">{visitors.length} Passes</div>
              <div className="text-xs text-on-surface-variant mt-0.5">Main Gate 01 &amp; Service Gate 02</div>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-secondary h-full w-[80%]"></div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Deliveries Handled</span>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
                Courier &amp; Food
              </span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-on-surface">{deliveryVisitors.length} Deliveries</div>
              <div className="text-xs text-on-surface-variant mt-0.5">Swiggy, Amazon, Zomato</div>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-secondary-fixed-dim h-full w-[60%]"></div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Security Alerts</span>
              <span className="p-1 rounded bg-surface-container text-emerald-700">
                <span className="material-symbols-outlined text-[16px]">verified</span>
              </span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-emerald-700">0 Flagged</div>
              <div className="text-xs text-on-surface-variant mt-0.5">All visits verified by flat intercom</div>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full w-full"></div>
            </div>
          </div>
        </div>

        {/* Desktop Filter Toolbar & Table */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs overflow-hidden">
          <div className="p-space-md flex flex-wrap items-center justify-between gap-space-sm border-b border-outline-variant/20 bg-surface-container-lowest">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-low text-on-surface w-72 border border-outline-variant/20">
              <span className="material-symbols-outlined text-secondary text-[18px]">search</span>
              <input
                type="text"
                placeholder="Search visitor, vehicle, flat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-on-surface placeholder:text-outline w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/20">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  All ({visitors.length})
                </button>
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'active'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  Inside ({activeVisitors.length})
                </button>
                <button
                  onClick={() => setActiveTab('deliveries')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'deliveries'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  Deliveries ({deliveryVisitors.length})
                </button>
              </div>

              <select
                value={purposeFilter}
                onChange={(e) => setPurposeFilter(e.target.value)}
                className="text-xs bg-surface-container-low text-on-surface py-1.5 px-3 rounded-xl border border-outline-variant/20 outline-none cursor-pointer"
              >
                <option value="">Purpose: All</option>
                <option value="GUEST">Guest</option>
                <option value="DELIVERY">Delivery</option>
                <option value="SERVICE">Service Vendor</option>
                <option value="CAB">Cab / Taxi</option>
              </select>

              <button
                onClick={() => { setActiveTab('all'); setPurposeFilter(''); setSearch(''); }}
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
                  <th className="py-3 px-space-md">Pass No</th>
                  <th className="py-3 px-space-md">Visitor Name &amp; Phone</th>
                  <th className="py-3 px-space-md">Destination Unit</th>
                  <th className="py-3 px-space-md">Purpose</th>
                  <th className="py-3 px-space-md">Vehicle</th>
                  <th className="py-3 px-space-md">Check In</th>
                  <th className="py-3 px-space-md">Status</th>
                  <th className="py-3 px-space-md text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-on-surface-variant">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                        <span>Loading gate entries...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredVisitors.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-on-surface-variant">
                      No visitor records found.
                    </td>
                  </tr>
                ) : (
                  filteredVisitors.map((v) => {
                    const isInside = v.status === 'CHECKED_IN';
                    return (
                      <tr key={v.id} className="hover:bg-surface-container-low/60 transition">
                        <td className="py-3 px-space-md font-mono font-bold text-primary">
                          {v.pass_number || `PASS-${v.id}`}
                        </td>
                        <td className="py-3 px-space-md">
                          <div className="font-semibold text-on-surface">{v.visitor_name}</div>
                          <div className="text-[11px] text-secondary font-mono">{v.phone_number}</div>
                        </td>
                        <td className="py-3 px-space-md font-bold text-on-surface">
                          {v.destination_flat_code || (v.destination_flat ? `Flat #${v.destination_flat}` : 'General')}
                        </td>
                        <td className="py-3 px-space-md">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-container text-secondary">
                            {v.purpose}
                          </span>
                        </td>
                        <td className="py-3 px-space-md font-mono text-secondary">
                          {v.vehicle_number || 'Pedestrian'}
                        </td>
                        <td className="py-3 px-space-md font-mono text-secondary">
                          {v.check_in_time ? new Date(v.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </td>
                        <td className="py-3 px-space-md">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isInside
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${isInside ? 'bg-emerald-600 animate-pulse' : 'bg-slate-500'}`}
                            ></span>
                            {isInside ? 'Inside' : 'Checked Out'}
                          </span>
                        </td>
                        <td className="py-3 px-space-md text-right">
                          {isInside && (
                            <button
                              onClick={() => handleCheckOut(v.id)}
                              className="px-2.5 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold border border-outline-variant/20 transition cursor-pointer"
                            >
                              Check Out
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
      {/* Ported from visitors_gate_logs_minimal_mobile/code.html  */}
      {/* ======================================================== */}
      <div className="block md:hidden space-y-space-sm pb-12">
        {/* Gate Control & Live Indicator Bar */}
        <div className="flex items-center justify-between bg-surface-container-low px-3.5 py-2.5 rounded-xl border border-outline-variant/20">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Gate Checkpoint</span>
              <span className="text-xs font-bold text-on-surface truncate">Main Gate 1 &amp; 2 (Active Lane)</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="bg-surface-container-highest text-on-surface px-2 py-0.5 rounded-full text-[10px] font-bold">
              Shift A
            </span>
          </div>
        </div>

        {/* Primary Guard Action Button */}
        <div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full h-12 bg-primary text-on-primary rounded-xl flex items-center justify-center gap-2 shadow-xs active:scale-98 transition font-semibold text-xs"
          >
            <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
            <span>+ Quick Check-In (Scan or Type)</span>
          </button>
        </div>

        {/* Real-Time Metrics Strip (3 columns from mobile spec) */}
        <div className="grid grid-cols-3 gap-1.5 bg-surface-container-lowest p-1 rounded-xl border border-outline-variant/20 shadow-xs">
          <div className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-surface-container-low text-center">
            <span className="font-mono text-base font-bold text-primary">{activeVisitors.length}</span>
            <span className="text-[10px] text-secondary mt-0.5 font-medium">Inside Campus</span>
          </div>
          <div className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-surface-container text-center">
            <span className="font-mono text-base font-bold text-on-surface">{visitors.length}</span>
            <span className="text-[10px] text-secondary mt-0.5 font-medium">Today Total</span>
          </div>
          <div className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-surface-container-low text-center">
            <div className="flex items-center gap-1">
              <span className="font-mono text-base font-bold text-emerald-700">0</span>
              <span className="material-symbols-outlined text-primary text-[14px]">verified</span>
            </div>
            <span className="text-[10px] text-secondary mt-0.5 font-medium">Flagged Alerts</span>
          </div>
        </div>

        {/* Search & Fast Filter Pills */}
        <div className="space-y-2">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search visitor, vehicle or flat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline text-xs outline-none focus:bg-surface-container transition border border-outline-variant/20"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              All ({visitors.length})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              Active Inside ({activeVisitors.length})
            </button>
            <button
              onClick={() => setActiveTab('deliveries')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'deliveries'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              Deliveries ({deliveryVisitors.length})
            </button>
            <button
              onClick={() => setActiveTab('guests')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'guests'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              Guests ({guestVisitors.length})
            </button>
          </div>
        </div>

        {/* Security Visitor Cards List */}
        <div className="space-y-2.5 pt-1">
          {loading ? (
            <div className="p-8 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/20">
              <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block mr-2"></span>
              <span className="text-xs text-on-surface-variant">Loading visitor passes...</span>
            </div>
          ) : filteredVisitors.length === 0 ? (
            <div className="p-8 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/20">
              <span className="material-symbols-outlined text-secondary text-[24px]">badge</span>
              <p className="text-xs text-on-surface-variant mt-1">No visitors found for this filter</p>
            </div>
          ) : (
            filteredVisitors.map((v) => {
              const isInside = v.status === 'CHECKED_IN';
              return (
                <div
                  key={v.id}
                  className="bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/20 shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary font-bold">
                        <span className="material-symbols-outlined text-[20px]">
                          {v.purpose === 'DELIVERY' ? 'local_shipping' : v.purpose === 'CAB' ? 'local_taxi' : 'person'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-on-surface">{v.visitor_name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-container text-secondary font-semibold">
                            {v.purpose}
                          </span>
                        </div>
                        <span className="text-[11px] text-secondary font-mono">{v.phone_number}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                        isInside
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${isInside ? 'bg-emerald-600 animate-pulse' : 'bg-slate-500'}`}
                      ></span>
                      {isInside ? 'Inside' : 'Out'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-surface-container-low flex items-center justify-between text-[11px] border border-outline-variant/15">
                    <div>
                      <span className="text-secondary">Destination: </span>
                      <strong className="text-on-surface">{v.destination_flat_code || `Flat #${v.destination_flat}`}</strong>
                    </div>
                    <div className="font-mono text-secondary">
                      {v.vehicle_number || 'Pedestrian'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-outline-variant/15 text-[11px]">
                    <span className="text-secondary font-mono">
                      In: {v.check_in_time ? new Date(v.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </span>
                    {isInside && (
                      <button
                        onClick={() => handleCheckOut(v.id)}
                        className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold border border-outline-variant/20 transition cursor-pointer"
                      >
                        Check Out
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. FAST CHECK-IN MODAL (Used by both Desktop & Mobile)   */}
      {/* ======================================================== */}
      {showModal && (
        <div className="fixed inset-0 bg-inverse-surface/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant/30 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">badge</span>
                <h2 className="text-base font-bold text-on-surface">Issue Gate Entry Pass</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-secondary hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCheckIn} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase mb-1">Visitor Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alok Verma"
                    value={formData.visitor_name}
                    onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91-98401-..."
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase mb-1">Destination Flat</label>
                  <select
                    required
                    value={formData.destination_flat}
                    onChange={(e) => setFormData({ ...formData, destination_flat: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl outline-none"
                  >
                    {flats.map(f => (
                      <option key={f.id} value={f.id}>Flat {f.flat_number} ({f.building_name || `Twr ${f.building}`})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase mb-1">Visit Purpose</label>
                  <select
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl outline-none"
                  >
                    <option value="GUEST">Personal Guest</option>
                    <option value="DELIVERY">Delivery / Courier</option>
                    <option value="SERVICE">Service Technician</option>
                    <option value="CAB">Cab / Ride Hailing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase mb-1">Vehicle No (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. TN-09-AB-1234"
                    value={formData.vehicle_number}
                    onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase mb-1">Gate Lane</label>
                  <select
                    value={formData.gate_name}
                    onChange={(e) => setFormData({ ...formData, gate_name: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl outline-none"
                  >
                    <option value="Main Gate 01">Main Gate 01</option>
                    <option value="Service Gate 02">Service Gate 02</option>
                    <option value="Basement Ramp Entry">Basement Ramp Entry</option>
                  </select>
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
                  disabled={checkingIn}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {checkingIn ? 'Authorizing Pass...' : 'Print Pass & Grant Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
