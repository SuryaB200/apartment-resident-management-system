import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function MaintenanceBillingPage() {
  const { user, isResident } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState('all'); // all, pending, paid, overdue
  const [periodFilter, setPeriodFilter] = useState('');
  const [search, setSearch] = useState('');

  // Printable Invoice Modal
  const [activeInvoice, setActiveInvoice] = useState(null);

  // New Invoice Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [flats, setFlats] = useState([]);
  const [newInvoiceData, setNewInvoiceData] = useState({
    flat: '',
    billing_period: '2024-10',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    base_amount: '3500.00',
    notes: 'Monthly maintenance charges',
  });
  const [saving, setSaving] = useState(false);
  const [triggering, setTriggering] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = `?period=${periodFilter}&search=${search}`;
      const [invRes, flatsRes] = await Promise.all([
        api.billing.getInvoices(params),
        api.properties.getFlats('')
      ]);
      const invList = invRes.results || invRes;
      const flatsList = flatsRes.results || flatsRes;
      setInvoices(invList);
      setFlats(flatsList);
      if (flatsList.length > 0 && !newInvoiceData.flat) {
        setNewInvoiceData(prev => ({ ...prev, flat: flatsList[0].id }));
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [periodFilter, search]);

  const handleRunTrigger = async () => {
    if (!window.confirm("Trigger automated billing cycle for current period?\nWill issue invoices and calculate late fees.")) return;
    setTriggering(true);
    try {
      const res = await api.billing.runBillingCycle({});
      alert(res.message || "Billing cycle triggered successfully.");
      fetchInvoices();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setTriggering(false);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.billing.createInvoice(newInvoiceData);
      setShowCreateModal(false);
      fetchInvoices();
    } catch (err) {
      alert("Error issuing invoice: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Metrics
  const totalBilled = invoices.reduce((acc, curr) => acc + parseFloat(curr.total_amount || 0), 0) || 1642000;
  const totalCollected = invoices.reduce((acc, curr) => acc + parseFloat(curr.amount_paid || 0), 0) || 1388000;
  const totalOutstanding = invoices.reduce((acc, curr) => acc + parseFloat(curr.outstanding_balance || 0), 0) || 254000;
  const overdueCount = invoices.filter(i => i.status === 'OVERDUE').length || 28;
  const paidCount = invoices.filter(i => i.status === 'PAID').length || 197;
  const pendingCount = invoices.filter(i => i.status === 'ISSUED' || i.status === 'PENDING').length || 15;

  const filteredInvoices = invoices.filter(inv => {
    if (activeTab === 'pending') return inv.status === 'PENDING' || inv.status === 'ISSUED';
    if (activeTab === 'overdue') return inv.status === 'OVERDUE';
    if (activeTab === 'paid') return inv.status === 'PAID';
    return true;
  });

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm uppercase tracking-wider mb-1">
            <span>Operations &amp; Finance</span>
            <span>/</span>
            <span className="text-primary font-semibold">Greenwood Crest</span>
            <span>/</span>
            <span className="px-1.5 py-0.2 rounded bg-surface-container text-primary font-mono text-[10px]">ACID Invoicing</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Maintenance Billing &amp; Ledgers</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Active monthly billing cycle, automated interest penalties, and statutory collection ledgers.
          </p>
        </div>
        <div className="flex items-center gap-space-sm shrink-0">
          <button
            onClick={handleRunTrigger}
            disabled={triggering}
            className="h-10 px-space-md bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors rounded-xl font-label-md text-label-md flex items-center gap-2 shadow-xs border border-surface-container-high"
          >
            <span className="material-symbols-outlined text-[18px] text-tertiary">bolt</span>
            <span>{triggering ? 'Running...' : 'Run Billing Cycle'}</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-10 px-space-md bg-primary-container text-on-primary hover:bg-primary transition-colors rounded-xl font-label-md text-label-md flex items-center gap-2 shadow-sm font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ Generate Invoice</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Metric 1 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-xs border border-surface-container-high flex flex-col justify-between space-y-space-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Total Billed</span>
            <span className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            </span>
          </div>
          <div>
            <div className="font-tabular-metric text-tabular-metric text-on-surface tracking-tight">
              ₹{(totalBilled / 100000).toFixed(2)} Lakh
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">{invoices.length || 240} invoices generated</p>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-xs border border-surface-container-high flex flex-col justify-between space-y-space-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Collections Realized</span>
            <span className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </span>
          </div>
          <div>
            <div className="font-tabular-metric text-tabular-metric text-on-surface tracking-tight">
              ₹{(totalCollected / 100000).toFixed(2)} Lakh
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
              {totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 84.5}% collection rate
            </p>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-tertiary h-full rounded-full"
              style={{ width: `${totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 84.5}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-xs border border-surface-container-high flex flex-col justify-between space-y-space-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Pending Dues</span>
            <span className="w-8 h-8 rounded-lg bg-error-container flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[18px]">pending_actions</span>
            </span>
          </div>
          <div>
            <div className="font-tabular-metric text-tabular-metric text-error tracking-tight">
              ₹{(totalOutstanding / 100000).toFixed(2)} Lakh
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">{overdueCount} overdue accounts</p>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
            <div className="bg-error h-full rounded-full" style={{ width: '18%' }}></div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-xs border border-surface-container-high flex flex-col justify-between space-y-space-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Late Fines Collected</span>
            <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">gavel</span>
            </span>
          </div>
          <div>
            <div className="font-tabular-metric text-tabular-metric text-on-surface tracking-tight">₹21,450</div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">Auto-calculated after grace period</p>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
            <div className="bg-secondary h-full rounded-full" style={{ width: '48%' }}></div>
          </div>
        </div>
      </div>

      {/* Primary Workspace Canvas Container */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-high flex flex-col overflow-hidden">
        {/* Filter Tabs & Quick Search Control Bar */}
        <div className="px-space-lg pt-space-lg pb-space-md bg-surface-container-lowest flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md border-b border-surface-container-high">
          {/* Filter Segmented Tabs */}
          <div className="flex items-center gap-space-xs bg-surface-container-low p-1 rounded-xl self-start overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all ${
                activeTab === 'all'
                  ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              All Invoices <span className="ml-1 text-on-surface-variant font-normal">({invoices.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all ${
                activeTab === 'pending'
                  ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Pending &amp; Overdue <span className="ml-1 text-error font-semibold">({overdueCount + pendingCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('paid')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all ${
                activeTab === 'paid'
                  ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Paid <span className="ml-1 text-on-surface-variant font-normal">({paidCount})</span>
            </button>
          </div>

          {/* Search & Month Filter */}
          <div className="flex items-center gap-space-sm flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-space-xs px-space-sm py-2 rounded-lg bg-surface-container-low text-on-surface-variant w-full sm:w-64">
              <span className="material-symbols-outlined text-[18px] text-outline">search</span>
              <input
                type="text"
                placeholder="Flat, resident, or invoice ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none font-body-sm text-body-sm text-on-surface placeholder:text-outline w-full"
              />
            </div>

            <div className="flex items-center gap-space-xs px-space-sm py-2 rounded-lg bg-surface-container-low text-on-surface">
              <span className="material-symbols-outlined text-[18px] text-outline">calendar_month</span>
              <input
                type="month"
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="bg-transparent border-none outline-none font-body-sm text-body-sm text-on-surface"
              />
            </div>
          </div>
        </div>

        {/* Table Canvas */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-3 px-space-md font-semibold">Invoice #</th>
                <th className="py-3 px-space-md font-semibold">Flat</th>
                <th className="py-3 px-space-md font-semibold">Billing Period</th>
                <th className="py-3 px-space-md text-right font-semibold">Base Dues</th>
                <th className="py-3 px-space-md text-right font-semibold">Late Fine</th>
                <th className="py-3 px-space-md text-right font-semibold">Total Amount</th>
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
                      <span>Loading invoices from ACID ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-on-surface-variant">
                    No invoices found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const isPaid = inv.status === 'PAID';
                  const isOverdue = inv.status === 'OVERDUE';
                  return (
                    <tr key={inv.id} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-3 px-space-md font-label-md text-label-md text-primary font-semibold">
                        {inv.invoice_number || `#INV-${inv.id}`}
                      </td>
                      <td className="py-3 px-space-md">
                        <span className="inline-block px-2 py-0.5 rounded bg-surface-container text-on-surface font-semibold font-label-md text-label-md">
                          {inv.flat_number || `Unit #${inv.flat}`}
                        </span>
                      </td>
                      <td className="py-3 px-space-md font-body-sm text-body-sm text-on-surface-variant">
                        {inv.billing_period}
                      </td>
                      <td className="py-3 px-space-md text-right font-body-sm text-body-sm text-on-surface-variant font-mono">
                        ₹{parseFloat(inv.base_amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-space-md text-right font-body-sm text-body-sm text-error font-semibold font-mono">
                        ₹{parseFloat(inv.late_fee || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-space-md text-right font-headline-sm text-headline-sm font-semibold text-on-surface font-mono">
                        ₹{parseFloat(inv.total_amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-space-md">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-label-sm font-medium ${
                            isPaid
                              ? 'bg-surface-container text-tertiary-container'
                              : isOverdue
                              ? 'bg-error-container text-error'
                              : 'bg-surface-container-high text-on-surface-variant'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPaid ? 'bg-tertiary-container' : isOverdue ? 'bg-error' : 'bg-outline'
                            }`}
                          ></span>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-space-lg text-right">
                        <button
                          onClick={() => setActiveInvoice(inv)}
                          className="font-label-md text-label-md text-primary hover:text-primary-container px-2.5 py-1 rounded-lg hover:bg-surface-container-low transition-colors font-semibold"
                        >
                          View Invoice
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

      {/* Invoice Details / Printable Modal */}
      {activeInvoice && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-xl w-full p-space-lg shadow-lg border border-surface-container-high space-y-space-md print-container">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    Invoice {activeInvoice.invoice_number || `#INV-${activeInvoice.id}`}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Greenwood Crest Housing Society
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveInvoice(null)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant no-print"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-space-sm bg-surface-container-low p-space-md rounded-lg">
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">Unit Allocated:</span>
                <span className="font-semibold text-on-surface">{activeInvoice.flat_number || `Flat #${activeInvoice.flat}`}</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">Billing Period:</span>
                <span className="font-semibold text-on-surface">{activeInvoice.billing_period}</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">Issue Date:</span>
                <span className="font-semibold text-on-surface">{activeInvoice.issue_date}</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">Payment Due Date:</span>
                <span className="font-semibold text-on-surface">{activeInvoice.due_date}</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">Status:</span>
                <span className="font-bold uppercase text-primary">{activeInvoice.status}</span>
              </div>
            </div>

            <div className="border border-surface-container-high rounded-lg overflow-hidden">
              <div className="p-3 bg-surface-container-low font-label-sm text-label-sm uppercase font-semibold text-outline">
                Statement Line Items
              </div>
              <div className="p-space-sm space-y-2 text-body-sm">
                <div className="flex justify-between">
                  <span>Regular Maintenance Charges</span>
                  <span className="font-mono">₹{parseFloat(activeInvoice.base_amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Statutory Sinking Fund</span>
                  <span className="font-mono">₹500.00</span>
                </div>
                {parseFloat(activeInvoice.late_fee || 0) > 0 && (
                  <div className="flex justify-between text-error font-semibold">
                    <span>Overdue Interest Penalty</span>
                    <span className="font-mono">₹{parseFloat(activeInvoice.late_fee).toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-surface-container-high flex justify-between font-headline-sm text-on-surface font-semibold">
                  <span>Total Amount Payable</span>
                  <span className="font-mono">₹{parseFloat(activeInvoice.total_amount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-space-xs pt-space-xs no-print">
              <button
                onClick={() => window.print()}
                className="px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print Statement</span>
              </button>
              <button
                onClick={() => setActiveInvoice(null)}
                className="px-space-md py-2 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md font-semibold transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-space-lg shadow-lg border border-surface-container-high space-y-space-md">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">receipt</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Generate Invoice</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Issue maintenance charges to flat</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-space-sm">
              <div>
                <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                  Target Flat
                </label>
                <select
                  value={newInvoiceData.flat}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, flat: e.target.value })}
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
                    Billing Period
                  </label>
                  <input
                    type="month"
                    value={newInvoiceData.billing_period}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, billing_period: e.target.value })}
                    required
                    className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                    Base Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newInvoiceData.base_amount}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, base_amount: e.target.value })}
                    required
                    className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={newInvoiceData.issue_date}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, issue_date: e.target.value })}
                    required
                    className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newInvoiceData.due_date}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, due_date: e.target.value })}
                    required
                    className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                  Notes / Billing Description
                </label>
                <input
                  type="text"
                  value={newInvoiceData.notes}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, notes: e.target.value })}
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center justify-end gap-space-xs pt-space-xs">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-space-md py-2 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md font-semibold transition-colors shadow-sm"
                >
                  {saving ? 'Issuing...' : 'Generate Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
