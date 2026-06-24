import React, { useState, useEffect } from 'react';
import styles from './StatsSidebar.module.css';

export default function StatsSidebar({ activeTab }) {
  const [time, setTime] = useState(new Date());
  const [hiScore, setHiScore] = useState(0);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update high score reactively
  useEffect(() => {
    const updateHighScore = () => {
      const score = parseInt(localStorage.getItem('chaos_hi_score') || '0', 10);
      setHiScore(score);
    };

    updateHighScore();
    
    // Listen for high score updates (e.g., custom score update events or check on interval)
    const interval = setInterval(updateHighScore, 1000);
    return () => clearInterval(interval);
  }, []);

  const getMissionName = () => {
    switch (activeTab) {
      case 'shooter': return 'BUG INVADERS';
      case 'guitar': return 'GUITAR LAB';
      case 'books': return 'BOOK MOOD';
      case 'junk': return 'JUNK LAB';
      default: return 'SYSTEM COMPILING';
    }
  };

  const getDayName = () => {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[time.getDay()];
  };

  const formatDate = () => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${time.getDate().toString().padStart(2, '0')} ${months[time.getMonth()]} ${time.getFullYear()}`;
  };

  return (
    <aside className={styles.sidebar} aria-label="System Stats">
      {/* Player Bio */}
      <section className={styles.section}>
        <div className={styles.playerTitle}>PLAYER: VINIT.EXE</div>
        <div className={styles.divider} />
        <div className={styles.grid}>
          <span className={styles.label}>HI-SCORE</span>
          <span className={styles.value}>{hiScore.toString().padStart(6, '0')}</span>
          <span className={styles.label}>LEVEL</span>
          <span className={styles.value}>FINAL YR</span>
          <span className={styles.label}>STATUS</span>
          <span className={styles.value}>SEEKING INT</span>
        </div>
      </section>

      {/* Mission */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>CURRENT MISSION</div>
        <div className={styles.divider} />
        <div className={styles.missionText}>{getMissionName()}</div>
      </section>

      {/* Vitals */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>VINIT'S VITALS</div>
        <div className={styles.divider} />
        <div className={styles.grid}>
          <span className={styles.label}>GUITAR</span>
          <span className={styles.value}>♩ MEDITATIVE</span>
          <span className={styles.label}>BOOKS</span>
          <span className={styles.value}>87% TENSION</span>
          <span className={styles.label}>CRAFT</span>
          <span className={styles.value}>ACTIVE</span>
          <span className={styles.label}>GAMES</span>
          <span className={styles.value}>RANKED</span>
        </div>
      </section>

      {/* Live Time */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>NOW PLAYING</div>
        <div className={styles.divider} />
        <div className={styles.timeValue}>
          {time.getHours().toString().padStart(2, '0')}:
          {time.getMinutes().toString().padStart(2, '0')}:
          {time.getSeconds().toString().padStart(2, '0')}
        </div>
        <div className={styles.dateValue}>
          {getDayName()} · {formatDate()}
        </div>
      </section>

      {/* System Flags */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>SYSTEM</div>
        <div className={styles.divider} />
        <div className={styles.grid}>
          <span className={styles.label}>STACK</span>
          <span className={styles.value}>REACT+VITE</span>
          <span className={styles.label}>VIBES</span>
          <span className={styles.value}>MAXIMUM</span>
          <span className={styles.label}>COFFEE</span>
          <span className={styles.value}>NEEDED</span>
        </div>
      </section>
    </aside>
  );
}
