# CHAOS_PANEL.md — "True Me" Panel Full Specification

> This document specifies the complete design system, tech stack, features, and implementation
> plan for the Chaos Mode panel. It supersedes any prior notes about the panel in other docs.
> The main portfolio (Warm Noir) remains vanilla HTML/CSS/JS. The Chaos Panel is a React + Vite
> micro-app that mounts as a full-screen overlay.

---

## 01. Concept

The main portfolio is the suit. This is the person inside it.

When the visitor clicks `[ see the real me ]`, the screen does a pixel-dissolve transition and
a completely different world loads — same Vinit, different frequency. It should feel like
inserting a cartridge into an arcade cabinet. The energy shifts instantly.

**Target audience:** Millennials who grew up on arcade games + Gen Z who discovered them through
nostalgia. The aesthetic is modern enough to feel designed, retro enough to feel human.

---

## 02. Aesthetic Direction — "Arcade Cabinet Meets Modern"

### Core Concept: "INSERT COIN TO SEE THE REAL ME"

Think: a premium arcade cabinet designed in 2025. CRT scanline texture on a sharp modern grid.
Pixel fonts for display text, clean sans for body. Neon accents that don't look cheap.
Every feature feels like a mini-game you'd find in an arcade hidden behind the main game.

### Color Palette — CHAOS MODE

```css
:root {
  /* Backgrounds */
  --chaos-bg:         #0A0A0F;   /* near-black, blue-black undertone */
  --chaos-surface:    #12121A;   /* card backgrounds */
  --chaos-elevated:   #1A1A26;   /* elevated panels */

  /* Neon Accents — use one per feature, not all at once */
  --neon-orange:      #FF6B35;   /* primary — alien shooter, energy */
  --neon-cyan:        #00F5FF;   /* guitar lab — sound waves */
  --neon-pink:        #FF2D78;   /* book analyser — tension/darkness */
  --neon-green:       #39FF14;   /* junk lab — creation/make */

  /* Pixel / Retro */
  --pixel-gold:       #FFD700;   /* score, achievements, hi-score */
  --pixel-white:      #E8E8F0;   /* primary text */
  --pixel-muted:      #6B6B8A;   /* secondary text, labels */
  --pixel-grid:       #1A1A2E;   /* background grid lines */

  /* Scanline */
  --scanline-opacity: 0.04;
}
```

### Typography — CHAOS MODE

```css
/* Display / Score / Titles — pixel font */
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

/* UI / Body — clean modern mono */
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');

/* Accent / Feature names — bold geometric */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

:root {
  --font-pixel:   'Press Start 2P', monospace;   /* scores, game UI, hero */
  --font-ui:      'Space Mono', monospace;        /* body, descriptions */
  --font-display: 'Orbitron', sans-serif;         /* feature titles, panel header */
}
```

### Visual Signatures
- **CRT scanline overlay** — repeating horizontal lines at 2px interval, `--scanline-opacity`
- **Pixel grid background** — subtle dot grid on `--chaos-bg`
- **Neon glow on interactive elements** — `box-shadow: 0 0 12px var(--neon-X)` on hover only
- **Pixel borders** — `border: 2px solid` with stepped corner effect (CSS clip-path trick)
- **Score counter aesthetic** — all numbers displayed like arcade scores (zero-padded: 000420)
- **"INSERT COIN" blinking text** — `animation: blink 1s step-end infinite`
- **No rounded corners anywhere** — pure sharp pixel aesthetic
- **Sprite-style icons** — tiny 16×16 pixel art icons for each feature tab

---

## 03. Stack — Chaos Panel

```
Main Portfolio:   Vanilla HTML + CSS + JS  (unchanged, stays as-is)
Chaos Panel:      React 18 + Vite 5
State:            useState / useReducer (no Redux — overkill)
Styling:          CSS Modules per component + global chaos-variables.css
Audio:            Web Audio API (no library — native browser)
Game:             HTML5 Canvas + requestAnimationFrame (inside a React ref)
AI Features:      Vite proxy → /api/* → Anthropic Claude API (server-side)
Build output:     /dist → embedded into main portfolio as a lazy-loaded bundle
```

### How It Connects to the Main Portfolio

The Chaos Panel is built separately with Vite, then its `dist/` output is dropped into the
main portfolio's folder. The vanilla JS in `main.js` dynamically injects the React bundle
only when the user clicks `[ see the real me ]` — zero impact on main portfolio load time.

```js
// In main portfolio's main.js
document.getElementById('chaos-trigger').addEventListener('click', () => {
  const script = document.createElement('script');
  script.src = './chaos/assets/index.js';  // Vite build output
  script.type = 'module';
  document.head.appendChild(script);

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './chaos/assets/index.css';
  document.head.appendChild(link);
});
```

---

## 04. The Trigger Button

