import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Search, X, Pill, Activity, Dna, BookOpen, Shield, SlidersHorizontal,
  LayoutGrid, List, ChevronLeft, ChevronRight, Copy, Check,
  FlaskConical, Star, Filter, ArrowUpDown, CircleCheck, CircleX, Beaker
} from 'lucide-react';
import drugsData from '../../data/drugs.json';

/* ─── Helpers ───────────────────────────────────────── */
const PAGE_SIZE = 18;

function normClass(c) {
  if (!c) return 'Unknown';
  const lc = c.toLowerCase();
  if (lc.includes('beta') && lc.includes('antiarr')) return 'Beta Blocker + Antiarrhythmic';
  if (lc.includes('beta')) return 'Beta Blocker';
  if (lc.includes('calcium')) return 'Calcium Channel Blocker';
  if (lc.includes('anticoag')) return 'Anticoagulant';
  if (lc.includes('antiarr')) return 'Antiarrhythmic';
  if (lc.includes('diuretic') && lc.includes('loop')) return 'Loop Diuretic';
  if (lc.includes('diuretic') && lc.includes('thiaz')) return 'Thiazide Diuretic';
  if (lc.includes('diuretic') || lc.includes('potassium')) return 'Diuretic';
  if (lc.includes('angiotensin') && lc.includes('receptor')) return 'ARB';
  if (lc.includes('angiotensin') || lc.includes('ace') || lc.includes('enzymes')) return 'ACE Inhibitor';
  if (lc.includes('alpha')) return 'Alpha & Beta Blocker';
  if (lc.includes('glycoside')) return 'Cardiac Glycoside';
  if (lc.includes('antianginal')) return 'Antianginal';
  return c.length > 30 ? c.substring(0, 28) + '…' : c;
}

function normStatus(s) {
  if (!s || s === 'NULL') return 'unknown';
  const lc = s.toLowerCase();
  if (lc.includes('not')) return 'not_approved';
  if (lc.includes('approv')) return 'approved';
  return 'unknown';
}

function normNature(n) {
  if (!n) return 'Unknown';
  const lc = n.toLowerCase();
  if (lc.includes('nat')) return 'Natural';
  return 'Synthetic';
}

const STATUS_CFG = {
  approved: { label: 'FDA Approved', cls: 'tag-success', icon: <CircleCheck size={11} /> },
  not_approved: { label: 'Not FDA Approved', cls: 'tag-danger', icon: <CircleX size={11} /> },
  unknown: { label: 'Status Unknown', cls: 'tag', icon: null },
};

const CLASS_COLORS = {
  'Beta Blocker': '#3b82f6',
  'Beta Blocker + Antiarrhythmic': '#8b5cf6',
  'Calcium Channel Blocker': '#f59e0b',
  'Anticoagulant': '#ef4444',
  'Antiarrhythmic': '#ec4899',
  'Diuretic': '#14b8a6',
  'Loop Diuretic': '#06b6d4',
  'Thiazide Diuretic': '#0ea5e9',
  'ACE Inhibitor': '#a78bfa',
  'ARB': '#7c3aed',
  'Alpha & Beta Blocker': '#6366f1',
  'Cardiac Glycoside': '#22c55e',
  'Antianginal': '#f97316',
};

function classColor(cls) { return CLASS_COLORS[cls] || '#00c9a7'; }

