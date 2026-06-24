# DESIGN.md — Portfolio Design System

> This document is the single source of truth for every visual, typographic, and interaction decision in the portfolio. Before writing a single line of CSS, read this fully.

---

## 01. Design Philosophy

This portfolio is built on a single idea: **controlled contrast**.

Gritty meets precise. Raw meets refined. The portfolio of someone who reads noir thrillers, builds things from junk, and then ships a machine learning model — all in the same week.

The visual language is not "developer portfolio." It is closer to a **limited-edition art book designed by an engineer.** Dark, atmospheric, deliberate. Typography that cuts. Layouts that break the grid on purpose. Warmth hiding inside a cold exterior.

**The one thing a visitor must feel:** *"I know exactly who this person is."*

---

## 02. Aesthetic Direction

### Core Concept: "Warm Noir"
- Inspired by: noir film posters, Swiss typographic grids, vintage editorial print, hand-crafted zines
- Contrast pair: **gritty/textured** atmosphere + **razor-sharp** typographic grid
- NOT: generic dark dev portfolio, hacker aesthetic, terminal green-on-black, purple gradient SaaS

### Mood Words
```
deliberate · atmospheric · warm · sharp · human · unexpected · honest
```

### Visual Metaphor
Think of a jazz record sleeve from the 1960s — dark background, one bold typographic statement, a few careful graphic elements, nothing wasted. Now imagine that was designed by someone who also builds AI tools. That is the vibe.

---

## 03. Color System

All colors defined as CSS custom properties on `:root`.

```css
:root {
  /* === BACKGROUNDS === */
  --bg-primary:    #0E0C0A;   /* near-black, warm undertone — main page bg */
  --bg-secondary:  #161310;   /* slightly lighter — cards, panels */
  --bg-tertiary:   #1F1A16;   /* hover states, subtle sections */
  --bg-surface:    #252018;   /* elevated surfaces */

  /* === TEXT === */
  --text-primary:  #F0EAE0;   /* warm off-white — headings */
  --text-secondary:#A89F94;   /* muted warm gray — body, descriptions */
  --text-tertiary: #6B6259;   /* very muted — labels, metadata */
  --text-inverse:  #0E0C0A;   /* for use on accent backgrounds */

  /* === ACCENT — use sparingly === */
  --accent-primary:  #D4854A; /* burnt orange — primary accent, CTAs */
  --accent-secondary:#8C6A3F; /* darker amber — secondary, borders */
  --accent-glow:     #D4854A22; /* accent at low opacity — glows, highlights */

  /* === UTILITY === */
  --border-subtle:   #2A2420;   /* barely visible — separators */
  --border-medium:   #3D3228;   /* visible — card borders */
  --border-accent:   #D4854A55; /* accent border */
  --noise-opacity:   0.035;     /* grain texture overlay */
}
```

### Color Usage Rules
| Element | Color |
|---|---|
| Page background | `--bg-primary` |
| Section alternates | `--bg-secondary` |
| Cards / panels | `--bg-secondary` + `--border-medium` border |
| H1, H2 headings | `--text-primary` |
| Body text | `--text-secondary` |
| Labels, metadata | `--text-tertiary` |
| Primary CTA button | `--accent-primary` bg + `--text-inverse` |
| Links (hover) | `--accent-primary` |
| Section dividers | `--border-subtle` |
| Accent underlines | `--accent-primary` |

### Do Not
- Do not use pure `#000000` or `#ffffff`
- Do not introduce new colors outside this system
- Do not use `--accent-primary` for more than ~10% of any screen
- Do not use blue, green, or purple — this palette is warm-only

---

## 04. Typography

### Font Stack

```css
/* Display — used for H1, hero text, section numbers */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&display=swap');

/* Body & UI — used for everything else */
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap');

/* Optional editorial accent — pull quotes, callouts */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300;1,400&display=swap');

:root {
  --font-display: 'Playfair Display', Georgia, serif;
  --font-mono:    'DM Mono', 'Courier New', monospace;
  --font-serif:   'Cormorant Garamond', Georgia, serif;
}
```

### Why These Fonts
- **Playfair Display** — editorial authority, warmth, contrast between thick and thin strokes. Feels like a masthead.
- **DM Mono** — a monospace that doesn't look like a terminal. Clean, readable, slightly unusual.
- **Cormorant Garamond** — italic-only, for moments that need elegance. Sparingly.