Location: Fixed, bottom-center of the main portfolio. Always visible on scroll.

```html
<button id="chaos-trigger" class="chaos-btn" aria-label="Open True Me panel">
  <span class="chaos-btn-bracket">[</span>
  <span class="chaos-btn-text">INSERT COIN</span>
  <span class="chaos-btn-bracket">]</span>
</button>
```

```css
.chaos-btn {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: transparent;
  border: 2px solid var(--accent-primary);  /* warm noir accent */
  color: var(--accent-primary);
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  letter-spacing: 0.15em;
  padding: 10px 20px;
  cursor: pointer;
  z-index: 100;
  animation: pulse-border 2s ease-in-out infinite;
}

@keyframes pulse-border {
  0%, 100% { border-color: var(--accent-primary); opacity: 1; }
  50%       { border-color: var(--accent-secondary); opacity: 0.6; }
}
```

---

## 05. Entry Transition — Pixel Dissolve

When the button is clicked, before the panel appears:

1. **Phase 1 (0–200ms):** Screen overlaid with a canvas element. Random pixels of
   `--neon-orange` fill the screen from random positions — like a pixel storm.
2. **Phase 2 (200–400ms):** Pixels coalesce into solid `--chaos-bg` color.
3. **Phase 3 (400ms):** React panel mounts. Pixel storm canvas fades out.
4. **Panel header types in** using a typewriter effect: `CHAOS MODE ACTIVATED...`

Exit transition (back to portfolio): reverse — pixel storm, then Warm Noir returns.

```js
// chaos-transition.js — vanilla JS, runs before React mounts
export function pixelDissolve(onComplete) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:9998;pointer-events:none';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const PIXEL_SIZE = 8;
  const cols = Math.ceil(canvas.width / PIXEL_SIZE);
  const rows = Math.ceil(canvas.height / PIXEL_SIZE);
  const pixels = Array.from({length: cols * rows}, (_, i) => i);

  // Fisher-Yates shuffle for random fill order
  for (let i = pixels.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pixels[i], pixels[j]] = [pixels[j], pixels[i]];
  }

  let filled = 0;
  const FILL_PER_FRAME = Math.ceil(pixels.length / 20);

  function frame() {
    ctx.fillStyle = '#FF6B35';
    for (let i = 0; i < FILL_PER_FRAME && filled < pixels.length; i++, filled++) {
      const idx = pixels[filled];
      const x = (idx % cols) * PIXEL_SIZE;
      const y = Math.floor(idx / cols) * PIXEL_SIZE;
      ctx.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
    }
    if (filled < pixels.length) {
      requestAnimationFrame(frame);
    } else {
      ctx.fillStyle = '#0A0A0F';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setTimeout(() => { canvas.remove(); onComplete(); }, 100);
    }
  }
  requestAnimationFrame(frame);
}
```

---

## 06. Panel Layout

```
┌─────────────────────────────────────────────────────────┐
│  CHAOS MODE          VINIT.EXE          [EXIT ×]        │  ← Panel header
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← Scanline
├─────────────────────────────────────────────────────────┤
│  [SHOOTER] [GUITAR] [BOOKS] [JUNK LAB]                  │  ← Feature tabs (pixel art icons)
├──────────────────────────────┬──────────────────────────┤
│                              │                          │
│   ACTIVE FEATURE             │   VINIT'S STATS SIDEBAR  │
│   (full featured widget)     │                          │
│                              │   HI-SCORE: 004200       │
│                              │   GENRE: THRILLER        │
│                              │   CHORD: Am              │
│                              │   CRAFT: ACTIVE          │
│                              │                          │
│                              │   CURRENTLY VIBING:      │
│                              │   [live clock + date]    │
│                              │                          │
└──────────────────────────────┴──────────────────────────┘
│  INSERT COIN TO CONTINUE  ·  ·  ·  [BACK TO PORTFOLIO]  │  ← Footer
└─────────────────────────────────────────────────────────┘
```

---

## 07. Feature 01 — Alien Shooter

**Tab icon:** 8×8 pixel alien sprite  
**Neon color:** `--neon-orange`  
**Tech flex conveyed:** Canvas API, game loop architecture, OOP in JS, collision detection

### Game Spec
- Canvas-based, runs inside a React `useRef` + `useEffect`
- The aliens are **pixel art versions of bugs** — literal software bugs (🐛) as enemies
- The player ship is a pixel spaceship with "VINIT" written underneath in pixel font
- Aliens drop "merge conflicts," "null pointers," and "404s" as labels on death
- **Power-up:** "Coffee" item falls randomly — doubles fire rate for 5 seconds
- **Wave system:** Each wave is named after a tech concept (Wave 1: "Hello World", Wave 2: "Stack Overflow", Wave 3: "The Deadline")
- High score persisted in localStorage
- Game over screen: `GAME OVER — but Vinit never gives up` with restart button

