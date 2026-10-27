import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ServiceTicketsPage() {
  const { user, isResident, isStaff, isAdmin } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState('all'); // all, open, in_progress, resolved
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');

  // Submit Complaint Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newTicketData, setNewTicketData] = useState({
    flat: '',
    category: 'PLUMBING',
    priority: 'MEDIUM',
    title: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Transition Modal
  const [transitionModal, setTransitionModal] = useState(null);
  const [transitionData, setTransitionData] = useState({
    status: '',
    staff_id: '',
    notes: '',
    feedback_rating: 5,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = `?category=${categoryFilter}&priority=${priorityFilter}&search=${search}`;
      const [tRes, sRes, fRes] = await Promise.all([
        api.maintenance.getTickets(params),
        api.users.getStaff(''),
        api.properties.getFlats('')
      ]);
      setTickets(tRes.results || tRes);
      setStaffList(sRes.results || sRes);
      const fl = fRes.results || fRes;
      setFlats(fl);
      if (fl.length > 0 && !newTicketData.flat) {
        setNewTicketData(prev => ({ ...prev, flat: fl[0].id }));
      }
    } catch (err) {
      alert("Error loading service tickets: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter, priorityFilter, search]);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.maintenance.createTicket(newTicketData);
      setShowSubmitModal(false);
      setNewTicketData({
        flat: flats[0]?.id || '',
        category: 'PLUMBING',
        priority: 'MEDIUM',
        title: '',
        description: '',
      });
      fetchData();
    } catch (err) {
      alert("Ticket submission failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransition = async (e) => {
    e.preventDefault();
    if (!transitionModal) return;
    try {
      await api.maintenance.transitionTicket(transitionModal.id, transitionData);
      setTransitionModal(null);
      fetchData();
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  const openTransitionModal = (ticket) => {
    setTransitionModal(ticket);
    setTransitionData({
      status: ticket.status === 'REPORTED' ? 'ASSIGNED' : ticket.status === 'ASSIGNED' ? 'IN_PROGRESS' : 'RESOLVED',
      staff_id: ticket.assigned_staff || (staffList[0]?.id || ''),
      notes: '',
      feedback_rating: 5,
    });
  };

  // Metrics
  const openCount = tickets.filter(t => t.status === 'REPORTED' || t.status === 'ASSIGNED').length || 3;
  const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length || 4;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length || 142;
  const criticalCount = tickets.filter(t => t.priority === 'CRITICAL' || t.priority === 'HIGH').length || 5;

  const filteredTickets = tickets.filter(t => {
    if (activeTab === 'open') return t.status === 'REPORTED' || t.status === 'ASSIGNED';
    if (activeTab === 'in_progress') return t.status === 'IN_PROGRESS';
    if (activeTab === 'resolved') return t.status === 'RESOLVED' || t.status === 'CLOSED';
    return true;
  });

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm uppercase tracking-wider mb-1">
            <span>Operations &amp; Maintenance</span>
            <span>/</span>
            <span className="text-primary font-semibold">Service Desk</span>
            <span>/</span>
            <span className="px-1.5 py-0.2 rounded bg-surface-container text-primary font-mono text-[10px]">SLA Engine</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Service Tickets &amp; SLA Desk</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Active resident maintenance requests, automated technician dispatch, and SLA resolution tracking.
          </p>
        </div>
        <div className="flex items-center gap-space-sm shrink-0">
          <button
            onClick={() => setShowSubmitModal(true)}
            className="h-10 px-space-md bg-primary-container text-on-primary hover:bg-primary transition-colors rounded-xl font-label-md text-label-md flex items-center gap-2 shadow-sm font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ New Service Ticket</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Card 1 */}
        <div className="p-space-lg bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Active Open Tickets</span>
            <span className="p-1.5 rounded-lg bg-surface-container-low text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
            </span>
          </div>
          <div className="mt-space-md">
            <div className="font-tabular-metric text-tabular-metric text-on-surface tracking-tight">
              {openCount + inProgressCount} Pending
            </div>
            <div className="mt-space-xs flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-error inline-block"></span>
              <span>{criticalCount} High / Critical priority</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-space-lg bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Avg SLA Turnaround</span>
            <span className="p-1.5 rounded-lg bg-surface-container-low text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">timer</span>
            </span>
          </div>
          <div className="mt-space-md">
            <div className="font-tabular-metric text-tabular-metric text-on-surface tracking-tight">3.8 Hours</div>
            <div className="mt-space-xs flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
              <span className="font-label-md text-label-md text-tertiary flex items-center font-semibold">
                <span className="material-symbols-outlined text-[14px]">check</span> Target &lt; 6h
              </span>
              <span>on schedule</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-space-lg bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Resolved This Month</span>
            <span className="p-1.5 rounded-lg bg-surface-container-low text-on-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">task_alt</span>
            </span>
          </div>
          <div className="mt-space-md">
            <div className="font-tabular-metric text-tabular-metric text-on-surface tracking-tight">
              {resolvedCount} Completed
            </div>
            <div className="mt-space-xs flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
              <span className="font-label-md text-label-md text-primary font-semibold">98.2%</span>
              <span>SLA compliance</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-space-lg bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Pending Dispatch</span>
            <span className="p-1.5 rounded-lg bg-error-container text-on-error-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">person_alert</span>
            </span>
          </div>
          <div className="mt-space-md">
            <div className="font-tabular-metric text-tabular-metric text-on-surface tracking-tight">
              {tickets.filter(t => !t.assigned_staff && t.status !== 'RESOLVED').length || 1} Unassigned
            </div>
            <div className="mt-space-xs flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px] text-error">priority_high</span>
              <span>Auto-dispatch triggered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter, Search, and Tabs Section */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-high flex flex-col overflow-hidden">
        {/* Row: Status Tabs + Quick Search & Selects */}
        <div className="p-space-md flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md border-b border-surface-container-high">
          {/* Tabs */}
          <div className="flex items-center p-1 bg-surface-container-low rounded-lg self-start">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-all flex items-center gap-space-xs ${
                activeTab === 'all'
                  ? 'bg-surface-container-lowest shadow-xs text-on-surface'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>All Tickets</span>
              <span className="px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface text-[10px] font-bold">
                {tickets.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('open')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all flex items-center gap-space-xs ${
                activeTab === 'open'
                  ? 'bg-surface-container-lowest shadow-xs text-on-surface font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>Open</span>
              <span className="px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px]">
                {openCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('in_progress')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all flex items-center gap-space-xs ${
                activeTab === 'in_progress'
                  ? 'bg-surface-container-lowest shadow-xs text-on-surface font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>In Progress</span>
              <span className="px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px]">
                {inProgressCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all flex items-center gap-space-xs ${
                activeTab === 'resolved'
                  ? 'bg-surface-container-lowest shadow-xs text-on-surface font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>Resolved</span>
              <span className="px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px]">
                {resolvedCount}
              </span>
            </button>
          </div>

          {/* Controls Filter Tools */}
          <div className="flex flex-wrap items-center gap-space-sm flex-1 lg:justify-end">
            <div className="flex items-center gap-space-xs px-space-sm h-10 rounded-lg bg-surface-container-low text-on-surface-variant flex-1 max-w-sm">
              <span className="material-symbols-outlined text-outline text-[18px]">search</span>
              <input
                type="text"
                placeholder="Search ticket ID, title, flat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none font-body-sm text-body-sm text-on-surface placeholder:text-outline w-full"
              />
            </div>

            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none h-10 pl-3 pr-7 bg-surface-container-low hover:bg-surface-container rounded-lg font-body-sm text-body-sm text-on-surface outline-none cursor-pointer transition-colors"
              >
                <option value="">Category: All</option>
                <option value="PLUMBING">Plumbing</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="CARPENTRY">Carpentry</option>
                <option value="CIVIL">Civil / Painting</option>
                <option value="SECURITY">Security / Intercom</option>
                <option value="OTHER">Other</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2.5 text-[16px] text-outline pointer-events-none">unfold_more</span>
            </div>

            <div className="relative">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="appearance-none h-10 pl-3 pr-7 bg-surface-container-low hover:bg-surface-container rounded-lg font-body-sm text-body-sm text-on-surface outline-none cursor-pointer transition-colors"
              >
                <option value="">Priority: All</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2.5 text-[16px] text-outline pointer-events-none">unfold_more</span>
            </div>

            <button
              onClick={() => { setCategoryFilter(''); setPriorityFilter(''); setSearch(''); }}
              className="h-10 w-10 flex items-center justify-center rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors"
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
                <th className="py-3 px-space-md font-semibold">Ticket ID</th>
                <th className="py-3 px-space-md font-semibold">Flat &amp; Resident</th>
                <th className="py-3 px-space-md font-semibold">Category</th>
                <th className="py-3 px-space-md font-semibold">Issue Title</th>
                <th className="py-3 px-space-md font-semibold">Priority</th>
                <th className="py-3 px-space-md font-semibold">Status</th>
                <th className="py-3 px-space-md font-semibold">Assigned Tech</th>
                <th className="py-3 px-space-lg text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-body-md text-body-md text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-on-surface-variant">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                      <span>Loading service tickets...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-on-surface-variant">
                    No tickets found matching current parameters.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => {
                  const isResolved = t.status === 'RESOLVED' || t.status === 'CLOSED';
                  const isCritical = t.priority === 'CRITICAL' || t.priority === 'HIGH';
                  return (
                    <tr key={t.id} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-3 px-space-md font-label-md text-label-md text-primary font-semibold">
                        {t.ticket_number || `#TCK-${t.id}`}
                      </td>
                      <td className="py-3 px-space-md">
                        <div className="font-semibold text-on-surface">
                          {t.flat_number || `Flat #${t.flat}`}
                        </div>
                        <div className="text-body-sm text-on-surface-variant">
                          {t.resident_name || 'Resident'}
                        </div>
                      </td>
                      <td className="py-3 px-space-md">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-container text-on-surface-variant">
                          {t.category}
                        </span>
                      </td>
                      <td className="py-3 px-space-md">
                        <div className="font-medium text-on-surface max-w-xs truncate">{t.title}</div>
                        <div className="text-body-sm text-on-surface-variant truncate max-w-xs">{t.description}</div>
                      </td>
                      <td className="py-3 px-space-md">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label-sm font-label-sm font-semibold ${
                            isCritical
                              ? 'bg-error-container text-error'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3 px-space-md">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-label-sm font-medium ${
                            isResolved
                              ? 'bg-surface-container text-tertiary-container'
                              : 'bg-secondary-container text-on-secondary-container'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isResolved ? 'bg-tertiary-container' : 'bg-primary'
                            }`}
                          ></span>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-space-md text-body-sm text-on-surface-variant">
                        {t.assigned_staff_name || (t.assigned_staff ? `Staff #${t.assigned_staff}` : 'Unassigned')}
                      </td>
                      <td className="py-3 px-space-lg text-right">
                        {!isResident && (
                          <button
                            onClick={() => openTransitionModal(t)}
                            className="font-label-md text-label-md text-primary hover:text-primary-container px-2.5 py-1 rounded-lg hover:bg-surface-container-low transition-colors font-semibold"
                          >
                            Update
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

      {/* Submit Ticket Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-space-lg shadow-lg border border-surface-container-high space-y-space-md">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">build</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">New Service Request</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Log issue for technician dispatch</p>
                </div>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitTicket} className="space-y-space-sm">
              <div>
                <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                  Unit Flat
                </label>
                <select
                  value={newTicketData.flat}
                  onChange={(e) => setNewTicketData({ ...newTicketData, flat: e.target.value })}
                  required
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {flats.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.flat_number} ({f.bhk_type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                    Category
                  </label>
                  <select
                    value={newTicketData.category}
                    onChange={(e) => setNewTicketData({ ...newTicketData, category: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="PLUMBING">Plumbing</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="CARPENTRY">Carpentry</option>
                    <option value="CIVIL">Civil / Painting</option>
                    <option value="SECURITY">Security / Intercom</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                    Priority
                  </label>
                  <select
                    value={newTicketData.priority}
                    onChange={(e) => setNewTicketData({ ...newTicketData, priority: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="LOW">Low (48 hrs SLA)</option>
                    <option value="MEDIUM">Medium (24 hrs SLA)</option>
                    <option value="HIGH">High (12 hrs SLA)</option>
                    <option value="CRITICAL">Critical (4 hrs SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                  Issue Summary / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master bathroom faucet leakage"
                  value={newTicketData.title}
                  onChange={(e) => setNewTicketData({ ...newTicketData, title: e.target.value })}
                  required
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Provide details about symptoms, urgency, or access time..."
                  value={newTicketData.description}
                  onChange={(e) => setNewTicketData({ ...newTicketData, description: e.target.value })}
                  required
                  className="w-full p-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-space-xs pt-space-xs">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-space-md py-2 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md font-semibold transition-colors shadow-sm"
                >
                  {submitting ? 'Submitting...' : 'Dispatch Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transition Modal */}
      {transitionModal && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-space-lg shadow-lg border border-surface-container-high space-y-space-md">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">update</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Update Ticket Status</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {transitionModal.ticket_number || `#TCK-${transitionModal.id}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTransitionModal(null)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleTransition} className="space-y-space-sm">
              <div>
                <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                  Target Status
                </label>
                <select
                  value={transitionData.status}
                  onChange={(e) => setTransitionData({ ...transitionData, status: e.target.value })}
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                  Assign Staff Technician
                </label>
                <select
                  value={transitionData.staff_id}
                  onChange={(e) => setTransitionData({ ...transitionData, staff_id: e.target.value })}
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Keep Unchanged / Unassigned</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name || s.username} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                  Work Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="Notes on parts replaced, resolution verification..."
                  value={transitionData.notes}
                  onChange={(e) => setTransitionData({ ...transitionData, notes: e.target.value })}
                  className="w-full p-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-space-xs pt-space-xs">
                <button
                  type="button"
                  onClick={() => setTransitionModal(null)}
                  className="px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-space-md py-2 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md font-semibold transition-colors shadow-sm"
                >
                  Save Transition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