### Type Scale

```css
:root {
  --text-xs:   0.75rem;    /* 12px — labels, tags */
  --text-sm:   0.875rem;   /* 14px — metadata, captions */
  --text-base: 1rem;       /* 16px — body */
  --text-lg:   1.125rem;   /* 18px — lead text */
  --text-xl:   1.375rem;   /* 22px — subheadings */
  --text-2xl:  1.75rem;    /* 28px — H3 */
  --text-3xl:  2.5rem;     /* 40px — H2 */
  --text-4xl:  3.75rem;    /* 60px — H1 */
  --text-hero: clamp(3.5rem, 9vw, 7rem); /* fluid hero */
}
```

### Typography Rules
- **Headings**: `--font-display`, `font-weight: 700`
- **Body text**: `--font-mono`, `font-weight: 300`, `line-height: 1.8`
- **Labels / tags / nav**: `--font-mono`, `font-weight: 500`, `letter-spacing: 0.08em`, uppercase
- **Pull quotes**: `--font-serif`, italic, large, `--text-primary`
- **Code snippets**: `--font-mono`, `--bg-tertiary` background
- Headings should feel **heavy and editorial**. Body text should feel **light and precise**.

---

## 05. Layout & Spacing

### Grid System
```css
:root {
  --container-max: 1200px;
  --container-pad: clamp(1.5rem, 5vw, 5rem);
  --section-gap:   clamp(5rem, 10vw, 9rem);
  --grid-cols:     12;
  --gutter:        1.5rem;
}
```

### Layout Philosophy
- **Don't center everything.** Left-align text is more editorial.
- **Break the grid deliberately.** One element per section should overflow, overlap, or sit unexpectedly.
- **Section numbers** (01, 02, 03…) in top-left of each section — `--text-tertiary`, `--font-mono`, small, uppercase. These are the spine of the page.
- **Large negative space** is intentional. Don't fill it.
- **No equal-width columns.** Use asymmetric splits: 40/60, 30/70, 20/80.

### Spacing Scale
```css
:root {
  --space-1:  0.25rem;
  --space-2:  0.5rem;
  --space-3:  0.75rem;
  --space-4:  1rem;
  --space-6:  1.5rem;
  --space-8:  2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-24: 6rem;
}
```

---

## 06. Components

### 6.1 Hero Section
- Full viewport height (`100svh`)
- Large `--text-hero` headline — **NOT** "Hi, I'm [Name]"
- Subtle grain texture overlay (SVG noise or CSS pseudo-element)
- One horizontal rule in `--accent-primary` cutting across the layout
- Scroll indicator: thin vertical line with downward-moving dot, bottom-center
- Name appears small, `--font-mono`, top-left like a film credit

### 6.2 Section Headers
```
[section number in --text-tertiary]   [section title in --text-primary, --font-display]
─────────────────────────────────────────────────────────────────────
```
A full-width `1px` rule in `--border-medium` under every section header.

### 6.3 Project Cards
- Dark card: `--bg-secondary` background, `--border-medium` border, `1px solid`
- Top: project type tag (`--font-mono`, uppercase, `--accent-primary` color)
- Title: `--font-display`, large
- Body: `--font-mono`, `--text-secondary`, 2–3 lines max
- Bottom: built-with tags + "View Project" link
- On hover: border shifts to `--border-accent`, subtle translate-Y(-4px)
- **No project card should lead with a screenshot** — lead with the idea

### 6.4 Skill Display
- Skills are **not** progress bars or badge clouds
- Display as a typed list — each skill on its own line, preceded by a `—` dash
- Group by domain (Data & AI / Web / Tools / Currently Learning)
- Animate in with a staggered fade — like a terminal loading

### 6.5 Navigation
- Fixed top, full width
- Left: name in `--font-mono`, small, `--text-tertiary`
- Right: nav links in `--font-mono`, uppercase, `--text-xs`, letter-spaced
- Background: `--bg-primary` at 90% opacity + `backdrop-filter: blur(8px)`
- On scroll past hero: a `1px` bottom border appears (`--border-subtle`)
- Active section: link gets `--accent-primary` color

