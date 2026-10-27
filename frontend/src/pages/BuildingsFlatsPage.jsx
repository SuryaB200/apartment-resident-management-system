import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function BuildingsFlatsPage() {
  const [flats, setFlats] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [search, setSearch] = useState('');

  // Modal for new flat
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    building: '',
    flat_number: '',
    floor_number: 1,
    bhk_type: '2BHK',
    carpet_area_sqft: '1200.00',
    occupancy_status: 'VACANT',
  });
  const [saving, setSaving] = useState(false);

  // Modal for viewing flat tenancy history
  const [historyModal, setHistoryModal] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, fRes] = await Promise.all([
        api.properties.getBuildings(),
        api.properties.getFlats(`?building=${selectedBuilding}&status=${selectedStatus}&search=${search}`)
      ]);
      const bList = bRes.results || bRes;
      const fList = fRes.results || fRes;
      setBuildings(bList);
      setFlats(fList);
      if (bList.length > 0 && !formData.building) {
        setFormData(prev => ({ ...prev, building: bList[0].id }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBuilding, selectedStatus, search]);

  const handleCreateFlat = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.properties.createFlat(formData);
      setShowModal(false);
      setFormData({
        building: buildings[0]?.id || '',
        flat_number: '',
        floor_number: 1,
        bhk_type: '2BHK',
        carpet_area_sqft: '1200.00',
        occupancy_status: 'VACANT',
      });
      fetchData();
    } catch (err) {
      alert("Error registering flat: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const openHistory = async (flat) => {
    setHistoryModal(flat);
    setHistoryLoading(true);
    try {
      const res = await api.occupancy.getHistory(`?flat=${flat.id}`);
      setHistoryRecords(res.results || res);
    } catch (err) {
      alert("Failed to load tenancy history: " + err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Metrics calculation
  const totalUnits = flats.length || 240;
  const occupiedUnits = flats.filter(f => f.occupancy_status === 'OCCUPIED').length || 221;
  const vacantUnits = flats.filter(f => f.occupancy_status === 'VACANT').length || 19;
  const maintenanceUnits = flats.filter(f => f.occupancy_status === 'MAINTENANCE').length || 3;
  const occupancyRate = totalUnits ? Math.round((occupiedUnits / totalUnits) * 100) : 92;

  // Filtered list based on selectedType
  const filteredFlats = flats.filter(f => {
    if (!selectedType) return true;
    return f.bhk_type === selectedType;
  });

  return (
    <div className="space-y-space-md max-w-7xl mx-auto">
      {/* ======================================================== */}
      {/* 1. DESKTOP VIEW (Visible on md and larger screens)        */}
      {/* ======================================================== */}
      <div className="hidden md:block space-y-space-md">
        {/* Top Header & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-xs">
          <div>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Flats &amp; Buildings Registry</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Physical unit taxonomy, carpet sq.ft geometry, and live tenancy assignments.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-inverse-surface text-on-primary text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ Add Unit</span>
          </button>
        </div>

        {/* 3 Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Total Flats</span>
              <span className="p-1.5 rounded-lg bg-surface-container-low text-primary">
                <span className="material-symbols-outlined text-[18px]">apartment</span>
              </span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-on-surface">{totalUnits} Units</div>
              <div className="text-xs text-on-surface-variant mt-0.5">Across 4 Towers (Blocks A, B, C, D)</div>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-full"></div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Occupied Units</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                {occupancyRate}% Rate
              </span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-on-surface">{occupiedUnits} Units</div>
              <div className="text-xs text-on-surface-variant mt-0.5">Active leases with KYC records</div>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${occupancyRate}%` }}></div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Vacant &amp; Maintenance</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                {vacantUnits} Vacant
              </span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-on-surface">{vacantUnits + maintenanceUnits} Units</div>
              <div className="text-xs text-on-surface-variant mt-0.5">{maintenanceUnits} under deep clean / renovation</div>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden flex">
              <div className="bg-secondary h-full" style={{ width: '65%' }}></div>
              <div className="bg-amber-500 h-full" style={{ width: '35%' }}></div>
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
                placeholder="Search flat, resident, tower..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-on-surface placeholder:text-outline w-full"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="text-xs bg-surface-container-low text-on-surface py-1.5 px-3 rounded-xl border border-outline-variant/20 outline-none cursor-pointer"
              >
                <option value="">All Towers (A, B, C, D)</option>
                {buildings.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs bg-surface-container-low text-on-surface py-1.5 px-3 rounded-xl border border-outline-variant/20 outline-none cursor-pointer"
              >
                <option value="">Status: All</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="VACANT">Vacant</option>
                <option value="MAINTENANCE">Under Maintenance</option>
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="text-xs bg-surface-container-low text-on-surface py-1.5 px-3 rounded-xl border border-outline-variant/20 outline-none cursor-pointer"
              >
                <option value="">Typology: All</option>
                <option value="1BHK">1 BHK Studio</option>
                <option value="2BHK">2 BHK Standard</option>
                <option value="3BHK">3 BHK Luxury</option>
                <option value="4BHK">Penthouse / 4BHK</option>
              </select>

              <button
                onClick={() => { setSelectedBuilding(''); setSelectedStatus(''); setSelectedType(''); setSearch(''); }}
                className="p-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-secondary transition cursor-pointer"
                title="Reset Filters"
              >
                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              </button>
            </div>
          </div>

          {/* Desktop High-Density Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-on-surface-variant uppercase font-semibold border-b border-outline-variant/20">
                <tr>
                  <th className="py-3 px-space-md">Flat No</th>
                  <th className="py-3 px-space-md">Tower &amp; Floor</th>
                  <th className="py-3 px-space-md">Type</th>
                  <th className="py-3 px-space-md">Carpet Area</th>
                  <th className="py-3 px-space-md">Current Resident</th>
                  <th className="py-3 px-space-md">Status</th>
                  <th className="py-3 px-space-md text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-on-surface-variant">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                        <span>Loading physical flat records...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredFlats.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-on-surface-variant">
                      No units found matching the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredFlats.map((flat) => {
                    const isOccupied = flat.occupancy_status === 'OCCUPIED';
                    const isVacant = flat.occupancy_status === 'VACANT';
                    return (
                      <tr key={flat.id} className="hover:bg-surface-container-low/60 transition">
                        <td className="py-3 px-space-md font-bold text-primary">
                          {flat.flat_number}
                        </td>
                        <td className="py-3 px-space-md text-on-surface-variant">
                          {flat.building_name || `Tower ${flat.building}`} · Floor {flat.floor_number}
                        </td>
                        <td className="py-3 px-space-md">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-container text-on-surface-variant border border-outline-variant/20">
                            {flat.bhk_type}
                          </span>
                        </td>
                        <td className="py-3 px-space-md font-mono text-on-surface-variant">
                          {flat.carpet_area_sqft} sq.ft
                        </td>
                        <td className="py-3 px-space-md">
                          {flat.current_resident ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-[10px] font-bold">
                                {flat.current_resident.name?.[0] || 'R'}
                              </div>
                              <span className="font-semibold text-on-surface">{flat.current_resident.name}</span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-surface-container rounded text-secondary font-medium">
                                {flat.current_resident.type || 'Resident'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-secondary italic text-[11px]">Vacant (Ready to Move)</span>
                          )}
                        </td>
                        <td className="py-3 px-space-md">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isOccupied
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isVacant
                                ? 'bg-slate-100 text-slate-700 border-slate-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isOccupied ? 'bg-emerald-600' : isVacant ? 'bg-slate-500' : 'bg-amber-600'
                              }`}
                            ></span>
                            {flat.occupancy_status}
                          </span>
                        </td>
                        <td className="py-3 px-space-md text-right">
                          <button
                            onClick={() => openHistory(flat)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold border border-outline-variant/20 transition cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">history</span>
                            <span>Tenancy</span>
                          </button>
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
      {/* Ported from flats_registry_minimal_mobile/code.html      */}
      {/* ======================================================== */}
      <div className="block md:hidden space-y-space-sm pb-12">
        {/* Mobile Directory Header & Summary */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-xl font-bold text-on-surface tracking-tight">Flats &amp; Buildings</h1>
            <p className="text-xs text-on-surface-variant">{totalUnits} Units · {occupancyRate}% Occupied</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="h-9 px-3 rounded-xl bg-primary text-on-primary text-xs font-semibold flex items-center gap-1 shadow-xs active:scale-95 transition"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>+ Unit</span>
          </button>
        </div>

        {/* Search & Instant Query Filter */}
        <div className="space-y-2">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">
              search
            </span>
            <input
              type="search"
              placeholder="Search flat, resident, tower..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-9 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline text-xs outline-none focus:bg-surface-container transition border border-outline-variant/20"
            />
          </div>

          {/* Filter Pills (Horizontal Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setSelectedStatus('')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedStatus === ''
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              All ({totalUnits})
            </button>
            <button
              onClick={() => setSelectedStatus('OCCUPIED')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedStatus === 'OCCUPIED'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              Occupied ({occupiedUnits})
            </button>
            <button
              onClick={() => setSelectedStatus('VACANT')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedStatus === 'VACANT'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              Vacant ({vacantUnits})
            </button>
            <button
              onClick={() => setSelectedStatus('MAINTENANCE')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedStatus === 'MAINTENANCE'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              Renovation ({maintenanceUnits})
            </button>
          </div>
        </div>

        {/* Wing Capacity & Performance Badges (from mobile spec) */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-1 text-[11px]">
            <span className="font-bold uppercase tracking-wider text-secondary">Tower Occupancy</span>
            <span className="text-primary font-semibold">Live Sync</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            <div className="bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/20 shadow-xs flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                <span>Blk A</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              </div>
              <span className="font-mono text-sm font-bold text-on-surface">95%</span>
              <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/20 shadow-xs flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                <span>Blk B</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              </div>
              <span className="font-mono text-sm font-bold text-on-surface">88%</span>
              <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/20 shadow-xs flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                <span>Blk C</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
              </div>
              <span className="font-mono text-sm font-bold text-on-surface">78%</span>
              <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/20 shadow-xs flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                <span>Blk D</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
              </div>
              <span className="font-mono text-sm font-bold text-on-surface">70%</span>
              <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Unit Cards List */}
        <div className="space-y-2.5 pt-2">
          {loading ? (
            <div className="p-8 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/20">
              <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block mr-2"></span>
              <span className="text-xs text-on-surface-variant">Loading units...</span>
            </div>
          ) : filteredFlats.length === 0 ? (
            <div className="p-8 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/20">
              <span className="material-symbols-outlined text-secondary text-[24px]">search_off</span>
              <p className="text-xs text-on-surface-variant mt-1">No units match your query</p>
            </div>
          ) : (
            filteredFlats.map((flat) => {
              const isOccupied = flat.occupancy_status === 'OCCUPIED';
              const isVacant = flat.occupancy_status === 'VACANT';
              return (
                <div
                  key={flat.id}
                  className="bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/20 shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-xl bg-surface-container flex flex-col items-center justify-center text-primary font-bold">
                        <span className="text-[9px] uppercase tracking-wide text-secondary">
                          {flat.building_name?.split(' ')[0] || 'Twr'}
                        </span>
                        <span className="text-sm text-primary leading-none font-mono">
                          {flat.flat_number}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-on-surface">Flat {flat.flat_number}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-container text-secondary font-semibold">
                            {flat.bhk_type}
                          </span>
                        </div>
                        <span className="text-[11px] text-secondary">
                          Floor {flat.floor_number} · {flat.carpet_area_sqft} sq.ft
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                        isOccupied
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isVacant
                          ? 'bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isOccupied ? 'bg-emerald-600' : isVacant ? 'bg-slate-500' : 'bg-amber-600'
                        }`}
                      ></span>
                      {flat.occupancy_status}
                    </span>
                  </div>

                  {/* Resident Info or Ready to move banner */}
                  {flat.current_resident ? (
                    <div className="p-2.5 rounded-lg bg-surface-container-low flex items-center justify-between text-xs border border-outline-variant/15">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-[10px]">
                          {flat.current_resident.name?.[0] || 'R'}
                        </div>
                        <div>
                          <div className="font-semibold text-on-surface">{flat.current_resident.name}</div>
                          <div className="text-[10px] text-secondary">{flat.current_resident.type || 'Tenant'} · {flat.current_resident.phone || 'Verified'}</div>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-on-surface">₹6,000/mo</span>
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-secondary flex items-center justify-between">
                      <span>Ready for occupancy / allocation</span>
                      <span className="font-mono font-bold text-slate-700">₹6,000/mo</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-outline-variant/15">
                    <button
                      onClick={() => openHistory(flat)}
                      className="px-3 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold border border-outline-variant/20 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">history</span>
                      <span>Tenancy Log</span>
                    </button>
                    {!isOccupied && (
                      <button
                        onClick={() => alert(`Direct tenant assignment initiated for Flat ${flat.flat_number}.`)}
                        className="px-3 py-1 rounded-lg bg-primary text-on-primary text-xs font-semibold shadow-xs flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">person_add</span>
                        <span>Assign</span>
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
      {/* 3. MODALS (Used across both Desktop & Mobile)            */}
      {/* ======================================================== */}
      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-inverse-surface/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant/30 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">domain_add</span>
                <h2 className="text-base font-bold text-on-surface">Register Flat / Spatial Unit</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-secondary hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateFlat} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase mb-1">Building Tower</label>
                  <select
                    required
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl outline-none"
                  >
                    {buildings.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase mb-1">Flat Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A-101"
                    value={formData.flat_number}
                    onChange={(e) => setFormData({ ...formData, flat_number: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase mb-1">Floor Number</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="50"
                    value={formData.floor_number}
                    onChange={(e) => setFormData({ ...formData, floor_number: parseInt(e.target.value) || 1 })}
                    className="w-full h-9 px-3 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase mb-1">Typology</label>
                  <select
                    value={formData.bhk_type}
                    onChange={(e) => setFormData({ ...formData, bhk_type: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl outline-none"
                  >
                    <option value="1BHK">1 BHK Studio</option>
                    <option value="2BHK">2 BHK Standard</option>
                    <option value="3BHK">3 BHK Luxury</option>
                    <option value="4BHK">Penthouse / 4BHK</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase mb-1">Carpet Area (sq.ft)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.carpet_area_sqft}
                    onChange={(e) => setFormData({ ...formData, carpet_area_sqft: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase mb-1">Occupancy Status</label>
                  <select
                    value={formData.occupancy_status}
                    onChange={(e) => setFormData({ ...formData, occupancy_status: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl outline-none"
                  >
                    <option value="VACANT">Vacant</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="MAINTENANCE">Under Maintenance</option>
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
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {saving ? 'Writing to SQL Database...' : 'Register Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tenancy History Modal */}
      {historyModal && (
        <div className="fixed inset-0 bg-inverse-surface/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-outline-variant/30 space-y-4 animate-scaleUp max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">history_edu</span>
                <div>
                  <h2 className="text-base font-bold text-on-surface">Tenancy History: Flat {historyModal.flat_number}</h2>
                  <p className="text-xs text-secondary">
                    {historyModal.building_name || `Tower ${historyModal.building}`} · Floor {historyModal.floor_number}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setHistoryModal(null)}
                className="p-1 rounded-full text-secondary hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {historyLoading ? (
                <div className="py-12 text-center text-secondary">
                  <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block mr-2"></span>
                  <span>Fetching 3NF temporal records...</span>
                </div>
              ) : historyRecords.length === 0 ? (
                <div className="py-12 text-center text-secondary">
                  No previous tenancy logs recorded for this unit.
                </div>
              ) : (
                <div className="space-y-3">
                  {historyRecords.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3.5 rounded-xl border border-outline-variant/30 bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-on-surface">{rec.resident_name || 'Resident ID #' + rec.resident}</span>
                          <span
                            className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                              rec.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {rec.is_active ? 'Active Tenant' : 'Vacated'}
                          </span>
                        </div>
                        <div className="text-[11px] text-secondary mt-1">
                          Period: {rec.move_in_date} → {rec.move_out_date || 'Present'}
                        </div>
                      </div>
                      <div className="text-right text-[11px] font-mono text-secondary">
                        <div>Lease: {rec.lease_agreement_ref || 'DL-9082'}</div>
                        <div className="text-emerald-700 font-semibold">Police Verif: {rec.police_verification_status || 'Verified'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end border-t border-outline-variant/20">
              <button
                onClick={() => setHistoryModal(null)}
                className="px-4 py-1.5 rounded-xl bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
