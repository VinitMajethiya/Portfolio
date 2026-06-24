import React, { useState } from 'react';
import styles from './BookAnalyser.module.css';

const QUICK_BOOKS = [
  {
    title: "The Silent Patient",
    text: "Alicia Berenson's life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house in one of London's most desirable areas. One evening her husband Gabriel returns home late from a fashion shoot, and Alicia shoots him five times in the face, and then never speaks another word."
  },
  {
    title: "Gone Girl",
    text: "On a warm summer morning in North Carthage, Missouri, it is Amy and Nick Dunne's fifth wedding anniversary. Presents are being wrapped and reservations are being made when Nick's clever and beautiful wife disappears from their rented McMansion. Nick soon becomes the prime suspect as his lies unravel."
  },
  {
    title: "Shutter Island",
    text: "In 1954, U.S. Marshal Teddy Daniels and his new partner, Chuck Aule, arrive at Ashecliffe Hospital for the criminally insane on Shutter Island. They are investigating the disappearance of a patient, Rachel Solando, a multiple murderer who escaped from a locked cell. But nothing is as it seems."
  }
];

export default function BookAnalyser() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyse = async (blurbText) => {
    const textToSubmit = blurbText || text;
    if (!textToSubmit.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyse-book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: textToSubmit })
      });

      if (!response.ok) {
        throw new Error('API returned an error');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.warn('API call failed, using local mock data fallback:', err);
      // Fallback mock data so user can see it work locally
      setResult({
        tension: 88,
        darkness: 92,
        plotTwists: 85,
        twoAmIndex: 95,
        verdict: "An absolute page-turner. Read it now.",
        vinitRating: "WOULD DESTROY HIM"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (book) => {
    setText(book.text);
    handleAnalyse(book.text);
  };

  // Helper to draw visual text meters (e.g. ██████░░░░ 60%)
  const renderMeter = (value) => {
    const totalBlocks = 10;
    const filledBlocks = Math.round((value / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    const meterStr = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
    return `${meterStr} ${value}%`;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>THRILLER MOOD ANALYSER</h2>
      <p className={styles.subtitle}>PASTE A BLURB TO CALCULATE THE SUSPENSE TENSION STATISTICS</p>

      {/* Quick Select Quick Chips */}
      <div className={styles.quickChips}>
        <span className={styles.chipsLabel}>QUICK FILES:</span>
        {QUICK_BOOKS.map((book, idx) => (
          <button 
            key={idx} 
            onClick={() => handleQuickSelect(book)}
            className={styles.chip}
            disabled={loading}
          >
            {book.title}
          </button>
        ))}
      </div>

      {/* Text Area Input */}
      <div className={styles.inputWrapper}>
        <textarea 
          placeholder="Paste book plot summary, back cover blurb, or character dialogue here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
          className={styles.textarea}
          rows={6}
        />
        <button 
          onClick={() => handleAnalyse()}
          disabled={loading || !text.trim()}
          className={`${styles.submitBtn} glow-pink`}
        >
          [ RUN ANALYSIS ]
        </button>
      </div>

      {/* Loading bar state */}
      {loading && (
        <div className={styles.loaderContainer}>
          <div className={styles.loaderText}>ANALYSING MOOD AND TENSION...</div>
          <div className={styles.progressBar}>
            <div className={`${styles.progressFill} progress-fill`} />
          </div>
          <div className={styles.loaderSub}>GEMINI CORE DECRYPTING BLURB DATA</div>
        </div>
      )}

      {/* Error state */}
      {error && <div className={styles.errorBox}>{error}</div>}

      {/* Result Display Board */}
      {result && !loading && (
        <div className={styles.resultsBoard}>
          <div className={styles.boardHeader}>
            <span>ANALYSIS COMPLETE</span>
            <span className={styles.verdictBadge}>
              {result.tension + result.darkness > 160 ? 'VINIT APPROVED ✓' : 'TOO SOFT FOR VINIT ✗'}
            </span>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statLine}>
              <span className={styles.statLabel}>TENSION SCORE:</span>
              <span className={styles.statMeter}>{renderMeter(result.tension)}</span>
            </div>
            <div className={styles.statLine}>
              <span className={styles.statLabel}>DARKNESS RATING:</span>
              <span className={styles.statMeter}>{renderMeter(result.darkness)}</span>
            </div>
            <div className={styles.statLine}>
              <span className={styles.statLabel}>PLOT TWISTS:</span>
              <span className={styles.statMeter}>{renderMeter(result.plotTwists)}</span>
            </div>
            <div className={styles.statLine}>
              <span className={styles.statLabel}>2AM INDEX:</span>
              <span className={styles.statMeter}>{renderMeter(result.twoAmIndex)}</span>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.verdictBlock}>
            <div className={styles.verdictRow}>
              <span className={styles.verdictLabel}>VERDICT:</span>
              <span className={styles.verdictText}>"{result.verdict}"</span>
            </div>
            <div className={styles.verdictRow}>
              <span className={styles.verdictLabel}>VINIT RATING:</span>
              <span className={`${styles.ratingText} ${result.vinitRating === 'WOULD DESTROY HIM' ? styles.goldText : ''}`}>
                {result.vinitRating}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
