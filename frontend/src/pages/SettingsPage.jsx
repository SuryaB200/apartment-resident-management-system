import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function SettingsPage() {
  const [settings, setSettings] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('society');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Society identity form
  const [societyData, setSocietyData] = useState({
    name: 'The Meridian Tower (Greenwood Crest)',
    rera: 'PRM/KA/RERA/1251/310/PR/200115',
    address: 'Survey No 42/3, Varthur Main Road, Near Greenwood High, Bengaluru, Karnataka 560087',
    email: 'management@greenwoodcrest.in',
    phone: '+91 80 4122 9081',
  });

  // Billing policies form
  const [billingConfig, setBillingConfig] = useState({
    rate_per_sqft: '3.50',
    sinking_fund: '500.00',
    late_fee_rate: '18.00',
    grace_period_days: '15',
  });

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [settingsData, policiesData] = await Promise.all([
        api.reporting.getSettings(),
        api.billing.getPolicies(),
      ]);
      setSettings(settingsData.results || settingsData);
      setPolicies(policiesData.results || policiesData);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      // Simulate saving policies
      await new Promise((r) => setTimeout(r, 600));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Error updating settings: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm uppercase tracking-wider mb-1">
            <span>System &amp; Configuration</span>
            <span>/</span>
            <span className="text-primary font-semibold">Global Registry</span>
            <span>/</span>
            <span className="px-1.5 py-0.2 rounded bg-surface-container text-primary font-mono text-[10px]">RERA Compliant</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">System &amp; Property Settings</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Configure billing rates, penalty interest equations, access control rules, and society registry.
          </p>
        </div>
        <div className="flex items-center gap-space-sm shrink-0">
          {saveSuccess && (
            <span className="font-label-md text-label-md text-tertiary-container flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Changes Saved</span>
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-10 px-space-md bg-primary-container text-on-primary hover:bg-primary transition-colors rounded-xl font-label-md text-label-md flex items-center gap-2 shadow-sm font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left Sub-Nav List */}
        <div className="lg:col-span-3 flex flex-col gap-space-xs">
          <button
            onClick={() => setActiveTab('society')}
            className={`w-full flex items-center justify-between px-space-md py-2.5 rounded-lg text-left transition-colors font-medium ${
              activeTab === 'society'
                ? 'bg-secondary-container text-on-surface font-semibold shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[18px]">apartment</span>
              <span className="font-body-md text-body-md">Society Identity</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center justify-between px-space-md py-2.5 rounded-lg text-left transition-colors font-medium ${
              activeTab === 'billing'
                ? 'bg-secondary-container text-on-surface font-semibold shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              <span className="font-body-md text-body-md">Billing &amp; Penalties</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('access')}
            className={`w-full flex items-center justify-between px-space-md py-2.5 rounded-lg text-left transition-colors font-medium ${
              activeTab === 'access'
                ? 'bg-secondary-container text-on-surface font-semibold shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[18px]">shield</span>
              <span className="font-body-md text-body-md">Gate &amp; Access Rules</span>
            </span>
          </button>

          {/* Subnav Footer Info Card */}
          <div className="mt-space-md p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs border border-surface-container-high">
            <div className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface font-semibold">
              <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
              <span>Verified Society Node</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              RERA statutory ledger connected. Changes to tax and interest formulas will be archived for compliance reporting.
            </p>
          </div>
        </div>

        {/* Right Settings Form Stack */}
        <div className="lg:col-span-9 flex flex-col gap-space-lg">
          {activeTab === 'society' && (
            <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-xs border border-surface-container-high flex flex-col gap-space-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-sm gap-space-xs border-b border-surface-container-high">
                <div>
                  <div className="font-label-sm text-label-sm uppercase tracking-wider text-outline mb-0.5">Section 01</div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">Society Identity &amp; Physical Registry</h2>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Active Registration
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-space-xs">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">Registered Society Name</label>
                  <input
                    className="h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                    type="text"
                    value={societyData.name}
                    onChange={(e) => setSocietyData({ ...societyData, name: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-space-xs">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">RERA / Official Reg. Number</label>
                  <input
                    className="h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                    type="text"
                    value={societyData.rera}
                    onChange={(e) => setSocietyData({ ...societyData, rera: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2 flex flex-col gap-space-xs">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">Campus Postal Address</label>
                  <input
                    className="h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                    type="text"
                    value={societyData.address}
                    onChange={(e) => setSocietyData({ ...societyData, address: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-space-xs">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">Management Desk Email</label>
                  <input
                    className="h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                    type="email"
                    value={societyData.email}
                    onChange={(e) => setSocietyData({ ...societyData, email: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-space-xs">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">Helpline Phone</label>
                  <input
                    className="h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                    type="tel"
                    value={societyData.phone}
                    onChange={(e) => setSocietyData({ ...societyData, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Inventory Summary */}
              <div className="pt-space-md bg-surface-container-low rounded-lg p-space-md flex flex-col md:flex-row items-center justify-between gap-space-md border border-surface-container-high">
                <div className="flex items-center gap-space-md">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary flex-shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[20px]">apartment</span>
                  </div>
                  <div>
                    <div className="font-label-md text-label-md text-on-surface font-semibold">Physical Structure Allocation</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">240 Flats across 4 Towers (Alpha, Beta, Gamma, Delta)</div>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-xs">Alpha (60)</span>
                  <span className="px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-xs">Beta (60)</span>
                  <span className="px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-xs">Gamma (60)</span>
                  <span className="px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-xs">Delta (60)</span>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'billing' && (
            <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-xs border border-surface-container-high flex flex-col gap-space-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-sm gap-space-xs border-b border-surface-container-high">
                <div>
                  <div className="font-label-sm text-label-sm uppercase tracking-wider text-outline mb-0.5">Section 02</div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">Automated Maintenance Billing &amp; Penalties</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-space-xs">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">Base Per-Sq-Ft Rate (₹)</label>
                  <input
                    className="h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                    type="number"
                    step="0.1"
                    value={billingConfig.rate_per_sqft}
                    onChange={(e) => setBillingConfig({ ...billingConfig, rate_per_sqft: e.target.value })}
                  />
                  <span className="text-body-sm text-on-surface-variant">Default: ₹3.50 per sq.ft of carpet area</span>
                </div>

                <div className="flex flex-col gap-space-xs">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">Statutory Sinking Fund (₹)</label>
                  <input
                    className="h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                    type="number"
                    value={billingConfig.sinking_fund}
                    onChange={(e) => setBillingConfig({ ...billingConfig, sinking_fund: e.target.value })}
                  />
                  <span className="text-body-sm text-on-surface-variant">Fixed monthly reserve collection</span>
                </div>

                <div className="flex flex-col gap-space-xs">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">Overdue Late Interest (% p.a.)</label>
                  <input
                    className="h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                    type="number"
                    value={billingConfig.late_fee_rate}
                    onChange={(e) => setBillingConfig({ ...billingConfig, late_fee_rate: e.target.value })}
                  />
                  <span className="text-body-sm text-on-surface-variant">Statutory model: 18.00% per annum</span>
                </div>

                <div className="flex flex-col gap-space-xs">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">Grace Period (Days)</label>
                  <input
                    className="h-10 px-3 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                    type="number"
                    value={billingConfig.grace_period_days}
                    onChange={(e) => setBillingConfig({ ...billingConfig, grace_period_days: e.target.value })}
                  />
                  <span className="text-body-sm text-on-surface-variant">Calendar days before interest triggers</span>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'access' && (
            <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-xs border border-surface-container-high flex flex-col gap-space-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-sm gap-space-xs border-b border-surface-container-high">
                <div>
                  <div className="font-label-sm text-label-sm uppercase tracking-wider text-outline mb-0.5">Section 03</div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">Gate &amp; Physical Access Rules</h2>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-surface-container-low flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-on-surface">RFID FastTag Automated Barrier</div>
                    <div className="text-body-sm text-on-surface-variant">Automatic boom barrier opening for resident vehicles</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-primary" />
                </div>

                <div className="p-4 rounded-lg bg-surface-container-low flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-on-surface">Delivery OTP Pre-Authorization</div>
                    <div className="text-body-sm text-on-surface-variant">Require delivery agents to present resident app OTP</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-primary" />
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
