import React, { useState, useEffect, useRef } from 'react';
import ChaosShooter from './components/ChaosShooter/ChaosShooter';
import GuitarLab from './components/GuitarLab/GuitarLab';
import BookAnalyser from './components/BookAnalyser/BookAnalyser';
import BuildOMatic from './components/BuildOMatic/BuildOMatic';
import StatsSidebar from './components/StatsSidebar/StatsSidebar';

/* ─── Arcade Menu Options matching reference ─── */
const MENU_ITEMS = [
  { id: 'shooter', num: '1P', title: '1 PLAYER: CHAOS SHOOTER', desc: 'Space Invaders 8-bit retro battle', badge: 'ARCADE' },
  { id: 'guitar',  num: '2P', title: '2: GUITAR SYNTH LAB',     desc: 'WebAudio chord synthesizer',       badge: 'AUDIO'  },
  { id: 'books',   num: '3P', title: '3: BOOK MOOD ANALYSER',   desc: 'AI narrative thriller decoder',   badge: 'AI LAB' },
  { id: 'junk',    num: '4P', title: '4: JUNK BUILD-O-MATIC',   desc: 'Mad inventor broken tech forge',  badge: 'CRAFT'  },
];

const TABS = [
  { id: 'shooter', label: 'Shooter',   icon: '👾' },
  { id: 'guitar',  label: 'Guitar Lab', icon: '🎸' },
  { id: 'books',   label: 'Book Mood',  icon: '📖' },
  { id: 'junk',    label: 'Junk Lab',   icon: '⚙️' },
];

/* ─── Lightweight WebAudio Retro Arcade Sound Synthesizer ─── */
let arcadeAudioCtx = null;
function playArcadeFx(type = 'select') {
  try {
    if (!arcadeAudioCtx) {
      arcadeAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (arcadeAudioCtx.state === 'suspended') {
      arcadeAudioCtx.resume();
    }
    const t = arcadeAudioCtx.currentTime;
    const osc = arcadeAudioCtx.createOscillator();
    const gain = arcadeAudioCtx.createGain();
    osc.connect(gain);
    gain.connect(arcadeAudioCtx.destination);

    if (type === 'move') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.setValueAtTime(587, t + 0.03);
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
      osc.start(t);
      osc.stop(t + 0.07);
    } else if (type === 'start') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.18);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.start(t);
      osc.stop(t + 0.22);
    } else if (type === 'coin') {
      // Classic Mario / Arcade dual high chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, t); // B5
      osc.frequency.setValueAtTime(1318.51, t + 0.08); // E6
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t);
      osc.stop(t + 0.35);
    }
  } catch (_) {
    // Ignore if audio permissions not yet granted
  }
}

