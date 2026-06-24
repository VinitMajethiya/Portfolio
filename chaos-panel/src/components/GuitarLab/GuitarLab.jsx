import React, { useState, useRef, useEffect } from 'react';
import styles from './GuitarLab.module.css';

// Base frequencies for open strings E2, A2, D3, G3, B3, E4
const BASE_FREQS = [329.63, 246.94, 196.00, 146.83, 110.00, 82.41]; // High E (string 1) to Low E (string 6)
const STRING_NAMES = ['E', 'B', 'G', 'D', 'A', 'E'];

// Chord fingering database: [string 1, string 2, string 3, string 4, string 5, string 6]
const CHORDS = {
  Am: [0, 1, 2, 2, 0, -1],
  Em: [0, 0, 0, 2, 2, 0],
  G: [3, 0, 0, 0, 2, 3],
  C: [0, 1, 0, 2, 3, -1],
  D: [2, 3, 2, 0, -1, -1],
  F: [1, 1, 2, 3, 3, 1],
  Dm: [1, 3, 2, 0, -1, -1],
  E: [0, 0, 1, 2, 2, 0]
};

const CHORD_PROGRESSIONS = [
  { chords: ['Am', 'G', 'C', 'Em'], desc: 'classic sad boi progression' },
  { chords: ['Em', 'C', 'G', 'D'], desc: 'stadium rock anthem anthem' },
  { chords: ['Am', 'F', 'C', 'G'], desc: 'pop-punk nostalgia loops' },
  { chords: ['C', 'G', 'Am', 'F'], desc: 'universal 4-chord journey' }
];

