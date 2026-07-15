import React from 'react';
import { BookOpen, User, ArrowUpRight, Heart, Database, FlaskConical, CircleCheck } from 'lucide-react';
import drugsData from '../../data/drugs.json';
import logo from '../assets/HCMdrugs_logo.png';

const drugs = drugsData?.records ?? drugsData ?? [];
const approvedCount = drugs.filter(d => {
  const s = (d.status || '').toLowerCase();
  return s.includes('approv') && !s.includes('not');
}).length;
const classCount = new Set(drugs.map(d => d.drugClass)).size;

export default function About() {
  return (
    <div style={{ flex: 1, padding: '3rem 2rem', maxWidth: '960px', margin: '0 auto', width: '100%' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }} className="animate-slideup">
        <img
          src={logo}
          alt="HCMdrugs Logo"
          style={{ height: '120px', marginBottom: '2rem', filter: 'drop-shadow(0 8px 24px rgba(0,201,167,0.25))' }}
        />
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1rem' }}>
          About <span className="gradient-text">HCMdrugs</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.85, maxWidth: '680px', margin: '0 auto' }}>
          A web-based database cataloging the drugs available for the treatment of <strong style={{ color: 'var(--text-primary)' }}>Hypertrophic Cardiomyopathy (HCM)</strong>
        </p>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          { icon: <Database size={20} />, value: 73, label: 'Total Drugs', color: 'var(--accent)', bg: 'var(--accent-dim)' },
          { icon: <FlaskConical size={20} />, value: classCount, label: 'Drug Classes', color: 'var(--accent2)', bg: 'var(--accent2-dim)' },
          { icon: <CircleCheck size={20} />, value: approvedCount, label: 'FDA Approved', color: 'var(--success)', bg: 'var(--success-dim)' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ justifyContent: 'center', flexDirection: 'column', textAlign: 'center', padding: '1.5rem' }}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color, margin: '0 auto 0.75rem' }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color, textAlign: 'center' }}>{s.value}</div>
            <div className="stat-label" style={{ textAlign: 'center' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Publication card */}
        <div className="clinical-card" style={{ padding: '2.25rem' }}>
          <h2 className="heading-academic" style={{ marginTop: 0 }}>
            <BookOpen size={18} color="var(--accent)" />
            Official Publication
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1rem', lineHeight: 1.8 }}>
            The comprehensive dataset, methodology, and clinical significance of this database are
            detailed in our official peer-reviewed publication in <em>Journal of Computational Biophysics and Chemistry</em>.
          </p>
          <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1.1rem 1.25rem', marginBottom: '1.5rem', fontFamily: 'Georgia, serif', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
            <strong style={{ color: 'var(--text-primary)' }}>DOI:</strong>{' '}
            <a href="https://doi.org/10.1142/S2737416525500954" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
              10.1142/S2737416525500954
            </a>
          </div>
          <a
            href="https://doi.org/10.1142/S2737416525500954"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Read the Published Paper <ArrowUpRight size={16} />
          </a>
        </div>

        {/* Developer card */}
        <div className="clinical-card" style={{ padding: '2.25rem' }}>
          <h2 className="heading-academic" style={{ marginTop: 0 }}>
            <User size={18} color="var(--accent2)" />
            Developer &amp; Researcher
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1rem', lineHeight: 1.8 }}>
            This platform was engineered and developed to provide free, high-performance access to
            curated clinical pharmacology data for HCM. For more projects, research, and academic
            collaborations, please visit the developer's portfolio.
          </p>
          <a
            href="https://mharis01862.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            Visit Developer Portfolio <ArrowUpRight size={16} />
          </a>
        </div>

        {/* Mission card */}
        <div className="clinical-card" style={{ padding: '2.25rem' }}>
          <h2 className="heading-academic" style={{ marginTop: 0 }}>
            <Heart size={18} color="var(--danger)" />
            Mission &amp; Open Access
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.8 }}>
            HCMdrugs is committed to open science. All pharmacological data, references, and clinical
            profiles are freely accessible to researchers, clinicians, and patients worldwide with zero
            paywalls, no registration required. The static architecture ensures long-term availability and
            global performance.
          </p>
        </div>
      </div>
    </div>
  );
}
