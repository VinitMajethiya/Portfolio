import React, { useState, useEffect, useRef } from 'react';
import styles from './GuitarLab.module.css';

// Midi-note calculations and frequency mapping helpers
const NOTE_TO_MIDI = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11
};

function getFrequency(noteName) {
  const match = noteName.match(/^([A-G]#?|Bb|Db|Eb|Gb|Ab)([0-9])$/);
  if (!match) return 440;
  const key = match[1];
  const octave = parseInt(match[2]);
  const semitones = NOTE_TO_MIDI[key];
  const midi = 12 * (octave + 1) + semitones;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

const CHORD_NOTES = {
  'C':   ['C3', 'E3', 'G3', 'C4', 'E4'],
  'G':   ['G2', 'B2', 'D3', 'G3', 'B3', 'G4'],
  'Am':  ['A2', 'E3', 'A3', 'C4', 'E4'],
  'F':   ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'],
  'Dm':  ['D3', 'A3', 'D4', 'F4'],
  'Em':  ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],
  'C7':  ['C3', 'E3', 'Bb3', 'C4', 'E4'],
  'G7':  ['G2', 'B2', 'D3', 'F3', 'G3', 'B3']
};

const STRINGS = [
  { openNote: 'E4', name: 'e', notes: ['E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5', 'C#5', 'D5', 'D#5', 'E5'] },
  { openNote: 'B3', name: 'B', notes: ['B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'] },
  { openNote: 'G3', name: 'G', notes: ['G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4'] },
  { openNote: 'D3', name: 'D', notes: ['D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4'] },
  { openNote: 'A2', name: 'A', notes: ['A2', 'A#2', 'B2', 'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3'] },
  { openNote: 'E2', name: 'E', notes: ['E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2', 'C3', 'C#3', 'D3', 'D#3', 'E3'] }
];

const STRUM_PATTERNS = ['STRUM', 'ARPEGGIO', 'MUTE', 'CHORD RUN'];
const CHORDS_LIST = ['C', 'G', 'Am', 'F', 'Dm', 'Em', 'C7', 'G7'];

// Audio Context Singleton / Initialization
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export default function GuitarLab() {
  const [calibrating, setCalibrating] = useState(true);
  const [calibProgress, setCalibProgress] = useState(0);
  const [calibStatus, setCalibStatus] = useState('INITIALISING SYNTH CORE...');

  // Interactive Synth/Metronome states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMetroActive, setIsMetroActive] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [activePattern, setActivePattern] = useState('STRUM');
  const [selectedChord, setSelectedChord] = useState('C');
  const [progression, setProgression] = useState(['C', 'Am', 'F', 'G']);
  const [currentChordIdx, setCurrentChordIdx] = useState(-1);
  const [swing, setSwing] = useState('left');

  const timerRef = useRef(null);

  // Sound pluck engine
  const triggerPluck = (noteName, timeOffset = 0, volume = 0.25) => {
    initAudio();
    const freq = getFrequency(noteName);
    const now = audioCtx.currentTime + timeOffset;

    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gainNode = audioCtx.createGain();

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Dynamic wave shape modeling
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    // Add brief sawtooth oscillator overlay for metal string pluck bite
    let osc2 = null;
    if (volume > 0.05) {
      osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(freq, now);
      gain2.gain.setValueAtTime(volume * 0.15, now);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      osc2.connect(gain2);
      gain2.connect(filter);
      osc2.start(now);
      osc2.stop(now + 0.2);
    }

    // Filter sweep (decays filter freq to produce a warm acoustic sound)
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(1.5, now);
    filter.frequency.setValueAtTime(freq * 5, now);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.1, now + 0.25);

    // Gain decay
    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.start(now);
    osc.stop(now + 1.3);
  };

  // Strum trigger helper
  const triggerStrum = (chordName, pattern = 'STRUM') => {
    initAudio();
    const notes = CHORD_NOTES[chordName];
    if (!notes) return;

    if (pattern === 'MUTE') {
      notes.forEach((note, idx) => {
        triggerPluck(note, idx * 0.015, 0.04);
      });
      return;
    }

    if (pattern === 'ARPEGGIO') {
      notes.forEach((note, idx) => {
        triggerPluck(note, idx * 0.12, 0.2);
      });
      return;
    }

    if (pattern === 'CHORD RUN') {
      notes.forEach((note, idx) => {
        triggerPluck(note, idx * 0.06, 0.22);
      });
      return;
    }

    // Default fast STRUM
    notes.forEach((note, idx) => {
      triggerPluck(note, idx * 0.03, 0.25);
    });
  };

  // Metronome tick sound
  const triggerMetronomeBeep = () => {
    initAudio();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1000, now);
    gainNode.gain.setValueAtTime(0.06, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.start(now);
    osc.stop(now + 0.05);
  };

  // Bootup sequence simulation
  useEffect(() => {
    const startProgress = () => {
      let currentVal = 0;
      const interval = setInterval(() => {
        currentVal += Math.floor(Math.random() * 12) + 5;
        if (currentVal >= 100) {
          currentVal = 100;
          clearInterval(interval);
          setCalibProgress(100);
          setCalibStatus('AUDIO SYSTEM CONFIGURED. ONLINE.');
          setTimeout(() => {
            setCalibrating(false);
          }, 400);
        } else {
          setCalibProgress(currentVal);
          if (currentVal < 30) {
            setCalibStatus('INITIALISING SYNTH CORE...');
          } else if (currentVal < 60) {
            setCalibStatus('MAPPING OSCILLATORS...');
          } else if (currentVal < 85) {
            setCalibStatus('CALIBRATING FILTER NODES...');
          } else {
            setCalibStatus('CONFIGURING OUTPUT BUSSES...');
          }
        }
      }, 100);
    };

    startProgress();
  }, []);

  // Metronome / Sequencer loops
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      setCurrentChordIdx(-1);
      return;
    }

    const intervalMs = (60 / tempo) * 1000;

    const tick = () => {
      // Swing pendulum
      setSwing(s => s === 'left' ? 'right' : 'left');

      // Loop index progression
      setCurrentChordIdx(prevIdx => {
        const nextIdx = progression.length > 0 ? (prevIdx + 1) % progression.length : 0;
        const activeChord = progression[nextIdx];
        if (activeChord) {
          triggerStrum(activeChord, activePattern);
        }
        return nextIdx;
      });

      if (isMetroActive) {
        triggerMetronomeBeep();
      }
    };

    // Trigger initial tick
    tick();

    const intervalId = setInterval(tick, intervalMs);
    timerRef.current = intervalId;

    return () => clearInterval(intervalId);
  }, [isPlaying, tempo, progression, activePattern, isMetroActive]);

  // Click on Chord board
  const handleChordClick = (chord) => {
    setSelectedChord(chord);
    triggerStrum(chord, activePattern);
    // Add to progression queue if we have space (max 8)
    if (progression.length < 8) {
      setProgression(prev => [...prev, chord]);
    }
  };

  // Progression Panel Actions
  const handleClearProgression = () => {
    setProgression([]);
    setCurrentChordIdx(-1);
  };

  const handleDefaultProgression = () => {
    setProgression(['C', 'Am', 'F', 'G']);
    setCurrentChordIdx(-1);
  };

  // Calibration Bootloader view
  if (calibrating) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: 'calc(100vh - 200px)',
          fontFamily: 'var(--font-mono)',
          padding: 'var(--space-8)',
          animation: 'paneReveal 0.3s ease'
        }}
      >
        <div
          style={{
            maxWidth: '500px',
            width: '100%',
            backgroundColor: 'var(--chaos-surface)',
            border: '2px dashed var(--tab-accent)',
            borderRadius: '4px',
            padding: 'var(--space-6)',
            boxShadow: '0 0 20px var(--tab-glow-soft)',
            position: 'relative'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '12px',
              fontSize: '8px',
              color: 'var(--tab-accent)'
            }}
          >
            SYS.STATUS: IN_DEV
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-lg)',
              color: 'var(--chaos-text-primary)',
              marginBottom: 'var(--space-4)',
              fontWeight: 900,
              letterSpacing: '0.05em'
            }}
          >
            🎸 GUITAR SYNTHESIS CORE
          </h2>
          <div
            style={{
              fontSize: '10px',
              color: 'var(--chaos-text-secondary)',
              lineHeight: '1.8',
              marginBottom: 'var(--space-6)',
              minHeight: '60px'
            }}
          >
            <div>&gt; CONNECTING WEB AUDIO NODES...</div>
            <div className="term-caret">&gt; {calibStatus}</div>
          </div>
          <div
            style={{
              width: '100%',
              height: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--chaos-border-medium)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${calibProgress}%`,
                height: '100%',
                backgroundColor: 'var(--tab-accent)',
                transition: 'width 0.1s ease',
                boxShadow: '0 0 8px var(--tab-glow)'
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '9px',
              color: 'var(--chaos-text-muted)',
              marginTop: '8px'
            }}
          >
            <span>[ CALIBRATING MODULES ]</span>
            <span>{calibProgress}%</span>
          </div>
        </div>
      </div>
    );
  }

  // Fretboard spacing calculations for SVG
  const fretX = (idx) => 40 + idx * 58;
  const stringY = (idx) => 15 + idx * 18;

  return (
    <div className={styles.guitarContainer}>
      <h2 className={styles.title}>GUITAR CHORDS LAB</h2>
      <p className={styles.subtitle}>INTERACTIVE OSCILLATOR SYNTH &amp; SEQUENCE RUNNER</p>

      {/* METRONOME & CYCLE PANEL */}
      <div className={styles.metronomeBar}>
        <div className={styles.metronomeLayout}>
          <button
            onClick={() => setIsPlaying(p => !p)}
            className={`${styles.loopBtn} ${isPlaying ? styles.activeLoop : ''}`}
          >
            {isPlaying ? '■ STOP LOOP' : '▶ RUN LOOP'}
          </button>

          <button
            onClick={() => setIsMetroActive(m => !m)}
            className={`${styles.metroBtn} ${isMetroActive ? styles.activeMetro : ''}`}
          >
            {isMetroActive ? '🔊 METRO ON' : '🔇 METRO OFF'}
          </button>

          <div className={styles.tempoSlider}>
            <span>TEMPO: {tempo} BPM</span>
            <input
              type="range"
              min="60"
              max="200"
              value={tempo}
              onChange={(e) => setTempo(parseInt(e.target.value))}
            />
          </div>
        </div>

        {/* Pendulum Swing animation */}
        <div className={styles.metronomeVisual}>
          <div
            className={`${styles.pendant} ${
              isPlaying ? (swing === 'left' ? styles.swingLeft : styles.swingRight) : ''
            }`}
          />
        </div>
      </div>

      {/* STRUMMING PATTERNS */}
      <div className={styles.patternBar}>
        <span className={styles.patternTitle}>STRUM PATTERN:</span>
        {STRUM_PATTERNS.map((pat) => (
          <button
            key={pat}
            onClick={() => setActivePattern(pat)}
            className={`${styles.patBtn} ${activePattern === pat ? styles.activePat : ''}`}
          >
            {pat}
          </button>
        ))}
      </div>

      {/* CHORD BOARD SELECTORS */}
      <div className={styles.chordBoard}>
        {CHORDS_LIST.map((chord) => (
          <button
            key={chord}
            onClick={() => handleChordClick(chord)}
            className={`${styles.chordBtn} ${selectedChord === chord ? styles.activeChord : ''}`}
          >
            {chord}
          </button>
        ))}
      </div>

      {/* FRETBOARD INTERACTIVE PANEL */}
      <div className={styles.fretboardContainer}>
        <svg className={styles.fretboardSvg} viewBox="0 0 800 120" xmlns="http://www.w3.org/2000/svg">
          {/* Wood Neck Backing */}
          <rect x="0" y="5" width="800" height="110" rx="4" fill="rgba(255, 255, 255, 0.015)" stroke="var(--chaos-border-medium)" strokeWidth="1" />

          {/* Fretboard markers (dots at 3, 5, 7, 9 and double dots at 12) */}
          <circle cx={fretX(2.5)} cy="60" r="4" fill="var(--chaos-text-muted)" opacity="0.4" />
          <circle cx={fretX(4.5)} cy="60" r="4" fill="var(--chaos-text-muted)" opacity="0.4" />
          <circle cx={fretX(6.5)} cy="60" r="4" fill="var(--chaos-text-muted)" opacity="0.4" />
          <circle cx={fretX(8.5)} cy="60" r="4" fill="var(--chaos-text-muted)" opacity="0.4" />
          <circle cx={fretX(11.5)} cy="40" r="4" fill="var(--chaos-text-muted)" opacity="0.4" />
          <circle cx={fretX(11.5)} cy="80" r="4" fill="var(--chaos-text-muted)" opacity="0.4" />

          {/* Draw Frets (Vertical bars) */}
          {Array.from({ length: 13 }).map((_, idx) => (
            <line
              key={`fret-${idx}`}
              x1={fretX(idx)}
              y1="5"
              x2={fretX(idx)}
              y2="115"
              stroke={idx === 0 ? 'var(--tab-accent)' : 'var(--chaos-border-strong)'}
              strokeWidth={idx === 0 ? '4' : '2'}
            />
          ))}

          {/* Fret numbers */}
          {Array.from({ length: 12 }).map((_, idx) => (
            <text
              key={`num-${idx}`}
              x={fretX(idx) + 29}
              y="112"
              fill="var(--chaos-text-muted)"
              fontSize="8"
              fontFamily="var(--font-mono)"
              textAnchor="middle"
            >
              {idx + 1}
            </text>
          ))}

          {/* Draw Strings (Horizontal lines) */}
          {STRINGS.map((string, sIdx) => (
            <g key={`str-group-${sIdx}`} className={styles.stringGroup}>
              {/* Thick strings have wider stroke */}
              <line
                x1="40"
                y1={stringY(sIdx)}
                x2="760"
                y2={stringY(sIdx)}
                stroke="var(--chaos-text-secondary)"
                strokeWidth={1.5 + (5 - sIdx) * 0.4}
                opacity="0.75"
              />
              
              {/* String label on left */}
              <text
                x="20"
                y={stringY(sIdx) + 3}
                fill="var(--tab-accent)"
                fontSize="9"
                fontFamily="var(--font-mono)"
                textAnchor="middle"
              >
                {string.name}
              </text>

              {/* Fret interactable note nodes */}
              {string.notes.map((note, fIdx) => (
                <circle
                  key={`note-${sIdx}-${fIdx}`}
                  cx={fIdx === 0 ? 30 : fretX(fIdx) - 29}
                  cy={stringY(sIdx)}
                  r="6"
                  fill="transparent"
                  stroke="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => {
                    // Trigger note sound on hover with low volume if mouse button is down
                    if (e.buttons === 1) {
                      triggerPluck(note, 0, 0.2);
                    }
                  }}
                  onClick={() => {
                    triggerPluck(note, 0, 0.28);
                  }}
                >
                  <title>{note}</title>
                </circle>
              ))}
            </g>
          ))}
        </svg>
      </div>

      {/* CHORD PROGRESSION PANEL / CONSOLE */}
      <div className={styles.progressionPanel}>
        <div className={styles.progHeader}>
          <span>LOOP PROGRESSION QUEUE ({progression.length}/8)</span>
          <div className={styles.progActions}>
            <button onClick={handleDefaultProgression} className={styles.cycleBtn}>
              [ DEFAULT ]
            </button>
            <button onClick={handleClearProgression} className={styles.clearBtn}>
              [ CLEAR ]
            </button>
          </div>
        </div>

        <div className={styles.progBody}>
          {progression.length === 0 ? (
            <p className={styles.progDesc}>Progression empty. Click chords above to compile a sequence.</p>
          ) : (
            <div className={styles.progChords}>
              {progression.map((chord, idx) => (
                <span
                  key={idx}
                  className={`${styles.progChordSpan} ${
                    currentChordIdx === idx ? styles.activeProgChord : ''
                  }`}
                  onClick={() => triggerStrum(chord, activePattern)}
                >
                  {chord}
                  {idx < progression.length - 1 ? ' → ' : ''}
                </span>
              ))}
            </div>
          )}
          <p className={styles.progDesc} style={{ marginTop: '8px', fontSize: '8px' }}>
            * TIP: Run Loop to play your progression chronologically. Hover/click strings on the fretboard to play solo notes!
          </p>
        </div>
      </div>
    </div>
  );
}