export default function GuitarLab() {
  const [selectedChord, setSelectedChord] = useState('Am');
  const [bpm, setBpm] = useState(90);
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const [progression, setProgression] = useState(CHORD_PROGRESSIONS[0]);

  // Endless custom loop states
  const [customLoop, setCustomLoop] = useState([]);
  const [isLoopingActive, setIsLoopingActive] = useState(false);
  const [strumPattern, setStrumPattern] = useState('arpeggio'); // 'arpeggio', 'down-up', 'bass-strum'
  const [currentLoopIndex, setCurrentLoopIndex] = useState(-1);

  const audioCtxRef = useRef(null);
  const metronomeIntervalRef = useRef(null);
  const metronomeTickRef = useRef(0);
  const loopTimeoutRef = useRef(null);
  const [metronomeSwing, setMetronomeSwing] = useState(false);

  // Initialize AudioContext safely
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Play synthesized note
  const playSynthesizedNote = (freq, delayTime = 0) => {
    const ctx = initAudio();
    const now = ctx.currentTime + delayTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const waveShaper = ctx.createWaveShaper();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    const makeDistortionCurve = (amount = 15) => {
      const k = typeof amount === 'number' ? amount : 50;
      const n_samples = 44100;
      const curve = new Float32Array(n_samples);
      const deg = Math.PI / 180;
      for (let i = 0; i < n_samples; ++i) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
      }
      return curve;
    };
    waveShaper.curve = makeDistortionCurve();
    waveShaper.oversample = '4x';

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.18, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(150, now + 1.1);

    osc.connect(waveShaper);
    waveShaper.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.6);
  };

  // Strumming Pattern Engine
  const triggerPatternStrum = (chordName) => {
    initAudio();
    const fingering = CHORDS[chordName];
    if (!fingering) return;

    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const beatDuration = 60 / bpm; // length of 1 beat in seconds

    if (strumPattern === 'arpeggio') {
      // Ascending strings stagger
      let playedCount = 0;
      for (let sIdx = 5; sIdx >= 0; sIdx--) {
        const fret = fingering[sIdx];
        if (fret !== -1) {
          const baseFreq = BASE_FREQS[sIdx];
          const freq = baseFreq * Math.pow(2, fret / 12);
          playSynthesizedNote(freq, playedCount * 0.06);
          playedCount++;
        }
      }
    } else if (strumPattern === 'down-up') {
      // Beat 1: Down strum
      let playedCount = 0;
      for (let sIdx = 5; sIdx >= 0; sIdx--) {
        const fret = fingering[sIdx];
        if (fret !== -1) {
          const baseFreq = BASE_FREQS[sIdx];
          const freq = baseFreq * Math.pow(2, fret / 12);
          playSynthesizedNote(freq, playedCount * 0.04);
          playedCount++;
        }
      }
      
      // Beat 3: Up strum (reversed, high strings to low)
      let upPlayedCount = 0;
      for (let sIdx = 0; sIdx <= 5; sIdx++) {
        const fret = fingering[sIdx];
        if (fret !== -1) {
          const baseFreq = BASE_FREQS[sIdx];
          const freq = baseFreq * Math.pow(2, fret / 12);
          playSynthesizedNote(freq, (beatDuration * 2) + (upPlayedCount * 0.025));
          upPlayedCount++;
        }
      }
    } else if (strumPattern === 'bass-strum') {
      // Beat 1: Bass note
      let lowestStringIdx = 5;
      while (lowestStringIdx >= 0 && fingering[lowestStringIdx] === -1) {
        lowestStringIdx--;
      }
      if (lowestStringIdx >= 0) {
        const fret = fingering[lowestStringIdx];
        const baseFreq = BASE_FREQS[lowestStringIdx];
        const freq = baseFreq * Math.pow(2, fret / 12);
        playSynthesizedNote(freq, 0);
      }

      // Beat 2: Full strum
      let playedCount = 0;
      for (let sIdx = 5; sIdx >= 0; sIdx--) {
        const fret = fingering[sIdx];
        if (fret !== -1) {
          const baseFreq = BASE_FREQS[sIdx];
          const freq = baseFreq * Math.pow(2, fret / 12);
          playSynthesizedNote(freq, beatDuration + (playedCount * 0.04));
          playedCount++;
        }
      }

      // Beat 4: Full strum
      playedCount = 0;
      for (let sIdx = 5; sIdx >= 0; sIdx--) {
        const fret = fingering[sIdx];
        if (fret !== -1) {
          const baseFreq = BASE_FREQS[sIdx];
          const freq = baseFreq * Math.pow(2, fret / 12);
          playSynthesizedNote(freq, (beatDuration * 3) + (playedCount * 0.04));
          playedCount++;
        }
      }
    }
  };

  // Strum single chord trigger
  const strumChord = (chordName) => {
    triggerPatternStrum(chordName);
  };

  // Click string directly on board
  const handleStringClick = (stringIndex) => {
    const fingering = CHORDS[selectedChord];
    const fret = fingering[stringIndex];
    if (fret !== -1) {
      const baseFreq = BASE_FREQS[stringIndex];
      const freq = baseFreq * Math.pow(2, fret / 12);
      playSynthesizedNote(freq);
    }
  };

  // Metronome audio tick
  const playMetronomeClick = () => {
    const ctx = initAudio();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'triangle';
    const pitch = metronomeTickRef.current % 4 === 0 ? 800 : 500;
    osc.frequency.setValueAtTime(pitch, now);

    gainNode.gain.setValueAtTime(0.08, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);

    metronomeTickRef.current++;
    setMetronomeSwing(prev => !prev);
  };

  // Metronome ticks loop
  useEffect(() => {
    if (isMetronomeActive) {
      const intervalMs = (60 / bpm) * 1000;
      metronomeTickRef.current = 0;
      playMetronomeClick();
      metronomeIntervalRef.current = setInterval(playMetronomeClick, intervalMs);
    } else {
      clearInterval(metronomeIntervalRef.current);
    }
    return () => clearInterval(metronomeIntervalRef.current);
  }, [isMetronomeActive, bpm]);

  // Custom Endless Chord Loop Scheduler
  useEffect(() => {
    if (!isLoopingActive) {
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current);
      }
      setCurrentLoopIndex(-1);
      return;
    }

    const playLoopTick = () => {
      const activeSequence = customLoop.length > 0 ? customLoop : progression.chords;
      if (activeSequence.length === 0) return;

      setCurrentLoopIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % activeSequence.length;
        const currentChord = activeSequence[nextIndex];
        
        // Sync selected chord visualization on fretboard
        setSelectedChord(currentChord);
        triggerPatternStrum(currentChord);

        // Schedule next chord strum in loop (1 chord per bar = 4 beats)
        const measureDuration = (60 / bpm) * 4 * 1000;
        loopTimeoutRef.current = setTimeout(playLoopTick, measureDuration);

        return nextIndex;
      });
    };

    playLoopTick();

    return () => {
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current);
      }
    };
  }, [isLoopingActive, customLoop, progression, bpm, strumPattern]);

  // Click chord button: either pluck chord OR append to custom loop
  const handleChordClick = (chord) => {
    if (isLoopingActive) {
      // Append to custom loop queue if loop is active/being configured
      setCustomLoop(prev => [...prev, chord].slice(-8)); // limit queue to 8 chords max
    } else {
      // Normal chord click: pluck immediately
      setSelectedChord(chord);
      strumChord(chord);
    }
  };

  const handleNextProgression = () => {
    const index = CHORD_PROGRESSIONS.indexOf(progression);
    const nextIndex = (index + 1) % CHORD_PROGRESSIONS.length;
    setProgression(CHORD_PROGRESSIONS[nextIndex]);
    if (!isLoopingActive) {
      setSelectedChord(CHORD_PROGRESSIONS[nextIndex].chords[0]);
    }
  };

  const clearCustomLoop = () => {
    setCustomLoop([]);
    setCurrentLoopIndex(-1);
  };

  // Get dots coordinates on SVG Fretboard
  const renderFretboardDots = () => {
    const fingering = CHORDS[selectedChord];
    return fingering.map((fret, sIdx) => {
      if (fret <= 0) return null;
      const x = 50 + (fret - 0.5) * 55;
      const y = 30 + sIdx * 28;
      return (
        <circle 
          key={sIdx}
          cx={x} 
          cy={y} 
          r={6} 
          fill="var(--neon-cyan)" 
          className={styles.cyanPulse}
        />
      );
    });
  };

  // Render muted markers 'X' or open 'O' on left of fretboard
  const renderNutMarkers = () => {
    const fingering = CHORDS[selectedChord];
    return fingering.map((fret, sIdx) => {
      const y = 30 + sIdx * 28 + 4;
      let markerText = '';
      let markerColor = 'var(--pixel-white)';

      if (fret === -1) {
        markerText = '×';
        markerColor = 'var(--neon-pink)';
      } else if (fret === 0) {
        markerText = '○';
        markerColor = 'var(--neon-cyan)';
      }

      return (
        <text 
          key={sIdx}
          x={18}
          y={y}
          fill={markerColor}
          fontFamily="monospace"
          fontSize="16"
          textAnchor="middle"
        >
          {markerText}
        </text>
      );
    });
  };

  const activeSequence = customLoop.length > 0 ? customLoop : progression.chords;

  return (
    <div className={styles.guitarContainer}>
      <h2 className={styles.title}>GUITAR CHORD LAB</h2>
      <p className={styles.subtitle}>CLICK CHORDS TO PLAY OR ADD TO LOOP. SELECT PATTERNS &amp; SET ENDLESS LOOPS.</p>

      {/* Metronome & Loop Controls */}
      <div className={styles.metronomeBar}>
        <div className={styles.metronomeLayout}>
          <button 
            onClick={() => setIsLoopingActive(!isLoopingActive)}
            className={`${styles.loopBtn} ${isLoopingActive ? styles.activeLoop : ''}`}
          >
            {isLoopingActive ? '[ LOOP: ON ]' : '[ LOOP: OFF ]'}
          </button>
          
          <button 
            onClick={() => setIsMetronomeActive(!isMetronomeActive)}
            className={`${styles.metroBtn} ${isMetronomeActive ? styles.activeMetro : ''}`}
          >
            {isMetronomeActive ? '[ METRO: ON ]' : '[ METRO: OFF ]'}
          </button>

          <div className={styles.tempoSlider}>
            <span>BPM: {bpm}</span>
            <input 
              type="range" 
              min="60" 
              max="180" 
              value={bpm} 
              onChange={(e) => setBpm(parseInt(e.target.value))}
            />
          </div>
        </div>

        {/* Metronome swinging pendant */}
        <div className={styles.metronomeVisual}>
          <div className={`${styles.pendant} ${metronomeSwing ? styles.swingLeft : styles.swingRight}`} />
        </div>
      </div>

      {/* Strumming Pattern Selectors */}
      <div className={styles.patternBar}>
        <span className={styles.patternTitle}>PATTERN:</span>
        <button 
          onClick={() => setStrumPattern('arpeggio')} 
          className={`${styles.patBtn} ${strumPattern === 'arpeggio' ? styles.activePat : ''}`}
        >
          ARPEGGIO
        </button>
        <button 
          onClick={() => setStrumPattern('down-up')} 
          className={`${styles.patBtn} ${strumPattern === 'down-up' ? styles.activePat : ''}`}
        >
          DOWN-UP
        </button>
        <button 
          onClick={() => setStrumPattern('bass-strum')} 
          className={`${styles.patBtn} ${strumPattern === 'bass-strum' ? styles.activePat : ''}`}
        >
          BASS-STRUM
        </button>
      </div>

      {/* Chord Fretboard Selectors */}
      <div className={styles.chordBoard}>
        {Object.keys(CHORDS).map((chordName) => (
          <button 
            key={chordName}
            className={`${styles.chordBtn} ${selectedChord === chordName ? styles.activeChord : ''}`}
            onClick={() => handleChordClick(chordName)}
          >
            {chordName}
          </button>
        ))}
      </div>

      {/* Interactive Fretboard SVG */}
      <div className={styles.fretboardContainer}>
        <svg viewBox="0 0 740 200" className={styles.fretboardSvg}>
          <rect x="30" y="15" width="680" height="170" fill="var(--chaos-surface)" stroke="var(--pixel-white)" strokeWidth="2" />
          
          {/* Frets */}
          {Array.from({ length: 13 }).map((_, idx) => {
            const x = 30 + idx * 55;
            const strokeColor = idx === 0 ? 'var(--pixel-white)' : 'var(--pixel-muted)';
            const strokeWidth = idx === 0 ? '6' : '2';
            return (
              <line key={idx} x1={x} y1={15} x2={x} y2={185} stroke={strokeColor} strokeWidth={strokeWidth} />
            );
          })}

          {/* Fret Markers */}
          {[3, 5, 7, 9].map((fret) => (
            <circle key={fret} cx={30 + (fret - 0.5) * 55} cy={100} r="4" fill="var(--pixel-muted)" />
          ))}
          <circle cx={30 + (12 - 0.5) * 55} cy={60} r="4" fill="var(--pixel-muted)" />
          <circle cx={30 + (12 - 0.5) * 55} cy={140} r="4" fill="var(--pixel-muted)" />

          {/* Strings */}
          {Array.from({ length: 6 }).map((_, idx) => {
            const y = 30 + idx * 28;
            const thickness = 1 + (5 - idx) * 0.8;
            return (
              <g key={idx} className={styles.stringGroup} onClick={() => handleStringClick(idx)}>
                <line x1="30" y1={y} x2="710" y2={y} stroke="transparent" strokeWidth="15" style={{ cursor: 'pointer' }} />
                <line x1="30" y1={y} x2="710" y2={y} stroke="var(--pixel-white)" strokeWidth={thickness} style={{ pointerEvents: 'none' }} />
                <text x="8" y={y + 4} fill="var(--pixel-muted)" fontSize="10" fontFamily="monospace">{STRING_NAMES[idx]}</text>
              </g>
            );
          })}

          {/* Finger dots & nut marks */}
          {renderFretboardDots()}
          {renderNutMarkers()}
        </svg>
      </div>

      {/* Chord Progression Info Box / Loop Queue builder */}
      <div className={styles.progressionPanel}>
        <div className={styles.progHeader}>
          <span>{customLoop.length > 0 ? 'CUSTOM PLAYBACK QUEUE' : 'DEFAULT SOUND PROGRESSION'}</span>
          <div className={styles.progActions}>
            {customLoop.length > 0 && (
              <button onClick={clearCustomLoop} className={styles.clearBtn}>[ CLEAR ]</button>
            )}
            <button onClick={handleNextProgression} className={styles.cycleBtn}>[ CYCLE PROG ]</button>
          </div>
        </div>
        <div className={styles.progBody}>
          <div className={styles.progChords}>
            {activeSequence.map((ch, idx) => (
              <span 
                key={idx} 
                onClick={() => setSelectedChord(ch)}
                className={`${styles.progChordSpan} ${selectedChord === ch && currentLoopIndex === idx ? styles.activeProgChord : ''}`}
              >
                {ch} {idx < activeSequence.length - 1 ? '→' : ''}
              </span>
            ))}
          </div>
          {customLoop.length > 0 ? (
            <p className={styles.progDesc}>Click chord buttons to queue notes (max 8). Loop steps through these on beat.</p>
          ) : (
            <p className={styles.progDesc}>Vibe: <em>{progression.desc}</em>. Toggle loop to step automatically.</p>
          )}
        </div>
      </div>
    </div>
  );
}
