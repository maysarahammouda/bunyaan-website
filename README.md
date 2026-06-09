# Bunyaan Website

Official website for **Bunyaan** — Scotland's first Muslim community robotics and AI team for young people, competing in the FIRST UK competition.

**Live site:** [bunyaan.org.uk](https://www.bunyaan.org.uk)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JS (single file) |
| Database | Firebase Firestore |
| Hosting | Cloudflare Pages |
| Domain | bunyaan.org.uk |

No build tools, no frameworks, no npm. The entire public site is `index.html` with all CSS and JS inline.

---

## Project Structure

```
bunyaan-website/
├── index.html          # Public website (entire site — HTML, CSS, JS inline)
├── admin.html          # Password-protected admin dashboard
├── favicon.ico         # Browser tab icon
├── _headers            # Cloudflare Pages security headers
├── assets/
│   ├── logo-nav.png        # Logo for nav bar (gold mark + white text, transparent bg)
│   ├── logo-source.jpg     # Original logo file (source for all derived assets)
│   ├── og-image.png        # Social share preview image (1200x630)
│   └── apple-touch-icon.png
└── CLAUDE.md           # Full design brief and build specification
```

---

## Local Development

No build step required. Open `index.html` directly in a browser:

```bash
open index.html
```

> **Note:** Firestore form submissions and the team section require a live server (or deployment) since Firebase uses module imports. For local testing of forms, use a local server:
> ```bash
> npx serve .
> ```

---

## Deployment

The site deploys to Cloudflare Pages via Wrangler:

```bash
CLOUDFLARE_API_TOKEN=<token> npx wrangler pages deploy . --project-name bunyaan
```

Cloudflare project name: `bunyaan`
Production URL: `https://www.bunyaan.org.uk`

---

## Firebase

The site uses Firebase Firestore for:
- **Team members** (`team_members` collection) — managed via `admin.html`
- **Form submissions** — `join_submissions`, `mentor_submissions`, `sponsor_submissions`

Firebase project: `bunyaan-26ed6`
Firebase console: [console.firebase.google.com](https://console.firebase.google.com)

### Required Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /team_members/{doc} {
      allow read: if true;
      allow write: if true;
    }
    match /join_submissions/{doc}    { allow create, read, update: if true; }
    match /mentor_submissions/{doc}  { allow create, read, update: if true; }
    match /sponsor_submissions/{doc} { allow create, read, update: if true; }
  }
}
```

---

## Admin Panel

URL: `/admin.html`
Credentials are stored in `admin.html` — update before sharing access.

Features:
- Real-time view of all form submissions (Join, Mentor, Sponsor)
- Status tracking (New / Contacted / Confirmed / Declined) with notes
- CSV export per form
- Team member management (add, edit, delete, upload photos)

---

## Charity Details

- Registered Scottish Charity: **SC055377**
- Regulator: OSCR (Office of the Scottish Charity Regulator)
- Contact: info@bunyaan.org.uk
