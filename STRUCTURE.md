# STRUCTURE.md — Project Architecture & Build Guide

> This document defines the file structure, build approach, and development order for the portfolio. Follow this to avoid re-doing work.

---

## Chosen Stack

| Decision | Choice | Reason |
|---|---|---|
| Framework | **Vanilla HTML/CSS/JS** | No build step, fast, you own every line |
| Animations | **CSS + IntersectionObserver** | No library needed for what we're doing |
| Fonts | **Google Fonts** | Free, fast with preconnect |
| Icons | **None / inline SVG** | Keeps it pure, no dependency |
| Deployment | **GitHub Pages / Vercel** | Free, instant, connects to your repo |
| Version Control | **Git + GitHub** | Required — portfolio IS your GitHub presence |

> If you want smoother animations later, add GSAP via CDN. Do not add React — the complexity isn't worth it for a single-page portfolio.

---

## File Structure

```
portfolio/
│
├── index.html              ← Single page — entire portfolio
│
├── css/
│   ├── reset.css           ← Minimal CSS reset (box-sizing, margins)
│   ├── variables.css       ← All CSS custom properties (from DESIGN.md)
│   ├── base.css            ← Typography, global element styles
│   ├── layout.css          ← Grid, container, section spacing
│   ├── components.css      ← Nav, cards, buttons, tags, forms
│   ├── animations.css      ← All keyframes and transition classes
│   └── responsive.css      ← Media queries only (no duplicate styles)
│
├── js/
│   ├── main.js             ← Entry point — imports and initializes everything
│   ├── scroll.js           ← IntersectionObserver reveal logic
│   ├── nav.js              ← Nav scroll behavior, active section tracking
│   ├── typewriter.js       ← Skills typing animation
│   └── easter-egg.js       ← Konami code listener + overlay
│
├── assets/
│   ├── favicon.ico         ← Simple, dark background + accent color initial
│   └── og-image.jpg        ← Open Graph preview (1200×630px, dark bg)
│
├── docs/
│   ├── DESIGN.md           ← (this project's design system)
│   ├── CONTENT.md          ← (copy and content guide)
│   ├── STRUCTURE.md        ← (this file)
│   └── CHECKLIST.md        ← (pre-launch checklist)
│
└── README.md               ← Brief project description for GitHub
```

---

## HTML Skeleton (`index.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="[YOUR NAME] — [YOUR TAGLINE]" />

  <!-- Open Graph -->
  <meta property="og:title" content="[YOUR NAME] · Portfolio" />
  <meta property="og:description" content="[YOUR TAGLINE]" />
  <meta property="og:image" content="./assets/og-image.jpg" />
  <meta property="og:type" content="website" />

  <!-- Fonts — preconnect first for performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Mono:wght@300;400;500&family=Cormorant+Garamond:ital,wght@1,300&display=swap" rel="stylesheet" />

  <!-- CSS — order matters -->
  <link rel="stylesheet" href="./css/reset.css" />
  <link rel="stylesheet" href="./css/variables.css" />
  <link rel="stylesheet" href="./css/base.css" />
  <link rel="stylesheet" href="./css/layout.css" />
  <link rel="stylesheet" href="./css/components.css" />
  <link rel="stylesheet" href="./css/animations.css" />
  <link rel="stylesheet" href="./css/responsive.css" />

  <link rel="icon" href="./assets/favicon.ico" />
  <title>[YOUR NAME] · Portfolio</title>
