import React, { useRef, useEffect, useState } from 'react';
import styles from './ChaosShooter.module.css';

export default function ChaosShooter() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [score, setScore] = useState(0);
  const [hiScore, setHiScore] = useState(() => {
    return parseInt(localStorage.getItem('chaos_hi_score') || '0', 10);
  });
  const [gameState, setGameState] = useState('start'); // start | playing | gameover | win
  const [wave, setWave] = useState(1);
  const [coffeeActive, setCoffeeActive] = useState(false);
  const [coffeeTimer, setCoffeeTimer] = useState(0);

  // Keyboard controls state
  const keysRef = useRef({
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
  });

  // Touch/Mobile controls state
  const touchControlsRef = useRef({
    left: false,
    right: false,
    fire: false
  });

  // Load high score
  useEffect(() => {
    localStorage.setItem('chaos_hi_score', hiScore.toString());
  }, [hiScore]);

  // Wave names
  const waveNames = {
    1: 'Hello World',
    2: 'Stack Overflow',
    3: 'The Deadline',
    4: 'Infinite Loop'
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Game Constants
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 450;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Player settings
    const player = {
      x: CANVAS_WIDTH / 2 - 20,
      y: CANVAS_HEIGHT - 50,
      w: 40,
      h: 20,
      speed: 6,
      lastShot: 0
    };

    // Lists
    let bullets = [];
    let bugs = [];
    let powerUps = [];
    let floatingTexts = [];

    // Wave Configurations
    function setupWave(w) {
      bullets = [];
      powerUps = [];
      floatingTexts = [];
      bugs = [];

      const rows = 3;
      const cols = Math.min(4 + w, 10);
      const bugSpeed = 1 + (w * 0.4);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          bugs.push({
            x: 80 + c * 60,
            y: 60 + r * 45,
            w: 24,
            h: 24,
            speedX: bugSpeed,
            points: 100 * w,
            emoji: '🐛'
          });
        }
      }
    }

    setupWave(wave);

    // Key handlers
    const handleKeyDown = (e) => {
      if (e.code === 'ArrowLeft') keysRef.current.ArrowLeft = true;
      if (e.code === 'ArrowRight') keysRef.current.ArrowRight = true;
      if (e.code === 'Space') {
        keysRef.current.Space = true;
        e.preventDefault(); // Stop page scrolling
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'ArrowLeft') keysRef.current.ArrowLeft = false;
      if (e.code === 'ArrowRight') keysRef.current.ArrowRight = false;
      if (e.code === 'Space') keysRef.current.Space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animationId;
    let coffeeCountDownInterval;
    let localCoffeeTimer = 0;

    // Game Loop
    function update() {
      // 1. Move Player
      if (keysRef.current.ArrowLeft || touchControlsRef.current.left) {
        player.x = Math.max(0, player.x - player.speed);
      }
      if (keysRef.current.ArrowRight || touchControlsRef.current.right) {
        player.x = Math.min(CANVAS_WIDTH - player.w, player.x + player.speed);
      }

      // 2. Shoot Bullets
      const now = Date.now();
      const fireInterval = coffeeActive ? 100 : 250; // Coffee double rate
      if ((keysRef.current.Space || touchControlsRef.current.fire) && now - player.lastShot > fireInterval) {
        bullets.push({
          x: player.x + player.w / 2 - 2,
          y: player.y,
          w: 4,
          h: 12,
          speed: 8
        });
        player.lastShot = now;
      }

      // 3. Move Bullets
      bullets = bullets.filter(b => {
        b.y -= b.speed;
        return b.y > 0;
      });

      // 4. Move Bugs
      let changeDir = false;
      bugs.forEach(bug => {
        bug.x += bug.speedX;
        if (bug.x <= 10 || bug.x >= CANVAS_WIDTH - bug.w - 10) {
          changeDir = true;
        }
        
        // Touch player check (instant game over)
        if (
          bug.x < player.x + player.w &&
          bug.x + bug.w > player.x &&
          bug.y < player.y + player.h &&
          bug.y + bug.h > player.y
        ) {
          setGameState('gameover');
        }
      });

      if (changeDir) {
        bugs.forEach(bug => {
          bug.speedX = -bug.speedX;
          bug.y += 20; // descend
          if (bug.y >= player.y - 10) {
            setGameState('gameover');
          }
        });
      }

      // 5. Move Power-ups
      powerUps = powerUps.filter(p => {
        p.y += p.speed;
        // Collision with player
        if (
          p.x < player.x + player.w &&
          p.x + p.w > player.x &&
          p.y < player.y + player.h &&
          p.y + p.h > player.y
        ) {
          // Trigger Coffee
          setCoffeeActive(true);
          localCoffeeTimer = 5;
          setCoffeeTimer(5);
          clearInterval(coffeeCountDownInterval);
          coffeeCountDownInterval = setInterval(() => {
            localCoffeeTimer--;
            setCoffeeTimer(localCoffeeTimer);
            if (localCoffeeTimer <= 0) {
              setCoffeeActive(false);
              clearInterval(coffeeCountDownInterval);
            }
          }, 1000);
          return false;
        }
        return p.y < CANVAS_HEIGHT;
      });

      // 6. Move Floating Texts
      floatingTexts = floatingTexts.filter(t => {
        t.y -= 1;
        t.opacity -= 0.02;
        return t.opacity > 0;
      });

      // 7. Collisions (Bullet -> Bug)
      bullets.forEach((bullet, bIdx) => {
        bugs.forEach((bug, bugIdx) => {
          if (
            bullet.x < bug.x + bug.w &&
            bullet.x + bullet.w > bug.x &&
            bullet.y < bug.y + bug.h &&
            bullet.y + bullet.h > bug.y
          ) {
            // Kill bug, remove bullet
            bugs.splice(bugIdx, 1);
            bullets.splice(bIdx, 1);

            // Add Score
            setScore(prev => {
              const newScore = prev + bug.points;
              if (newScore > hiScore) setHiScore(newScore);
              return newScore;
            });

            // Float code label
            const errors = ['NULL POINTER', '404 ERROR', 'MERGE CONFLICT', 'STACK OVERFLOW', 'SEGFAULT'];
            const label = errors[Math.floor(Math.random() * errors.length)];
            floatingTexts.push({
              x: bug.x,
              y: bug.y,
              text: label,
              opacity: 1
            });

            // Random coffee powerup drop (12% chance)
            if (Math.random() < 0.12) {
              powerUps.push({
                x: bug.x + 8,
                y: bug.y,
                w: 16,
                h: 16,
                speed: 3,
                emoji: '☕'
              });
            }
          }
        });
      });

      // 8. Check Win (Current wave clear)
      if (bugs.length === 0) {
        if (wave < 3) {
          setWave(prev => prev + 1);
          setupWave(wave + 1);
        } else {
          setGameState('win');
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw background lines (grid visual)
      ctx.strokeStyle = '#1A1A2E';
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_WIDTH; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      // Draw Player SpaceShip
      ctx.fillStyle = coffeeActive ? '#39FF14' : '#FF6B35'; // green if coffee-boosted
      ctx.beginPath();
      ctx.moveTo(player.x + player.w / 2, player.y);
      ctx.lineTo(player.x + player.w, player.y + player.h);
      ctx.lineTo(player.x, player.y + player.h);
      ctx.closePath();
      ctx.fill();

      // Write 'VINIT' below ship
      ctx.fillStyle = '#E8E8F0';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('VINIT', player.x + player.w / 2, player.y + player.h + 10);

      // Draw Bugs (literal bugs 🐛)
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      bugs.forEach(bug => {
        ctx.fillText(bug.emoji, bug.x + bug.w / 2, bug.y + 16);
      });

      // Draw Bullets
      ctx.fillStyle = '#00F5FF'; // cyan laser
      bullets.forEach(b => {
        ctx.fillRect(b.x, b.y, b.w, b.h);
      });

      // Draw Coffee Power-ups
      ctx.font = '16px Arial';
      powerUps.forEach(p => {
        ctx.fillText(p.emoji, p.x + p.w / 2, p.y + 14);
      });

      // Draw Floating Texts
      floatingTexts.forEach(t => {
        ctx.fillStyle = `rgba(255, 45, 120, ${t.opacity})`; // pink error tags
        ctx.font = '9px "Space Mono", monospace';
        ctx.fillText(t.text, t.x, t.y);
      });
    }

    function tick() {
      update();
      draw();
      if (gameState === 'playing') {
        animationId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
      clearInterval(coffeeCountDownInterval);
    };
  }, [gameState, wave, coffeeActive]);

  const startGame = () => {
    setScore(0);
    setWave(1);
    setCoffeeActive(false);
    setGameState('playing');
  };

  return (
    <div className={styles.shooterContainer} ref={containerRef}>
      {/* Game Top Indicators */}
      <div className={styles.scoreboard}>
        <div>WAVE: 0{wave} ({waveNames[wave] || 'Infinite Loop'})</div>
        <div>SCORE: {score.toString().padStart(6, '0')}</div>
        {coffeeActive && (
          <div className={styles.coffeeBoost}>☕ COFFEE SPEED UP: {coffeeTimer}s</div>
        )}
      </div>

      <div className={styles.canvasWrapper}>
        <canvas ref={canvasRef} className={styles.gameCanvas} />

        {/* Start Overlay */}
        {gameState === 'start' && (
          <div className={styles.overlay}>
            <h2 className={styles.title}>BUG INVADERS</h2>
            <p className={styles.subtitle}>SHOOT THE BUGS BEFORE THEY CRASH VINIT.EXE</p>
            <button onClick={startGame} className={styles.arcadeBtn}>[ START GAME ]</button>
            <div className={styles.controlsInfo}>
              Use <span>←</span> and <span>→</span> to Move. <span>Space</span> to Fire.
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className={styles.overlay}>
            <h2 className={`${styles.title} ${styles.redText}`}>SYSTEM CRASHED</h2>
            <p className={styles.subtitle}>BUGS INVADED THE CORE COMPILER.</p>
            <div className={styles.scoreSummary}>FINAL SCORE: {score}</div>
            <button onClick={startGame} className={styles.arcadeBtn}>[ COMPILATION RESTART ]</button>
          </div>
        )}

        {/* Win Overlay */}
        {gameState === 'win' && (
          <div className={styles.overlay}>
            <h2 className={`${styles.title} ${styles.goldText}`}>BUG FREE BUILD!</h2>
            <p className={styles.subtitle}>ALL WAVES COMPILED SUCCESSFULLY.</p>
            <div className={styles.scoreSummary}>FINAL SCORE: {score}</div>
            <button onClick={startGame} className={styles.arcadeBtn}>[ COMPILE AGAIN ]</button>
          </div>
        )}
      </div>

      {/* Mobile Touch Controls */}
      <div className={styles.mobileControls}>
        <button
          className={styles.controlBtn}
          onTouchStart={() => { touchControlsRef.current.left = true; }}
          onTouchEnd={() => { touchControlsRef.current.left = false; }}
          onMouseDown={() => { touchControlsRef.current.left = true; }}
          onMouseUp={() => { touchControlsRef.current.left = false; }}
          aria-label="Move left"
        >
          ◀
        </button>
        <button
          className={`${styles.controlBtn} ${styles.fireBtn}`}
          onTouchStart={() => { touchControlsRef.current.fire = true; }}
          onTouchEnd={() => { touchControlsRef.current.fire = false; }}
          onMouseDown={() => { touchControlsRef.current.fire = true; }}
          onMouseUp={() => { touchControlsRef.current.fire = false; }}
          aria-label="Fire weapon"
        >
          FIRE
        </button>
        <button
          className={styles.controlBtn}
          onTouchStart={() => { touchControlsRef.current.right = true; }}
          onTouchEnd={() => { touchControlsRef.current.right = false; }}
          onMouseDown={() => { touchControlsRef.current.right = true; }}
          onMouseUp={() => { touchControlsRef.current.right = false; }}
          aria-label="Move right"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
