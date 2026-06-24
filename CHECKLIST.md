# CHECKLIST.md — Pre-Launch Quality Gate

> Run through every item here before sharing the link with anyone. This is your quality gate.

---

## Content

- [ ] Hero does NOT start with "Hi, I'm" or "Hello, I'm"
- [ ] Every `[PLACEHOLDER]` has been replaced with real content
- [ ] Every project has: headline · problem · what I built · what I learned · tech stack
- [ ] Skills list includes "Currently Learning" section
- [ ] Human Side section has all 4 blocks (guitar, reading, gaming, making)
- [ ] Leadership story has a challenge, not just a success
- [ ] Contact section has a real, working email address
- [ ] Footer year is correct
- [ ] No buzzwords: passionate, motivated, innovative, leverage, synergize
- [ ] Read every line out loud — does it sound like you?
- [ ] All external links open in new tab (`target="_blank" rel="noopener"`)
- [ ] GitHub and LinkedIn links actually work

---

## Design & Visual

- [ ] Dark background consistent throughout — no light sections
- [ ] Accent color (`--accent-primary`) used sparingly, not everywhere
- [ ] No pure black (`#000`) or pure white (`#fff`) used anywhere
- [ ] Fonts loading correctly (Playfair Display, DM Mono, Cormorant Garamond)
- [ ] Section numbers (01–06) visible on desktop
- [ ] No broken layouts at any common screen width (375px, 768px, 1280px)
- [ ] Grain texture visible but subtle (not overwhelming)
- [ ] Horizontal accent rule appears correctly in hero

---

## Navigation

- [ ] Nav links scroll to correct sections
- [ ] Active section is highlighted in nav
- [ ] Hamburger menu works on mobile
- [ ] Mobile drawer opens and closes correctly
- [ ] Nav background blurs on scroll (desktop)

---

## Animations

- [ ] Scroll reveal works — elements fade up as they enter viewport
- [ ] Hero headline animates in on page load
- [ ] Skills typewriter animation triggers when section is in view
- [ ] Card hover: `translateY(-4px)` + border color change
- [ ] `prefers-reduced-motion` disables all animations (test in OS settings)
- [ ] No animation plays more than once unless explicitly designed to

---

## Easter Egg

- [ ] Konami Code works: `↑ ↑ ↓ ↓ ← → ← → B A`
- [ ] Overlay appears correctly
- [ ] Message types out in terminal style
- [ ] Close button works
- [ ] Overlay is accessible (focus trapped inside while open)

---

## Performance

- [ ] Google Fonts loaded with `preconnect` and `display=swap`
- [ ] All images have `loading="lazy"` and `decoding="async"`
- [ ] All images have explicit `width` and `height` attributes
- [ ] No unused CSS files or JS files included
- [ ] Page loads in under 3 seconds on slow 3G (test in Chrome DevTools)
- [ ] Run Lighthouse: target 90+ on Performance, Accessibility, Best Practices, SEO

---

## Accessibility

- [ ] All images have descriptive `alt` text
- [ ] All interactive elements reachable by keyboard (Tab key)
- [ ] Focus rings visible on all interactive elements
- [ ] Navigation landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`
- [ ] Color contrast passes WCAG AA (use Chrome DevTools → Accessibility)
- [ ] `aria-label` present on icon-only buttons (hamburger, close)
- [ ] Easter egg dialog has `role="dialog"` and `aria-modal="true"`

---

## SEO & Social

- [ ] `<title>` tag: `[YOUR NAME] · Portfolio`
- [ ] `<meta name="description">` filled with your tagline
- [ ] Open Graph tags filled: `og:title`, `og:description`, `og:image`
- [ ] `og:image` is 1200×630px and looks good as a preview card
- [ ] Favicon present and displays correctly
- [ ] URL is clean (no `.html` extension if possible)

---

## Cross-Browser Test

Test in each before launching:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if you have a Mac/iPhone)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iPhone)

---

## Final Gut Check

- [ ] Show the site to one person who doesn't know you. Ask: "What kind of person is this?"
- [ ] Their answer should match who you actually are.
- [ ] If it doesn't — go back to CONTENT.md and revise.

---

## After Launch

- [ ] Add portfolio link to GitHub profile
- [ ] Add portfolio link to LinkedIn
- [ ] Add portfolio link to your email signature
- [ ] Share with 3 people you respect and ask for honest feedback
- [ ] Set a reminder to update projects every 3 months

---

*This checklist is your quality gate. Nothing ships without every box checked.*