### Implementation
```
components/
  ChaosShooter/
    ChaosShooter.jsx      ← React wrapper, canvas ref, game init
    game/
      GameLoop.js         ← requestAnimationFrame loop
      Player.js           ← Ship class, movement, shooting
      Alien.js            ← Alien class, movement patterns, pixel sprites
      Bullet.js           ← Projectile physics
      CollisionEngine.js  ← AABB collision detection
      ScoreBoard.js       ← Score state, hi-score persistence
    ChaosShooter.module.css
```

---

## 08. Feature 02 — Guitar Chord Lab

**Tab icon:** Pixel guitar sprite  
**Neon color:** `--neon-cyan`  
**Tech flex conveyed:** Web Audio API, music theory in code, real-time synthesis

### Feature Spec
- Displays an interactive guitar fretboard (SVG, 6 strings × 12 frets)
- **Chord buttons:** Am, Em, G, C, D, F, Dm, E — the chords Vinit actually plays
- Click a chord → fretboard lights up the fingering positions (cyan dots on correct frets)
- Click a string individually → hear the note synthesized via Web Audio oscillators
- Click the chord button → all strings strum in rapid succession (arpeggio effect, 80ms apart)
- **BPM Metronome toggle** — a pixel-art metronome arm swings, click sound via AudioContext
- **"What Vinit is probably playing right now"** — randomly cycles through his chord progressions
  with a description: `Am → G → C → Em — classic sad boi progression`

### Audio Implementation
```js
// No audio files. Pure Web Audio API synthesis.
function playGuitarNote(frequency, audioCtx) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  const distortion = audioCtx.createWaveShaper(); // warmth/grit

  oscillator.type = 'sawtooth';  // closest to guitar timbre
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  // Natural decay envelope
  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);

  oscillator.connect(distortion);
  distortion.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 1.5);
}
```

---

## 09. Feature 03 — Thriller Book Mood Analyser

**Tab icon:** Pixel book sprite  
**Neon color:** `--neon-pink`  
**Tech flex conveyed:** Claude API integration, prompt engineering, NLP, async UI

### Feature Spec
- Text input: "Paste a book blurb, a plot summary, or just vibes"
- Calls Claude API via Vite proxy `/api/analyse-book`
- Returns a structured JSON response rendered as an arcade-style results screen:

```
ANALYSIS COMPLETE
─────────────────────────────
TENSION SCORE:    ████████░░  82/100
DARKNESS RATING:  ██████████  94/100
PLOT TWISTS:      ████░░░░░░  45/100
2AM INDEX:        █████████░  90/100
─────────────────────────────
VERDICT: "Read with the lights on."
VINIT RATING: WOULD DESTROY HIM (high praise)
```

- **Pre-loaded books** — Vinit's actual reading list as quick-select chips
- **"Compare to Vinit's taste"** — scores are compared against a baseline of his favorites
  and returns: `VINIT APPROVED ✓` or `TOO SOFT FOR VINIT ✗`

### Claude API Prompt (for Vite proxy)
```js
const systemPrompt = `You are a thriller book analyser with the personality of an arcade game.
Return ONLY valid JSON with these fields:
{
  "tension": number 0-100,
  "darkness": number 0-100,
  "plotTwists": number 0-100,
  "twoAmIndex": number 0-100,
  "verdict": "one punchy sentence, max 8 words",
  "vinitRating": "WOULD DESTROY HIM | SOLID READ | TOO SOFT FOR VINIT | NOT A THRILLER"
}
No markdown. No explanation. JSON only.`;
```

---

## 10. Feature 04 — Build-o-Matic (Junk Lab)

**Tab icon:** Pixel wrench + gear sprite  
**Neon color:** `--neon-green`  
**Tech flex conveyed:** Claude API, creative prompt engineering, generative UI, structured output

### Feature Spec
- Input: A list of junk/scrap materials (text area, one item per line)
- Click `GENERATE BUILD` → calls Claude API via `/api/generate-build`
- Returns an arcade-style "build card":

```
┌─────────────────────────────────────┐
│  BUILD UNLOCKED                     │
│  ████████████████████████████████   │
│                                     │
│  NAME: THE CHAOS TURBINE 3000       │
│  DIFFICULTY: ████░░ MEDIUM          │
│  COOLNESS:   █████████ MAXIMUM      │
│  TIME:       ~2 hours               │
│                                     │
│  PARTS NEEDED:                      │
│  ✓ old fan motor                    │
│  ✓ 3 LEDs                          │
│  ✓ cardboard                        │
│  + duct tape (always)               │
│                                     │
│  STEP 1: [brief instruction]        │
│  STEP 2: [brief instruction]        │
│  STEP 3: plug it in and hope        │
│                                     │
│  VINIT'S COMMENT:                   │
│  "this is either genius or fire"    │
└─────────────────────────────────────┘
```