export default function ChaosApp() {
  const [isOpen, setIsOpen]                 = useState(true);
  const [activeTab, setActiveTab]           = useState('menu'); // Starts on Reference Start Screen!
  const [selectedMenuIdx, setSelectedMenuIdx] = useState(0);
  const [theme, setTheme]                   = useState('dark');
  const [credits, setCredits]               = useState(12);
  const [showStats, setShowStats]           = useState(false);
  const [hiScore, setHiScore]               = useState(() => {
    return parseInt(localStorage.getItem('chaos_hi_score') || '12571', 10);
  });
  const [sessionTime, setSessionTime]       = useState('0:00');
  const sessionStartRef                     = useRef(Date.now());

  /* ─── Sync High Score from LocalStorage ─── */
  useEffect(() => {
    const checkScore = () => {
      const stored = parseInt(localStorage.getItem('chaos_hi_score') || '12571', 10);
      setHiScore(stored);
    };
    checkScore();
    const interval = setInterval(checkScore, 2000);
    return () => clearInterval(interval);
  }, []);

  /* ─── Session Elapsed Timer ─── */
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      const m = Math.floor(elapsed / 60);
      const s = String(elapsed % 60).padStart(2, '0');
      setSessionTime(`${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  /* ─── Portfolio Show Event Listener ─── */
  useEffect(() => {
    const handleShow = () => {
      setIsOpen(true);
      setActiveTab('menu');
      setSelectedMenuIdx(0);
      document.body.style.overflow = 'hidden';
    };

    window.addEventListener('show-chaos-panel', handleShow);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('show-chaos-panel', handleShow);
      document.body.style.overflow = '';
    };
  }, []);

  /* ─── Keyboard Controls for Arcade Cabinet ─── */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (activeTab !== 'menu') {
          playArcadeFx('move');
          setActiveTab('menu');
        } else {
          handleExit();
        }
        return;
      }

      // Quick jump via number keys 1-4 anytime
      if (['1', '2', '3', '4'].includes(e.key)) {
        const item = MENU_ITEMS[parseInt(e.key, 10) - 1];
        if (item) {
          playArcadeFx('start');
          setActiveTab(item.id);
        }
        return;
      }

      // Arrow navigation on the reference start menu
      if (activeTab === 'menu') {
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          playArcadeFx('move');
          setSelectedMenuIdx(prev => (prev > 0 ? prev - 1 : MENU_ITEMS.length - 1));
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          e.preventDefault();
          playArcadeFx('move');
          setSelectedMenuIdx(prev => (prev < MENU_ITEMS.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const target = MENU_ITEMS[selectedMenuIdx];
          if (target) {
            playArcadeFx('start');
            setActiveTab(target.id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeTab, selectedMenuIdx]);

  /* ─── Start Selected Game ─── */
  const handleStartGame = (tabId) => {
    playArcadeFx('start');
    setActiveTab(tabId);
  };

  /* ─── Switch Tab / Mode ─── */
  const handleTabChange = (tabId) => {
    if (tabId === activeTab) return;
    playArcadeFx('move');
    setActiveTab(tabId);
  };

  /* ─── Insert Coin / Add Credits ─── */
  const handleAddCredit = () => {
    playArcadeFx('coin');
    setCredits(c => c + 1);
  };

  /* ─── Theme Toggle ─── */
  const toggleTheme = () => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  };

  /* ─── Exit Cabinet back to portfolio ─── */
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

  const hiScoreStr = String(hiScore).padStart(7, '0');

  return (
    <div
      className="chaos-overlay-container"
      data-tab={activeTab}
      data-theme={theme}
      role="dialog"
      aria-modal="true"
      aria-label="Chaos Arcade Cabinet"
    >
      {/* Outer ambient darkness */}
      <div className="chaos-vignette" aria-hidden="true" />

      {/* ════════════════════════════════════════════════
         3D ARCADE CABINET HOUSING (Reference Perspective)
         ════════════════════════════════════════════════ */}
      <div className="arcade-cabinet-housing">

        {/* 3D Inset Cabinet Hood Bevels */}
        <div className="arcade-hood-top" aria-hidden="true" />
        <div className="arcade-hood-left" aria-hidden="true" />
        <div className="arcade-hood-right" aria-hidden="true" />
        <div className="arcade-hood-bottom" aria-hidden="true" />

        {/* Physical Rounded Arcade Monitor Bezel */}
        <div className="arcade-bezel">

          {/* Authentic Corner Rivets */}
          <div className="arcade-rivet arcade-rivet-tl" aria-hidden="true" />
          <div className="arcade-rivet arcade-rivet-tr" aria-hidden="true" />
          <div className="arcade-rivet arcade-rivet-bl" aria-hidden="true" />
          <div className="arcade-rivet arcade-rivet-br" aria-hidden="true" />

          {/* ════════════════════════════════════════════════
             CURVED CRT SCREEN (Exact Reference Color & Grid)
             ════════════════════════════════════════════════ */}
          <div className="arcade-crt-screen">

            {/* CRT Glass Layers */}
            <div className="arcade-crt-reflection" aria-hidden="true" />
            <div className="arcade-crt-scanlines" aria-hidden="true" />
            <div className="arcade-crt-vignette" aria-hidden="true" />
            <div className="arcade-crt-grid" aria-hidden="true" />
            <div className="arcade-crt-horizon" aria-hidden="true" />

            {/* ── TOP HUD (1UP · HI-SCORE · 2UP) ── */}
            <header className="arcade-hud-top" aria-label="Arcade HUD status">
              <div className="arcade-hud-col arcade-hud-1up">
                <span className="arcade-hud-label">1UP</span>
                <span className="arcade-hud-val">
                  {activeTab === 'shooter' ? '002400' : '000000'}
                </span>
              </div>

              <div className="arcade-hud-col arcade-hud-hiscore">
                <span className="arcade-hud-label">HI-SCORE</span>
                <span className="arcade-hud-score">{hiScoreStr}</span>
              </div>

              <div className="arcade-hud-col arcade-hud-2up">
                <span className="arcade-hud-label">2UP</span>
                <span className="arcade-hud-val">READY</span>
              </div>
            </header>

            {/* ── SCREEN MAIN CONTENT ── */}
            <div className="arcade-screen-content">

              {/* ──────────────────────────────────────────
                 VIEW 1: START GAME TITLE & SELECTION MENU
                 (Exact recreation of reference photo!)
                 ────────────────────────────────────────── */}
              {activeTab === 'menu' && (
                <div className="arcade-menu-view">
                  <div className="arcade-title-block">
                    <h1 className="arcade-title-3d">START GAME</h1>
                    <div className="arcade-title-sub">
                      ★ VINIT MAJETHIYA · AIML PORTFOLIO ARCADE ★
                    </div>
                  </div>

                  <div className="arcade-menu-options" role="menu">
                    {MENU_ITEMS.map((item, idx) => {
                      const isSelected = selectedMenuIdx === idx;
                      return (
                        <button
                          key={item.id}
                          className={`arcade-menu-option ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleStartGame(item.id)}
                          onMouseEnter={() => {
                            if (selectedMenuIdx !== idx) {
                              playArcadeFx('move');
                              setSelectedMenuIdx(idx);
                            }
                          }}
                          role="menuitem"
                          aria-selected={isSelected}
                        >
                          <span className="arcade-menu-cursor" aria-hidden="true">
                            {isSelected ? '▶' : '\u00A0'}
                          </span>
                          <span className="arcade-menu-text">
                            {item.title}
                          </span>
                          <span className="arcade-menu-badge">{item.badge}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="arcade-menu-footer-callout">
                    <div className="arcade-blink-prompt">
                      ▓ PUSH ENTER OR CLICK TO START ▓
                    </div>
                    <div className="arcade-keys-legend">
                      [↑/↓] SELECT · [ENTER] PLAY · [1-4] QUICK START · [ESC] EXIT
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────────────────────────────────
                 VIEW 2: ACTIVE GAME / TOOL RUNNING INSIDE CRT
                 ────────────────────────────────────────── */}
              {activeTab !== 'menu' && (
                <div className={`arcade-active-game-container ${showStats ? 'with-stats' : ''}`}>
                  <main
                    className="arcade-game-viewport"
                    id={`chaos-panel-${activeTab}`}
                    role="tabpanel"
                    aria-label={`Chaos ${activeTab} panel`}
                  >
                    {activeTab === 'shooter' && <ChaosShooter />}
                    {activeTab === 'guitar'  && <GuitarLab />}
                    {activeTab === 'books'   && <BookAnalyser />}
                    {activeTab === 'junk'    && <BuildOMatic />}
                  </main>

                  {/* Optional Diagnostic Sidebar Drawer */}
                  {showStats && (
                    <aside className="arcade-side-stats" aria-label="Arcade System Diagnostics">
                      <StatsSidebar activeTab={activeTab} />
                    </aside>
                  )}
                </div>
              )}

            </div>{/* /arcade-screen-content */}

            {/* ── BOTTOM HUD (CREDIT · STATUS · CONTROLS) ── */}
            <footer className="arcade-hud-bottom" aria-label="Arcade HUD bottom bar">
              <div className="arcade-hud-bot-left">
                <button
                  className="arcade-hud-btn arcade-hud-btn-exit"
                  onClick={handleExit}
                  aria-label="Exit Chaos Mode"
                >
                  [ ESC = EXIT ]
                </button>

                {activeTab !== 'menu' && (
                  <button
                    className="arcade-hud-btn arcade-hud-btn-menu"
                    onClick={() => handleTabChange('menu')}
                    aria-label="Return to Arcade Title Menu"
                  >
                    [ ◂ ARCADE MENU ]
                  </button>
                )}
              </div>

              <div className="arcade-hud-bot-center">
                {activeTab !== 'menu' ? (
                  <div className="arcade-quick-tabs">
                    {TABS.map(tab => (
                      <button
                        key={tab.id}
                        className={`arcade-quick-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab.id)}
                        aria-label={`Switch to ${tab.label}`}
                      >
                        <span className="arcade-quick-icon">{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="arcade-system-status">VINIT.EXE · ONLINE · {sessionTime}</span>
                )}
              </div>

              <div className="arcade-hud-bot-right">
                {activeTab !== 'menu' && (
                  <button
                    className={`arcade-hud-btn arcade-hud-btn-stats ${showStats ? 'active' : ''}`}
                    onClick={() => setShowStats(!showStats)}
                    aria-label="Toggle diagnostics stats panel"
                  >
                    [ ▤ STATS {showStats ? 'ON' : 'OFF'} ]
                  </button>
                )}
                <span className="arcade-credit-count" aria-live="polite">
                  CREDIT {String(credits).padStart(3, '0')}
                </span>
              </div>
            </footer>

          </div>{/* /arcade-crt-screen */}

        </div>{/* /arcade-bezel */}

        {/* ════════════════════════════════════════════════
           PHYSICAL CABINET APRON / CONTROL CONSOLE
           ════════════════════════════════════════════════ */}
        <div className="arcade-cabinet-apron">
          <div className="arcade-apron-left">
            <button
              className="arcade-coin-slot-btn"
              onClick={handleAddCredit}
              title="Click or press to drop a quarter!"
            >
              <span className="arcade-coin-slit" />
              <span className="arcade-coin-text">INSERT COIN 25¢</span>
            </button>
          </div>

          <div className="arcade-apron-center">
            <span className="arcade-speaker-slots" aria-hidden="true">||||||||</span>
            <span className="arcade-cabinet-badge">MAJETHIYA BOOTLEG CABINET v2.0</span>
            <span className="arcade-speaker-slots" aria-hidden="true">||||||||</span>
          </div>

          <div className="arcade-apron-right">
            <button
              className="arcade-theme-toggle-btn"
              onClick={toggleTheme}
              title="Toggle Cabinet Day/Night Ambient"
            >
              {theme === 'dark' ? '☀ DAY' : '☾ NIGHT'}
            </button>
          </div>
        </div>

      </div>{/* /arcade-cabinet-housing */}
    </div>
  );
}