/* ─── Animated counter ──────────────────────────────── */
function AnimCounter({ target, duration = 900 }) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  const ref = useRef();

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          setValue(Math.floor(p * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{value}</span>;
}

/* ─── Status tag ─────────────────────────────────────── */
function StatusTag({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.unknown;
  return <span className={`tag ${cfg.cls}`}>{cfg.icon}{cfg.label}</span>;
}

/* ─── Copy button ────────────────────────────────────── */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className="btn btn-ghost btn-icon" onClick={handleCopy} title="Copy to clipboard">
      {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
    </button>
  );
}

/* ─── Drug detail modal ──────────────────────────────── */
function DrugModal({ drug, onClose }) {
  const [tab, setTab] = useState('pharma');
  const status = normStatus(drug.status);
  const normCls = normClass(drug.drugClass);
  const accentColor = classColor(normCls);
  const refs = drug.references ? drug.references.split(';').map(r => r.trim()).filter(Boolean) : [];

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [onClose]);

  const tabs = [
    { id: 'pharma', label: 'Pharmacodynamics', icon: <Activity size={14} /> },
    { id: 'targets', label: 'Mol. Targets', icon: <Dna size={14} /> },
    { id: 'profile', label: 'Clinical Profile', icon: <Shield size={14} /> },
    { id: 'refs', label: `References (${refs.length})`, icon: <BookOpen size={14} /> },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        {/* Accent bar */}
        <div style={{ height: '4px', background: `linear-gradient(90deg, ${accentColor}, var(--accent2))` }} />

        {/* Header */}
        <div style={{ position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 10, padding: '1.75rem 2rem 0', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
              <span className="tag tag-accent">{drug.drugId}</span>
              <span className="tag" style={{ borderColor: `${accentColor}55`, color: accentColor, background: `${accentColor}15` }}>{normCls}</span>
              <StatusTag status={status} />
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <CopyButton text={`${drug.name} — ${drug.drugId}`} />
              <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
            </div>
          </div>

          <h2 style={{ fontSize: '2rem', marginBottom: '1.25rem', lineHeight: 1.2 }}>{drug.name}</h2>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0', overflowX: 'auto', borderBottom: 'none', marginBottom: '-1px' }}>
            {tabs.map(t => (
              <button
                key={t.id}
                className={`modal-tab${tab === t.id ? ' active' : ''}`}
                onClick={() => setTab(t.id)}
                style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          {tab === 'pharma' && (
            <div className="animate-fadein">
              <h3 className="heading-academic"><Activity size={16} color="var(--accent)" />Mechanism of Action &amp; Effects</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.85, fontSize: '0.95rem' }}>{drug.effects}</p>
            </div>
          )}

          {tab === 'targets' && (
            <div className="animate-fadein">
              <h3 className="heading-academic"><Dna size={16} color="var(--accent2)" />Molecular Targets</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.85, fontSize: '0.95rem' }}>{drug.molecularTargets}</p>
            </div>
          )}

          {tab === 'profile' && (
            <div className="animate-fadein">
              <h3 className="heading-academic"><Shield size={16} color="var(--accent)" />Clinical Profile</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '0 1.25rem', marginBottom: '1.5rem' }}>
                <div className="info-row">
                  <span className="info-row-label">Drug ID</span>
                  <span className="info-row-value">{drug.drugId}</span>
                </div>
                <div className="info-row">
                  <span className="info-row-label">Drug Class</span>
                  <span className="info-row-value" style={{ color: accentColor }}>{normCls}</span>
                </div>
                <div className="info-row">
                  <span className="info-row-label">Regulatory Status</span>
                  <span className="info-row-value"><StatusTag status={status} /></span>
                </div>
                <div className="info-row">
                  <span className="info-row-label">Nature</span>
                  <span className="info-row-value">{normNature(drug.nature)}</span>
                </div>
                <div className="info-row">
                  <span className="info-row-label">Source</span>
                  <span className="info-row-value">{drug.source}</span>
                </div>
                <div className="info-row">
                  <span className="info-row-label">Brand Names</span>
                  <span className="info-row-value" style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{drug.brandNames}</span>
                </div>
              </div>
            </div>
          )}

          {tab === 'refs' && (
            <div className="animate-fadein">
              <h3 className="heading-academic"><BookOpen size={16} color="var(--accent)" />Clinical Literature</h3>
              {refs.length === 0
                ? <p style={{ color: 'var(--text-muted)' }}>No references available.</p>
                : (
                  <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {refs.map((r, i) => (
                      <li key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.75, fontFamily: 'Georgia, serif' }}>
                        {r}
                      </li>
                    ))}
                  </ol>
                )
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Drug card (grid view) ──────────────────────────── */
function DrugCard({ drug, onClick }) {
  const normCls = normClass(drug.drugClass);
  const status = normStatus(drug.status);
  const accentColor = classColor(normCls);

  return (
    <div className="clinical-card" style={{ padding: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column' }} onClick={onClick}>
      <div className="drug-card-accent" style={{ background: `linear-gradient(90deg, ${accentColor}, var(--accent2))`, opacity: 1, height: '2px' }} />
      <div style={{ padding: '1.25rem 1.25rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: '1.05rem', margin: '0 0 0.35rem 0', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={drug.name}>{drug.name}</h3>
            <span className="tag tag-accent" style={{ fontSize: '0.7rem' }}>{drug.drugId}</span>
          </div>
        </div>

        {/* Class badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="tag" style={{ borderColor: `${accentColor}40`, color: accentColor, background: `${accentColor}12`, fontSize: '0.72rem' }}>
            <Pill size={10} /> {normCls}
          </span>
          <StatusTag status={status} />
        </div>

        {/* Effects preview */}
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
          {drug.effects}
        </p>

        {/* Brand names */}
        {drug.brandNames && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {drug.brandNames}
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '0.65rem 1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <FlaskConical size={11} /> {normNature(drug.nature)}
        </span>
        <span style={{ color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.02em' }}>View Details →</span>
      </div>
    </div>
  );
}

/* ─── Table row ──────────────────────────────────────── */
function DrugRow({ drug, onClick }) {
  const normCls = normClass(drug.drugClass);
  const status = normStatus(drug.status);
  const accentColor = classColor(normCls);

  return (
    <tr onClick={onClick}>
      <td style={{ fontWeight: 600, color: 'var(--accent)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{drug.drugId}</td>
      <td style={{ fontWeight: 500 }}>{drug.name}</td>
      <td>
        <span className="tag" style={{ borderColor: `${accentColor}40`, color: accentColor, background: `${accentColor}12`, fontSize: '0.72rem' }}>{normCls}</span>
      </td>
      <td><StatusTag status={status} /></td>
      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{normNature(drug.nature)}</td>
      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drug.brandNames}</td>
      <td><span style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600 }}>→</span></td>
    </tr>
  );
}

/* ─── Main Page ──────────────────────────────────────── */
export default function Database() {
  const [drugs, setDrugs] = useState([]);
  const [search, setSearch] = useState('');
  const [activeClass, setActiveClass] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const [activeNature, setActiveNature] = useState('All');
  const [sortKey, setSortKey] = useState('default');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef();

  useEffect(() => {
    const raw = drugsData?.records ?? drugsData;
    setDrugs(Array.isArray(raw) ? raw : []);
  }, []);

  // Derived unique values
  const drugClasses = useMemo(() => {
    const set = new Set(drugs.map(d => normClass(d.drugClass)));
    return ['All', ...Array.from(set).sort()];
  }, [drugs]);

  const fdaApprovedCount = useMemo(() => drugs.filter(d => normStatus(d.status) === 'approved').length, [drugs]);
  const syntheticCount = useMemo(() => drugs.filter(d => normNature(d.nature) === 'Synthetic').length, [drugs]);
  const naturalCount = useMemo(() => drugs.filter(d => normNature(d.nature) === 'Natural').length, [drugs]);
  const classCount = useMemo(() => new Set(drugs.map(d => normClass(d.drugClass))).size, [drugs]);

  const filtered = useMemo(() => {
    let list = drugs;
    const lc = search.toLowerCase().trim();
    if (lc) list = list.filter(d =>
      (d.name && d.name.toLowerCase().includes(lc)) ||
      (d.drugId && d.drugId.toLowerCase().includes(lc)) ||
      (d.drugClass && d.drugClass.toLowerCase().includes(lc)) ||
      (d.brandNames && d.brandNames.toLowerCase().includes(lc)) ||
      (d.molecularTargets && d.molecularTargets.toLowerCase().includes(lc)) ||
      (d.effects && d.effects.toLowerCase().includes(lc))
    );
    if (activeClass !== 'All') list = list.filter(d => normClass(d.drugClass) === activeClass);
    if (activeStatus !== 'All') list = list.filter(d => normStatus(d.status) === activeStatus);
    if (activeNature !== 'All') list = list.filter(d => normNature(d.nature) === activeNature);

    if (sortKey === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortKey === 'class') list = [...list].sort((a, b) => normClass(a.drugClass).localeCompare(normClass(b.drugClass)));
    else if (sortKey === 'id') list = [...list].sort((a, b) => (a.drugId || '').localeCompare(b.drugId || ''));

    return list;
  }, [drugs, search, activeClass, activeStatus, activeNature, sortKey]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = useCallback(() => setPage(1), []);
  useEffect(resetPage, [search, activeClass, activeStatus, activeNature, sortKey]);

  const hasFilters = search || activeClass !== 'All' || activeStatus !== 'All' || activeNature !== 'All';

  const clearAll = () => {
    setSearch(''); setActiveClass('All'); setActiveStatus('All'); setActiveNature('All'); setSortKey('default');
  };

  return (
    <main style={{ flex: 1, padding: '2rem 2rem 3rem', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>

      {/* ── Hero ── */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '1rem' }} className="animate-slideup">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--accent-dim)', border: '1px solid rgba(0,201,167,0.25)', borderRadius: '99px', padding: '0.3rem 1rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '1.25rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          An Open-Access Database for HCM Research
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', marginBottom: '0.75rem' }}>
          <span className="gradient-text">HCMdrugs</span> Database
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2.5rem', fontSize: '1.05rem', lineHeight: 1.8 }}>
          A web-based database cataloging the drugs available for the treatment of <strong style={{ color: 'var(--text-primary)' }}>Hypertrophic Cardiomyopathy (HCM)</strong>
        </p>

        {/* Search */}
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div className="search-wrap">
            <Search size={18} className="search-icon" />
            <input
              ref={searchRef}
              className="search-input"
              type="text"
              placeholder="Search by name, class, target, brand…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => { setSearch(''); searchRef.current?.focus(); }}>
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          { icon: <Pill size={22} />, value: drugs.length, label: 'Total Drugs', color: 'var(--accent)', bg: 'var(--accent-dim)' },
          { icon: <FlaskConical size={22} />, value: classCount, label: 'Drug Classes', color: 'var(--accent2)', bg: 'var(--accent2-dim)' },
          { icon: <CircleCheck size={22} />, value: fdaApprovedCount, label: 'FDA Approved', color: 'var(--success)', bg: 'var(--success-dim)' },
          { icon: <Beaker size={22} />, value: naturalCount, label: 'Natural Origin', color: 'var(--warning)', bg: 'var(--warning-dim)' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div>
              <div className="stat-value" style={{ color: s.color }}>
                <AnimCounter target={s.value} />
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Controls bar ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          {/* Toggle filters */}
          <button className={`btn btn-ghost${showFilters ? ' btn-outline' : ''}`} style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }} onClick={() => setShowFilters(v => !v)}>
            <SlidersHorizontal size={14} /> Filters
            {hasFilters && <span className="nav-badge" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>!</span>}
          </button>

          {hasFilters && (
            <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', color: 'var(--danger)' }} onClick={clearAll}>
              <X size={13} /> Clear all
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowUpDown size={13} style={{ color: 'var(--text-muted)' }} />
            <select className="select-input" value={sortKey} onChange={e => setSortKey(e.target.value)}>
              <option value="default">Default order</option>
              <option value="name">Name A–Z</option>
              <option value="id">Drug ID</option>
              <option value="class">Drug Class</option>
            </select>
          </div>

          {/* View toggle */}
          <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.2rem' }}>
            <button className={`btn btn-icon${viewMode === 'grid' ? ' btn-primary' : ' btn-ghost'}`} style={{ border: 'none', padding: '0.35rem' }} onClick={() => setViewMode('grid')} title="Grid view">
              <LayoutGrid size={15} />
            </button>
            <button className={`btn btn-icon${viewMode === 'table' ? ' btn-primary' : ' btn-ghost'}`} style={{ border: 'none', padding: '0.35rem' }} onClick={() => setViewMode('table')} title="Table view">
              <List size={15} />
            </button>
          </div>

          {/* Result count */}
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
            {filtered.length} record{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Filter panel ── */}
      {showFilters && (
        <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-fadein">
          {/* Class filter */}
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Drug Class</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {drugClasses.map(cls => (
                <button key={cls} className={`filter-chip${activeClass === cls ? ' active' : ''}`} onClick={() => setActiveClass(cls)}>
                  {cls === 'All' ? 'All Classes' : cls}
                </button>
              ))}
            </div>
          </div>

          {/* Status + Nature filter */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>FDA Status</p>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {['All', 'approved', 'not_approved', 'unknown'].map(s => (
                  <button key={s} className={`filter-chip${activeStatus === s ? ' active' : ''}`} onClick={() => setActiveStatus(s)}>
                    {s === 'All' ? 'All' : s === 'approved' ? '✓ FDA Approved' : s === 'not_approved' ? '✗ Not Approved' : 'Unknown'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Nature</p>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {['All', 'Synthetic', 'Natural'].map(n => (
                  <button key={n} className={`filter-chip${activeNature === n ? ' active' : ''}`} onClick={() => setActiveNature(n)}>
                    {n === 'All' ? 'All' : n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Active filter badges ── */}
      {hasFilters && !showFilters && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
          {search && <span className="tag tag-accent"><Filter size={10} />"{search}"</span>}
          {activeClass !== 'All' && <span className="tag tag-indigo"><Pill size={10} />{activeClass}</span>}
          {activeStatus !== 'All' && <span className="tag tag-success">{STATUS_CFG[activeStatus]?.label}</span>}
          {activeNature !== 'All' && <span className="tag tag-warning"><Beaker size={10} />{activeNature}</span>}
        </div>
      )}

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div className="empty-state">
          <Search size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No records found</h3>
          <p style={{ fontSize: '0.9rem' }}>Try adjusting your search or filters</p>
          <button className="btn btn-outline" style={{ marginTop: '1.25rem' }} onClick={clearAll}>Clear all filters</button>
        </div>
      )}

      {/* ── Grid view ── */}
      {viewMode === 'grid' && filtered.length > 0 && (
        <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {paged.map(drug => (
            <DrugCard key={drug.id} drug={drug} onClick={() => setSelectedDrug(drug)} />
          ))}
        </div>
      )}

      {/* ── Table view ── */}
      {viewMode === 'table' && filtered.length > 0 && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }} className="animate-fadein">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Drug ID</th><th>Name</th><th>Class</th><th>FDA Status</th><th>Nature</th><th>Brand Names</th><th></th>
                </tr>
              </thead>
              <tbody>
                {paged.map(drug => (
                  <DrugRow key={drug.id} drug={drug} onClick={() => setSelectedDrug(drug)} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
          <button className="pagination-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft size={15} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} className={`pagination-btn${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>
              {p}
            </button>
          ))}
          <button className="pagination-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* ── Drug detail modal ── */}
      {selectedDrug && <DrugModal drug={selectedDrug} onClose={() => setSelectedDrug(null)} />}
    </main>
  );
}