### 6.6 Buttons
```css
/* Primary */
.btn-primary {
  background: var(--accent-primary);
  color: var(--text-inverse);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.75rem 1.75rem;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-primary:hover { opacity: 0.85; }

/* Ghost */
.btn-ghost {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-medium);
  /* same font/padding as primary */
}
.btn-ghost:hover { border-color: var(--accent-primary); color: var(--accent-primary); }
```
- **No border-radius** on buttons. Sharp corners only.
- **No rounded cards** either — `border-radius: 2px` maximum.

### 6.7 Tags / Pills
```css
.tag {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  border: 1px solid var(--border-subtle);
  padding: 0.25rem 0.625rem;
  border-radius: 2px;
}
```

---

## 07. Motion & Animation

### Principles
- **Purposeful, not decorative.** Every animation must serve communication.
- **Entrance animations only** — nothing loops, nothing bounces perpetually.
- **Fast.** Most transitions under 300ms. Page reveal: 600–900ms max.
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` for entrances. `ease-out` for exits.

### Animation Catalogue

| Name | Trigger | Effect |
|---|---|---|
| `fadeUp` | On scroll into view | `opacity 0→1`, `translateY 20px→0`, 500ms |
| `revealLine` | Section header enters | Width `0→100%` on the horizontal rule, 600ms |
| `typeIn` | Skills section | Characters appear one by one, cursor blinking |
| `cardHover` | Card mouse-enter | `translateY(-4px)`, border color shift, 200ms |
| `navAppear` | Page load | Nav fades in at 300ms delay |
| `heroReveal` | Page load | Headline word-by-word stagger, 100ms each |
| `cursorTrail` | Mouse move | Subtle `--accent-primary` dot follows cursor (desktop only) |

### Scroll Reveal
Use `IntersectionObserver` — no library needed.
```js
const observer = new IntersectionObserver(
  entries => entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)),
  { threshold: 0.15 }
);
document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
```

---

## 08. Texture & Atmosphere

### Grain Overlay
Every section gets a subtle noise texture. Apply via pseudo-element:
```css
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* SVG noise */
  opacity: var(--noise-opacity); /* 0.035 */
  pointer-events: none;
  z-index: 9999;
}
```

### Accent Lines
Thin horizontal or vertical rules in `--accent-primary` used as:
- Section dividers (full-width, 1px)
- Left border on pull quotes (3px, left side only)
- Underline on hover states

### The Warmth
The dark background is **not cold.** It has a brown undertone (`#0E0C0A`). The accent is burnt orange, not electric. The typography is a serif, not a sans. These are the details that make it feel human.

---

## 09. Easter Egg Spec

**The Konami Code Easter Egg.**
When the user types: `↑ ↑ ↓ ↓ ← → ← → B A`

Trigger: A brief terminal-style overlay appears with a handwritten-style message in `--font-mono`:
```
> accessing hidden file...
> ...
> this is the part nobody sees.
> i made this site at 2am with coffee and a guitar riff stuck in my head.
> if you found this — you're the kind of person i want to work with.
> [close]
```
Overlay: `--bg-primary` at 95% opacity, centered, max-width 480px. Fade in, close on click.

---

## 10. Responsive Breakpoints

```css
:root {
  /* Mobile first */
  --bp-sm:  480px;
  --bp-md:  768px;
  --bp-lg:  1024px;
  --bp-xl:  1280px;
}
```

| Element | Mobile | Desktop |
|---|---|---|
| Hero text | `clamp(2.5rem, 10vw, 7rem)` — fluid | Same |
| Layout | Single column | Asymmetric multi-column |
| Nav | Hamburger → slide-in drawer | Horizontal top nav |
| Project cards | Stacked | 2-column grid |
| Section numbers | Hidden | Visible |
| Cursor effect | Disabled | Enabled |

---

## 11. Accessibility

- All color contrasts meet WCAG AA (minimum 4.5:1 for body, 3:1 for large text)
- `prefers-reduced-motion` media query: all animations off
- All interactive elements keyboard-navigable
- All images have descriptive `alt` text
- Focus rings: `outline: 2px solid var(--accent-primary); outline-offset: 3px`
- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- `aria-label` on icon-only elements

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 12. Performance Rules

- Google Fonts loaded with `display=swap` and `preconnect`
- All images: `loading="lazy"`, `decoding="async"`, explicit `width`/`height`
- No UI framework unless necessary (prefer vanilla JS + CSS)
- No hero image — atmosphere is created with color, type, and texture only
- Target Lighthouse score: 90+ on all metrics

---

*Last updated: project inception. Update this doc whenever a new design decision is made.*