</head>
<body>

  <!-- GRAIN TEXTURE OVERLAY -->
  <div class="grain" aria-hidden="true"></div>

  <!-- CUSTOM CURSOR (desktop only) -->
  <div class="cursor-dot" aria-hidden="true"></div>

  <!-- ==================== NAVIGATION ==================== -->
  <header class="nav-wrapper" role="banner">
    <nav class="nav container" aria-label="Main navigation">
      <span class="nav-name">[YOUR NAME]</span>
      <button class="nav-toggle" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span>
      </button>
      <ul class="nav-links" role="list">
        <li><a href="#about">About</a></li>
        <li><a href="#skills">Skills</a></li>
        <li><a href="#projects">Projects</a></li>
        <li><a href="#human">Human</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  </header>

  <main>

    <!-- ==================== HERO ==================== -->
    <section class="hero" id="hero" aria-label="Introduction">
      <div class="container">
        <p class="hero-eyebrow">[YOUR NAME]</p>
        <h1 class="hero-headline" data-reveal>
          <!-- Split into spans for stagger animation -->
          <span>I build things</span>
          <span>that matter.</span>
        </h1>
        <p class="hero-sub" data-reveal>[YOUR TAGLINE]</p>
        <div class="hero-cta" data-reveal>
          <a href="#projects" class="btn-primary">See My Work</a>
          <a href="#contact" class="btn-ghost">Get In Touch</a>
        </div>
      </div>
      <div class="scroll-indicator" aria-hidden="true">
        <div class="scroll-line"><div class="scroll-dot"></div></div>
      </div>
    </section>

    <!-- ==================== ABOUT ==================== -->
    <section class="section" id="about" aria-labelledby="about-heading">
      <div class="container">
        <div class="section-header" data-reveal>
          <span class="section-number">01</span>
          <h2 id="about-heading" class="section-title">About</h2>
        </div>
        <div class="about-grid">
          <div class="about-story" data-reveal>
            <p class="lead-text">[HOOK — unexpected first sentence]</p>
            <p>[YOUR STORY — journey paragraph]</p>
            <p>[LEADERSHIP paragraph]</p>
            <p>[FORWARD LOOK — what you want next]</p>
          </div>
          <aside class="about-sidebar" data-reveal>
            <dl class="sidebar-facts">
              <dt>Currently</dt>  <dd>[DEGREE · COLLEGE]</dd>
              <dt>Building with</dt> <dd>[YOUR STACK]</dd>
              <dt>Listening to</dt> <dd>[CURRENT ALBUM]</dd>
              <dt>Reading</dt>    <dd>[CURRENT BOOK]</dd>
              <dt>Latest craft</dt> <dd>[SOMETHING YOU MADE]</dd>
            </dl>
          </aside>
        </div>
      </div>
    </section>

    <!-- ==================== SKILLS ==================== -->
    <section class="section section-alt" id="skills" aria-labelledby="skills-heading">
      <div class="container">
        <div class="section-header" data-reveal>
          <span class="section-number">02</span>
          <h2 id="skills-heading" class="section-title">Skills</h2>
        </div>
        <div class="skills-grid" data-reveal>
          <div class="skill-group">
            <h3 class="skill-group-title">Data &amp; AI/ML</h3>
            <ul class="skill-list" role="list">
              <!-- JS will animate these in -->
              <li>Python</li>
              <li>Pandas · NumPy · Scikit-learn</li>
              <!-- Add yours from CONTENT.md -->
            </ul>
          </div>
          <div class="skill-group">
            <h3 class="skill-group-title">Web Development</h3>
            <ul class="skill-list" role="list">
              <li>HTML · CSS · JavaScript</li>
              <!-- Add yours -->
            </ul>
          </div>
          <div class="skill-group">
            <h3 class="skill-group-title">Tools &amp; Workflow</h3>
            <ul class="skill-list" role="list">
              <li>Git &amp; GitHub</li>
              <!-- Add yours -->
            </ul>
          </div>
          <div class="skill-group currently-learning">
            <h3 class="skill-group-title">Currently Learning</h3>
            <ul class="skill-list" role="list">
              <!-- Be honest here -->
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== PROJECTS ==================== -->
    <section class="section" id="projects" aria-labelledby="projects-heading">
      <div class="container">
        <div class="section-header" data-reveal>
          <span class="section-number">03</span>
          <h2 id="projects-heading" class="section-title">Projects</h2>
        </div>
        <div class="projects-grid">

          <!-- REPEAT THIS BLOCK PER PROJECT -->
          <article class="project-card" data-reveal>
            <span class="project-type">[TYPE TAG]</span>
            <h3 class="project-title">[PROJECT HEADLINE]</h3>
            <p class="project-desc">[WHAT I BUILT — 2-3 lines]</p>
            <p class="project-learning"><em>[WHAT I LEARNED]</em></p>
            <div class="project-footer">
              <div class="project-tags" aria-label="Built with">
                <span class="tag">[Tech]</span>
                <span class="tag">[Tech]</span>
              </div>
              <div class="project-links">
                <a href="#" class="btn-ghost btn-sm">GitHub</a>
                <a href="#" class="btn-ghost btn-sm">Live</a>
              </div>
            </div>
          </article>
          <!-- END PROJECT BLOCK -->

        </div>
      </div>
    </section>

    <!-- ==================== HUMAN SIDE ==================== -->
    <section class="section section-alt" id="human" aria-labelledby="human-heading">
      <div class="container">
        <div class="section-header" data-reveal>
          <span class="section-number">04</span>
          <h2 id="human-heading" class="section-title">Off the Clock</h2>
        </div>
        <div class="human-grid">
          <div class="human-block" data-reveal>
            <span class="human-icon" aria-hidden="true">♩</span>
            <h3>Guitar</h3>
            <p>[YOUR GUITAR TEXT]</p>
          </div>
          <div class="human-block" data-reveal>
            <span class="human-icon" aria-hidden="true">◈</span>
            <h3>Reading</h3>
            <p>[YOUR READING TEXT]</p>
          </div>
          <div class="human-block" data-reveal>
            <span class="human-icon" aria-hidden="true">▷</span>
            <h3>Gaming</h3>
            <p>[YOUR GAMING TEXT]</p>
          </div>
          <div class="human-block" data-reveal>
            <span class="human-icon" aria-hidden="true">⚙</span>
            <h3>Making Things</h3>
            <p>[YOUR CRAFT TEXT]</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== LEADERSHIP ==================== -->
    <section class="section" id="leadership" aria-labelledby="leadership-heading">
      <div class="container">
        <div class="section-header" data-reveal>
          <span class="section-number">05</span>
          <h2 id="leadership-heading" class="section-title">A Moment Worth Mentioning</h2>
        </div>
        <blockquote class="leadership-story" data-reveal>
          <p>[SETUP — what was it?]</p>
          <p>[THE CHALLENGE — what almost went wrong?]</p>
          <p>[THE OUTCOME — what happened?]</p>
          <footer><cite>[THE REFLECTION — what you took away]</cite></footer>
        </blockquote>
      </div>
    </section>

    <!-- ==================== CONTACT ==================== -->
    <section class="section section-alt" id="contact" aria-labelledby="contact-heading">
      <div class="container">
        <div class="section-header" data-reveal>
          <span class="section-number">06</span>
          <h2 id="contact-heading" class="section-title">Let's Talk</h2>
        </div>
        <div class="contact-block" data-reveal>
          <p class="lead-text">[YOUR OPENING LINE]</p>
          <div class="contact-links">
            <a href="mailto:[your@email.com]" class="contact-link">
              <span class="contact-label">Email</span>
              <span class="contact-value">[your@email.com]</span>
            </a>
            <a href="[linkedin url]" class="contact-link" target="_blank" rel="noopener">
              <span class="contact-label">LinkedIn</span>
              <span class="contact-value">/in/[yourhandle]</span>
            </a>
            <a href="[github url]" class="contact-link" target="_blank" rel="noopener">
              <span class="contact-label">GitHub</span>
              <span class="contact-value">/[yourhandle]</span>
            </a>
          </div>
        </div>
      </div>
    </section>

  </main>

  <!-- ==================== FOOTER ==================== -->
  <footer class="footer" role="contentinfo">
    <div class="container">
      <p class="footer-text">Built by [YOUR NAME] · [YEAR] · No templates were harmed.</p>
    </div>
  </footer>

  <!-- EASTER EGG OVERLAY (hidden by default) -->
  <div class="easter-egg" id="easterEgg" role="dialog" aria-modal="true" aria-label="Hidden message" hidden>
    <div class="easter-egg-box">
      <pre class="easter-egg-text" id="easterEggText"></pre>
      <button class="btn-ghost" id="easterEggClose">[ close ]</button>
    </div>
  </div>

  <!-- JS — deferred, order matters -->
  <script src="./js/scroll.js" defer></script>
  <script src="./js/nav.js" defer></script>
  <script src="./js/typewriter.js" defer></script>
  <script src="./js/easter-egg.js" defer></script>
  <script src="./js/main.js" defer></script>

