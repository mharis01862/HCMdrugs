import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Database as DbIcon, Info, Heart } from 'lucide-react';
import Database from './pages/Database';
import About from './pages/About';
import drugsData from '../data/drugs.json';

const totalDrugs = (drugsData?.records || drugsData)?.length || 0;

function Navigation() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="nav-header"
      style={{ boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.4)' : 'none', transition: 'box-shadow 0.3s' }}
    >
      <Link to="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <img src="/HCMdrugs_logo.png" alt="HCMdrugs" />
      </Link>

      <nav className="nav-links">
        <Link to="/" className={`nav-link${location.pathname === '/' ? ' active' : ''}`}>
          <DbIcon size={15} />
          Database
          <span className="nav-badge">{totalDrugs}</span>
        </Link>
        <Link to="/about" className={`nav-link${location.pathname === '/about' ? ' active' : ''}`}>
          <Info size={15} />
          About &amp; Publication
        </Link>
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <Router>
      <div className="bg-ambient" />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <Navigation />

        <Routes>
          <Route path="/" element={<Database />} />
          <Route path="/about" element={<About />} />
        </Routes>

        <footer className="site-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Heart size={13} fill="currentColor" style={{ color: 'var(--accent)' }} />
            <span>HCMdrugs &mdash; An Open-Access Pharmacological Database</span>
          </div>
          <span>&copy; {new Date().getFullYear()} HCMdrugs. All rights reserved.</span>
        </footer>
      </div>
    </Router>
  );
}
