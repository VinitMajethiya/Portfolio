/* polaroid-drag.js — Drag-and-drop card physics & Web Audio synth arpeggiator */

document.addEventListener('DOMContentLoaded', () => {
  const deck = document.getElementById('polaroidDeck');
  const cards = document.querySelectorAll('.polaroid-card');
  if (!deck || cards.length === 0) return;

  let activeCard = null;
  let startX = 0;
  let startY = 0;
  let cardLeft = 0;
  let cardTop = 0;
  let topZIndex = 20;

  // Set initial random rotations slightly so it feels organic
  const initialRotations = [-4, 3, -2, 5];
  cards.forEach((card, idx) => {
    const rot = initialRotations[idx % initialRotations.length];
    card.style.transform = `rotate(${rot}deg)`;
  });

  // DRAG & DROP EVENT LISTENERS
  cards.forEach(card => {
    card.addEventListener('mousedown', dragStart);
    card.addEventListener('touchstart', dragStart, { passive: false });
  });

  function dragStart(e) {
    // Avoid dragging on button click or keycaps click
    if (e.target.closest('#macropadGrid') || e.target.closest('.key-cap') || e.target.closest('button')) {
      return;
    }

    activeCard = this;
    topZIndex++;
    activeCard.style.zIndex = topZIndex;

    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    const rect = activeCard.getBoundingClientRect();
    const deckRect = deck.getBoundingClientRect();

    startX = clientX;
    startY = clientY;
    cardLeft = rect.left - deckRect.left;
    cardTop = rect.top - deckRect.top;

    activeCard.style.cursor = 'grabbing';

    if (e.type === 'touchstart') {
      e.preventDefault();
    }

    document.addEventListener('mousemove', dragMove);
    document.addEventListener('touchmove', dragMove, { passive: false });
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);
  }

  function dragMove(e) {
    if (!activeCard) return;

    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

    const dx = clientX - startX;
    const dy = clientY - startY;

    let newLeft = cardLeft + dx;
    let newTop = cardTop + dy;

    const deckW = deck.clientWidth;
    const deckH = deck.clientHeight;
    const cardW = activeCard.clientWidth;
    const cardH = activeCard.clientHeight;

    newLeft = Math.max(-cardW / 2, Math.min(newLeft, deckW - cardW / 2));
    newTop = Math.max(-cardH / 3, Math.min(newTop, deckH - cardH / 1.5));

    const tilt = Math.max(-10, Math.min(dx * 0.1, 10));
    activeCard.style.left = `${newLeft}px`;
    activeCard.style.top = `${newTop}px`;
    activeCard.style.transform = `rotate(${tilt}deg)`;

    if (e.type === 'touchmove') {
      e.preventDefault();
    }
  }

  function dragEnd() {
    if (!activeCard) return;

    activeCard.style.cursor = 'grab';
    const finalRot = (Math.random() * 8) - 4;
    activeCard.style.transform = `rotate(${finalRot}deg)`;

    activeCard = null;

    document.removeEventListener('mousemove', dragMove);
    document.removeEventListener('touchmove', dragMove);
    document.removeEventListener('mouseup', dragEnd);
    document.removeEventListener('touchend', dragEnd);
  }

  // ==================== SHARED AUDIO CONTEXT ====================
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }


  // ==================== 1. GUITAR CARD: STRUM ARPEGGIO ====================
  const cardMusic = document.getElementById('cardMusic');
  const waveAnim = document.getElementById('synthWaveAnim');
  let arpeggioPlaying = false;

  const chords = {
    Am: [110.00, 220.00, 261.63, 329.63, 440.00],
    G:  [98.00,  196.00, 246.94, 293.66, 392.00],
    C:  [130.81, 261.63, 329.63, 392.00, 523.25],
    Em: [82.41,  164.81, 246.94, 329.63, 493.88]
  };
  const chordProgression = ['Am', 'G', 'C', 'Em'];
  let currentProgressionIndex = 0;

  if (cardMusic && waveAnim) {
    cardMusic.addEventListener('click', () => {
      if (arpeggioPlaying) return;
      playGuitarStrum();
    });
  }

  function playGuitarStrum() {
    arpeggioPlaying = true;
    waveAnim.classList.add('active');

    const ctx = getAudioCtx();
    const frequencies = chords[chordProgression[currentProgressionIndex]];
    const strumSpeed = 0.08;
    const now = ctx.currentTime;

    frequencies.forEach((freq, index) => {
      synthesizeGuitarNote(ctx, freq, now + (index * strumSpeed));
    });

    const totalStrumTime = frequencies.length * strumSpeed * 1000 + 1500;
    setTimeout(() => {
      waveAnim.classList.remove('active');
      arpeggioPlaying = false;
      currentProgressionIndex = (currentProgressionIndex + 1) % chordProgression.length;
    }, totalStrumTime);
  }

  function synthesizeGuitarNote(ctx, freq, startTime) {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.12, startTime + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.6);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2500, startTime);
    filter.frequency.exponentialRampToValueAtTime(300, startTime + 0.8);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 1.8);
  }


  // ==================== 2. GAMING CARD: SCORE BURST ====================
  const cardGaming = document.getElementById('cardGaming');
  const scoreTicker = document.getElementById('gameScoreVal');
  let currentScore = 4200;
  let scoreRunning = false;

  if (cardGaming && scoreTicker) {
    // Hover: continuously tick score up
    cardGaming.addEventListener('mouseenter', () => {
      if (scoreRunning) return;
      scoreRunning = true;
      tickScore();
    });
    cardGaming.addEventListener('mouseleave', () => {
      scoreRunning = false;
    });

    // Click: score burst + coin chime
    cardGaming.addEventListener('click', (e) => {
      if (e.target.closest('.polaroid-caption')) return;
      const burst = 500 + Math.floor(Math.random() * 1500);
      currentScore += burst;
      updateScoreDisplay();
      scoreTicker.classList.remove('score-pop');
      void scoreTicker.offsetWidth; // reflow to restart animation
      scoreTicker.classList.add('score-pop');
      scoreTicker.addEventListener('animationend', () => scoreTicker.classList.remove('score-pop'), { once: true });
      playCoinChime();
    });
  }

  function tickScore() {
    if (!scoreRunning) return;
    currentScore += Math.floor(Math.random() * 10) + 1;
    updateScoreDisplay();
    setTimeout(tickScore, 80);
  }

  function updateScoreDisplay() {
    scoreTicker.textContent = 'SCORE: ' + String(currentScore).padStart(6, '0');
  }

  function playCoinChime() {
    const ctx = getAudioCtx();
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    const now = ctx.currentTime;
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.06);
      gain.gain.setValueAtTime(0.18, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.3);
    });
  }


  // ==================== 3. MAKING CARD: MECHANICAL KEYCAPS ====================
  const macropadGrid = document.getElementById('macropadGrid');

  if (macropadGrid) {
    const keyCaps = macropadGrid.querySelectorAll('.key-cap');
    const keyLabels = ['FN', '⌘', 'ESC', '◀', '▶', '■'];

    keyCaps.forEach((key, idx) => {
      // Label each key
      key.textContent = keyLabels[idx] || '';
      Object.assign(key.style, {
        fontFamily: 'var(--font-mono)',
        fontSize: '7px',
        color: '#8a8060',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: '1',
      });

      const fireKey = () => {
        key.classList.add('pressed');
        playMechClick(idx);
        setTimeout(() => key.classList.remove('pressed'), 120);
      };

      key.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        fireKey();
      });
      key.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        e.preventDefault();
        fireKey();
      }, { passive: false });
    });
  }

  function playMechClick(keyIndex) {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    // White noise burst
    const bufferSize = Math.floor(ctx.sampleRate * 0.04);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.setValueAtTime(800 + keyIndex * 80, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    noise.connect(hpf);
    hpf.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.07);

    // Low tonal "thock"
    const thockOsc = ctx.createOscillator();
    thockOsc.type = 'sine';
    thockOsc.frequency.setValueAtTime(180 - keyIndex * 10, now);
    const thockGain = ctx.createGain();
    thockGain.gain.setValueAtTime(0.15, now);
    thockGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    thockOsc.connect(thockGain);
    thockGain.connect(ctx.destination);
    thockOsc.start(now);
    thockOsc.stop(now + 0.09);
  }


  // ==================== 4. RUNNING CARD: SPRINT ANIMATION ====================
  const cardRunning = document.getElementById('cardRunning');
  const runnerSprite = document.getElementById('runnerSprite');
  let isRunning = false;

  if (cardRunning && runnerSprite) {
    const triggerRun = (e) => {
      if (e && e.target.closest('.polaroid-caption')) return;
      if (isRunning) return;
      startRun();
    };

    cardRunning.addEventListener('click', triggerRun);
    cardRunning.addEventListener('mouseenter', triggerRun);
  }

  function startRun() {
    isRunning = true;
    cardRunning.classList.add('is-running');
    playFootsteps();

    // Runner takes ~2s to cross, then reset
    setTimeout(() => {
      runnerSprite.classList.add('resetting'); // no transition, snap back
      cardRunning.classList.remove('is-running');
      void runnerSprite.offsetWidth; // force reflow
      setTimeout(() => {
        runnerSprite.classList.remove('resetting');
        isRunning = false;
      }, 60);
    }, 2200);
  }

  function playFootsteps() {
    const ctx = getAudioCtx();
    [0, 0.28, 0.56].forEach((offset) => {
      const now = ctx.currentTime + offset;
      const bufLen = Math.floor(ctx.sampleRate * 0.06);
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bufLen);

      const src = ctx.createBufferSource();
      src.buffer = buf;

      const lpf = ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.value = 280;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.22, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

      src.connect(lpf); lpf.connect(g); g.connect(ctx.destination);
      src.start(now); src.stop(now + 0.08);
    });
  }
});
