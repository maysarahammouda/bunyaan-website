# Bunyaan Website — Build Brief for Claude Code

## Overview

Build a complete, production-ready single-page website for **Bunyaan** — Scotland's first Muslim community robotics and AI team for young people, competing in the FIRST UK competition.

This is not a generic charity website. It should feel like a pioneering team's home — confident, architectural, distinctive. Think precision engineering meets Islamic geometric tradition.

---

## Technical Constraints

- **Single HTML file** — all CSS and JS inline. No build tools, no dependencies, no npm. Must be deployable by dragging a single file to Netlify.
- **No frameworks** — vanilla HTML, CSS, JS only.
- **Fully responsive** — mobile-first, works perfectly on all screen sizes.
- **Arabic/RTL ready** — the site is English only for now, but Arabic text appears in specific places (the Ayah). The codebase must support RTL as a future toggle (`dir="rtl"` on `<html>`) without breaking the layout. Use logical CSS properties (`margin-inline-start` etc.) where appropriate.
- **Accessible** — semantic HTML, proper heading hierarchy, ARIA labels on interactive elements, sufficient colour contrast.
- **Performance** — no large images. All visuals are CSS/SVG. Google Fonts loaded via `<link>` with `display=swap`.
- **Forms** — use Netlify Forms (add `netlify` attribute to `<form>` and `data-netlify="true"`). No backend needed.

---

## Fonts