- **Share button** — copies the build card as text to clipboard
- **"Vinit has built"** counter — a fake (but plausible) number that increments: `47 builds and counting`

---

## 11. The Stats Sidebar

Always visible alongside the active feature. Updates reactively.

```
PLAYER: VINIT.EXE
──────────────────
HI-SCORE    004200
LEVEL       FINAL YR
STATUS      SEEKING INTERNSHIP

CURRENT MISSION
──────────────────
[active feature name in pixel font]

VINIT'S VITALS
──────────────────
GUITAR      ♩ Am
BOOK        87% TENSION
CRAFT       ACTIVE
GAMES       RANKED

NOW PLAYING
──────────────────
[live time — HH:MM:SS updating]
[day of week, date]

SYSTEM
──────────────────
STACK       REACT+VITE
VIBES       MAXIMUM
COFFEE      NEEDED
```

---

## 12. File Structure — Chaos Panel

```
chaos-panel/                    ← Separate Vite project
│
├── index.html
├── vite.config.js              ← Proxy config for /api/* routes
├── package.json
│
├── src/
│   ├── main.jsx                ← React entry, mounts <ChaosApp />
│   ├── ChaosApp.jsx            ← Root: transition, tabs, layout
│   │
│   ├── styles/
│   │   ├── chaos-variables.css ← All CSS custom properties (chaos palette)
│   │   ├── chaos-base.css      ← Scanlines, pixel grid, scrollbars
│   │   └── chaos-animations.css← Blink, glow-pulse, pixel-storm keyframes
│   │
│   ├── components/
│   │   ├── PanelHeader/        ← CHAOS MODE header + exit button
│   │   ├── FeatureTabs/        ← Tab switcher with pixel art icons
│   │   ├── StatsSidebar/       ← Always-visible stats panel
│   │   ├── PanelFooter/        ← INSERT COIN + back to portfolio
│   │   │
│   │   ├── ChaosShooter/       ← Feature 01 (see §07)
│   │   ├── GuitarLab/          ← Feature 02 (see §08)
│   │   ├── BookAnalyser/       ← Feature 03 (see §09)
│   │   └── BuildOMatic/        ← Feature 04 (see §10)
│   │
│   ├── hooks/
│   │   ├── useAudioContext.js  ← Shared Web Audio context
│   │   ├── useHighScore.js     ← localStorage hi-score
│   │   └── usePixelTransition.js← Entry/exit animation
│   │
│   └── api/
│       ├── analyseBook.js      ← Claude API call wrapper
│       └── generateBuild.js    ← Claude API call wrapper
│
└── api/                        ← Vite dev server proxy handlers
    ├── analyse-book.js         ← Server-side: calls Anthropic, returns JSON
    └── generate-build.js       ← Server-side: calls Anthropic, returns JSON
```

---

## 13. Vite Config (Proxy for Claude API)

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',  // tiny Express server in dev
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: '../portfolio/chaos',  // outputs into main portfolio folder
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
        }
      }
    }
  }
})
```

---

## 14. Deployment

```
Main portfolio:   GitHub Pages or Vercel (static)
Chaos Panel API:  Vercel Serverless Functions (api/ folder)
Environment var:  ANTHROPIC_API_KEY stored in Vercel dashboard, never in code
```

On Vercel, the `/api/analyse-book` and `/api/generate-build` routes become
serverless functions automatically. The API key never touches the browser.

---

## 15. Build & Dev Commands

```bash
# Main portfolio — no build step
open portfolio/index.html

# Chaos panel — development
cd chaos-panel
npm install
npm run dev         # localhost:5173 with hot reload

# Build chaos panel and embed into main portfolio
npm run build       # outputs to ../portfolio/chaos/

# Deploy everything
vercel              # from portfolio root
```

---

## 16. Quality Checklist — Chaos Panel

- [ ] Pixel dissolve transition works in Chrome, Firefox, Safari
- [ ] All 4 features load and function correctly
- [ ] Alien shooter: hi-score persists across sessions
- [ ] Guitar lab: all 8 chords produce sound on user interaction (AudioContext requires gesture)
- [ ] Book analyser: loading state shown while Claude API responds
- [ ] Build-o-Matic: error state handled if API fails
- [ ] Stats sidebar updates reactively with active feature
- [ ] Exit button returns to main portfolio with reverse transition
- [ ] Scanline overlay present but not overwhelming
- [ ] `prefers-reduced-motion` disables transitions, keeps functionality
- [ ] No API key exposed in any client-side code
- [ ] Mobile: tabs stack vertically, game gets touch controls
- [ ] Lighthouse: accessibility 85+ (game canvas gets aria-label)

---

*The main portfolio shows what you can build. This panel shows who you are while building it.*
