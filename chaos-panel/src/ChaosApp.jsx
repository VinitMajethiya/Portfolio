import React, { useState, useEffect } from 'react';
import ChaosShooter from './components/ChaosShooter/ChaosShooter';
import GuitarLab from './components/GuitarLab/GuitarLab';
import BookAnalyser from './components/BookAnalyser/BookAnalyser';
import BuildOMatic from './components/BuildOMatic/BuildOMatic';
import StatsSidebar from './components/StatsSidebar/StatsSidebar';

export default function ChaosApp() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('shooter');

  useEffect(() => {
    const handleShow = () => {
      setIsOpen(true);
      setActiveTab('shooter');
      document.body.style.overflow = 'hidden';
    };

    window.addEventListener('show-chaos-panel', handleShow);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('show-chaos-panel', handleShow);
      document.body.style.overflow = '';
    };
  }, []);

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
    <div className="chaos-overlay-container">
      {/* Header */}
      <header className="chaos-header">
        <span className="chaos-header-title">CHAOS MODE // VINIT.EXE</span>
        <button onClick={handleExit} className="chaos-exit-btn" aria-label="Exit Chaos Mode">[ EXIT × ]</button>
      </header>

      {/* Tabs */}
      <div className="chaos-tabs-wrapper">
        <nav className="chaos-tabs" aria-label="Chaos Panel tabs">
          <button 
            className={`chaos-tab glow-orange ${activeTab === 'shooter' ? 'active active-orange' : ''}`}
            onClick={() => setActiveTab('shooter')}
          >
            <span className="tab-icon">👾</span> SHOOTER
          </button>
          <button 
            className={`chaos-tab glow-cyan ${activeTab === 'guitar' ? 'active active-cyan' : ''}`}
            onClick={() => setActiveTab('guitar')}
          >
            <span className="tab-icon">🎸</span> GUITAR LAB
          </button>
          <button 
            className={`chaos-tab glow-pink ${activeTab === 'books' ? 'active active-pink' : ''}`}
            onClick={() => setActiveTab('books')}
          >
            <span className="tab-icon">📖</span> BOOK MOOD
          </button>
          <button 
            className={`chaos-tab glow-green ${activeTab === 'junk' ? 'active active-green' : ''}`}
            onClick={() => setActiveTab('junk')}
          >
            <span className="tab-icon">⚙️</span> JUNK LAB
          </button>
        </nav>
      </div>

      {/* Main split viewport */}
      <div className="chaos-viewport">
        <div className="chaos-content-pane">
          {activeTab === 'shooter' && <ChaosShooter />}
          {activeTab === 'guitar' && <GuitarLab />}
          {activeTab === 'books' && <BookAnalyser />}
          {activeTab === 'junk' && <BuildOMatic />}
        </div>
        <div className="chaos-sidebar-pane">
          <StatsSidebar activeTab={activeTab} />
        </div>
      </div>

      {/* Footer */}
      <footer className="chaos-footer">
        <span className="blink-text font-pixel-size">INSERT COIN TO CONTINUE</span>
        <button onClick={handleExit} className="chaos-footer-back-btn">← BACK TO PORTFOLIO</button>
      </footer>
    </div>
  );
}
