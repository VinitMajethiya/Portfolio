import React, { useState, useEffect, useRef } from 'react';
import ChaosShooter from './components/ChaosShooter/ChaosShooter';
import GuitarLab from './components/GuitarLab/GuitarLab';
import BookAnalyser from './components/BookAnalyser/BookAnalyser';
import BuildOMatic from './components/BuildOMatic/BuildOMatic';
import StatsSidebar from './components/StatsSidebar/StatsSidebar';

const TABS = [
  { id: 'shooter', label: 'Shooter',   icon: '👾', forAttr: 'shooter' },
  { id: 'guitar',  label: 'Guitar Lab', icon: '🎸', forAttr: 'guitar'  },
  { id: 'books',   label: 'Book Mood',  icon: '📖', forAttr: 'books'   },
  { id: 'junk',    label: 'Junk Lab',   icon: '⚙️', forAttr: 'junk'    },
];

export default function ChaosApp() {
  const [isOpen, setIsOpen]       = useState(true);
  const [activeTab, setActiveTab] = useState('shooter');
  const [theme, setTheme]         = useState('dark');
  const [contentKey, setContentKey] = useState(0); // forces re-mount for animation
  const [sessionTime, setSessionTime] = useState('0:00');
  const contentRef = useRef(null);
  const sessionStartRef = useRef(Date.now());

  /* ─── Session timer ─── */
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      const m = Math.floor(elapsed / 60);
      const s = String(elapsed % 60).padStart(2, '0');
      setSessionTime(`${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  /* ─── Listen for portfolio → show event ─── */
  useEffect(() => {
    const handleShow = () => {
      setIsOpen(true);
      setActiveTab('shooter');
      setContentKey(k => k + 1);
      document.body.style.overflow = 'hidden';
    };

    window.addEventListener('show-chaos-panel', handleShow);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('show-chaos-panel', handleShow);
      document.body.style.overflow = '';
    };
  }, []);

  /* ─── Handle tab change with content animation ─── */
  const handleTabChange = (tabId) => {
    if (tabId === activeTab) return;
    setActiveTab(tabId);
    setContentKey(k => k + 1);
  };

  /* ─── Toggle Theme ─── */
  const toggleTheme = () => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  };

  /* ─── Exit back to portfolio ─── */
  const handleExit = () => {
    if (window.pixelDissolve) {
      window.pixelDissolve('exit', () => {
        setIsOpen(false);
        document.body.style.overflow = '';
      });
    } else {
      setIsOpen(false);
      document.body.style.overflow = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="chaos-overlay-container"
      data-tab={activeTab}
      data-theme={theme}
      role="dialog"
      aria-modal="true"
      aria-label="Chaos Mode"
    >
      {/* Background decorative layers */}
      <div className="chaos-vignette" aria-hidden="true" />

      {/* ── HEADER ── */}
      <header className="chaos-header">
        <div className="chaos-header-left">
          <span className="chaos-header-pulse" aria-hidden="true" />
          <div>
            <div className="chaos-header-title">Chaos Mode</div>
            <div className="chaos-header-sub">VINIT.EXE · SYSTEM ONLINE</div>
          </div>
        </div>

        <div className="chaos-header-right">
          <button
            className="chaos-btn chaos-btn-theme"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? '☀ Light' : '☾ Dark'}
          </button>
          <button
            className="chaos-btn"
            onClick={handleExit}
            aria-label="Back to portfolio"
          >
            ← Back
          </button>
          <button
            className="chaos-btn chaos-btn-exit"
            onClick={handleExit}
            aria-label="Exit Chaos Mode"
          >
            Exit ×
          </button>
        </div>
      </header>

      {/* ── TABS ── */}
      <div className="chaos-tabs-wrapper" role="tablist" aria-label="Chaos panel sections">
        <nav className="chaos-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`chaos-panel-${tab.id}`}
              id={`chaos-tab-${tab.id}`}
              className={`chaos-tab${activeTab === tab.id ? ' active' : ''}`}
              data-for={tab.forAttr}
              onClick={() => handleTabChange(tab.id)}
            >
              <span className="chaos-tab-icon" aria-hidden="true">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── MAIN VIEWPORT ── */}
      <div className="chaos-viewport">

        {/* Content pane */}
        <main
          ref={contentRef}
          className="chaos-content-pane chaos-content-enter"
          key={contentKey}
          id={`chaos-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`chaos-tab-${activeTab}`}
        >
          {activeTab === 'shooter' && <ChaosShooter />}
          {activeTab === 'guitar'  && <GuitarLab />}
          {activeTab === 'books'   && <BookAnalyser />}
          {activeTab === 'junk'    && <BuildOMatic />}
        </main>

        {/* Sidebar */}
        <aside className="chaos-sidebar-pane" aria-label="System stats">
          <StatsSidebar activeTab={activeTab} />
        </aside>

      </div>

      {/* ── FOOTER ── */}
      <footer className="chaos-footer">
        <span className="chaos-footer-sys" aria-hidden="true">[ ESC = EXIT ]</span>
        <span className="chaos-footer-insert" aria-hidden="true">▓ INSERT COIN TO CONTINUE ▓</span>
        <span className="chaos-footer-timer" aria-hidden="true">{sessionTime}</span>
      </footer>
    </div>
  );
}
