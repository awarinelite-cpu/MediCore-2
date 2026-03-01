import { useState, useEffect, useRef, useCallback } from "react";

// ── API base URL ─────────────────────────────────────────────
// In production the Express server serves both frontend and API
const API_BASE = import.meta.env.VITE_API_URL || "";

// ── CSS ──────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #0a0f1e; color: #e2e8f0; min-height: 100vh; }

  :root {
    --accent: #00d4ff; --accent2: #7c3aed;
    --surface: #0f172a; --surface2: #1e293b; --surface3: #334155;
    --text: #e2e8f0; --text-dim: #94a3b8; --border: rgba(148,163,184,0.15);
    --radius: 12px; --radius-lg: 20px;
  }

  .mc-app {
    min-height: 100vh;
    background: #0a0f1e;
    background-image:
      radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,212,255,0.08) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 60%, rgba(124,58,237,0.06) 0%, transparent 50%);
  }

  /* HEADER */
  .mc-header {
    position: sticky; top: 0; z-index: 100;
    background: rgba(10,15,30,0.85); backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border); padding: 0 1.5rem;
  }
  .mc-header-inner {
    max-width: 1100px; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between; height: 64px;
  }
  .mc-logo-btn {
    background: none; border: none; cursor: pointer;
    display: flex; align-items: center; gap: 0.75rem;
  }
  .mc-logo-icon {
    width: 36px; height: 36px;
    background: linear-gradient(135deg,#00d4ff,#7c3aed);
    border-radius: 10px; display: flex; align-items: center; justify-content: center;
    font-size: 18px; box-shadow: 0 0 20px rgba(0,212,255,0.3);
  }
  .mc-logo-text {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.3rem;
    background: linear-gradient(135deg,#00d4ff,#a78bfa);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .mc-badge {
    font-size: 0.65rem; font-weight: 600;
    background: rgba(0,212,255,0.15); color: var(--accent);
    border: 1px solid rgba(0,212,255,0.3); border-radius: 20px;
    padding: 2px 8px; letter-spacing: 0.05em;
  }
  .mc-ai-badge {
    font-size: 0.7rem; font-weight: 600;
    background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(0,212,255,0.2));
    color: #a78bfa; border: 1px solid rgba(124,58,237,0.3);
    border-radius: 20px; padding: 4px 12px;
    display: flex; align-items: center; gap: 6px;
  }
  .mc-ai-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #a78bfa; animation: pulse-dot 2s infinite;
  }
  @keyframes pulse-dot {
    0%,100% { opacity:1; transform: scale(1); }
    50% { opacity:0.5; transform: scale(0.8); }
  }

  /* MAIN */
  .mc-main { max-width: 1100px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }

  /* SEARCH */
  .mc-search-hero { text-align: center; margin-bottom: 2rem; }
  .mc-search-hero h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.8rem,4vw,2.8rem); font-weight: 800;
    line-height: 1.15; margin-bottom: 0.75rem;
    background: linear-gradient(135deg,#f1f5f9,#94a3b8);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .mc-search-hero p { color: var(--text-dim); font-size: 0.95rem; line-height: 1.6; }
  .mc-search-hero .mc-ai-note {
    display: inline-flex; align-items: center; gap: 8px;
    margin-top: 0.75rem; font-size: 0.82rem;
    background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.25);
    border-radius: 30px; padding: 6px 14px; color: #a78bfa;
  }

  .mc-search-box {
    position: relative; max-width: 620px; margin: 0 auto;
  }
  .mc-search-icon {
    position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
    color: var(--accent); font-size: 1.1rem; pointer-events: none;
  }
  .mc-search-input {
    width: 100%; background: var(--surface2);
    border: 1.5px solid var(--border); border-radius: var(--radius-lg);
    padding: 16px 56px 16px 48px;
    font-family: 'DM Sans',sans-serif; font-size: 1rem; color: var(--text);
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .mc-search-input::placeholder { color: var(--text-dim); }
  .mc-search-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(0,212,255,0.1), 0 0 30px rgba(0,212,255,0.05);
  }
  .mc-search-btn {
    position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
    background: linear-gradient(135deg,#00d4ff,#7c3aed);
    border: none; border-radius: 12px; padding: 8px 16px;
    color: #fff; font-family: 'DM Sans',sans-serif; font-weight: 600;
    font-size: 0.85rem; cursor: pointer; transition: opacity 0.2s;
    white-space: nowrap;
  }
  .mc-search-btn:hover { opacity: 0.9; }
  .mc-search-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* BREADCRUMB */
  .mc-breadcrumb {
    display: flex; align-items: center; gap: 8px;
    font-size: 0.82rem; color: var(--text-dim);
    margin-bottom: 1.5rem; flex-wrap: wrap;
  }
  .mc-breadcrumb-btn {
    background: none; border: none; color: var(--accent);
    cursor: pointer; font-size: 0.82rem; padding: 0;
    text-decoration: underline; text-underline-offset: 3px;
    font-family: 'DM Sans',sans-serif;
  }

  /* LOADING */
  .mc-loading {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 4rem 2rem; gap: 1.5rem;
  }
  .mc-spinner {
    width: 56px; height: 56px;
    border: 3px solid rgba(0,212,255,0.1);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .mc-loading-text {
    font-family: 'Syne',sans-serif; font-size: 1rem;
    color: var(--text-dim); text-align: center;
  }
  .mc-loading-sub { font-size: 0.8rem; color: #475569; margin-top: 4px; }

  /* ERROR */
  .mc-error {
    background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25);
    border-radius: var(--radius); padding: 1rem 1.25rem;
    color: #fca5a5; font-size: 0.9rem; margin-bottom: 1.5rem;
    display: flex; align-items: flex-start; gap: 10px;
  }

  /* CARD */
  .mc-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 1.25rem;
  }
  .mc-section-title {
    font-family: 'Syne',sans-serif; font-size: 0.9rem; font-weight: 700;
    color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.08em;
    margin-bottom: 1rem; display: flex; align-items: center; gap: 8px;
  }

  /* DIAGNOSIS OVERVIEW */
  .mc-diag-name {
    font-family: 'Syne',sans-serif; font-size: 1.6rem; font-weight: 800;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg,#f1f5f9,#a78bfa);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .mc-diag-desc { color: var(--text-dim); line-height: 1.7; font-size: 0.95rem; }
  .mc-ai-generated {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.72rem; color: #a78bfa; margin-top: 0.75rem;
    background: rgba(124,58,237,0.1); border-radius: 20px; padding: 3px 10px;
  }

  /* TYPE SELECTOR */
  .mc-type-grid { display: flex; flex-wrap: wrap; gap: 10px; }
  .mc-type-btn {
    padding: 10px 20px; border-radius: 30px;
    border: 1.5px solid var(--border); background: var(--surface2);
    color: var(--text-dim); font-family: 'DM Sans',sans-serif;
    font-weight: 500; font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
  }
  .mc-type-btn:hover { border-color: var(--accent); color: var(--accent); }
  .mc-type-btn.active {
    background: linear-gradient(135deg,rgba(0,212,255,0.15),rgba(124,58,237,0.15));
    border-color: var(--accent); color: #fff;
    box-shadow: 0 0 15px rgba(0,212,255,0.15);
  }
  .mc-cause-box {
    margin-top: 1rem; background: rgba(0,212,255,0.05);
    border-left: 3px solid var(--accent); border-radius: 0 8px 8px 0;
    padding: 12px 16px; font-size: 0.9rem; color: var(--text-dim);
  }
  .mc-cause-label { font-weight: 600; color: var(--text); margin-bottom: 4px; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; }

  /* STATS */
  .mc-stats { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 1.25rem; }
  .mc-stat {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 12px 16px;
    flex: 1; min-width: 110px; text-align: center;
  }
  .mc-stat-val {
    font-family: 'Syne',sans-serif; font-size: 1.5rem; font-weight: 800;
    background: linear-gradient(135deg,var(--accent),#a78bfa);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .mc-stat-label { font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }

  /* LAB */
  .mc-lab-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(230px,1fr)); gap: 12px; }
  .mc-lab-card { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px; }
  .mc-lab-name { font-weight: 600; font-size: 0.88rem; margin-bottom: 6px; }
  .mc-lab-range { font-size: 0.75rem; color: var(--text-dim); margin-bottom: 10px; line-height: 1.5; }
  .mc-lab-input-wrap { display: flex; align-items: center; gap: 8px; }
  .mc-lab-input {
    flex: 1; background: var(--surface3); border: 1px solid var(--border);
    border-radius: 8px; padding: 8px 10px;
    font-family: 'DM Sans',sans-serif; font-size: 0.9rem; color: var(--text);
    outline: none; transition: border-color 0.2s; width: 100%;
  }
  .mc-lab-input:focus { border-color: var(--accent); }
  .mc-lab-unit { font-size: 0.75rem; color: var(--text-dim); white-space: nowrap; }
  .mc-lab-result {
    margin-top: 8px; font-size: 0.78rem; font-weight: 600;
    padding: 4px 10px; border-radius: 6px; display: inline-block;
  }
  .mc-lab-result.high { background:#fee2e2; color:#b91c1c; }
  .mc-lab-result.low { background:#fff7ed; color:#c2410c; }
  .mc-lab-result.normal { background:#dcfce7; color:#15803d; }
  .mc-lab-result.critical { background:#7f1d1d; color:#fca5a5; animation: pulse-red 1s infinite; }
  @keyframes pulse-red { 0%,100%{opacity:1} 50%{opacity:0.7} }

  /* MEDICATIONS */
  .mc-role-section { margin-bottom: 1.5rem; }
  .mc-role-badge {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: 'Syne',sans-serif; font-size: 0.78rem; font-weight: 700;
    padding: 5px 14px; border-radius: 20px; margin-bottom: 1rem;
    letter-spacing: 0.04em; text-transform: uppercase; border: 1px solid;
  }
  .mc-med-card {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: var(--radius); overflow: hidden; margin-bottom: 10px; transition: border-color 0.2s;
  }
  .mc-med-card:hover { border-color: rgba(148,163,184,0.3); }
  .mc-med-header {
    padding: 14px 16px; cursor: pointer;
    display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  }
  .mc-med-drug { font-family: 'Syne',sans-serif; font-weight: 700; font-size: 1rem; }
  .mc-med-class { font-size: 0.78rem; color: var(--text-dim); margin-top: 2px; }
  .mc-med-toggle { color: var(--text-dim); font-size: 1rem; transition: transform 0.2s; }
  .mc-med-toggle.open { transform: rotate(180deg); }
  .mc-med-body { padding: 14px 16px; border-top: 1px solid var(--border); }
  .mc-med-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(160px,1fr)); gap: 10px; margin-bottom: 12px; }
  .mc-med-field-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-dim); margin-bottom: 3px; font-weight: 600; }
  .mc-med-field-value { font-size: 0.88rem; font-weight: 500; }
  .mc-sub-section { margin-top: 10px; }
  .mc-sub-title { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-dim); margin-bottom: 6px; }
  .mc-pill-list { display: flex; flex-wrap: wrap; gap: 6px; }
  .mc-pill { font-size: 0.78rem; padding: 4px 12px; border-radius: 20px; border: 1px solid var(--border); color: var(--text-dim); }
  .mc-pill.se { border-color: rgba(239,68,68,0.3); color: #fca5a5; background: rgba(239,68,68,0.06); }
  .mc-info-row { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
  .mc-info-item { font-size: 0.78rem; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 6px 12px; border: 1px solid var(--border); flex: 1; min-width: 160px; }
  .mc-info-item-label { color: var(--text-dim); margin-bottom: 2px; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em; }

  /* NURSING */
  .mc-nursing-list { list-style: none; }
  .mc-nursing-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 0.9rem; line-height: 1.55; color: var(--text-dim); }
  .mc-nursing-item:last-child { border-bottom: none; }
  .mc-nursing-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); margin-top: 6px; flex-shrink: 0; box-shadow: 0 0 8px rgba(0,212,255,0.6); }

  /* DISCLAIMER */
  .mc-disclaimer {
    background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.25);
    border-radius: var(--radius); padding: 12px 16px; font-size: 0.8rem;
    color: #fbbf24; display: flex; align-items: flex-start; gap: 10px;
    margin-bottom: 1.5rem; line-height: 1.5;
  }

  /* EMPTY */
  .mc-empty { text-align: center; padding: 4rem 2rem; }
  .mc-empty-icon { font-size: 3.5rem; margin-bottom: 1rem; opacity: 0.25; }
  .mc-empty-title { font-family: 'Syne',sans-serif; font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-dim); }
  .mc-empty-sub { font-size: 0.85rem; color: #475569; line-height: 1.6; }
  .mc-example-tags { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 1.25rem; }
  .mc-example-tag {
    font-size: 0.8rem; padding: 6px 14px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 20px; color: var(--text-dim);
    cursor: pointer; transition: all 0.2s;
  }
  .mc-example-tag:hover { border-color: var(--accent); color: var(--accent); }

  /* FOOTER */
  .mc-footer { text-align: center; padding: 2rem; font-size: 0.75rem; color: #334155; border-top: 1px solid var(--border); margin-top: 2rem; }

  /* ANIMATE */
  @keyframes fadeSlideIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .mc-animate { animation: fadeSlideIn 0.35s ease forwards; }

  @media(max-width:640px) {
    .mc-main { padding: 1.25rem 1rem 3rem; }
    .mc-search-hero h1 { font-size: 1.5rem; }
    .mc-diag-name { font-size: 1.3rem; }
  }
`;

// ── Constants ────────────────────────────────────────────────
const ROLE_CONFIG = {
  "First-line": { color: "#22c55e", bg: "#dcfce7", border: "#86efac", label: "🟢 First-Line" },
  "Second-line": { color: "#3b82f6", bg: "#dbeafe", border: "#93c5fd", label: "🔵 Second-Line" },
  Adjunct:       { color: "#a855f7", bg: "#f3e8ff", border: "#d8b4fe", label: "🟣 Adjunct" },
  Emergency:     { color: "#ef4444", bg: "#fee2e2", border: "#fca5a5", label: "🔴 Emergency" },
};

const EXAMPLE_DIAGNOSES = [
  "Pneumonia", "Heart Failure", "Stroke", "Sepsis",
  "Tuberculosis", "Malaria", "Typhoid", "Anaemia",
  "Asthma", "Acute MI", "UTI", "Appendicitis",
];

// ── Lab interpreter ──────────────────────────────────────────
function interpretLab(value, test) {
  if (value === "" || isNaN(Number(value))) return null;
  const v = Number(value);
  if (test.critical_high && v >= test.critical_high) return "critical-high";
  if (test.critical_low  && v <= test.critical_low)  return "critical-low";
  if (v > test.normal_max) return "high";
  if (v < test.normal_min) return "low";
  return "normal";
}
function getResultLabel(r) {
  if (!r) return null;
  return {
    "critical-high": { label: "🚨 Critical High", cls: "critical" },
    "critical-low":  { label: "🚨 Critical Low",  cls: "critical" },
    high:            { label: "🔴 High",           cls: "high" },
    low:             { label: "🟠 Low",            cls: "low" },
    normal:          { label: "🟢 Normal",         cls: "normal" },
  }[r];
}

// ── Sub-components ───────────────────────────────────────────
function MedCard({ med }) {
  const [open, setOpen] = useState(false);
  const d = med.dosages?.[0] || {};
  return (
    <div className="mc-med-card">
      <div className="mc-med-header" onClick={() => setOpen(o => !o)}>
        <div>
          <div className="mc-med-drug">{med.drug_name}</div>
          <div className="mc-med-class">{med.drug_class}</div>
        </div>
        <span className={`mc-med-toggle ${open ? "open" : ""}`}>▾</span>
      </div>
      {open && (
        <div className="mc-med-body mc-animate">
          <div className="mc-med-grid">
            {d.dose      && <div><div className="mc-med-field-label">Dose</div><div className="mc-med-field-value">{d.dose}</div></div>}
            {d.form      && <div><div className="mc-med-field-label">Form</div><div className="mc-med-field-value">{d.form}</div></div>}
            {d.frequency && <div><div className="mc-med-field-label">Frequency</div><div className="mc-med-field-value">{d.frequency}</div></div>}
            {d.route     && <div><div className="mc-med-field-label">Route</div><div className="mc-med-field-value">{d.route}</div></div>}
          </div>
          {med.side_effects?.length > 0 && (
            <div className="mc-sub-section">
              <div className="mc-sub-title">Side Effects</div>
              <div className="mc-pill-list">
                {med.side_effects.map((s, i) => <span key={i} className="mc-pill se">{s}</span>)}
              </div>
            </div>
          )}
          <div className="mc-info-row">
            {med.contraindications   && <div className="mc-info-item"><div className="mc-info-item-label">⚠️ Contraindications</div>{med.contraindications}</div>}
            {med.monitoring_required && <div className="mc-info-item"><div className="mc-info-item-label">📊 Monitoring</div>{med.monitoring_required}</div>}
          </div>
          <div className="mc-info-row">
            {d.renal_adjustment    && <div className="mc-info-item"><div className="mc-info-item-label">🫘 Renal Adjustment</div>{d.renal_adjustment}</div>}
            {d.pediatric_adjustment && <div className="mc-info-item"><div className="mc-info-item-label">👶 Pediatric Dose</div>{d.pediatric_adjustment}</div>}
            {med.guideline_source  && <div className="mc-info-item"><div className="mc-info-item-label">📋 Guideline</div>{med.guideline_source}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function MedicationSection({ medications }) {
  const grouped = {};
  (medications || []).forEach(m => {
    if (!grouped[m.treatment_role]) grouped[m.treatment_role] = [];
    grouped[m.treatment_role].push(m);
  });
  const order = ["First-line", "Second-line", "Adjunct", "Emergency"].filter(r => grouped[r]);
  if (!order.length) return null;
  return (
    <div className="mc-card mc-animate">
      <div className="mc-section-title">💊 Medications</div>
      {order.map(role => {
        const cfg = ROLE_CONFIG[role] || {};
        return (
          <div key={role} className="mc-role-section">
            <div className="mc-role-badge" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>{cfg.label || role}</div>
            {grouped[role].map(med => <MedCard key={med.id} med={med} />)}
          </div>
        );
      })}
    </div>
  );
}

function LabPanel({ labs }) {
  const [values, setValues] = useState({});
  return (
    <div className="mc-card mc-animate">
      <div className="mc-section-title">🔬 Lab Tests & Interpretation</div>
      <div className="mc-lab-grid">
        {labs.map(t => {
          const val = values[t.id] ?? "";
          const result = interpretLab(val, t);
          const rl = getResultLabel(result);
          return (
            <div key={t.id} className="mc-lab-card">
              <div className="mc-lab-name">{t.test_name}</div>
              <div className="mc-lab-range">
                Normal: {t.normal_min} – {t.normal_max} {t.unit}
                {t.critical_high && ` | Critical ≥${t.critical_high}`}
                {t.critical_low  && ` | Critical ≤${t.critical_low}`}
              </div>
              <div className="mc-lab-input-wrap">
                <input
                  className="mc-lab-input" type="number" placeholder="Enter value"
                  value={val}
                  onChange={e => setValues(v => ({ ...v, [t.id]: e.target.value }))}
                />
                <span className="mc-lab-unit">{t.unit}</span>
              </div>
              {rl && <div className={`mc-lab-result ${rl.cls}`}>{rl.label}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NursingPanel({ items }) {
  return (
    <div className="mc-card mc-animate">
      <div className="mc-section-title">🩺 Nursing Considerations</div>
      <ul className="mc-nursing-list">
        {items.map((c, i) => (
          <li key={i} className="mc-nursing-item">
            <div className="mc-nursing-dot" />
            <span>{c}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────
export default function MediCoreApp() {
  const [query, setQuery]         = useState("");
  const [diagnosisData, setDiagnosisData] = useState(null); // AI-generated
  const [selectedType, setSelectedType]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const inputRef = useRef(null);

  // Inject CSS
  useEffect(() => {
    const tag = document.createElement("style");
    tag.textContent = CSS;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  const search = useCallback(async (term) => {
    const q = (term || query).trim();
    if (!q) return;
    setLoading(true);
    setError("");
    setDiagnosisData(null);
    setSelectedType(null);

    try {
      const res = await fetch(`${API_BASE}/api/diagnose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diagnosis: q }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Server error");
      setDiagnosisData({ name: q, ...json.data });
      // Auto-select first type
      if (json.data.types?.length > 0) setSelectedType(json.data.types[0]);
    } catch (err) {
      setError(err.message || "Failed to generate clinical data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  function reset() {
    setQuery("");
    setDiagnosisData(null);
    setSelectedType(null);
    setError("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleKey(e) {
    if (e.key === "Enter") search();
  }

  const typeDetail = selectedType || null;

  return (
    <div className="mc-app">
      {/* Header */}
      <header className="mc-header">
        <div className="mc-header-inner">
          <button className="mc-logo-btn" onClick={reset}>
            <div className="mc-logo-icon">🏥</div>
            <span className="mc-logo-text">MediCore</span>
            <span className="mc-badge">PWA</span>
          </button>
          <div className="mc-ai-badge">
            <div className="mc-ai-dot" />
            AI-Powered
          </div>
        </div>
      </header>

      <main className="mc-main">
        {/* Disclaimer */}
        <div className="mc-disclaimer">
          <span>⚠️</span>
          <span><strong>Educational use only.</strong> AI-generated content is based on clinical guidelines but must not replace professional clinical judgment. Always verify with authoritative sources.</span>
        </div>

        {/* Search */}
        <div style={{ marginBottom: "2rem" }}>
          {diagnosisData && (
            <div className="mc-breadcrumb">
              <button className="mc-breadcrumb-btn" onClick={reset}>Home</button>
              <span>›</span>
              <span>{diagnosisData.name}</span>
              {selectedType && <><span>›</span><span>{selectedType.type_name}</span></>}
            </div>
          )}

          {!diagnosisData && !loading && (
            <div className="mc-search-hero">
              <h1>Clinical Companion</h1>
              <p>Search <em>any</em> medical diagnosis — AI generates labs, medications & nursing considerations instantly.</p>
              <div className="mc-ai-note">✨ Powered by Claude AI · Any condition · Real-time generation</div>
            </div>
          )}

          <div className="mc-search-box" style={{ maxWidth: diagnosisData ? "100%" : "620px", margin: diagnosisData ? "0" : "0 auto" }}>
            <span className="mc-search-icon">🔍</span>
            <input
              ref={inputRef}
              className="mc-search-input"
              placeholder="Type any diagnosis — e.g. Sepsis, Malaria, Heart Failure…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button
              className="mc-search-btn"
              onClick={() => search()}
              disabled={loading || !query.trim()}
            >
              {loading ? "Generating…" : "Generate ✦"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mc-error">
            <span>❌</span>
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mc-loading">
            <div className="mc-spinner" />
            <div className="mc-loading-text">
              Generating clinical reference…
              <div className="mc-loading-sub">AI is compiling labs, medications & nursing considerations</div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!diagnosisData && !loading && !error && (
          <div className="mc-empty">
            <div className="mc-empty-icon">🩺</div>
            <div className="mc-empty-title">Search any diagnosis</div>
            <div className="mc-empty-sub">The AI will generate a complete clinical reference — types, lab tests with interpretation, medications grouped by role, and nursing considerations.</div>
            <div className="mc-example-tags">
              {EXAMPLE_DIAGNOSES.map(d => (
                <button key={d} className="mc-example-tag" onClick={() => { setQuery(d); search(d); }}>{d}</button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {diagnosisData && !loading && (
          <>
            {/* Overview */}
            <div className="mc-card mc-animate">
              <div className="mc-diag-name">{diagnosisData.name}</div>
              <div className="mc-diag-desc">{diagnosisData.description}</div>
              <div className="mc-ai-generated">✦ Generated by Claude AI · Based on current clinical guidelines</div>
            </div>

            {/* Type selector */}
            {diagnosisData.types?.length > 0 && (
              <div className="mc-card mc-animate">
                <div className="mc-section-title">🗂️ Types / Subtypes</div>
                <div className="mc-type-grid">
                  {diagnosisData.types.map(t => (
                    <button
                      key={t.id}
                      className={`mc-type-btn ${selectedType?.id === t.id ? "active" : ""}`}
                      onClick={() => setSelectedType(t)}
                    >
                      {t.type_name}
                    </button>
                  ))}
                </div>
                {selectedType?.cause && (
                  <div className="mc-cause-box">
                    <div className="mc-cause-label">Cause / Pathophysiology</div>
                    {selectedType.cause}
                  </div>
                )}
              </div>
            )}

            {/* Type details */}
            {typeDetail && (
              <>
                <div className="mc-stats mc-animate">
                  <div className="mc-stat">
                    <div className="mc-stat-val">{typeDetail.lab_tests?.length || 0}</div>
                    <div className="mc-stat-label">Lab Tests</div>
                  </div>
                  <div className="mc-stat">
                    <div className="mc-stat-val">{typeDetail.medications?.length || 0}</div>
                    <div className="mc-stat-label">Medications</div>
                  </div>
                  <div className="mc-stat">
                    <div className="mc-stat-val">{typeDetail.nursing_considerations?.length || 0}</div>
                    <div className="mc-stat-label">Nursing Points</div>
                  </div>
                  <div className="mc-stat">
                    <div className="mc-stat-val">
                      {[...new Set((typeDetail.medications || []).map(m => m.treatment_role))].length}
                    </div>
                    <div className="mc-stat-label">Treatment Roles</div>
                  </div>
                </div>

                {typeDetail.lab_tests?.length > 0       && <LabPanel labs={typeDetail.lab_tests} />}
                {typeDetail.medications?.length > 0      && <MedicationSection medications={typeDetail.medications} />}
                {typeDetail.nursing_considerations?.length > 0 && <NursingPanel items={typeDetail.nursing_considerations} />}
              </>
            )}
          </>
        )}
      </main>

      <footer className="mc-footer">
        MediCore PWA · AI-Powered Clinical Reference · Educational use only<br />
        <span style={{ color: "#1e293b" }}>Built with React + Express + Claude AI</span>
      </footer>
    </div>
  );
}
