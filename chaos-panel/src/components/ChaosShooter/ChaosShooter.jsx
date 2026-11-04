import React, { useState, useEffect, useRef } from 'react';
import styles from './ChaosShooter.module.css';

// Web Audio API helper (runs on first player interaction to bypass browser autoplay rules)
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playLaserSound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(600, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.12);
  
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.12);
}

function playExplosionSound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(120, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.25);
  
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.25);
}

function playPowerupSound() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const notes = [261.63, 329.63, 392.00, 523.25]; // C major arpeggio
  notes.forEach((freq, index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + index * 0.08);
    
    gain.gain.setValueAtTime(0.1, now + index * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.2);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(now + index * 0.08);
    osc.stop(now + index * 0.08 + 0.25);
  });
}

function playHurtSound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(150, audioCtx.currentTime);
  osc.frequency.linearRampToValueAtTime(60, audioCtx.currentTime + 0.35);
  
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.35);
}

const WAVE_NAMES = [
  'HELLO WORLD',
  'STACK OVERFLOW',
  'THE DEADLINE',
  'PRODUCTION DEPLOY',
  'CHAOS LOOP'
];

export default function ChaosShooter() {
  const canvasRef = useRef(null);
  
  // React state for HUD / sidebar sync
  const [score, setScore] = useState(0);
  const [hiScore, setHiScore] = useState(() => {
    return parseInt(localStorage.getItem('chaos_hi_score') || '0', 10);
  });
  const [gameState, setGameState] = useState('START'); // START, PLAYING, PAUSED, GAMEOVER, WAVE_CLEAR
  const [currentWave, setCurrentWave] = useState(1);
  const [lives, setLives] = useState(3);
  const [activePowerups, setActivePowerups] = useState([]);

  // Mutable game data for the animation loop
  const gameData = useRef({
    player: {
      x: 375,
      y: 500,
      width: 50,
      height: 30,
      speed: 6,
      shootDelay: 320, // ms
      lastShot: 0,
      powerups: {
        coffee: 0,   // remaining time in ms
        shield: false,
        debugger: 0  // remaining time in ms
      }
    },
    bugs: [],
    bullets: [],
    particles: [],
    powerups: [],
    floatingTexts: [],
    keys: {},
    wave: 1,
    score: 0,
    lives: 3,
    direction: 1, // 1 for right, -1 for left
    screenShake: 0,
    waveClearTimer: 0,
    gitCleanWave: {
      active: false,
      radius: 0,
      x: 0,
      y: 0
    }
  });

  const gameStateRef = useRef('START');

  // Track keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e) => {
      const keys = ['Space', ' ', 'ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'KeyP', 'Escape', 'Enter'];
      if (keys.includes(e.code) || keys.includes(e.key)) {
        // Prevent scrolling with Space / Arrows
        if (['Space', ' ', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
        }
      }
      gameData.current.keys[e.key.toLowerCase()] = true;
      gameData.current.keys[e.code ? e.code.toLowerCase() : ''] = true;

      // Handle pause toggling
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        setGameState(current => {
          if (current === 'PLAYING') {
            return 'PAUSED';
          } else if (current === 'PAUSED') {
            initAudio();
            return 'PLAYING';
          }
          return current;
        });
      }

      // Handle restart / start
      if (e.key === 'Enter' || e.code === 'Space' || e.key === ' ') {
        setGameState(current => {
          if (current === 'START' || current === 'GAMEOVER') {
            initAudio();
            resetGame();
            return 'PLAYING';
          }
          return current;
        });
      }
    };

    const handleKeyUp = (e) => {
      gameData.current.keys[e.key.toLowerCase()] = false;
      gameData.current.keys[e.code ? e.code.toLowerCase() : ''] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Sync state changes from loop back to React
  const resetGame = () => {
    const data = gameData.current;
    data.player.x = 375;
    data.player.y = 500;
    data.player.powerups = { coffee: 0, shield: false, debugger: 0 };
    data.score = 0;
    data.wave = 1;
    data.lives = 3;
    data.bugs = [];
    data.bullets = [];
    data.particles = [];
    data.powerups = [];
    data.floatingTexts = [];
    data.direction = 1;
    data.screenShake = 0;
    data.gitCleanWave.active = false;
    
    setScore(0);
    setCurrentWave(1);
    setLives(3);
    
    spawnBugs(1);
  };

  const spawnBugs = (waveNum) => {
    const data = gameData.current;
    data.bugs = [];
    
    const rows = 4;
    const cols = 8;
    const startX = 80;
    const startY = 80;
    const spacingX = 65;
    const spacingY = 50;

    // Define bug configurations based on row index
    // Row 0: Beetle (heavy 2hp), Row 1: Spider (wavy), Row 2: Mosquito (swooper), Row 3: Standard
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let bugType = 'standard';
        let emoji = '🐛';
        let color = '#39FF14'; // Neon Green
        let hp = 1;
        let points = 10;

        if (r === 0) {
          bugType = 'beetle';
          emoji = '🪲';
          color = '#00F5FF'; // Neon Cyan
          hp = 2;
          points = 30;
        } else if (r === 1) {
          bugType = 'spider';
          emoji = '🕷️';
          color = '#FF2D78'; // Neon Pink
          hp = 1;
          points = 20;
        } else if (r === 2) {
          bugType = 'mosquito';
          emoji = '🦟';
          color = '#FFD700'; // Retro Gold
          hp = 1;
          points = 40;
        }

        data.bugs.push({
          id: `${r}-${c}`,
          type: bugType,
          x: startX + c * spacingX,
          y: startY + r * spacingY,
          baseY: startY + r * spacingY, // for wavy motion
          width: 32,
          height: 32,
          emoji: emoji,
          color: color,
          hp: hp,
          maxHp: hp,
          points: points,
          phase: Math.random() * Math.PI * 2, // wave offset
          diveState: 'grid', // 'grid', 'diving', 'returning'
          diveTargetX: 0,
          shootCooldown: Math.random() * 4000 + (3000 - Math.min(waveNum * 200, 1500))
        });
      }
    }
  };

  // Trigger floating errors on bug death
  const spawnFloatingText = (x, y, text, color) => {
    gameData.current.floatingTexts.push({
      x,
      y,
      text,
      color: color || '#E8E8F0',
      vy: -1,
      alpha: 1.0,
      decay: 0.02
    });
  };

  // Trigger particle explosion
  const spawnParticles = (x, y, color, count = 10) => {
    for (let i = 0; i < count; i++) {
      gameData.current.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        color: color || '#FF6B35',
        size: Math.random() * 3 + 2,
        alpha: 1.0,
        decay: Math.random() * 0.03 + 0.015
      });
    }
  };

  // Main Canvas Game Loop
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const loop = (time) => {
      const dt = time - lastTime;
      lastTime = time;

      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameId = requestAnimationFrame(loop);
        return;
      }
      const ctx = canvas.getContext('2d');
      
      // Update Game State
      const currentStatus = gameStateRef.current;
      
      if (currentStatus === 'PLAYING') {
        updateGame(dt);
      }

      // Draw Everything
      drawGame(ctx, canvas.width, canvas.height);

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Keep ref in sync with React state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Update logic inside the frame loop
  const updateGame = (dt) => {
    const data = gameData.current;
    
    // Decelerate Screen Shake
    if (data.screenShake > 0) {
      data.screenShake *= 0.88;
      if (data.screenShake < 0.2) data.screenShake = 0;
    }

    // ─── 1. PLAYER MOVEMENT ───
    const isLeftPressed = data.keys['arrowleft'] || data.keys['a'] || data.keys['keya'];
    const isRightPressed = data.keys['arrowright'] || data.keys['d'] || data.keys['keyd'];

    if (isLeftPressed) {
      data.player.x = Math.max(10, data.player.x - data.player.speed);
    }
    if (isRightPressed) {
      data.player.x = Math.min(800 - 10 - data.player.width, data.player.x + data.player.speed);
    }

    // Update active powerups timer
    if (data.player.powerups.coffee > 0) {
      data.player.powerups.coffee = Math.max(0, data.player.powerups.coffee - dt);
    }
    if (data.player.powerups.debugger > 0) {
      data.player.powerups.debugger = Math.max(0, data.player.powerups.debugger - dt);
    }

    // Sync active power-ups UI indicators
    const activeList = [];
    if (data.player.powerups.coffee > 0) {
      activeList.push(`☕ COFFEE: ${(data.player.powerups.coffee / 1000).toFixed(1)}s`);
    }
    if (data.player.powerups.shield) {
      activeList.push('🛡️ SHIELD: ON');
    }
    if (data.player.powerups.debugger > 0) {
      activeList.push(`🐞 DEBUGGER: ${(data.player.powerups.debugger / 1000).toFixed(1)}s`);
    }
    setActivePowerups(activeList);

    // ─── 2. SHOOTING ───
    const isSpacePressed = data.keys[' '] || data.keys['space'];
    const now = Date.now();
    const effectiveShootDelay = data.player.powerups.coffee > 0 
      ? data.player.shootDelay / 2.2 // fast fire
      : data.player.shootDelay;

    if (isSpacePressed && now - data.player.lastShot > effectiveShootDelay) {
      data.player.lastShot = now;
      playLaserSound();
      
      const laserColor = data.player.powerups.coffee > 0 ? '#FF6B35' : '#39FF14';
      data.bullets.push({
        x: data.player.x + data.player.width / 2,
        y: data.player.y,
        vy: data.player.powerups.coffee > 0 ? -12 : -8, // faster lasers with coffee
        width: 3,
        height: 12,
        type: 'player',
        color: laserColor
      });
    }

    // ─── 3. SHOCKWAVE / GIT CLEAN ───
    if (data.gitCleanWave.active) {
      data.gitCleanWave.radius += 10;
      
      // Damage bugs hit by shockwave
      data.bugs.forEach(bug => {
        if (!bug.hitByShockwave) {
          const bugCenterX = bug.x + bug.width / 2;
          const bugCenterY = bug.y + bug.height / 2;
          const dist = Math.hypot(bugCenterX - data.gitCleanWave.x, bugCenterY - data.gitCleanWave.y);
          
          if (dist <= data.gitCleanWave.radius) {
            bug.hp = 0; // Obliterate bug
            bug.hitByShockwave = true;
          }
        }
      });

      if (data.gitCleanWave.radius >= 650) {
        data.gitCleanWave.active = false;
      }
    }

    // ─── 4. BUGS LOGIC ───
    let shiftDownNeeded = false;
    const isSlowed = data.player.powerups.debugger > 0;
    
    // Bug speed multiplier scales up as count drops and waves increase
    const baseSpeed = 0.8 + data.wave * 0.15;
    const aliveMultiplier = 1.0 + (32 - data.bugs.length) * 0.05;
    const slowMultiplier = isSlowed ? 0.4 : 1.0;
    const currentSpeed = baseSpeed * aliveMultiplier * slowMultiplier;

    data.bugs.forEach(bug => {
      // 4.1 Base horizontal movement
      if (bug.diveState === 'grid') {
        bug.x += data.direction * currentSpeed;
        
        // Spider custom wavy offset
        if (bug.type === 'spider') {
          bug.phase += 0.05 * slowMultiplier;
          bug.y = bug.baseY + Math.sin(bug.phase) * 8;
        } else {
          bug.y = bug.baseY;
        }

        // Check border collisions
        if (bug.x <= 15 || bug.x >= 800 - bug.width - 15) {
          shiftDownNeeded = true;
        }
      } 
      // 4.2 Mosquito custom dive swoop logic
      else if (bug.diveState === 'diving') {
        const targetX = data.player.x + data.player.width / 2;
        bug.x += (targetX - bug.x) * 0.03 * slowMultiplier;
        bug.y += 4 * slowMultiplier;
        
        // Return once past player
        if (bug.y >= 540) {
          bug.diveState = 'returning';
        }
      } 
      else if (bug.diveState === 'returning') {
        bug.x += (bug.x - bug.x) * 0.03; // stabilize x
        bug.y -= 4;
        
        if (bug.y <= bug.baseY) {
          bug.y = bug.baseY;
          bug.diveState = 'grid';
        }
      }

      // Check for mosquito diving trigger
      if (bug.type === 'mosquito' && bug.diveState === 'grid' && Math.random() < 0.0006 && !isSlowed) {
        bug.diveState = 'diving';
      }

      // 4.3 Bug shooting
      bug.shootCooldown -= dt;
      if (bug.shootCooldown <= 0) {
        bug.shootCooldown = Math.random() * 4000 + (3000 - Math.min(data.wave * 200, 1500));
        
        // Only shoot if in front or diving
        data.bullets.push({
          x: bug.x + bug.width / 2,
          y: bug.y + bug.height,
          vy: isSlowed ? 2.5 : 4 + Math.min(data.wave * 0.4, 2.5),
          width: 3,
          height: 10,
          type: 'enemy',
          color: bug.color
        });
      }
    });

    if (shiftDownNeeded) {
      data.direction *= -1;
      data.bugs.forEach(bug => {
        bug.baseY += 16;
        bug.x += data.direction * 3; // step away from border slightly
        
        // If bug touches bottom player boundary: instantly trigger Game Over
        if (bug.baseY >= data.player.y - 10) {
          playHurtSound();
          data.lives = 0;
          setLives(0);
          setGameState('GAMEOVER');
        }
      });
    }

    // ─── 5. BULLETS MOVEMENT & COLLISION ───
    data.bullets.forEach((bullet) => {
      bullet.y += bullet.vy;

      // Offscreen removal
      if (bullet.y < 0 || bullet.y > 600) {
        bullet.markedForDeletion = true;
        return;
      }

      // 5.1 Player laser hits bugs
      if (bullet.type === 'player') {
        data.bugs.forEach(bug => {
          if (bug.hp > 0 &&
              bullet.x >= bug.x && bullet.x <= bug.x + bug.width &&
              bullet.y >= bug.y && bullet.y <= bug.y + bug.height) {
            
            bullet.markedForDeletion = true;
            bug.hp--;
            spawnParticles(bug.x + bug.width / 2, bug.y + bug.height / 2, bug.color, 4);

            if (bug.hp <= 0) {
              playExplosionSound();
              data.screenShake = 3;
              data.score += bug.points;
              setScore(data.score);

              // Update high score in local storage
              const currentHi = parseInt(localStorage.getItem('chaos_hi_score') || '0', 10);
              if (data.score > currentHi) {
                localStorage.setItem('chaos_hi_score', data.score);
                setHiScore(data.score);
              }

              // Death labels floaty errors
              const errors = ['404', 'NULL_PTR', 'MERGE_CONFLICT', 'SEG_FAULT', 'STACK_OFLW', 'OUT_OF_BOUNDS', 'DEP_DEPR'];
              const randomErr = errors[Math.floor(Math.random() * errors.length)];
              spawnFloatingText(bug.x + bug.width/2, bug.y, randomErr, bug.color);
              spawnParticles(bug.x + bug.width/2, bug.y + bug.height/2, bug.color, 12);

              // Power-up drops: 16% chance
              if (Math.random() < 0.16) {
                const rand = Math.random();
                let type = 'coffee';
                let emoji = '☕';
                let color = '#FF6B35';

                if (rand < 0.3) {
                  type = 'coffee';
                  emoji = '☕';
                  color = '#FF6B35';
                } else if (rand < 0.6) {
                  type = 'shield';
                  emoji = '🛡️';
                  color = '#00F5FF';
                } else if (rand < 0.8) {
                  type = 'debugger';
                  emoji = '🐞';
                  color = '#FFD700';
                } else {
                  type = 'gitclean';
                  emoji = '💣';
                  color = '#FF2D78';
                }

                data.powerups.push({
                  x: bug.x + bug.width / 2 - 12,
                  y: bug.y + bug.height / 2 - 12,
                  type,
                  emoji,
                  color,
                  vy: 2.0,
                  width: 24,
                  height: 24
                });
              }
            }
          }
        });
      }

      // 5.2 Enemy laser hits Player
      if (bullet.type === 'enemy') {
        const px = data.player.x;
        const py = data.player.y;
        const pw = data.player.width;
        const ph = data.player.height;

        if (bullet.x >= px && bullet.x <= px + pw &&
            bullet.y >= py && bullet.y <= py + ph) {
          
          bullet.markedForDeletion = true;
          
          // Shield absorbs hits
          if (data.player.powerups.shield) {
            data.player.powerups.shield = false;
            data.screenShake = 6;
            playExplosionSound();
            spawnFloatingText(px + pw/2, py - 10, 'SHIELD BROKEN!', '#00F5FF');
            spawnParticles(px + pw/2, py + ph/2, '#00F5FF', 15);
          } else {
            // Player lost life
            data.lives--;
            setLives(data.lives);
            data.screenShake = 16;
            playHurtSound();
            spawnFloatingText(px + pw/2, py - 10, 'COMPILATION ERROR!', '#FF2D78');
            spawnParticles(px + pw/2, py + ph/2, '#FF2D78', 25);
            
            // Remove active temporary powerups on hit
            data.player.powerups.coffee = 0;
            data.player.powerups.debugger = 0;

            if (data.lives <= 0) {
              setGameState('GAMEOVER');
            }
          }
        }
      }
    });

    // Cleanup bullets
    data.bullets = data.bullets.filter(b => !b.markedForDeletion);

    // ─── 6. POWER-UPS MOVEMENT & COLLECTION ───
    data.powerups.forEach((pow) => {
      pow.y += pow.vy * slowMultiplier;

      // Remove offscreen
      if (pow.y > 600) {
        pow.markedForDeletion = true;
        return;
      }

      // Collision with player
      const px = data.player.x;
      const py = data.player.y;
      const pw = data.player.width;
      const ph = data.player.height;

      if (pow.x + pow.width >= px && pow.x <= px + pw &&
          pow.y + pow.height >= py && pow.y <= py + ph) {
        
        pow.markedForDeletion = true;
        playPowerupSound();

        if (pow.type === 'coffee') {
          data.player.powerups.coffee = 6000; // 6s duration
          spawnFloatingText(px + pw/2, py - 15, '☕ COFFEE BOOST!', '#FF6B35');
        } else if (pow.type === 'shield') {
          data.player.powerups.shield = true;
          spawnFloatingText(px + pw/2, py - 15, '🛡️ SHIELD EQUIPPED!', '#00F5FF');
        } else if (pow.type === 'debugger') {
          data.player.powerups.debugger = 6000; // 6s duration
          spawnFloatingText(px + pw/2, py - 15, '🐞 DEBUGGER ACTIVE!', '#FFD700');
        } else if (pow.type === 'gitclean') {
          // Trigger Git Clean screen clear shockwave
          data.gitCleanWave.active = true;
          data.gitCleanWave.radius = 10;
          data.gitCleanWave.x = px + pw/2;
          data.gitCleanWave.y = py + ph/2;
          
          // reset shockwave triggers on bugs
          data.bugs.forEach(b => b.hitByShockwave = false);

          data.screenShake = 12;
          spawnFloatingText(px + pw/2, py - 15, '💣 GIT CLEAN SHOCKWAVE!', '#FF2D78');
        }
      }
    });

    // Cleanup powerups
    data.powerups = data.powerups.filter(p => !p.markedForDeletion);

    // ─── 7. FLOATING TEXTS & PARTICLES ───
    data.floatingTexts.forEach(text => {
      text.y += text.vy;
      text.alpha -= text.decay;
    });
    data.floatingTexts = data.floatingTexts.filter(t => t.alpha > 0);

    data.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
    });
    data.particles = data.particles.filter(p => p.alpha > 0);

    // Filter out dead bugs
    data.bugs = data.bugs.filter(b => b.hp > 0);

    // ─── 8. WAVE CLEAR CONDITIONS ───
    if (data.bugs.length === 0 && !data.gitCleanWave.active) {
      data.wave++;
      setCurrentWave(data.wave);
      setGameState('WAVE_CLEAR');
      data.waveClearTimer = 120; // 2 seconds at ~60fps
    }
  };

  // Draw logic
  const drawGame = (ctx, w, h) => {
    const data = gameData.current;
    
    ctx.save();
    
    // Apply Screen Shake Translation
    if (data.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * data.screenShake;
      const shakeY = (Math.random() - 0.5) * data.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Draw Background
    ctx.fillStyle = '#0A0A0F';
    ctx.fillRect(0, 0, w, h);

    // Draw Grid Lines
    ctx.strokeStyle = 'rgba(255, 87, 34, 0.035)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // State conditional renders
    const status = gameStateRef.current;

    if (status === 'START') {
      drawStartScreen(ctx, w, h);
    } else {
      // ─── PLAYING / PAUSED / GAMEOVER / WAVE_CLEAR GAMEPLAY DRAWS ───
      
      // 2. Draw Git Clean Shockwave Circle
      if (data.gitCleanWave.active) {
        ctx.save();
        ctx.strokeStyle = '#FF2D78';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#FF2D78';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(data.gitCleanWave.x, data.gitCleanWave.y, data.gitCleanWave.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Draw Bugs
      data.bugs.forEach(bug => {
        ctx.save();
        ctx.shadowColor = bug.color;
        
        // Flicker / crack effect if beetle HP is low
        if (bug.type === 'beetle' && bug.hp === 1) {
          ctx.shadowBlur = 5;
          ctx.globalAlpha = 0.7;
        } else {
          ctx.shadowBlur = 12;
        }
        
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bug.emoji, bug.x + bug.width / 2, bug.y + bug.height / 2);
        
        // Mini health bar for beetles
        if (bug.type === 'beetle' && bug.hp === 2) {
          ctx.fillStyle = '#1A1A26';
          ctx.fillRect(bug.x + 2, bug.y - 6, bug.width - 4, 3);
          ctx.fillStyle = bug.color;
          ctx.fillRect(bug.x + 2, bug.y - 6, (bug.width - 4) * (bug.hp / bug.maxHp), 3);
        }

        ctx.restore();
      });

      // 4. Draw Player
      const px = data.player.x;
      const py = data.player.y;
      const pw = data.player.width;
      const ph = data.player.height;

      // 4.1 Coffee thrusters
      if (data.player.powerups.coffee > 0) {
        ctx.fillStyle = '#FF6B35';
        ctx.beginPath();
        ctx.moveTo(px + pw / 2 - 8, py + ph);
        ctx.lineTo(px + pw / 2, py + ph + 10 + Math.random() * 12);
        ctx.lineTo(px + pw / 2 + 8, py + ph);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(255, 87, 34, 0.4)';
        ctx.beginPath();
        ctx.moveTo(px + pw / 2 - 5, py + ph);
        ctx.lineTo(px + pw / 2, py + ph + 5 + Math.random() * 6);
        ctx.lineTo(px + pw / 2 + 5, py + ph);
        ctx.closePath();
        ctx.fill();
      }

      // 4.2 Ship body outline
      ctx.save();
      ctx.strokeStyle = '#39FF14';
      ctx.shadowColor = '#39FF14';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px + pw / 2, py); // nose
      ctx.lineTo(px + pw, py + ph); // right wing
      ctx.lineTo(px + pw - 10, py + ph - 5); // notch
      ctx.lineTo(px + 10, py + ph - 5); // notch
      ctx.lineTo(px, py + ph); // left wing
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // 4.3 VINIT.EXE Label
      ctx.fillStyle = '#39FF14';
      ctx.font = '8px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('VINIT.EXE', px + pw / 2, py + ph + 12);

      // 4.4 Player Shield Circle
      if (data.player.powerups.shield) {
        ctx.save();
        ctx.strokeStyle = '#00F5FF';
        ctx.shadowColor = '#00F5FF';
        ctx.shadowBlur = 15 + Math.sin(Date.now() / 120) * 5;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(px + pw / 2, py + ph / 2 + 2, Math.max(pw, ph) * 0.75, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 5. Draw Bullets
      data.bullets.forEach(bullet => {
        ctx.save();
        ctx.strokeStyle = bullet.color;
        ctx.shadowColor = bullet.color;
        ctx.shadowBlur = 8;
        ctx.lineWidth = bullet.type === 'player' ? 3 : 2;
        ctx.beginPath();
        ctx.moveTo(bullet.x, bullet.y);
        ctx.lineTo(bullet.x, bullet.y + (bullet.type === 'player' ? -bullet.height : bullet.height));
        ctx.stroke();
        ctx.restore();
      });

      // 6. Draw Powerups
      data.powerups.forEach(pow => {
        ctx.save();
        ctx.shadowColor = pow.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = 'rgba(18, 18, 26, 0.7)';
        ctx.strokeStyle = pow.color;
        ctx.lineWidth = 2;
        
        // draw circular container
        ctx.beginPath();
        ctx.arc(pow.x + pow.width/2, pow.y + pow.height/2, pow.width/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // draw emoji icon
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pow.emoji, pow.x + pow.width/2, pow.y + pow.height/2 + 0.5);
        ctx.restore();
      });

      // 7. Draw Particles
      data.particles.forEach(p => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.restore();
      });

      // 8. Draw Floating Error Texts
      data.floatingTexts.forEach(text => {
        ctx.save();
        ctx.fillStyle = text.color;
        ctx.globalAlpha = text.alpha;
        ctx.font = '700 9px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(text.text, text.x, text.y);
        ctx.restore();
      });

      // ─── SCENE STATES OVERLAYS ───
      if (status === 'PAUSED') {
        drawPauseOverlay(ctx, w, h);
      } else if (status === 'GAMEOVER') {
        drawGameOverOverlay(ctx, w, h);
      } else if (status === 'WAVE_CLEAR') {
        // Countdown transition to next wave
        data.waveClearTimer--;
        drawWaveClearOverlay(ctx, w, h, data.waveClearTimer);
        
        if (data.waveClearTimer <= 0) {
          spawnBugs(data.wave);
          setGameState('PLAYING');
        }
      }
    }

    // 9. Overlay Retro CRT Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1);
    }

    ctx.restore();
  };

  // Helper Screen Drawers
  const drawStartScreen = (ctx, w, h) => {
    // Blinking effect
    const blink = Math.floor(Date.now() / 450) % 2 === 0;

    // Glowing main Title
    ctx.save();
    ctx.shadowColor = '#FF6B35';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#FF6B35';
    ctx.font = '900 36px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BUG INVADERS', w / 2, h / 2 - 70);
    ctx.restore();

    ctx.fillStyle = '#E8E8F0';
    ctx.font = '10px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SYSTEM CODE INTRUSION DETECTED', w / 2, h / 2 - 30);

    // Demo Bug visual sprites
    const bugEmojis = ['🪲', '🕷️', '🦟', '🐛'];
    const bugColors = ['#00F5FF', '#FF2D78', '#FFD700', '#39FF14'];
    bugEmojis.forEach((emoji, idx) => {
      ctx.save();
      ctx.shadowColor = bugColors[idx];
      ctx.shadowBlur = 10;
      ctx.font = '26px sans-serif';
      ctx.fillText(emoji, w / 2 - 120 + idx * 80, h / 2 + 30);
      ctx.restore();
    });

    if (blink) {
      ctx.fillStyle = '#FF6B35';
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText('INSERT COIN TO PLAY', w / 2, h / 2 + 130);
      
      ctx.fillStyle = '#6B6B8A';
      ctx.font = '9px "Space Mono", monospace';
      ctx.fillText('PRESS [SPACE] OR CLICK SCREEN TO INITIALISE', w / 2, h / 2 + 160);
    }
  };

  const drawPauseOverlay = (ctx, w, h) => {
    ctx.fillStyle = 'rgba(10, 10, 15, 0.75)';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.shadowColor = '#FF6B35';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#FF6B35';
    ctx.font = '900 28px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME PAUSED', w / 2, h / 2 - 20);
    ctx.restore();

    ctx.fillStyle = '#E8E8F0';
    ctx.font = '10px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PRESS [ESC] OR CLICK SCREEN TO RESUME', w / 2, h / 2 + 20);
  };

  const drawGameOverOverlay = (ctx, w, h) => {
    const data = gameData.current;
    
    ctx.fillStyle = 'rgba(15, 5, 5, 0.85)';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.shadowColor = '#FF2D78';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#FF2D78';
    ctx.font = '900 38px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', w / 2, h / 2 - 60);
    ctx.restore();

    ctx.fillStyle = '#E8E8F0';
    ctx.font = '14px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('...but Vinit never gives up', w / 2, h / 2 - 15);

    ctx.fillStyle = '#FFD700';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText(`FINAL SCORE: ${data.score.toString().padStart(6, '0')}`, w / 2, h / 2 + 40);

    ctx.fillStyle = '#6B6B8A';
    ctx.font = '9px "Space Mono", monospace';
    ctx.fillText('PRESS [ENTER] TO RESOLVE MERGE CONFLICTS (RESTART)', w / 2, h / 2 + 100);
  };

  const drawWaveClearOverlay = (ctx, w, h, framesLeft) => {
    ctx.fillStyle = 'rgba(10, 10, 15, 0.4)';
    ctx.fillRect(0, 0, w, h);

    const nextWaveNum = gameData.current.wave;
    const waveName = WAVE_NAMES[Math.min(nextWaveNum - 1, WAVE_NAMES.length - 1)];

    ctx.save();
    ctx.shadowColor = '#39FF14';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#39FF14';
    ctx.font = '900 26px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WAVE COMPILED SUCCESSFULLY!', w / 2, h / 2 - 30);
    ctx.restore();

    ctx.fillStyle = '#E8E8F0';
    ctx.font = '10px "Space Mono", monospace';
    ctx.fillText(`INITIALISING WAVE ${nextWaveNum}: ${waveName}`, w / 2, h / 2 + 15);
  };

  const handleCanvasClick = () => {
    initAudio();
    if (gameState === 'START' || gameState === 'GAMEOVER') {
      resetGame();
      setGameState('PLAYING');
    } else if (gameState === 'PAUSED') {
      setGameState('PLAYING');
    }
  };

  return (
    <div className={styles.gameContainer}>
      {/* Native Retro HUD */}
      <div className={styles.hud}>
        <div>WAVE: {currentWave.toString().padStart(2, '0')}</div>
        <div>SCORE: {score.toString().padStart(6, '0')}</div>
        <div>HI-SCORE: {hiScore.toString().padStart(6, '0')}</div>
        <div>
          LIVES:{' '}
          {lives > 0
            ? Array.from({ length: lives }).map((_, i) => (
                <span key={i} style={{ color: '#39FF14', marginLeft: '3px' }}>
                  👾
                </span>
              ))
            : 'NONE'}
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%' }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className={styles.canvas}
          onClick={handleCanvasClick}
          aria-label="Bug Invaders Game Canvas"
        />

        {/* Screen scanline glassmorphic filter styling */}
        <div className={styles.scanlineOverlay} />
      </div>

      <div className={styles.hints}>
        <div className={styles.hint}>
          <span className={styles.key}>← →</span> / <span className={styles.key}>A D</span> Move
        </div>
        <div className={styles.hint}>
          <span className={styles.key}>SPACE</span> Fire
        </div>
        <div className={styles.hint}>
          <span className={styles.key}>ESC</span> Pause
        </div>
        
        {/* Dynamic active powerups list under screen */}
        {activePowerups.length > 0 && (
          <div className={styles.activePowerups}>
            {activePowerups.map((pw, i) => (
              <span key={i} className={styles.powerupLabel}>
                {pw}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
