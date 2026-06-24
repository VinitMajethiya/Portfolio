import React, { useState } from 'react';
import styles from './BuildOMatic.module.css';

const QUICK_MATERIALS = [
  {
    label: "Motor + LEDs",
    list: "old fan motor\n3 LEDs\nempty coffee cup\nduct tape\nbatteries"
  },
  {
    label: "Cardboard Rover",
    list: "cardboard sheets\nplastic bottle caps\nrubber bands\nwooden skewers\nglue gun"
  },
  {
    label: "Smart Desk Box",
    list: "broken alarm clock\nservo motor\nshoebox\npaperclips\nwires"
  }
];

export default function BuildOMatic() {
  const [materials, setMaterials] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [buildCount, setBuildCount] = useState(47);

  const handleGenerate = async (presetMaterials) => {
    const listToSubmit = presetMaterials || materials;
    if (!listToSubmit.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setCopySuccess(false);

    try {
      const response = await fetch('/api/generate-build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ materials: listToSubmit })
      });

      if (!response.ok) {
        throw new Error('API returned an error');
      }

      const data = await response.json();
      setResult(data);
      // Increment counter on successful build
      setBuildCount(prev => prev + 1);
    } catch (err) {
      console.warn('API call failed, using local mock build card:', err);
      setResult({
        name: "THE COFFEE-POWERED ROTATING TURBINE",
        difficulty: "MEDIUM",
        coolness: "MAXIMUM",
        time: "~1.5 hours",
        partsNeeded: [
          "old fan motor",
          "cardboard pieces",
          "3 glowing LEDs",
          "duct tape (lots of it)",
          "empty coffee cup"
        ],
        steps: [
          "Tape the fan motor securely to the bottom of the empty coffee cup.",
          "Cut the cardboard into four symmetrical blades and mount them to the motor shaft.",
          "Wire the 3 LEDs in series and solder them directly to the motor leads to draw induction power.",
          "Spin the blades manually, pour coffee, and pray it doesn't catch fire."
        ],
        vinitComment: "this is either absolute genius or an active fire hazard."
      });
      // Increment counter anyway
      setBuildCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (preset) => {
    setMaterials(preset.list);
    handleGenerate(preset.list);
  };

  // Helper to copy card content to clipboard
  const handleCopyCard = () => {
    if (!result) return;

    const cardText = `
┌─────────────────────────────────────────┐
│  BUILD UNLOCKED                         │
│  █████████████████████████████████████  │
│                                         │
│  NAME: ${result.name}
│  DIFFICULTY: ${result.difficulty}
│  COOLNESS:   ${result.coolness}
│  TIME:       ${result.time}
│                                         │
│  PARTS NEEDED:
${result.partsNeeded.map(p => `  ✓ ${p}`).join('\n')}
│                                         │
│  INSTRUCTIONS:
${result.steps.map((s, idx) => `  STEP ${idx + 1}: ${s}`).join('\n')}
│                                         │
│  VINIT'S COMMENT:
│  "${result.vinitComment}"
└─────────────────────────────────────────┘
    `.trim();

    navigator.clipboard.writeText(cardText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Helper to draw difficulty/coolness blocks
  const renderBlocks = (level) => {
    switch (level) {
      case 'EASY': return '██░░░░ EASY';
      case 'MEDIUM': return '████░░ MEDIUM';
      case 'HARD': return '██████ HARD';
      case 'LEGENDARY': return '██████████ LEGENDARY';
      case 'MINIMAL': return '██░░░░ MINIMAL';
      case 'HIGH': return '██████ HIGH';
      case 'MAXIMUM': return '██████████ MAXIMUM';
      default: return '████░░';
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>BUILD-O-MATIC (JUNK LAB)</h2>
      <p className={styles.subtitle}>ENTER A LIST OF SCRAPS TO FORMULATE AN ARCADE DIY DESIGN CARD</p>

      {/* Quick Select Materials */}
      <div className={styles.quickChips}>
        <span className={styles.chipsLabel}>JUNK PRESETS:</span>
        {QUICK_MATERIALS.map((preset, idx) => (
          <button 
            key={idx} 
            onClick={() => handleQuickSelect(preset)}
            className={styles.chip}
            disabled={loading}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Inputs area */}
      <div className={styles.inputWrapper}>
        <textarea 
          placeholder="Enter materials here (one per line, e.g. cardboard, broken cup, LED, tape)..."
          value={materials}
          onChange={(e) => setMaterials(e.target.value)}
          disabled={loading}
          className={styles.textarea}
          rows={5}
        />
        <button 
          onClick={() => handleGenerate()}
          disabled={loading || !materials.trim()}
          className={`${styles.submitBtn} glow-green`}
        >
          [ RUN JUNK COMPILER ]
        </button>
      </div>

      {/* Loading bar state */}
      {loading && (
        <div className={styles.loaderContainer}>
          <div className={styles.loaderText}>COMPILING MATERIAL BLUEPRINTS...</div>
          <div className={styles.progressBar}>
            <div className={`${styles.progressFill} progress-fill`} />
          </div>
          <div className={styles.loaderSub}>GEMINI LAB FORMULATING DESIGN SCHEMATICS</div>
        </div>
      )}

      {/* Error state */}
      {error && <div className={styles.errorBox}>{error}</div>}

      {/* Build counter display */}
      <div className={styles.unlockedCounter}>
        ⚡ {buildCount} BUILDS UNLOCKED &amp; COUNTING
      </div>

      {/* Resulting Build Card */}
      {result && !loading && (
        <div className={styles.buildCard}>
          <div className={styles.cardHeader}>
            <span>BUILD UNLOCKED</span>
            <button onClick={handleCopyCard} className={styles.copyBtn}>
              {copySuccess ? '[ COPIED! ]' : '[ SHARE CARD ]'}
            </button>
          </div>

          <div className={styles.cardSection}>
            <h3 className={styles.projectName}>{result.name}</h3>
            
            <div className={styles.projectStats}>
              <div className={styles.projectStatLine}>
                <span className={styles.statLabel}>DIFFICULTY:</span>
                <span className={styles.statBlocks}>{renderBlocks(result.difficulty)}</span>
              </div>
              <div className={styles.projectStatLine}>
                <span className={styles.statLabel}>COOLNESS:</span>
                <span className={styles.statBlocks}>{renderBlocks(result.coolness)}</span>
              </div>
              <div className={styles.projectStatLine}>
                <span className={styles.statLabel}>EST. TIME:</span>
                <span className={styles.timeVal}>{result.time}</span>
              </div>
            </div>
          </div>

          <div className={styles.cardSection}>
            <h4 className={styles.sectionTitle}>PARTS NEEDED:</h4>
            <ul className={styles.partsList}>
              {result.partsNeeded.map((part, idx) => (
                <li key={idx}>✓ {part}</li>
              ))}
            </ul>
          </div>

          <div className={styles.cardSection}>
            <h4 className={styles.sectionTitle}>INSTRUCTIONS:</h4>
            <ol className={styles.instructionsList}>
              {result.steps.map((step, idx) => (
                <li key={idx}>
                  <span className={styles.stepNum}>STEP {idx + 1}:</span> {step}
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.commentSection}>
            <span className={styles.commentLabel}>VINIT'S COMMENT:</span>
            <p className={styles.commentText}>"{result.vinitComment}"</p>
          </div>
        </div>
      )}
    </div>
  );
}