Load from Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=Noto+Naskh+Arabic:wght@400;700&display=swap" rel="stylesheet">
```

- **Display / headings:** `Cormorant Garamond` — used for all large titles, the Bunyaan wordmark, section headings, stat numbers, tier names
- **Body / UI:** `DM Sans` — used for all body text, navigation, labels, buttons, form fields
- **Arabic:** `Noto Naskh Arabic` — used exclusively for the Ayah text in hero and footer

---

## Colour Palette

```css
:root {
  --navy:         #0D1B3E;   /* Primary background */
  --navy-2:       #162347;   /* Secondary background (alternating sections) */
  --navy-3:       #1E3060;   /* Cards, elevated surfaces */
  --gold:         #C9A84C;   /* Primary accent — ALL highlights, icons, borders */
  --gold-light:   #E8C96B;   /* Hover states */
  --gold-dim:     rgba(201,168,76,0.12); /* Subtle card backgrounds */
  --gold-border:  rgba(201,168,76,0.25); /* Default border colour */
  --white:        #FFFFFF;
  --muted:        rgba(255,255,255,0.55); /* Body text on dark backgrounds */
  --muted-2:      rgba(255,255,255,0.35); /* Secondary muted text */
}
```

**Rules:**
- Navy is the dominant colour (60–70% visual weight)
- Gold is used ONLY for accents — never as a large fill except CTAs and the Year 1 total row
- No other colours except status indicators (green for confirmed, amber for pending)
- Dark backgrounds throughout — no light sections except form inputs

---

## Background Pattern

Apply a subtle Islamic geometric pattern as a fixed full-viewport background layer behind all content. Use CSS only — no images.

```css
.geo-bg {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  opacity: 0.035;
  background-image:
    repeating-linear-gradient(60deg,  #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%),
    repeating-linear-gradient(120deg, #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%),
    repeating-linear-gradient(0deg,   #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%);
  background-size: 60px 104px;
}
```

All content sections have `position: relative; z-index: 1` to sit above this layer.

---

## Navigation

Fixed top navigation. Becomes slightly more opaque on scroll (JS scroll listener adding a class).

**Left:** Wordmark `BUNYAAN` in Cormorant Garamond — the letters `YA` in gold, rest in white.

**Centre links:**
- About
- FIRST UK
- Our Pillars
- Support Us
- Meet the Team
- Get Involved

**Right:** CTA button "Get Involved" — gold background, navy text.

**Mobile:** Hamburger menu. Nav links collapse. CTA button remains visible.

---

## Sections — Full Content

### 1. Hero

Full viewport height. Centered content. No background image — rely on the geometric pattern and depth from layered shapes.

**Eyebrow pill:**
```
SCOTLAND'S FIRST MUSLIM ROBOTICS TEAM
```
Small uppercase, gold text, gold border, subtle pill.

**Main title:**
```
BUNYAAN
```
Cormorant Garamond, very large (clamp 5rem to 9rem), bold. Letters `YA` in gold.

**Gold divider line:** 80px wide, 2px tall, centred, beneath title.

**Arabic Ayah:**
```
كَأَنَّهُم بُنيَانٌ مَّرْصُوصٌ
```
Noto Naskh Arabic, ~1.6rem, gold, `dir="rtl"` on this element only.

**English translation:**
```
"As though they are a single solid structure"
```
Cormorant Garamond italic, ~1rem, muted white.

**Sub-headline:**
```
Scotland's first robotics and AI team for Muslim youth —
competing in FIRST UK, building engineers, changing futures.
```
DM Sans, ~1rem, muted white, max-width 560px centred.

**Three CTA buttons (flex row, centred, wrap on mobile):**
1. `Join the Team` — gold fill, navy text (primary)
2. `Become a Mentor` — outline, white text
3. `Support Us` — outline, white text

**Entrance animations:** Staggered `fadeUp` keyframe animations on each element (0.2s delay increments). CSS only, `animation-fill-mode: both`.

---

### 2. About

Background: `--navy-2`. Two-column layout (text left, visual right). Stacks to single column on mobile.

**Left column:**

Section label: `THE VISION`

Title:
```
Filling a gap that has always existed
```

Body:
```
Edinburgh has a thriving Muslim community with deep enthusiasm for
education and technology. Yet there has never been a dedicated,
competition-grade robotics programme built specifically for its young people.

Bunyaan is not a hobby club. It is a structured, competition-grade
initiative giving Muslim youth access to the same quality of STEM
education available in the best-funded schools in the country.

We compete in FIRST UK — one of the most respected youth engineering
competitions in the world — where students build real robots, write
real code, and are judged on engineering rigour, teamwork, and
community impact.
```

**Stats row (2×2 grid below text):**

| Stat | Label |
|---|---|
| 9–18 | Ages served |
| 20+ | Students in Season 1 |
| 5 | Expert mentors |
| 2026 | Season 1 begins |

Each stat: large Cormorant Garamond number in gold, small DM Sans label below, left gold border.

**Right column — decorative visual:**
Concentric animated rings (CSS `animation: spin`) with a centred element showing the FIRST UK competition icon or a simple robot SVG silhouette. Keep it geometric and minimal.

---

### 3. What is FIRST UK

Background: `--navy`. Three cards in a grid.

Section label: `THE COMPETITION`
Title: `More Than Robots`
Body:
```
FIRST UK is one of the world's most respected youth engineering
competitions, active in 110+ countries. Teams design, build, and
compete with fully functioning robots — but are judged on far more
than performance on the field.
```

**Three stat cards:**

| Number | Label | Description |
|---|---|---|
| 110+ | Countries | Participating in FIRST globally |
| 5 | Dimensions | Teams judged on — not just the robot |
| 6 months | Build season | From kickoff to national championship |

**Four feature items (2×2 grid below cards):**
- Engineering design & documentation
- Programming & autonomous capability
- Community outreach & impact
- Business planning & presentation

Each with a small gold diamond icon prefix.

**Pull quote:**
```
Gracious Professionalism® — FIRST's founding ethos. Teams are expected
to help their opponents. Fierce competition and kindness are not opposites.
```
Gold left border, Cormorant Garamond italic.

---

### 4. Our Founding Advantages

Background: `--navy-2`.

Section label: `WHY WE WILL SUCCEED`
Title: `Three Pillars. Already in Place.`
Sub:
```
Before a single team has been registered, three critical foundations
are already secured.
```

**Three pillar cards (grid, equal columns):**

**Card 1 — Space**
Icon: building/location (SVG)
Title: `Space`
Body:
```
A permanent 8.5m × 6.75m robotics lab in Broomhouse Mosque,
Edinburgh. Equipment stays built between sessions.
Secured free of charge.
```
Tag: `Secured ✓`

**Card 2 — Mentors**
Icon: people/graduation (SVG)
Title: `Mentors`
Body:
```
Professionals across Computer Science, AI, Robotics, and Engineering.
Can teach Java, CAD, electronics, and autonomous programming.
Most rookie teams struggle to find even one.
```
Tag: `Confirmed ✓`

**Card 3 — Partnership**
Icon: handshake (SVG)
Title: `Partnership`
Body:
```
Strategic alliance with Fitya — experienced teams within
the FIRST UK ecosystem. Bunyaan operates independently
with its own identity, funding, and direction.
```
Tag: `Established ✓`

---

### 5. Sponsorship Tiers

Background: `--navy`.

Section label: `SUPPORT BUNYAAN`
Title: `Choose Your Brick`
Sub:
```
Every level of support makes a direct, tangible difference
to the young people we serve.
```

**Three tier cards (equal grid). Middle card (Engineer) is featured — gold border, subtle gold background.**

**BUILDER — from £500**
Benefits:
- Logo on team banner at all competitions
- Named on Bunyaan website and social media
- Certificate of sponsorship
- Invitation to visit the lab
- Invitation to the season launch event

CTA button: `Become a Builder` → scrolls to #involved contact form (pre-selects Sponsor)

**ENGINEER — from £2,500** *(featured — badge: "Most Popular")*
Benefits:
- Everything in Builder, plus:
- Logo on team hoodies worn by all 25 members
- Logo on the robot
- Named in the Engineering Portfolio submitted to judges
- Personal introduction to the team at a regional competition

CTA button: `Become an Engineer` → scrolls to #involved

**ARCHITECT — from £5,000**
Benefits:
- Everything in Engineer, plus:
- Primary logo placement on robot and banner
- Named as Founding Sponsor in all Bunyaan materials
- Handwritten thank-you card signed by the whole team

CTA button: `Become an Architect` → scrolls to #involved

---

### 6. Meet the Team

Background: `--navy-2`.

Section label: `THE PEOPLE`
Title: `The People Behind the Structure`
Sub:
```
Every brick needs someone to place it.
```

**Trustees (3 cards, larger, top row):**

Each card:
- Circular avatar (grey placeholder with person silhouette SVG)
- Name: `[Name]`
- Role in gold: `Trustee — Founder` / `Trustee — Technical` / `Trustee — Community`
- One-liner: `[Background / Title]`

**Mentors & Volunteers (10 cards, smaller, 5 per row, 2 rows):**

Each card:
- Circular avatar (smaller)
- Name: `[Name]`
- Expertise in gold: `Java / Android` / `CAD / Mechanical` / `AI / Computer Vision` / `Electronics` / `Portfolio & Business` / `[TBC]` × 5

Build with realistic placeholder content so the layout is production-ready. Real names/photos/bios drop in by replacing placeholder values.

---

### 7. Get Involved

Background: `--navy`.

Section label: `JOIN BUNYAAN`
Title: `There Is a Brick Here With Your Name On It`
Sub:
```
Whether you are a young person ready to build, a professional
ready to mentor, or an organisation ready to invest — we have
a place for you.
```

**Three cards side by side (stack on mobile), each with a form:**

**Card 1 — Join the Team**
Body:
```
Are you aged 9–18 and based in Edinburgh? Or are you a parent
interested in registering your child? Tell us about yourself
and we will be in touch when registration opens.
```
Form fields:
- Full name (text)
- Email address (email)
- Child's age (number, 9–18)
- How did you hear about us? (select: Mosque / School / Friend / Social Media / Other)
- Any questions? (textarea, optional)
- Submit: `Register Interest`

**Card 2 — Become a Mentor**
Body:
```
We are looking for volunteers with expertise in Java, CAD,
electronics, AI, or business. No prior FIRST experience
required — we will train you.
```
Form fields:
- Full name (text)
- Email address (email)
- Professional background (text)
- Area of expertise (select: Java / Android Studio / CAD / Mechanical Engineering / AI / Computer Vision / Electronics / Portfolio Writing / Business Coaching / Other)
- Availability (select: Weekday evenings / Saturdays / Both / Flexible)
- Any questions? (textarea, optional)
- Submit: `Apply as Mentor`

**Card 3 — Support Us**
Body:
```
Your contribution funds equipment, robot kits, competition
entry, and team clothing. Every pound goes directly to
the young people we serve.
```
Form fields:
- Organisation / Name (text)
- Email address (email)
- Sponsorship level (select: Builder — from £500 / Engineer — from £2,500 / Architect — from £5,000 / Other amount)
- Message (textarea, optional)
- Submit: `Get in Touch`

All forms: `method="POST"` `data-netlify="true"` with unique `name` attributes for Netlify Forms identification.

Show a subtle success message on submission (JS, replace form with thank-you text).

---

### 8. Footer

Three-column grid (stacks on mobile).

**Column 1 — Brand:**
- Wordmark `BUNYAAN` (Cormorant Garamond, large)
- Arabic Ayah: `كَأَنَّهُم بُنيَانٌ مَّرْصُوصٌ` (Noto Naskh Arabic, gold, RTL)
- English: `"As though they are a single solid structure"` (italic, muted)
- Short description:
```
Scotland's first Muslim community robotics and AI team.
Competing in FIRST UK. Based in Edinburgh.
```

**Column 2 — Quick Links:**
- About Bunyaan
- What is FIRST UK
- Our Pillars
- Meet the Team
- Support Us
- Get Involved

**Column 3 — Contact:**
- Email: `hello@bunyaan.org` (placeholder — link with `mailto:`)
- Location: `Edinburgh, Scotland`
- FIRST UK partner: `firstuk.org`
- Social media: placeholder icons for Instagram, X (Twitter), LinkedIn — links to `#` for now

**Footer bottom bar:**
```
© 2026 Bunyaan. Registered Scottish Charity (pending).
Built with purpose in Edinburgh.
```
Left-aligned legal. Right-aligned: `Scotland's first Muslim robotics team`.

---

## Animations & Interactions

**Page load:** Hero elements animate in with staggered `fadeUp` (CSS keyframes, `animation-fill-mode: both`).

**Scroll reveal:** All section content uses an `IntersectionObserver` to add a `.visible` class when elements enter viewport. Animate with `opacity: 0 → 1` and `translateY(32px) → 0` over 0.7s.

**Nav scroll behaviour:** On scroll > 50px, add class to nav that increases background opacity slightly and adds a stronger bottom border.

**Hover states:**
- Cards: `border-color` transitions to gold, subtle `translateY(-4px)` lift
- Buttons: background lightens, subtle lift
- Nav links: colour transitions to gold
- Team avatar circles: border transitions to gold

**Form submission:** On submit, show inline success state (replace form content with thank-you message in gold). No page reload.

**Smooth scroll:** All anchor links use CSS `scroll-behavior: smooth`. Offset for fixed nav height (~72px) using `scroll-margin-top` on each section.

---

## Accessibility

- All images/SVGs have `alt` text or `aria-label`
- Form inputs have associated `<label>` elements
- Colour contrast: white on navy passes AA, gold on navy passes AA for large text
- Focus styles visible (custom gold outline, not browser default)
- `prefers-reduced-motion` media query: disable all animations for users who prefer it
- Semantic HTML: `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<h1>`–`<h3>` hierarchy

---

## File Structure

Single file: `index.html`

Internal structure:
```
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <!-- meta, fonts, inline <style> -->
</head>
<body>
  <div class="geo-bg"></div>
  <nav>...</nav>
  <main>
    <section id="hero">...</section>
    <section id="about">...</section>
    <section id="first">...</section>
    <section id="pillars">...</section>
    <section id="sponsor">...</section>
    <section id="team">...</section>
    <section id="involved">...</section>
  </main>
  <footer>...</footer>
  <script>
    <!-- IntersectionObserver, nav scroll, form handling, smooth scroll offset -->
  </script>
</body>
</html>
```

---

## SVG Icons

Build all icons as inline SVG, not icon fonts. Use a consistent style:
- Stroke-based, not fill-based
- `stroke="currentColor"` so they inherit colour
- `stroke-width="1.5"`
- `stroke-linecap="round"` `stroke-linejoin="round"`
- Viewbox `0 0 24 24`
- Size: 24×24px for nav/body, 32×32px for pillar cards

Icons needed:
- Location pin (space pillar)
- People/graduation (mentors pillar)
- Handshake / link (partnership pillar)
- Robot / gear (FIRST UK section)
- Trophy (competition)
- Person silhouette (team avatar placeholders)
- Chevron down (hero scroll indicator)
- Menu (hamburger)
- Close (X)
- Check mark
- Arrow right (CTAs)

---

## Quality Checklist Before Finishing

- [ ] All three CTA buttons in hero scroll to correct sections
- [ ] All nav links scroll to correct sections with proper offset for fixed nav
- [ ] All three forms submit correctly with Netlify attributes
- [ ] Form success states work without page reload
- [ ] Mobile hamburger menu opens and closes correctly
- [ ] Arabic Ayah renders correctly in both hero and footer (Noto Naskh Arabic)
- [ ] Scroll reveal animations trigger correctly on all sections
- [ ] No horizontal scroll on any screen size
- [ ] All hover states working on cards, buttons, nav links
- [ ] Colour contrast accessible on all text
- [ ] `prefers-reduced-motion` disables animations
- [ ] File is a single `index.html` with no external dependencies except Google Fonts

---

## Deployment

After building, the file is ready to deploy to Netlify:
1. Go to netlify.com
2. Drag and drop `index.html` into the deploy area
3. Once bunyaan.org domain is registered, add it in Netlify domain settings

---

## Notes for Claude Code

- Do not use any JavaScript frameworks, bundlers, or package managers
- Do not create separate CSS or JS files — everything inline in index.html
- Do not use placeholder image services (placehold.it etc.) — use CSS/SVG placeholders only
- The Bunyaan logo mark is not yet finalised — use the text wordmark only (BUNYAAN in Cormorant Garamond with YA in gold)
- The website must work by opening index.html directly in a browser locally (no server required except for Netlify Forms which only activates on deployment)
- Prioritise visual quality and distinctiveness — this is the public face of a pioneering initiative
- When in doubt about content, use what is in this document — do not invent facts about the organisation
EOF
echo "Done"