</body>
</html>
```

---

## Build Order

Follow this sequence. Do not jump ahead.

```
Phase 1 — Foundation (no visual polish yet)
  [1] variables.css    — colors, fonts, spacing tokens
  [2] reset.css        — normalize browsers
  [3] base.css         — body, typography defaults
  [4] index.html       — full skeleton with all sections and placeholder text

Phase 2 — Layout
  [5] layout.css       — container, grid, section spacing
  [6] responsive.css   — mobile-first breakpoints

Phase 3 — Components
  [7] components.css   — nav, cards, buttons, tags, contact links
  [8] Hero section     — special treatment, handled within components.css

Phase 4 — Motion
  [9] animations.css   — keyframes, reveal classes
  [10] scroll.js       — IntersectionObserver
  [11] nav.js          — scroll behavior
  [12] typewriter.js   — skills animation

Phase 5 — Polish
  [13] Easter egg      — easter-egg.js
  [14] Grain texture   — pseudo-element in base.css
  [15] Cursor effect   — in main.js
  [16] og-image        — design in Figma or Canva, export as JPG

Phase 6 — Content & Launch
  [17] Fill all [PLACEHOLDERS] using CONTENT.md
  [18] Run CHECKLIST.md
  [19] Deploy to GitHub Pages or Vercel
```

---

## Deployment (GitHub Pages)

```bash
# 1. Create repo on GitHub named: yourusername.github.io
# 2. In repo settings → Pages → Source: main branch / root

git init
git add .
git commit -m "init: portfolio v1"
git remote add origin https://github.com/[username]/[username].github.io.git
git push -u origin main

# Your site will be live at: https://[username].github.io
```

## Deployment (Vercel — preferred, faster)

```bash
npm i -g vercel
vercel
# Follow prompts — done in 60 seconds
# Custom domain can be added free
```

---

## Git Commit Message Convention

```
init:     first commit
feat:     new section or feature added
fix:      bug or layout fix
content:  copy or text changes
style:    visual/CSS changes only
perf:     performance improvement
docs:     changes to md files
```

---

*Keep this file updated as the structure evolves.*
