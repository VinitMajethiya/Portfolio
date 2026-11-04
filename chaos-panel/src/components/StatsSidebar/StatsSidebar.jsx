import React, { useState, useEffect } from 'react';
import styles from './StatsSidebar.module.css';

const TAB_META = {
  shooter: {
    mission: 'BUG INVADERS',
    missionSub: 'Eliminate all bugs',
    accent: '#FF5722',
    vitals: [
      { label: 'AIM',    value: 94, unit: '%' },
      { label: 'REFLEX', value: 82, unit: '%' },
      { label: 'AMMO',   value: 67, unit: '%' },
    ],
  },
  guitar: {
    mission: 'GUITAR LAB',
    missionSub: 'Compose something wild',
    accent: '#00E5FF',
    vitals: [
      { label: 'TUNING',    value: 100, unit: '%' },
      { label: 'VIBE',      value: 87,  unit: '%' },
      { label: 'DISTORTION',value: 42,  unit: '%' },
    ],
  },
  books: {
    mission: 'BOOK MOOD',
    missionSub: 'Decode the narrative',
    accent: '#D500F9',
    vitals: [
      { label: 'TENSION',   value: 87, unit: '%' },
      { label: 'PLOT HOLES',value: 12, unit: '%' },
      { label: 'IMMERSION', value: 96, unit: '%' },
    ],
  },
  junk: {
    mission: 'JUNK LAB',
    missionSub: 'Build something broken',
    accent: '#76FF03',
    vitals: [
      { label: 'CHAOS',    value: 100, unit: '%' },
      { label: 'COFFEE',   value: 43,  unit: '%' },
      { label: 'ENTROPY',  value: 78,  unit: '%' },
    ],
  },
};

const SYSTEM_STATS = [
  { label: 'STACK',   value: 'REACT+VITE' },
  { label: 'VIBES',   value: 'MAXIMUM' },
  { label: 'COFFEE',  value: 'NEEDED' },
  { label: 'STATUS',  value: 'SEEKING INT' },
];

export default function StatsSidebar({ activeTab }) {
  const [time, setTime]     = useState(new Date());
  const [hiScore, setHiScore] = useState(0);
  const [vitalKey, setVitalKey] = useState(0); // re-trigger bar animation on tab change

  /* ─── Live clock ─── */
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* ─── Hi-score from localStorage ─── */
  useEffect(() => {
    const update = () => {
      setHiScore(parseInt(localStorage.getItem('chaos_hi_score') || '0', 10));
    };
    update();
    const interval = setInterval(update, 2000);
    return () => clearInterval(interval);
  }, []);

  /* ─── Retrigger vital bar animations on tab change ─── */
  useEffect(() => {
    setVitalKey(k => k + 1);
  }, [activeTab]);

  const meta = TAB_META[activeTab] || TAB_META.shooter;

  const pad2  = (n) => String(n).padStart(2, '0');
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const days   = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

  return (
    <aside className={styles.sidebar} aria-label="System stats sidebar">

      {/* ─── Player header ─── */}
      <section className={styles.playerHeader}>
        <div className={styles.playerAvatarRing} aria-hidden="true">
          <span className={styles.playerAvatarInner}>V</span>
        </div>
        <div>
          <div className={styles.playerName}>VINIT.EXE</div>
          <div className={styles.playerRank}>FINAL YEAR · SEEKER</div>
        </div>
      </section>

      {/* ─── Hi-score ─── */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>HI-SCORE</div>
        <div className={styles.hiScore} aria-live="polite">
          {hiScore.toString().padStart(8, '0')}
        </div>
      </section>

      <div className={styles.divider} />

      {/* ─── Live Clock ─── */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>SYS CLOCK</div>
        <div className={styles.clock} aria-live="polite">
          <span className={styles.clockHH}>{pad2(time.getHours())}</span>
          <span className={styles.clockSep}>:</span>
          <span className={styles.clockMM}>{pad2(time.getMinutes())}</span>
          <span className={styles.clockSep}>:</span>
          <span className={styles.clockSS}>{pad2(time.getSeconds())}</span>
        </div>
        <div className={styles.clockDate}>
          {days[time.getDay()]} · {pad2(time.getDate())} {months[time.getMonth()]} {time.getFullYear()}
        </div>
      </section>

      <div className={styles.divider} />

      {/* ─── Current mission ─── */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>CURRENT MISSION</div>
        <div className={styles.missionBadge} style={{ '--mission-color': meta.accent }}>
          {meta.mission}
        </div>
        <div className={styles.missionSub}>{meta.missionSub}</div>
      </section>

      <div className={styles.divider} />

      {/* ─── Vitals / progress bars ─── */}
      <section className={styles.section} key={vitalKey}>
        <div className={styles.sectionLabel}>VITALS</div>
        <div className={styles.vitals}>
          {meta.vitals.map(v => (
            <div key={v.label} className={styles.vitalRow}>
              <div className={styles.vitalTop}>
                <span className={styles.vitalLabel}>{v.label}</span>
                <span className={styles.vitalValue} style={{ color: meta.accent }}>
                  {v.value}{v.unit}
                </span>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{
                    '--fill-width': `${v.value}%`,
                    '--bar-color': meta.accent,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.divider} />

      {/* ─── System stats grid ─── */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>SYS_INFO</div>
        <div className={styles.statGrid}>
          {SYSTEM_STATS.map(s => (
            <React.Fragment key={s.label}>
              <span className={styles.statKey}>{s.label}</span>
              <span className={styles.statVal}>{s.value}</span>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ─── Footer stamp ─── */}
      <div className={styles.sidebarFooter}>
        <span className={styles.buildStamp}>BUILD v2.0 · 2025</span>
      </div>

    </aside>
  );
}
