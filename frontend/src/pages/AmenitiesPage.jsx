import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AmenitiesPage() {
  const { user, isResident } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [flats, setFlats] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedFacility, setSelectedFacility] = useState('');
  const [search, setSearch] = useState('');

  // Reserve Modal
  const [showModal, setShowModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    amenity: '',
    flat: '',
    resident: '',
    booking_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    start_time: '18:00',
    end_time: '21:00',
    attendees_count: 20,
    total_charge: '3000.00',
    notes: 'Family gathering / get-together',
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [facRes, bkgRes, fRes, rRes] = await Promise.all([
        api.amenities.getFacilities(),
        api.amenities.getBookings(''),
        api.properties.getFlats(''),
        api.residents.getResidents('')
      ]);
      const facs = facRes.results || facRes;
      setFacilities(facs);
      setBookings(bkgRes.results || bkgRes);
      const fl = fRes.results || fRes;
      setFlats(fl);
      const res = rRes.results || rRes;
      setResidents(res);

      if (facs.length > 0 && !bookingData.amenity) {
        setBookingData(prev => ({
          ...prev,
          amenity: facs[0].id,
          flat: fl[0]?.id || '',
          resident: res[0]?.id || ''
        }));
      }
    } catch (err) {
      alert("Error loading facilities: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.amenities.createBooking(bookingData);
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert("Reservation conflict or error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;
    try {
      await api.amenities.cancelBooking(bookingId);
      fetchData();
    } catch (err) {
      alert("Error cancelling booking: " + err.message);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (selectedFacility && b.amenity !== parseInt(selectedFacility)) return false;
    if (search) {
      const matchName = b.amenity_name?.toLowerCase().includes(search.toLowerCase());
      const matchRes = b.resident_name?.toLowerCase().includes(search.toLowerCase());
      const matchFlat = b.flat_number?.toLowerCase().includes(search.toLowerCase());
      return matchName || matchRes || matchFlat;
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm uppercase tracking-wider mb-1">
            <span>Facilities &amp; Leisure</span>
            <span>/</span>
            <span className="text-primary font-semibold">Amenity Bookings</span>
            <span>/</span>
            <span className="px-1.5 py-0.2 rounded bg-surface-container text-primary font-mono text-[10px]">Slot Locking</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Amenities &amp; Space Reservations</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Clubhouse banquet reservations, swimming pool lap lanes, tennis courts, and fitness center bookings.
          </p>
        </div>
        <div className="flex items-center gap-space-sm shrink-0">
          <button
            onClick={() => setShowModal(true)}
            className="h-10 px-space-md bg-primary-container text-on-primary hover:bg-primary transition-colors rounded-xl font-label-md text-label-md flex items-center gap-2 shadow-sm font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ New Facility Booking</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Today's Bookings</span>
            <span className="material-symbols-outlined text-primary text-[20px]">event_available</span>
          </div>
          <div>
            <div className="font-tabular-metric text-tabular-metric text-on-surface tracking-tight">
              {bookings.length || 14} Reservations
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">6 slots active right now</div>
          </div>
          <div className="mt-space-md flex items-center gap-space-xs text-primary font-label-md text-label-md">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span>Zero overlapping conflicts</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Active Facilities</span>
            <span className="material-symbols-outlined text-tertiary text-[20px]">check_circle</span>
          </div>
          <div>
            <div className="font-tabular-metric text-tabular-metric text-on-surface tracking-tight">
              {facilities.length || 6} Operational
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs truncate">
              Banquet, Tennis, Pool, Gym, Courts
            </div>
          </div>
          <div className="mt-space-md flex items-center gap-space-xs text-secondary font-label-md text-label-md">
            <span className="inline-block w-2 h-2 rounded-full bg-secondary-container"></span>
            <span>100% capacity ready</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Peak Slot Today</span>
            <span className="material-symbols-outlined text-primary-container text-[20px]">schedule</span>
          </div>
          <div>
            <div className="font-tabular-metric text-tabular-metric text-on-surface tracking-tight">18:00 – 21:00</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">Evening Prime (Courts &amp; Banquet)</div>
          </div>
          <div className="mt-space-md flex items-center gap-space-xs text-on-secondary-container font-label-md text-label-md">
            <span className="material-symbols-outlined text-[16px]">speed</span>
            <span>92% Utilization anticipated</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Maintenance Window</span>
            <span className="material-symbols-outlined text-outline text-[20px]">build_circle</span>
          </div>
          <div>
            <div className="font-tabular-metric text-tabular-metric text-on-surface tracking-tight">Pool Maintenance</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">Tuesday 12:00 – 14:00 Window</div>
          </div>
          <div className="mt-space-md flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Scheduled routine filtration</span>
          </div>
        </div>
      </div>

      {/* Facility Visual Showcase Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
        <div className="relative bg-surface-container-lowest rounded-xl overflow-hidden shadow-xs border border-surface-container-high lg:col-span-2 flex flex-col md:flex-row">
          <div className="p-space-lg flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-space-xs">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-secondary-container text-on-secondary-container font-semibold">
                  Prime Venue
                </span>
                <span className="font-label-sm text-label-sm text-outline">Capacity: 150 Guests</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface mt-space-xs">Clubhouse Grand Banquet Suite</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                Soundproof multi-tier audio, caterer staging prep kitchen, central climate zoning, and adjoining garden deck.
              </p>
            </div>
            <div className="flex items-center justify-between mt-space-md pt-space-sm bg-surface-container-low px-space-md py-space-sm rounded-lg">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">event_seat</span>
                <span className="font-body-sm text-body-sm text-on-surface font-medium">Next open window: Today 18:30+</span>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="font-label-md text-label-md text-primary font-semibold hover:underline flex items-center gap-1"
              >
                Book Venue <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        <div className="relative bg-surface-container-lowest rounded-xl overflow-hidden shadow-xs border border-surface-container-high flex flex-col justify-between p-space-lg">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">Facility Snapshot</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1">Olympic Outdoor Pool</h3>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-container text-tertiary-container font-semibold">
              Temp: 26°C
            </span>
          </div>
          <div className="my-space-md space-y-2 text-body-sm text-on-surface-variant">
            <div className="flex items-center justify-between">
              <span>Automated pH Dosing:</span>
              <span className="font-semibold text-tertiary-container">Optimal (7.2)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Lane Availability:</span>
              <span className="font-semibold text-on-surface">Lanes 1–4 Open</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Lifeguard On-Duty:</span>
              <span className="font-semibold text-on-surface">SIS Guard Active</span>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full py-2 bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md rounded-lg transition-colors font-semibold"
          >
            Reserve Lap Slot
          </button>
        </div>
      </div>

      {/* Bookings Table Container */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-high flex flex-col overflow-hidden">
        {/* Filter bar */}
        <div className="p-space-md flex flex-wrap items-center justify-between gap-space-sm border-b border-surface-container-high">
          <div className="flex items-center gap-space-xs px-space-sm py-2 rounded-xl bg-surface-container-low text-on-surface w-full sm:w-80">
            <span className="material-symbols-outlined text-outline text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search amenity, resident, flat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none font-body-sm text-body-sm text-on-surface placeholder:text-outline w-full"
            />
          </div>

          <div className="flex items-center gap-space-xs">
            <div className="relative">
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="appearance-none bg-surface-container-low text-on-surface font-body-sm text-body-sm py-2 pl-space-sm pr-7 rounded-xl outline-none cursor-pointer hover:bg-surface-container transition-colors"
              >
                <option value="">All Amenities &amp; Facilities</option>
                {facilities.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2.5 text-[16px] text-outline pointer-events-none">unfold_more</span>
            </div>

            <button
              onClick={() => { setSelectedFacility(''); setSearch(''); }}
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
                <th className="py-3 px-space-md font-semibold">Amenity Venue</th>
                <th className="py-3 px-space-md font-semibold">Resident / Unit</th>
                <th className="py-3 px-space-md font-semibold">Reservation Date</th>
                <th className="py-3 px-space-md font-semibold">Time Window</th>
                <th className="py-3 px-space-md text-right font-semibold">Tariff (₹)</th>
                <th className="py-3 px-space-md font-semibold">Status</th>
                <th className="py-3 px-space-lg text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-body-md text-body-md text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-on-surface-variant">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                      <span>Loading reservation ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-on-surface-variant">
                    No bookings found for the selected amenity.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3 px-space-md font-semibold text-primary">
                      {b.amenity_name || `Facility #${b.amenity}`}
                    </td>
                    <td className="py-3 px-space-md">
                      <div className="font-semibold text-on-surface">{b.resident_name || 'Resident'}</div>
                      <div className="text-body-sm text-on-surface-variant">{b.flat_number || `Flat #${b.flat}`}</div>
                    </td>
                    <td className="py-3 px-space-md font-mono text-body-sm text-on-surface-variant">
                      {b.booking_date}
                    </td>
                    <td className="py-3 px-space-md font-body-sm text-on-surface-variant">
                      {b.start_time} – {b.end_time}
                    </td>
                    <td className="py-3 px-space-md text-right font-mono font-semibold text-on-surface">
                      ₹{parseFloat(b.total_charge || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-space-md">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-label-sm font-medium ${
                          b.status === 'CONFIRMED'
                            ? 'bg-surface-container text-tertiary-container'
                            : b.status === 'CANCELLED'
                            ? 'bg-error-container text-error'
                            : 'bg-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            b.status === 'CONFIRMED' ? 'bg-tertiary-container' : 'bg-outline'
                          }`}
                        ></span>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-space-lg text-right">
                      {b.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="font-label-md text-label-md text-error hover:text-red-700 px-2.5 py-1 rounded-lg hover:bg-error-container/30 transition-colors font-semibold"
                        >
                          Cancel
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

      {/* Reserve Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-space-lg shadow-lg border border-surface-container-high space-y-space-md">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">event</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Book Society Amenity</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Lock slot and calculate tariff</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleBooking} className="space-y-space-sm">
              <div>
                <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                  Facility
                </label>
                <select
                  value={bookingData.amenity}
                  onChange={(e) => setBookingData({ ...bookingData, amenity: e.target.value })}
                  required
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {facilities.map((fac) => (
                    <option key={fac.id} value={fac.id}>
                      {fac.name} (₹{fac.hourly_rate || 500}/hr)
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
                    value={bookingData.flat}
                    onChange={(e) => setBookingData({ ...bookingData, flat: e.target.value })}
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
                    Booking Date
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingData.booking_date}
                    onChange={(e) => setBookingData({ ...bookingData, booking_date: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={bookingData.start_time}
                    onChange={(e) => setBookingData({ ...bookingData, start_time: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={bookingData.end_time}
                    onChange={(e) => setBookingData({ ...bookingData, end_time: e.target.value })}
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
                  {saving ? 'Confirming...' : 'Lock Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
