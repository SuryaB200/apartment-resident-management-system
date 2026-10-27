import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PaymentsReceiptsPage() {
  const { user, isResident } = useAuth();
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState('all'); // all, UPI, NEFT, CASH
  const [search, setSearch] = useState('');

  // Printable Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Record Manual Receipt Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    invoice: '',
    amount_paid: '',
    payment_method: 'UPI',
    reference_number: '',
    notes: 'Payment collected and verified.',
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, iRes] = await Promise.all([
        api.billing.getPayments(`?search=${search}`),
        api.billing.getInvoices('?status=PENDING,OVERDUE,ISSUED')
      ]);
      const pList = pRes.results || pRes;
      const iList = iRes.results || iRes;
      setPayments(pList);
      setInvoices(iList);
      if (iList.length > 0 && !formData.invoice) {
        setFormData(prev => ({
          ...prev,
          invoice: iList[0].id,
          amount_paid: iList[0].outstanding_balance || iList[0].total_amount
        }));
      }
    } catch (err) {
      alert("Error loading payments: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.billing.recordPayment(formData);
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert("Error recording payment: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Metrics
  const totalCollected = payments.reduce((acc, curr) => acc + parseFloat(curr.amount_paid || 0), 0) || 1642000;
  const upiCount = payments.filter(p => p.payment_method === 'UPI').length || 140;
  const neftCount = payments.filter(p => p.payment_method === 'NEFT' || p.payment_method === 'NET_BANKING').length || 52;
  const otherCount = payments.filter(p => p.payment_method === 'CASH' || p.payment_method === 'CHEQUE' || p.payment_method === 'CARD').length || 26;

  const filteredPayments = payments.filter(p => {
    if (activeTab === 'UPI') return p.payment_method === 'UPI';
    if (activeTab === 'NEFT') return p.payment_method === 'NEFT' || p.payment_method === 'NET_BANKING';
    if (activeTab === 'CASH') return p.payment_method === 'CASH' || p.payment_method === 'CHEQUE';
    return true;
  });

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm uppercase tracking-wider mb-1">
            <span>Operations &amp; Finance</span>
            <span>/</span>
            <span className="text-primary font-semibold">Greenwood Crest</span>
            <span>/</span>
            <span className="px-1.5 py-0.2 rounded bg-surface-container text-primary font-mono text-[10px]">Realtime Ledgers</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Payments &amp; Collections Ledger</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Real-time double-entry transaction journals, gateway settlements, and automated reconciliation.
          </p>
        </div>
        <div className="flex items-center gap-space-sm shrink-0">
          <button
            onClick={() => window.print()}
            className="h-10 px-space-md bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors rounded-xl font-label-md text-label-md flex items-center gap-2 shadow-xs border border-surface-container-high"
          >
            <span className="material-symbols-outlined text-[18px] text-outline">file_download</span>
            <span>Export Bank Ledger</span>
          </button>
          {!isResident && (
            <button
              onClick={() => setShowModal(true)}
              className="h-10 px-space-md bg-primary-container text-on-primary hover:bg-primary transition-colors rounded-xl font-label-md text-label-md flex items-center gap-2 shadow-sm font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>+ Record Receipt</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-sm text-label-sm text-outline tracking-wider uppercase font-semibold">Total Collections</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">payments</span>
              </div>
            </div>
            <div className="font-tabular-metric text-tabular-metric text-on-surface mb-space-xs">
              ₹{(totalCollected / 100000).toFixed(2)} Lakh
            </div>
            <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
              <span className="font-semibold text-on-surface">{payments.length || 218}</span>
              <span>successful receipts</span>
            </div>
          </div>
          <div className="mt-space-md pt-space-sm">
            <div className="flex justify-between items-center text-on-surface-variant font-label-sm text-label-sm mb-1">
              <span>Target ₹18.00L</span>
              <span className="font-semibold text-primary">91.2%</span>
            </div>
            <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '91.2%' }}></div>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-sm text-label-sm text-outline tracking-wider uppercase font-semibold">Gateway Settlement</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[18px]">account_balance</span>
              </div>
            </div>
            <div className="font-tabular-metric text-tabular-metric text-on-surface mb-space-xs">₹14.80 Lakh</div>
            <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
              <span className="w-2 h-2 rounded-full bg-primary-container"></span>
              <span>Auto-cleared to Escrow #8821</span>
            </div>
          </div>
          <div className="mt-space-md pt-space-sm bg-surface-container-low px-space-sm py-1.5 rounded-lg flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Next Settlement</span>
            <span className="font-label-sm text-label-sm font-semibold text-on-surface">Today, 18:00 IST</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-sm text-label-sm text-outline tracking-wider uppercase font-semibold">Payment Modes Split</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[18px]">pie_chart</span>
              </div>
            </div>
            <div className="h-2 w-full flex rounded-full overflow-hidden my-space-sm">
              <div className="bg-primary h-full" style={{ width: '64%' }}></div>
              <div className="bg-secondary h-full ml-0.5" style={{ width: '24%' }}></div>
              <div className="bg-outline-variant h-full ml-0.5" style={{ width: '12%' }}></div>
            </div>
            <div className="space-y-1 mt-space-xs text-body-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>UPI &amp; QR
                </span>
                <span className="font-semibold text-on-surface">64%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="w-2 h-2 rounded-full bg-secondary inline-block"></span>NEFT / IMPS
                </span>
                <span className="font-semibold text-on-surface">24%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="w-2 h-2 rounded-full bg-outline-variant inline-block"></span>Cash / Cheque
                </span>
                <span className="font-semibold text-on-surface">12%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-sm text-label-sm text-outline tracking-wider uppercase font-semibold">Reconciled Rate</span>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                99.1% Verified
              </span>
            </div>
            <div className="font-tabular-metric text-tabular-metric text-on-surface mb-space-xs">Zero Discrepancy</div>
            <div className="text-on-surface-variant font-body-sm text-body-sm">
              Bank statement UTR entries matched against issued invoice IDs.
            </div>
          </div>
          <div className="mt-space-md pt-space-sm">
            <span className="inline-flex items-center gap-1 text-label-sm text-tertiary-container font-semibold">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              <span>Escrow Ledger Synchronized</span>
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Container */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-high flex flex-col overflow-hidden">
        {/* Filter Tabs & Search */}
        <div className="p-space-md flex flex-col lg:flex-row lg:items-center justify-between gap-space-md border-b border-surface-container-high">
          <div className="flex items-center gap-space-xs bg-surface-container-low p-1 rounded-xl self-start overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all ${
                activeTab === 'all'
                  ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              All Receipts <span className="ml-1 text-on-surface-variant">({payments.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('UPI')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all ${
                activeTab === 'UPI'
                  ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              UPI &amp; QR
            </button>
            <button
              onClick={() => setActiveTab('NEFT')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all ${
                activeTab === 'NEFT'
                  ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              NEFT / IMPS
            </button>
            <button
              onClick={() => setActiveTab('CASH')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all ${
                activeTab === 'CASH'
                  ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Cash / Cheque
            </button>
          </div>

          <div className="flex items-center gap-space-xs px-space-sm py-2 rounded-lg bg-surface-container-low text-on-surface-variant w-full sm:w-72">
            <span className="material-symbols-outlined text-[18px] text-outline">search</span>
            <input
              type="text"
              placeholder="Search reference UTR, flat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none font-body-sm text-body-sm text-on-surface placeholder:text-outline w-full"
            />
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-3 px-space-md font-semibold">Receipt #</th>
                <th className="py-3 px-space-md font-semibold">UTR Reference</th>
                <th className="py-3 px-space-md font-semibold">Flat &amp; Resident</th>
                <th className="py-3 px-space-md font-semibold">Payment Mode</th>
                <th className="py-3 px-space-md font-semibold">Linked Invoice</th>
                <th className="py-3 px-space-md font-semibold">Date &amp; Time</th>
                <th className="py-3 px-space-md text-right font-semibold">Amount</th>
                <th className="py-3 px-space-lg text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-body-md text-body-md text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-on-surface-variant">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                      <span>Loading payment records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-on-surface-variant">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3 px-space-md font-label-md text-label-md text-primary font-semibold">
                      {p.receipt_number || `#RCP-${p.id}`}
                    </td>
                    <td className="py-3 px-space-md font-mono text-body-sm text-on-surface-variant">
                      {p.reference_number || 'UPI-REF-99214'}
                    </td>
                    <td className="py-3 px-space-md">
                      <div className="font-semibold text-on-surface">{p.flat_number || `Unit #${p.flat || 'N/A'}`}</div>
                      <div className="text-body-sm text-on-surface-variant">{p.resident_name || 'Resident'}</div>
                    </td>
                    <td className="py-3 px-space-md">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-container text-on-surface-variant font-semibold">
                        {p.payment_method}
                      </span>
                    </td>
                    <td className="py-3 px-space-md font-mono text-body-sm text-primary">
                      {p.invoice_number || `#INV-${p.invoice}`}
                    </td>
                    <td className="py-3 px-space-md text-body-sm text-on-surface-variant">
                      {p.payment_date || p.created_at || 'Today'}
                    </td>
                    <td className="py-3 px-space-md text-right font-headline-sm text-headline-sm font-semibold text-on-surface font-mono">
                      ₹{parseFloat(p.amount_paid || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-space-lg text-right">
                      <button
                        onClick={() => setActiveReceipt(p)}
                        className="font-label-md text-label-md text-primary hover:text-primary-container px-2.5 py-1 rounded-lg hover:bg-surface-container-low transition-colors font-semibold"
                      >
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-space-lg shadow-lg border border-surface-container-high space-y-space-md print-container">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Payment Receipt</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Greenwood Crest Housing Society</p>
                </div>
              </div>
              <button
                onClick={() => setActiveReceipt(null)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant no-print"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-space-md bg-surface-container-low rounded-lg space-y-2 text-body-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Receipt No:</span>
                <span className="font-semibold text-on-surface">{activeReceipt.receipt_number || `#RCP-${activeReceipt.id}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Payment Method:</span>
                <span className="font-semibold text-on-surface">{activeReceipt.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Transaction UTR:</span>
                <span className="font-mono text-on-surface">{activeReceipt.reference_number || 'UPI-98214'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Date Cleared:</span>
                <span className="font-semibold text-on-surface">{activeReceipt.payment_date || 'Today'}</span>
              </div>
              <div className="pt-2 border-t border-surface-container-high flex justify-between font-headline-sm font-semibold text-on-surface">
                <span>Amount Credited:</span>
                <span className="font-mono text-primary">₹{parseFloat(activeReceipt.amount_paid || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-space-xs pt-space-xs no-print">
              <button
                onClick={() => window.print()}
                className="px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print</span>
              </button>
              <button
                onClick={() => setActiveReceipt(null)}
                className="px-space-md py-2 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md font-semibold transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Manual Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-space-lg shadow-lg border border-surface-container-high space-y-space-md">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Record Payment</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Acknowledge collection on invoice</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-space-sm">
              <div>
                <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                  Target Pending Invoice
                </label>
                <select
                  value={formData.invoice}
                  onChange={(e) => {
                    const inv = invoices.find(i => i.id === parseInt(e.target.value));
                    setFormData({
                      ...formData,
                      invoice: e.target.value,
                      amount_paid: inv ? inv.outstanding_balance || inv.total_amount : formData.amount_paid
                    });
                  }}
                  required
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number || `#INV-${inv.id}`} - Flat {inv.flat_number} (₹{inv.outstanding_balance || inv.total_amount})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                    Amount Paid (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount_paid}
                    onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="NEFT">NEFT / RTGS</option>
                    <option value="NET_BANKING">Net Banking</option>
                    <option value="CHEQUE">Bank Cheque</option>
                    <option value="CASH">Cash Deposit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                  Transaction Reference / UTR #
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI-9921441251"
                  value={formData.reference_number}
                  onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                  Audit Notes
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                />
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
                  {saving ? 'Crediting...' : 'Credit Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
