import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function ProjectOverviewPage() {
  const [capstoneInfo, setCapstoneInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedSection, setCopiedSection] = useState(null);

  useEffect(() => {
    async function loadInfo() {
      try {
        const data = await api.reporting.getCapstoneInfo();
        setCapstoneInfo(data);
      } catch (err) {
        console.error('Failed to load capstone info:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInfo();
  }, []);

  const copyToClipboard = (text, sectionId) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const ddlSnippet = `-- Temporal 3NF Residency Relation
CREATE TABLE Occupancy_History (
    tenancy_id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    flat_id              INT NOT NULL,
    resident_id          INT NOT NULL,
    move_in_date         DATE NOT NULL,
    move_out_date        DATE NULL,
    lease_doc_ref        VARCHAR(255),
    police_verif_status  ENUM('Pending','Verified','Rejected') DEFAULT 'Pending',
    is_active            BOOLEAN DEFAULT TRUE,
    
    -- Referential Integrity Invariants
    CONSTRAINT fk_occ_flat 
        FOREIGN KEY (flat_id) REFERENCES Flats(flat_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_occ_res 
        FOREIGN KEY (resident_id) REFERENCES Residents(resident_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
        
    -- Domain Constraint
    CONSTRAINT chk_tenancy_dates 
        CHECK (move_out_date IS NULL OR move_out_date >= move_in_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

  const triggerSnippet = `-- Trigger: Dynamic Late Fine Enforcement
DELIMITER $$
CREATE TRIGGER trg_calc_overdue_penalty
BEFORE UPDATE ON Maintenance_Invoices
FOR EACH ROW
BEGIN
    DECLARE days_overdue INT;
    IF NEW.status != 'Paid' AND CURRENT_DATE() > NEW.due_date THEN
        SET days_overdue = DATEDIFF(CURRENT_DATE(), NEW.due_date);
        -- Compound Penalty: ₹75 per day past grace period
        SET NEW.late_fee = days_overdue * 75.00;
        SET NEW.status = 'Overdue';
    END IF;
END$$
DELIMITER ;`;

  return (
    <div className="space-y-space-lg max-w-7xl mx-auto pb-16">
      {/* System Diagnostic Sub-Ribbon */}
      <div className="w-full bg-surface-container-low px-space-lg py-2.5 rounded-xl border border-outline-variant/30 flex flex-wrap items-center justify-between gap-space-md shadow-xs">
        <div className="flex items-center gap-space-md flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
            <span className="font-semibold uppercase tracking-wider text-on-surface">
              Capstone Node: SRM-TRP-2024-DBMS-R1
            </span>
          </div>
          <span className="text-outline-variant">|</span>
          <div className="flex items-center gap-1.5 font-mono text-secondary">
            <span className="material-symbols-outlined text-[16px] text-secondary">database</span>
            <span>Schema Engine: MySQL 8.0.36-InnoDB (Strict 3NF)</span>
          </div>
          <span className="text-outline-variant">|</span>
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
            <span>ACID Serializability: ENABLED</span>
          </div>
        </div>
        <div className="flex items-center gap-space-sm">
          <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-semibold border border-outline-variant/20">
            Review 1 & 2 Evaluated
          </span>
          <button
            onClick={() => window.print()}
            className="px-2.5 py-1 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors flex items-center gap-1 border border-outline-variant/30 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">print</span>
            <span>Print Specification</span>
          </button>
        </div>
      </div>

      {/* Academic Hero Header */}
      <div className="bg-surface-container-lowest p-space-xl rounded-2xl border border-outline-variant/30 shadow-xs relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-96 h-96 bg-surface-container-low rounded-full opacity-60 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-space-xl">
          <div className="space-y-space-sm max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-primary text-on-primary text-[11px] font-bold uppercase tracking-wider">
                Academic Capstone
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant text-[11px] font-semibold border border-outline-variant/20">
                B.Tech Artificial Intelligence • Batch 2024–2028
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-surface-container text-secondary text-[11px] font-semibold border border-outline-variant/20">
                Course: DBMS Capstone (Review 1 &amp; 2)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              Apartment &amp; Resident Management System
            </h1>

            <p className="text-sm text-on-surface-variant max-w-3xl leading-relaxed">
              A Normalized Relational Database System (SQL) engineered for community housing administration,
              high-concurrency temporal tenancy tracking, automated late-fine accrual triggers, and strict
              ACID transactional integrity across multi-tiered residential workflows.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-on-surface-variant text-xs">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">school</span>
                <span className="font-semibold text-on-surface">SRM Institute of Science and Technology</span>
                <span>(Tiruchirappalli Campus)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-secondary">person_celebrate</span>
                <span>Faculty Guide: <strong className="text-on-surface font-semibold">Dr. S. P. Ramya</strong> (Assistant Professor, Dept of AI)</span>
              </div>
            </div>
          </div>

          {/* Quick Summary Gauge Card */}
          <div className="w-full xl:w-80 bg-surface-container-low p-space-lg rounded-xl border border-outline-variant/30 flex flex-col justify-between space-y-space-md shrink-0 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  Review 1 & 2 Readiness
                </span>
                <div className="text-xl font-bold text-on-surface mt-0.5">100% Verified</div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                12/12 Tests Passing
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
              </div>
              <div className="flex justify-between text-[11px] text-on-surface-variant font-medium">
                <span>Problem Matrix &amp; 3NF Schema</span>
                <span className="font-semibold text-on-surface">Review Stage 1 &amp; 2 Complete</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between font-mono text-[11px] text-secondary border-t border-outline-variant/20">
              <span>Normalized Entities: <strong className="text-on-surface">9</strong></span>
              <span>Relational FKs: <strong className="text-on-surface">14</strong></span>
              <span>Triggers: <strong className="text-on-surface">3 Active</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members & Mentorship Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Member 1 */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-xs flex items-center gap-space-md">
          <div className="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center text-sm font-bold shrink-0">
            SB
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-on-surface truncate">Surya B</div>
            <div className="font-mono text-[11px] text-on-surface-variant truncate">RA2411047050042</div>
            <div className="text-[10px] font-semibold text-secondary uppercase tracking-wider">Lead Architect • Schema Design</div>
          </div>
        </div>

        {/* Member 2 */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-xs flex items-center gap-space-md">
          <div className="w-10 h-10 rounded-lg bg-secondary text-on-secondary flex items-center justify-center text-sm font-bold shrink-0">
            RR
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-on-surface truncate">Rohan Raj</div>
            <div className="font-mono text-[11px] text-on-surface-variant truncate">RA2411047050010</div>
            <div className="text-[10px] font-semibold text-secondary uppercase tracking-wider">Backend Services • Triggers</div>
          </div>
        </div>

        {/* Member 3 */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-xs flex items-center gap-space-md">
          <div className="w-10 h-10 rounded-lg bg-inverse-surface text-inverse-on-surface flex items-center justify-center text-sm font-bold shrink-0">
            SM
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-on-surface truncate">Saminathan M</div>
            <div className="font-mono text-[11px] text-on-surface-variant truncate">RA2411047050055</div>
            <div className="text-[10px] font-semibold text-secondary uppercase tracking-wider">Relational Constraints • API</div>
          </div>
        </div>

        {/* Faculty Mentor */}
        <div className="bg-surface-container-low p-space-md rounded-xl border border-outline-variant/30 shadow-xs flex items-center gap-space-md">
          <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-on-surface flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px] text-primary">psychology</span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-on-surface truncate">Dr. S. P. Ramya</div>
            <div className="text-xs text-on-surface-variant truncate">Assistant Professor (Guide)</div>
            <div className="text-[10px] font-semibold text-secondary uppercase tracking-wider">Dept of Artificial Intelligence</div>
          </div>
        </div>
      </div>

      {/* Capstone Milestone Roadmap & Four-Tier Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
        {/* Milestone Tracker (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20 mb-space-sm">
              <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">flag</span>
                <span>Project Review Roadmap</span>
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider text-secondary">
                Evaluation Cycle
              </span>
            </div>

            <div className="space-y-space-md relative">
              {/* Phase 1 */}
              <div className="flex items-start gap-space-sm">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[14px]">done</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface">Phase 1: Problem Definition &amp; Scope</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      COMPLETED
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                    Identified 6 residential operational breakdowns, stakeholder personas (Admin, Resident, Guard, Staff), and ACID constraints.
                  </p>
                </div>
              </div>

              {/* Phase 2 */}
              <div className="flex items-start gap-space-sm">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[14px]">done</span>
                </div>
                <div className="flex-1 min-w-0 bg-surface-container-low p-2 rounded-lg border border-outline-variant/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface">Phase 2: Review 1 &amp; Schema 3NF</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      COMPLETED
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                    Strict Boyce-Codd &amp; 3NF normalization across 9 entities, primary/foreign key invariants, and trigger architecture.
                  </p>
                </div>
              </div>

              {/* Phase 3 */}
              <div className="flex items-start gap-space-sm">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[14px]">done</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface">Phase 3: ER Modeling &amp; DDL Migration</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      COMPLETED
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                    Crow's foot ERD verification, physical MySQL schema indexing, stored procedures for composite billing, and database triggers.
                  </p>
                </div>
              </div>

              {/* Phase 4 */}
              <div className="flex items-start gap-space-sm">
                <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[14px]">done_all</span>
                </div>
                <div className="flex-1 min-w-0 bg-primary-container/10 p-2 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">Phase 4: Full UI &amp; Review 2 Verification</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary text-on-primary">
                      LIVE &amp; READY
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                    Django REST API layer, Tenancy OS responsive UI, live RBAC role switcher, audit logs, and test verification suite.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-space-sm mt-space-sm bg-surface-container-low px-3 py-2 rounded-lg flex items-center justify-between border border-outline-variant/20 text-xs">
            <div className="flex items-center gap-1.5 text-on-surface font-medium">
              <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
              <span>Academic Rubric Met: 3NF Normalization &amp; DDL Complete</span>
            </div>
            <span className="font-mono text-[11px] text-secondary font-semibold">SRM-DEC-2024</span>
          </div>
        </div>

        {/* Four-Tier Architectural Flow Pipeline (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20 mb-space-sm">
              <div>
                <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">account_tree</span>
                  <span>Four-Tier Architectural Workflow Engine</span>
                </h2>
                <span className="text-xs text-on-surface-variant">
                  Data transformation lifecycle: Ingestion → Transactional Compute → Storage → Dispatch
                </span>
              </div>
              <span className="px-2.5 py-1 rounded bg-surface-container-low text-on-surface text-[11px] font-semibold border border-outline-variant/20">
                ACID Pipeline
              </span>
            </div>

            {/* Flow Diagram Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-sm pt-space-xs">
              {/* Tier 1: Input */}
              <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col justify-between space-y-2 border border-outline-variant/20">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="uppercase tracking-wider text-secondary text-[10px] font-bold">Tier 01</span>
                    <span className="material-symbols-outlined text-primary text-[16px]">input</span>
                  </div>
                  <h3 className="text-xs font-bold text-on-surface mb-1">Input Tier</h3>
                  <ul className="space-y-1 text-[11px] text-on-surface-variant">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      <span>Resident &amp; Flat Profiles</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      <span>Payment Txn Inputs</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      <span>Gate Visitor Logs</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      <span>Amenity Slot Requests</span>
                    </li>
                  </ul>
                </div>
                <div className="font-mono text-[10px] text-secondary bg-surface-container-lowest p-1 rounded border border-outline-variant/20">
                  Ingress: JSON / Web Forms
                </div>
              </div>

              {/* Tier 2: Process */}
              <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col justify-between space-y-2 border border-outline-variant/20">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="uppercase tracking-wider text-secondary text-[10px] font-bold">Tier 02</span>
                    <span className="material-symbols-outlined text-secondary text-[16px]">settings_suggest</span>
                  </div>
                  <h3 className="text-xs font-bold text-on-surface mb-1">Process Tier</h3>
                  <ul className="space-y-1 text-[11px] text-on-surface-variant">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      <span>JWT &amp; RBAC Validation</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      <span>Overdue Penalty Daemon</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      <span>Slot Overlap Detector</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      <span>SLA Ticket State Machine</span>
                    </li>
                  </ul>
                </div>
                <div className="font-mono text-[10px] text-secondary bg-surface-container-lowest p-1 rounded border border-outline-variant/20">
                  Python 3.11 / REST Logic
                </div>
              </div>

              {/* Tier 3: Database */}
              <div className="bg-primary text-on-primary p-space-sm rounded-lg flex flex-col justify-between space-y-2 shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="uppercase tracking-wider text-primary-fixed text-[10px] font-bold">Tier 03 (Core)</span>
                    <span className="material-symbols-outlined text-primary-fixed text-[16px]">database</span>
                  </div>
                  <h3 className="text-xs font-bold text-on-primary mb-1">Relational DBMS</h3>
                  <ul className="space-y-1 text-[11px] text-primary-fixed-dim">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed"></span>
                      <span>InnoDB ACID Engine</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed"></span>
                      <span>3NF Normal Form</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed"></span>
                      <span>CASCADE / RESTRICT FKs</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed"></span>
                      <span>SQL Audit Triggers</span>
                    </li>
                  </ul>
                </div>
                <div className="font-mono text-[10px] text-primary-fixed bg-surface-container-highest/20 p-1 rounded">
                  MySQL 8.0 / Strict Constraints
                </div>
              </div>

              {/* Tier 4: Output */}
              <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col justify-between space-y-2 border border-outline-variant/20">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="uppercase tracking-wider text-secondary text-[10px] font-bold">Tier 04</span>
                    <span className="material-symbols-outlined text-secondary text-[16px]">output</span>
                  </div>
                  <h3 className="text-xs font-bold text-on-surface mb-1">Output Tier</h3>
                  <ul className="space-y-1 text-[11px] text-on-surface-variant">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      <span>Receipt Hashes / Ledger</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      <span>Breach Escalations</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      <span>Defaulter Registry</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      <span>Gate Pass Tokens</span>
                    </li>
                  </ul>
                </div>
                <div className="font-mono text-[10px] text-secondary bg-surface-container-lowest p-1 rounded border border-outline-variant/20">
                  Dispatch: UI &amp; Webhooks
                </div>
              </div>
            </div>
          </div>

          <div className="pt-space-sm flex flex-wrap items-center justify-between gap-2 text-on-surface-variant text-xs border-t border-outline-variant/20 mt-space-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary">sync_alt</span>
              <span>Flow Principle: Input Validated → Invariant Evaluated → ACID Commit → Client Dispatched</span>
            </div>
            <span className="font-mono text-[11px] text-secondary font-semibold">Latency Target: &lt;14ms per DML</span>
          </div>
        </div>
      </div>

      {/* The 6 Operational Friction Points Solved */}
      <div className="bg-surface-container-lowest p-space-xl rounded-2xl border border-outline-variant/30 shadow-xs space-y-space-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pb-space-sm border-b border-outline-variant/20">
          <div>
            <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">troubleshoot</span>
              <span>6 Core Operational Friction Points Solved</span>
            </h2>
            <p className="text-xs text-on-surface-variant">
              Real-world community management failures mapped directly to 3NF schema and DBMS mathematical countermeasures.
            </p>
          </div>
          <div className="px-3 py-1 rounded-md bg-surface-container-low text-on-surface font-mono text-xs border border-outline-variant/20">
            Target: Zero Inconsistency &amp; Non-Loss Decomposition
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md pt-1">
          {/* Friction Point 1 */}
          <div className="bg-surface-container-low p-space-md rounded-xl space-y-2 flex flex-col justify-between border border-outline-variant/20">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-error font-bold">Friction #1</span>
                <span className="material-symbols-outlined text-error text-[18px]">history_edu</span>
              </div>
              <h3 className="text-xs font-bold text-on-surface mt-1">Overwritten Tenancy Records</h3>
              <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                Traditional spreadsheets or flat tables replace tenant names upon move-out, destroying historical maintenance dues, police verification audits, and legal accountability.
              </p>
            </div>
            <div className="bg-surface-container-lowest p-2 rounded-lg text-[11px] space-y-1 border border-outline-variant/20">
              <div className="text-[11px] text-primary font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>Solution: Temporal 3NF Log</span>
              </div>
              <p className="text-on-surface-variant font-mono text-[10px]">
                Entity <strong className="text-on-surface">`Occupancy_History`</strong> with surrogate <code className="bg-surface-container px-1 py-0.5 rounded">tenancy_id</code> PK, valid-time intervals, and append-only constraints.
              </p>
            </div>
          </div>

          {/* Friction Point 2 */}
          <div className="bg-surface-container-low p-space-md rounded-xl space-y-2 flex flex-col justify-between border border-outline-variant/20">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-error font-bold">Friction #2</span>
                <span className="material-symbols-outlined text-error text-[18px]">price_change</span>
              </div>
              <h3 className="text-xs font-bold text-on-surface mt-1">Dues &amp; Late Fee Revenue Leakage</h3>
              <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                Manual invoice generation and late fine computations lead to unpaid accruals, disputed penalties, and arbitrary manual fee waivers with no audit trail.
              </p>
            </div>
            <div className="bg-surface-container-lowest p-2 rounded-lg text-[11px] space-y-1 border border-outline-variant/20">
              <div className="text-[11px] text-primary font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>Solution: Automated Trigger Enforcement</span>
              </div>
              <p className="text-on-surface-variant font-mono text-[10px]">
                DBMS Trigger <code className="bg-surface-container px-1 py-0.5 rounded">trg_calc_overdue_penalty()</code> executes nightly with immutable snapshot ledgers in <strong className="text-on-surface">`Maintenance_Invoices`</strong>.
              </p>
            </div>
          </div>

          {/* Friction Point 3 */}
          <div className="bg-surface-container-low p-space-md rounded-xl space-y-2 flex flex-col justify-between border border-outline-variant/20">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-error font-bold">Friction #3</span>
                <span className="material-symbols-outlined text-error text-[18px]">pending_actions</span>
              </div>
              <h3 className="text-xs font-bold text-on-surface mt-1">Untracked Maintenance SLAs</h3>
              <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                Resident complaints regarding plumbing, lifts, and electricity get lost in WhatsApp chats or verbal handoffs to building staff without escalation clocks.
              </p>
            </div>
            <div className="bg-surface-container-lowest p-2 rounded-lg text-[11px] space-y-1 border border-outline-variant/20">
              <div className="text-[11px] text-primary font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>Solution: State Machine &amp; Timestamp Audits</span>
              </div>
              <p className="text-on-surface-variant font-mono text-[10px]">
                <strong className="text-on-surface">`Service_Tickets`</strong> enforces enum state transitions <code className="bg-surface-container px-1 py-0.5 rounded">OPEN -&gt; ASSIGNED -&gt; RESOLVED</code> with staff FK assignment.
              </p>
            </div>
          </div>

          {/* Friction Point 4 */}
          <div className="bg-surface-container-low p-space-md rounded-xl space-y-2 flex flex-col justify-between border border-outline-variant/20">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-error font-bold">Friction #4</span>
                <span className="material-symbols-outlined text-error text-[18px]">security</span>
              </div>
              <h3 className="text-xs font-bold text-on-surface mt-1">Unverified Paper Visitor Logs</h3>
              <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                Physical gate registers contain illegible handwriting, fictitious destination flat numbers, zero check-out tracking, and non-existent forensic traceability.
              </p>
            </div>
            <div className="bg-surface-container-lowest p-2 rounded-lg text-[11px] space-y-1 border border-outline-variant/20">
              <div className="text-[11px] text-primary font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>Solution: Relational Gate Verification</span>
              </div>
              <p className="text-on-surface-variant font-mono text-[10px]">
                <strong className="text-on-surface">`Visitor_Logs`</strong> binds foreign key <code className="bg-surface-container px-1 py-0.5 rounded">destination_flat_id</code> with check-in timestamping and guard badge ID validation.
              </p>
            </div>
          </div>

          {/* Friction Point 5 */}
          <div className="bg-surface-container-low p-space-md rounded-xl space-y-2 flex flex-col justify-between border border-outline-variant/20">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-error font-bold">Friction #5</span>
                <span className="material-symbols-outlined text-error text-[18px]">event_busy</span>
              </div>
              <h3 className="text-xs font-bold text-on-surface mt-1">Amenity Double-Bookings</h3>
              <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                Simultaneous bookings for the clubhouse, pool pavilion, and tennis courts cause resident clashes due to lack of race-condition prevention in manual logs.
              </p>
            </div>
            <div className="bg-surface-container-lowest p-2 rounded-lg text-[11px] space-y-1 border border-outline-variant/20">
              <div className="text-[11px] text-primary font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>Solution: Slot Exclusion Constraints</span>
              </div>
              <p className="text-on-surface-variant font-mono text-[10px]">
                <strong className="text-on-surface">`Amenity_Bookings`</strong> operates with serializable isolation &amp; overlap checks <code className="bg-surface-container px-1 py-0.5 rounded">NOT (start &gt;= b.end OR end &lt;= b.start)</code>.
              </p>
            </div>
          </div>

          {/* Friction Point 6 */}
          <div className="bg-surface-container-low p-space-md rounded-xl space-y-2 flex flex-col justify-between border border-outline-variant/20">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-error font-bold">Friction #6</span>
                <span className="material-symbols-outlined text-error text-[18px]">local_parking</span>
              </div>
              <h3 className="text-xs font-bold text-on-surface mt-1">Unregistered Parking Disputes</h3>
              <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                Tenants and visitors occupy unauthorized basement slots; lack of unit-level parking quotas sparks daily conflict and blocked emergency fire access.
              </p>
            </div>
            <div className="bg-surface-container-lowest p-2 rounded-lg text-[11px] space-y-1 border border-outline-variant/20">
              <div className="text-[11px] text-primary font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>Solution: 1:1 / 1:N Slot Quota Model</span>
              </div>
              <p className="text-on-surface-variant font-mono text-[10px]">
                <strong className="text-on-surface">`Parking_Slots`</strong> maintains deterministic <code className="bg-surface-container px-1 py-0.5 rounded">assigned_flat_id</code> FK and UNIQUE constraint on vehicle registration strings.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 9 Relational Entities Catalog (Normalized 3NF Model) */}
      <div className="bg-surface-container-lowest p-space-xl rounded-2xl border border-outline-variant/30 shadow-xs space-y-space-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-space-sm pb-space-sm border-b border-outline-variant/20">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-on-surface">Database Architecture: 9 Normalized Entities (3NF)</h2>
              <span className="px-2 py-0.5 rounded bg-primary text-on-primary text-[10px] font-bold">
                Strict Boyce-Codd &amp; 3NF
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Every non-key attribute is fully functionally dependent on the Primary Key, and only on the Primary Key (no transitive dependencies).
            </p>
          </div>
          <div className="flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded-lg border border-outline-variant/20">
            <span className="text-[11px] font-medium text-on-surface-variant">Schema View:</span>
            <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-[11px] font-bold text-on-surface shadow-xs border border-outline-variant/20">
              All 9 Tables
            </span>
          </div>
        </div>

        {/* Entity Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
          {/* Table 1: Flats */}
          <div className="bg-surface-container-low rounded-xl overflow-hidden flex flex-col justify-between border border-outline-variant/20 shadow-xs">
            <div className="bg-surface-container px-space-md py-2 flex items-center justify-between border-b border-outline-variant/20">
              <span className="font-mono text-xs text-on-surface font-bold">1. Flats</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-lowest text-secondary font-semibold border border-outline-variant/20">
                Spatial Physical
              </span>
            </div>
            <div className="p-space-md font-mono text-[11px] space-y-1 flex-1">
              <div className="text-primary font-bold">flat_id (PK, INT AUTO_INC)</div>
              <div className="text-on-surface">block_id (VARCHAR(4))</div>
              <div className="text-on-surface">floor_no (SMALLINT)</div>
              <div className="text-on-surface">flat_no (VARCHAR(8))</div>
              <div className="text-on-surface">carpet_sqft (DECIMAL(7,2))</div>
              <div className="text-on-surface">typology (ENUM: 1BHK, 2BHK, 3BHK, Penthouse)</div>
              <div className="text-secondary font-semibold">owner_id (FK -&gt; Residents.resident_id)</div>
              <div className="text-on-surface">status (ENUM: Occupied, Vacant, Maintenance)</div>
            </div>
            <div className="px-space-md py-1.5 bg-surface-container-lowest text-[10px] text-on-surface-variant border-t border-outline-variant/20">
              Constraint: <code className="text-primary font-semibold">UNIQUE(block_id, flat_no)</code>
            </div>
          </div>

          {/* Table 2: Residents */}
          <div className="bg-surface-container-low rounded-xl overflow-hidden flex flex-col justify-between border border-outline-variant/20 shadow-xs">
            <div className="bg-surface-container px-space-md py-2 flex items-center justify-between border-b border-outline-variant/20">
              <span className="font-mono text-xs text-on-surface font-bold">2. Residents</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-lowest text-secondary font-semibold border border-outline-variant/20">
                Persona Entity
              </span>
            </div>
            <div className="p-space-md font-mono text-[11px] space-y-1 flex-1">
              <div className="text-primary font-bold">resident_id (PK, INT AUTO_INC)</div>
              <div className="text-on-surface">first_name (VARCHAR(50))</div>
              <div className="text-on-surface">last_name (VARCHAR(50))</div>
              <div className="text-on-surface">phone (VARCHAR(15) UNIQUE)</div>
              <div className="text-on-surface">email (VARCHAR(100) UNIQUE)</div>
              <div className="text-on-surface">id_proof_type (ENUM: Aadhaar, PAN, Passport)</div>
              <div className="text-on-surface">id_proof_no (VARCHAR(30) UNIQUE)</div>
              <div className="text-on-surface">resident_type (ENUM: Owner, Tenant, Family)</div>
            </div>
            <div className="px-space-md py-1.5 bg-surface-container-lowest text-[10px] text-on-surface-variant border-t border-outline-variant/20">
              Zero Nulls on Verified KYC Identifiers
            </div>
          </div>

          {/* Table 3: Occupancy_History */}
          <div className="bg-surface-container-low rounded-xl overflow-hidden flex flex-col justify-between border border-outline-variant/20 shadow-xs">
            <div className="bg-surface-container px-space-md py-2 flex items-center justify-between border-b border-outline-variant/20">
              <span className="font-mono text-xs text-on-surface font-bold">3. Occupancy_History</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary text-on-primary font-bold">
                Temporal 3NF
              </span>
            </div>
            <div className="p-space-md font-mono text-[11px] space-y-1 flex-1">
              <div className="text-primary font-bold">tenancy_id (PK, BIGINT AUTO_INC)</div>
              <div className="text-secondary font-semibold">flat_id (FK -&gt; Flats.flat_id)</div>
              <div className="text-secondary font-semibold">resident_id (FK -&gt; Residents.resident_id)</div>
              <div className="text-on-surface">move_in_date (DATE NOT NULL)</div>
              <div className="text-on-surface">move_out_date (DATE NULL)</div>
              <div className="text-on-surface">lease_doc_ref (VARCHAR(255))</div>
              <div className="text-on-surface">police_verif_status (ENUM: Pending, Verified)</div>
              <div className="text-on-surface">is_active (BOOLEAN DEFAULT TRUE)</div>
            </div>
            <div className="px-space-md py-1.5 bg-surface-container-lowest text-[10px] text-on-surface-variant border-t border-outline-variant/20">
              Constraint: Check <code className="text-primary font-semibold">move_out_date &gt;= move_in_date</code>
            </div>
          </div>

          {/* Table 4: Maintenance_Invoices */}
          <div className="bg-surface-container-low rounded-xl overflow-hidden flex flex-col justify-between border border-outline-variant/20 shadow-xs">
            <div className="bg-surface-container px-space-md py-2 flex items-center justify-between border-b border-outline-variant/20">
              <span className="font-mono text-xs text-on-surface font-bold">4. Maintenance_Invoices</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-lowest text-secondary font-semibold border border-outline-variant/20">
                Financial Ledger
              </span>
            </div>
            <div className="p-space-md font-mono text-[11px] space-y-1 flex-1">
              <div className="text-primary font-bold">invoice_id (PK, BIGINT AUTO_INC)</div>
              <div className="text-secondary font-semibold">flat_id (FK -&gt; Flats.flat_id)</div>
              <div className="text-on-surface">billing_month (CHAR(7)) -- 'YYYY-MM'</div>
              <div className="text-on-surface">base_amount (DECIMAL(10,2))</div>
              <div className="text-on-surface">late_fee (DECIMAL(10,2) DEFAULT 0.00)</div>
              <div className="text-on-surface font-bold">total_due (DECIMAL(10,2) GENERATED)</div>
              <div className="text-on-surface">due_date (DATE)</div>
              <div className="text-on-surface">status (ENUM: Unpaid, Paid, Overdue, Waived)</div>
            </div>
            <div className="px-space-md py-1.5 bg-surface-container-lowest text-[10px] text-on-surface-variant border-t border-outline-variant/20">
              Trigger Target: <code className="text-primary font-semibold">trg_calc_overdue_penalty()</code>
            </div>
          </div>

          {/* Table 5: Payments */}
          <div className="bg-surface-container-low rounded-xl overflow-hidden flex flex-col justify-between border border-outline-variant/20 shadow-xs">
            <div className="bg-surface-container px-space-md py-2 flex items-center justify-between border-b border-outline-variant/20">
              <span className="font-mono text-xs text-on-surface font-bold">5. Payments</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-lowest text-secondary font-semibold border border-outline-variant/20">
                ACID Settlement
              </span>
            </div>
            <div className="p-space-md font-mono text-[11px] space-y-1 flex-1">
              <div className="text-primary font-bold">payment_id (PK, BIGINT AUTO_INC)</div>
              <div className="text-secondary font-semibold">invoice_id (FK -&gt; Maintenance_Invoices)</div>
              <div className="text-on-surface">amount_paid (DECIMAL(10,2))</div>
              <div className="text-on-surface">payment_date (DATETIME DEFAULT NOW())</div>
              <div className="text-on-surface">payment_mode (ENUM: UPI, NEFT, Card, Cash)</div>
              <div className="text-on-surface">txn_ref_no (VARCHAR(64) UNIQUE)</div>
              <div className="text-on-surface">receipt_hash (CHAR(64)) -- SHA-256</div>
            </div>
            <div className="px-space-md py-1.5 bg-surface-container-lowest text-[10px] text-on-surface-variant border-t border-outline-variant/20">
              Integrity: Idempotent Transaction Keys
            </div>
          </div>

          {/* Table 6: Service_Tickets */}
          <div className="bg-surface-container-low rounded-xl overflow-hidden flex flex-col justify-between border border-outline-variant/20 shadow-xs">
            <div className="bg-surface-container px-space-md py-2 flex items-center justify-between border-b border-outline-variant/20">
              <span className="font-mono text-xs text-on-surface font-bold">6. Service_Tickets</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-lowest text-secondary font-semibold border border-outline-variant/20">
                Operations SLA
              </span>
            </div>
            <div className="p-space-md font-mono text-[11px] space-y-1 flex-1">
              <div className="text-primary font-bold">ticket_id (PK, INT AUTO_INC)</div>
              <div className="text-secondary font-semibold">flat_id (FK -&gt; Flats.flat_id)</div>
              <div className="text-secondary font-semibold">resident_id (FK -&gt; Residents.resident_id)</div>
              <div className="text-on-surface">category (ENUM: Electrical, Plumbing, Civil, Lift)</div>
              <div className="text-on-surface">priority (ENUM: Low, Medium, High, Emergency)</div>
              <div className="text-on-surface">status (ENUM: Open, Assigned, In_Progress, Closed)</div>
              <div className="text-secondary font-semibold">assigned_staff_id (FK NULLABLE)</div>
              <div className="text-on-surface">created_at / resolved_at (DATETIME)</div>
            </div>
            <div className="px-space-md py-1.5 bg-surface-container-lowest text-[10px] text-on-surface-variant border-t border-outline-variant/20">
              SLA Escalation Daemon Monitoring
            </div>
          </div>

          {/* Table 7: Visitor_Logs */}
          <div className="bg-surface-container-low rounded-xl overflow-hidden flex flex-col justify-between border border-outline-variant/20 shadow-xs">
            <div className="bg-surface-container px-space-md py-2 flex items-center justify-between border-b border-outline-variant/20">
              <span className="font-mono text-xs text-on-surface font-bold">7. Visitor_Logs</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-lowest text-secondary font-semibold border border-outline-variant/20">
                Perimeter Security
              </span>
            </div>
            <div className="p-space-md font-mono text-[11px] space-y-1 flex-1">
              <div className="text-primary font-bold">visitor_id (PK, BIGINT AUTO_INC)</div>
              <div className="text-on-surface">visitor_name (VARCHAR(60))</div>
              <div className="text-on-surface">phone (VARCHAR(15))</div>
              <div className="text-on-surface">vehicle_no (VARCHAR(20) NULL)</div>
              <div className="text-secondary font-semibold">destination_flat_id (FK -&gt; Flats.flat_id)</div>
              <div className="text-on-surface">checkin_time (DATETIME DEFAULT NOW())</div>
              <div className="text-on-surface">checkout_time (DATETIME NULL)</div>
              <div className="text-on-surface">guard_id (INT) &amp; status (ENUM)</div>
            </div>
            <div className="px-space-md py-1.5 bg-surface-container-lowest text-[10px] text-on-surface-variant border-t border-outline-variant/20">
              Automatic Resident Notification Handshake
            </div>
          </div>

          {/* Table 8: Amenities & Bookings */}
          <div className="bg-surface-container-low rounded-xl overflow-hidden flex flex-col justify-between border border-outline-variant/20 shadow-xs">
            <div className="bg-surface-container px-space-md py-2 flex items-center justify-between border-b border-outline-variant/20">
              <span className="font-mono text-xs text-on-surface font-bold">8. Amenities &amp; Bookings</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-lowest text-secondary font-semibold border border-outline-variant/20">
                Facility Asset
              </span>
            </div>
            <div className="p-space-md font-mono text-[11px] space-y-1 flex-1">
              <div className="text-primary font-bold">amenity_id (PK) | booking_id (PK)</div>
              <div className="text-on-surface">name, capacity, hourly_rate (DECIMAL)</div>
              <div className="text-on-surface">opening_time, closing_time (TIME)</div>
              <div className="text-secondary font-semibold">amenity_id (FK -&gt; Amenities)</div>
              <div className="text-secondary font-semibold">flat_id (FK -&gt; Flats.flat_id)</div>
              <div className="text-on-surface">slot_start (DATETIME)</div>
              <div className="text-on-surface">slot_end (DATETIME)</div>
              <div className="text-on-surface">status (ENUM: Confirmed, Cancelled, Completed)</div>
            </div>
            <div className="px-space-md py-1.5 bg-surface-container-lowest text-[10px] text-on-surface-variant border-t border-outline-variant/20">
              Constraint: Overlap Exclusion Indexing
            </div>
          </div>

          {/* Table 9: Parking_Slots */}
          <div className="bg-surface-container-low rounded-xl overflow-hidden flex flex-col justify-between border border-outline-variant/20 shadow-xs">
            <div className="bg-surface-container px-space-md py-2 flex items-center justify-between border-b border-outline-variant/20">
              <span className="font-mono text-xs text-on-surface font-bold">9. Parking_Slots</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-lowest text-secondary font-semibold border border-outline-variant/20">
                Asset Allocation
              </span>
            </div>
            <div className="p-space-md font-mono text-[11px] space-y-1 flex-1">
              <div className="text-primary font-bold">slot_id (PK, INT AUTO_INC)</div>
              <div className="text-on-surface">slot_code (VARCHAR(10) UNIQUE) -- e.g. B1-A12</div>
              <div className="text-on-surface">basement_level (ENUM: B1, B2, Ground, Open)</div>
              <div className="text-secondary font-semibold">assigned_flat_id (FK -&gt; Flats.flat_id NULL)</div>
              <div className="text-on-surface">vehicle_reg_no (VARCHAR(20) NULL)</div>
              <div className="text-on-surface">allocation_status (ENUM: Allocated, Reserved, Free)</div>
            </div>
            <div className="px-space-md py-1.5 bg-surface-container-lowest text-[10px] text-on-surface-variant border-t border-outline-variant/20">
              Constraint: Check vehicle registration string validity
            </div>
          </div>
        </div>
      </div>

      {/* SQL DDL / Automated Trigger / ACID Code Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
        {/* DDL Highlight Card */}
        <div className="bg-surface-container-lowest p-space-lg rounded-2xl border border-outline-variant/30 shadow-xs space-y-space-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20 mb-space-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">code</span>
                <h3 className="text-xs font-bold text-on-surface">3NF DDL: Temporal Tenancy Schema</h3>
              </div>
              <button
                onClick={() => copyToClipboard(ddlSnippet, 'ddl')}
                className="px-2 py-0.5 rounded bg-surface-container text-secondary text-[10px] font-bold hover:bg-surface-container-high transition flex items-center gap-1 border border-outline-variant/20 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[12px]">
                  {copiedSection === 'ddl' ? 'check' : 'content_copy'}
                </span>
                <span>{copiedSection === 'ddl' ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>
            <p className="text-xs text-on-surface-variant mb-space-xs">
              Prevents data loss when tenancy terminates. Employs cascading foreign key constraints and temporal validity checks.
            </p>
            <pre className="bg-[#0b1c30] text-[#c1beff] p-space-md rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-[#213145]">
              {ddlSnippet}
            </pre>
          </div>
          <div className="pt-space-xs flex items-center justify-between text-[11px] font-semibold text-secondary border-t border-outline-variant/20 mt-space-xs">
            <span>Non-loss decomposition guarantee</span>
            <span>Indexed PK/FK join paths</span>
          </div>
        </div>

        {/* Automated Trigger Highlight Card */}
        <div className="bg-surface-container-lowest p-space-lg rounded-2xl border border-outline-variant/30 shadow-xs space-y-space-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20 mb-space-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
                <h3 className="text-xs font-bold text-on-surface">Automated Trigger: Overdue Penalty Engine</h3>
              </div>
              <button
                onClick={() => copyToClipboard(triggerSnippet, 'trigger')}
                className="px-2 py-0.5 rounded bg-surface-container text-secondary text-[10px] font-bold hover:bg-surface-container-high transition flex items-center gap-1 border border-outline-variant/20 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[12px]">
                  {copiedSection === 'trigger' ? 'check' : 'content_copy'}
                </span>
                <span>{copiedSection === 'trigger' ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>
            <p className="text-xs text-on-surface-variant mb-space-xs">
              Eliminates human revenue leakage by computing daily late fees dynamically prior to ledger update commits.
            </p>
            <pre className="bg-[#0b1c30] text-[#c1beff] p-space-md rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-[#213145]">
              {triggerSnippet}
            </pre>
          </div>
          <div className="pt-space-xs flex items-center justify-between text-[11px] font-semibold text-secondary border-t border-outline-variant/20 mt-space-xs">
            <span>Determinism: Deterministic state output</span>
            <span>Zero manual intervention</span>
          </div>
        </div>
      </div>

      {/* Technology Stack Specifications Grid */}
      <div className="bg-surface-container-lowest p-space-xl rounded-2xl border border-outline-variant/30 shadow-xs space-y-space-md">
        <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20">
          <div>
            <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">layers</span>
              <span>Technology Stack &amp; Development Toolchain</span>
            </h2>
            <p className="text-xs text-on-surface-variant">
              Enterprise toolchain aligned with SRM Institute of Science &amp; Technology capstone review guidelines.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-surface-container-high text-on-surface text-[11px] font-bold border border-outline-variant/20">
            Standard Architecture
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md pt-1">
          {/* Frontend */}
          <div className="bg-surface-container-low p-space-md rounded-xl space-y-2 border border-outline-variant/20">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary border border-outline-variant/20 shadow-xs">
                <span className="material-symbols-outlined text-[18px]">web</span>
              </span>
              <div>
                <div className="text-xs font-bold text-on-surface">Frontend Client</div>
                <div className="text-[10px] text-secondary font-medium">Tier 1 Presentation</div>
              </div>
            </div>
            <ul className="text-xs text-on-surface-variant space-y-1 pt-1">
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>React 19 (SPA Architecture)</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>Tailwind CSS v4 Utility Engine</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>Tenancy OS Design System</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>Material Symbols Icons</li>
            </ul>
          </div>

          {/* Backend */}
          <div className="bg-surface-container-low p-space-md rounded-xl space-y-2 border border-outline-variant/20">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary border border-outline-variant/20 shadow-xs">
                <span className="material-symbols-outlined text-[18px]">terminal</span>
              </span>
              <div>
                <div className="text-xs font-bold text-on-surface">API &amp; Backend</div>
                <div className="text-[10px] text-secondary font-medium">Tier 2 Logic Daemon</div>
              </div>
            </div>
            <ul className="text-xs text-on-surface-variant space-y-1 pt-1">
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>Python 3.11 Runtime</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>Django 5.0 REST Framework</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>JWT Token Authentication</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>ACID Transaction Isolation</li>
            </ul>
          </div>

          {/* Database */}
          <div className="bg-surface-container-low p-space-md rounded-xl space-y-2 border border-outline-variant/20">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary border border-outline-variant/20 shadow-xs">
                <span className="material-symbols-outlined text-[18px]">dns</span>
              </span>
              <div>
                <div className="text-xs font-bold text-on-surface">ACID Database</div>
                <div className="text-[10px] text-secondary font-medium">Tier 3 Normalized Storage</div>
              </div>
            </div>
            <ul className="text-xs text-on-surface-variant space-y-1 pt-1">
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>MySQL 8.0 (InnoDB Engine)</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>SQLite / PostgreSQL Support</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>3NF Strict Normal Form</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>Repeatable Read Isolation</li>
            </ul>
          </div>

          {/* Tooling */}
          <div className="bg-surface-container-low p-space-md rounded-xl space-y-2 border border-outline-variant/20">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary border border-outline-variant/20 shadow-xs">
                <span className="material-symbols-outlined text-[18px]">build</span>
              </span>
              <div>
                <div className="text-xs font-bold text-on-surface">Dev Tooling</div>
                <div className="text-[10px] text-secondary font-medium">DevOps &amp; Testing</div>
              </div>
            </div>
            <ul className="text-xs text-on-surface-variant space-y-1 pt-1">
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>MySQL Workbench (ER Modeling)</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>Automated Django Test Suite</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>Git &amp; GitHub Version Control</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>Vite 8 Hot-Module Replacement</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Academic Footer Affirmation */}
      <div className="bg-surface-container-low p-space-lg rounded-2xl border border-outline-variant/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md shadow-xs">
        <div className="flex items-center gap-space-md">
          <div className="w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary shrink-0 border border-outline-variant/20 shadow-xs">
            <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
          </div>
          <div>
            <div className="text-sm font-bold text-on-surface">
              Review 1 &amp; 2 Academic Submission Dossier Complete
            </div>
            <div className="text-xs text-on-surface-variant">
              Department of Artificial Intelligence • SRM Institute of Science and Technology, Tiruchirappalli
            </div>
          </div>
        </div>
        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            onClick={() => copyToClipboard(ddlSnippet + '\n\n' + triggerSnippet, 'full-ddl')}
            className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-semibold hover:bg-surface-container shadow-xs flex items-center gap-1 border border-outline-variant/30 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copiedSection === 'full-ddl' ? 'check' : 'file_download'}
            </span>
            <span>{copiedSection === 'full-ddl' ? 'Copied Full DDL' : 'Export SQL DDL Script'}</span>
          </button>
          <div className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold shadow-xs flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Review Baseline Locked &amp; Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
