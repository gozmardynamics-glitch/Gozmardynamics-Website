# Gozmar Dynamics — Landing Page

> **Source of truth for this project.** Contains the full concept, brand system, all marketing copy, technical architecture, and the improvement roadmap. This file replaces `Review.md`, which can now be deleted.

---

## 1. Concept & Scope

A polished, **single-page marketing website** for **Gozmar Dynamics Limited** — an AI-powered IT solutions provider. It is a long-scrolling landing page with alternating product feature blocks, designed in an **Apple-like aesthetic**: monochrome base, subtle gradients, one strong accent color.

**Audience / market:** Generic and global (no specific geographic references — see §10 for the decision).

**Deliverable style:**
- Long scrolling single page
- Six product sections in alternating layout
- Scroll-reveal animations + lightweight vanilla JS (no framework)
- Legal content in modals (Terms & Privacy)
- Placeholder stock imagery, to be replaced with licensed assets

---

## 2. Brand Identity

| Element | Value |
|---|---|
| **Company** | Gozmar Dynamics Limited |
| **Tagline** | *Intelligence, Amplified.* |
| **Voice** | Apple-like: "Powerful. Intuitive. Effortless." — confident, minimal, human |
| **Base** | White `#ffffff`, Light Gray `#f5f5f7`, Dark `#1d1d1f` |
| **Accent** | Electric Blue `#0071e3`, gradient → Cyan `#5ac8fa` |
| **Text** | Primary `#1d1d1f`, Secondary `#6e6e73` |
| **Typography** | System font stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial` |
| **Logo** | Wordmark "Gozmar**Dynamics**" (accent-colored "Dynamics") |

---

## 3. Site Architecture

Single page, anchor-navigated. Section order and `id`s:

| # | Section | `id` | Layout |
|---|---|---|---|
| 0 | Navigation | `navbar` | Fixed; transparent → solid on scroll |
| 1 | Hero | `home` | Centered headline + CTAs, gradient bg |
| 2 | Stats band | `stats` | 4 social-proof numbers |
| 3 | About | `about` | Two-column: image + text |
| 4 | Products (6 blocks) | `products` | Alternating image/text |
| 5 | Why Choose Us / Values | `values` | 4 cards, dark section |
| 6 | Testimonials | `testimonials` | 3 quote cards |
| 7 | Contact | `contact` | Form + contact info |
| 8 | Footer | — | Links, legal, social, newsletter |
| — | Legal modals | `termsModal`, `privacyModal` | Terms & Privacy |

---

## 4. Product Catalog

### 1. Gozmar DMS — *Corporate document management, reimagined.*
AI-powered document management: organizes, secures, and retrieves corporate files with zero friction. ML auto-categorizes documents, extracts key data, and enforces compliance.
- AI-driven auto-tagging and metadata extraction
- Enterprise-grade encryption and access controls
- Full-text search across all file types
- Version history and audit trails
- **CTA:** Discover DMS
- **Image:** office professionals collaborating (placeholder)

### 2. My Family — *Your home, supervised and connected.*
Combines home supervision, family scheduling, and smart alerts into one app. AI learns routines and sends intelligent notifications — security alerts to school-pickup reminders.
- Real-time home monitoring with smart device integration
- Shared family calendar and chore management
- AI-powered anomaly detection (e.g. unusual entry times)
- Secure family communication channels
- **CTA:** Meet My Family
- **Image:** happy family at home (placeholder)

### 3. Gozmar Freight — *Shipping and freight management, simplified.*
Streamlines the whole logistics chain from booking to delivery. AI optimizes routes, predicts delays, and automates documentation.
- Real-time shipment tracking and predictive ETAs
- Automated customs and compliance paperwork
- Intelligent route optimization
- Collaboration hub for shippers, carriers, and clients
- **CTA:** Optimise Logistics
- **Image:** logistics professionals by containers (placeholder)

### 4. Mylife — *Your personal organiser, productivity, and private planner.*
The ultimate AI-powered personal assistant: learns habits, prioritizes tasks, plans your day. Meeting notes to personal goals in one private space.
- AI-suggested daily schedules based on your energy levels
- Voice-activated task capture
- Private journal and goal tracking
- Cross-device sync with end-to-end encryption
- **CTA:** Plan with Mylife
- **Image:** person using smartphone (placeholder)

### 5. Gozmar Task — *Team task management, accelerated by AI.*
Helps teams collaborate effortlessly. AI prioritizes work, detects bottlenecks, suggests smarter workflows.
- AI-powered workload balancing
- Natural language task creation
- Kanban, list, and calendar views
- Real-time progress analytics
- **CTA:** Boost Team Productivity
- **Image:** diverse team collaborating (placeholder)

### 6. Grey Auction — *AI-powered auction and collaboration platform.*
Revolutionizes online bidding with intelligent automation: real-time auctions, transparent collaboration, secure transactions. AI predicts fair market value and prevents fraud.
- Live bidding with sub-second latency
- AI-driven price recommendations and fraud detection
- Multi-party collaboration tools (buyers, sellers, agents)
- Secure escrow and payment integration
- **CTA:** Start Bidding
- **Image:** people bidding / business meeting (placeholder)

---

## 5. Values (Why Choose Us)

1. **AI-First** — Every product is built around AI that learns and adapts.
2. **Security by Design** — Enterprise-grade encryption and privacy controls on all platforms.
3. **Global Reach, Local Touch** — Designed for the world, with deep understanding of diverse markets.
4. **Effortless UX** — Beautiful, intuitive interfaces that require no training.

---

## 6. Testimonials

1. *"Gozmar DMS cut our document retrieval time by 80%. It feels like magic."* — Sarah O., Operations Director
2. *"My Family gives me complete peace of mind when I'm away. The AI alerts are spot on."* — Daniel K., Parent
3. *"Gozmar Freight transformed our logistics. We now predict delays before they happen."* — Amara T., Supply Chain Manager

---

## 7. Contact & Legal

**Contact info (generic):** `info@gozmardynamics.com` · `+1 (800) 555-0123` · "Serving clients worldwide"

**Legal** lives in the Terms & Privacy modals in `index.html`. Summary structure:

*Terms & Conditions:* Acceptance · Use of Services · Intellectual Property · Limitation of Liability · Termination · Governing Law · Changes.

*Privacy Policy:* Information We Collect · How We Use Data · Data Sharing · Security · Your Rights · Cookies · Changes.

---

## 8. Technical Stack & Decisions

- **No framework, no build step** — plain HTML/CSS/JS, opens directly in a browser.
- **Icons:** Font Awesome 6 via CDN (`cdnjs`).
- **Images:** Unsplash `images.unsplash.com` URLs (placeholder — replace with licensed assets).
- **Animations:** Intersection Observer scroll-reveal + CSS transitions (respects `prefers-reduced-motion`).
- **Fonts:** system stack (zero webfont load).

### File structure
```
Gozmar-Dynamics-Website/
├── index.html          # markup + all copy + modals
├── css/
│   └── styles.css      # design tokens, layout, animations
├── js/
│   └── main.js         # nav, scrollspy, modals, form, reveal
└── PROJECT.md          # this file
```

---

## 9. Implemented Improvements (delta vs. original `Review.md`)

**Functions**
- Contact form: inline validation + success state (replaces `alert()`).
- Modal system: Escape to close, backdrop click, `aria-modal`, scroll lock.
- Scrollspy: active nav link highlights on scroll.
- Back-to-top button.
- Mobile nav: hamburger→X animation, closes on link click / Escape, body scroll lock.
- Newsletter signup in footer.

**UI/UX**
- `scroll-margin-top` so the fixed navbar no longer covers section headings.
- `loading="lazy"` on below-the-fold images.
- Focus-visible styles for keyboard navigation.
- Skip-to-content link.
- Semantic HTML5 (header/main/section/footer) + proper heading hierarchy.
- Consistent spacing/type scale via design tokens.

**Accessibility**
- `aria-label` on nav toggle, `aria-modal` on modals, associated form labels.
- `prefers-reduced-motion` disables animations for users who request it.

---

## 10. Decisions & Fixes Applied

1. **"Make it generic" enforced** — removed `+234`, `Lagos, Nigeria`, and *"Federal Republic of Nigeria / courts of Lagos"* that remained in the original code, contradicting the stated brief. Contact info and governing law are now neutral.
2. **Duplicate image fixed** — About and Gozmar Task shared the same Unsplash photo. About now uses a distinct team photo.
3. **Placeholder stats** — the stats band numbers (e.g. "6 Products", "99.9% Uptime") are marketing placeholders; replace with real metrics before launch.

---

## 11. Roadmap / Backlog (future work)

- [ ] Replace all Unsplash URLs with licensed, on-brand imagery (own product screenshots ideal).
- [ ] Wire contact form + newsletter to a real backend (Formspree, Resend, Supabase, etc.).
- [ ] Add a favicon, OG/social meta tags, and JSON-LD structured data for SEO.
- [ ] Add a product **overview grid** at the top of `#products` for quick navigation to the 6 blocks.
- [ ] Dark mode toggle (the design system already uses CSS tokens).
- [ ] FAQ section (accordion) for common product questions.
- [ ] Per-product detail pages or deeper anchor sub-nav.
- [ ] Replace Font Awesome CDN with inline SVG for a dependency-free build (optional).
- [ ] Real legal review of Terms & Privacy copy.
- [ ] Analytics (privacy-respecting, e.g. Plausible/Umami).

---

## 12. How to Run

Open `index.html` in any modern browser — no server or build required. For a live preview with auto-reload, run a static server, e.g.:

```bash
python -m http.server 8000   # then open http://localhost:8000
```

---

## 13. Admin CMS (content management)

A no-backend, vanilla-JS CMS drives all front-page content so the layout/markup in `index.html`/`styles.css` stays untouched.

- `js/cms-data.js` — single source of truth (`GOZMAR_DEFAULTS`): all 6 products + site sections (hero, about, stats, values, testimonials, FAQ, contact, footer).
- `js/cms.js` — front-end binder; applies the data model to `index.html` via existing selectors; persists to `localStorage` (`gozmar_cms_v1`). Cross-tab live update via `storage` event.
- `admin.html` + `css/admin.css` + `js/admin.js` — dashboard with one tab per item (6 products + 8 site sections). Each product tab edits: details/descriptions, media (hero + 3 gallery URLs with live thumbnail preview), feature list, and tiered pricing with **quick price correction** + **volume discount %** + **min seats** per tier. Top bar: Save / Reset / Export JSON / Import JSON. Live preview pane.
- `www.gozmardynamics.com` is wired as canonical, OG, and JSON-LD URL.

**Note:** storage is per-browser `localStorage` (no server). To share content across users/admins, connect to PocketBase (self-hosted on Coolify) — the admin UI and data model already isolate that behind `CMS.saveState`/`loadState`. Add admin auth before exposing `admin.html` publicly.

### Roadmap status (updated)
- [x] Per-product detail pages / in-page sections
- [x] Admin CMS with per-item tabs, media, tiered pricing + volume discounts
- [x] `www.gozmardynamics.com` wired (canonical/OG/JSON-LD)
- [ ] Replace Unsplash placeholders with licensed imagery (+ real `og-image.png`)
- [ ] Wire contact form + newsletter to a real backend
- [x] Move CMS storage to a shared backend (PocketBase) + add admin authentication
- [ ] Real legal review of Terms & Privacy
- [x] Analytics (Google Analytics � configure measurement ID in cms-config.js)
- [ ] Replace Font Awesome CDN with inline SVG (optional)

## 14. Deployment: Coolify + PocketBase (self-hosted CMS)

> **Full step-by-step deployment guide: see [`DEPLOYMENT.md`](DEPLOYMENT.md)**

Static site is hosted on **Coolify** from a Docker/Nginx container; content is edited in the admin dashboard and stored in **PocketBase** (self-hosted on Coolify). No GitHub Actions needed — content saves directly to PocketBase.

### Services on Coolify
| Service | Purpose | Type |
|---|---|---|
| Gozmar website | Static site (nginx) | Dockerfile (public GitHub repo) |
| PocketBase | CMS database + auth + API | One-click service |
| Uptime Kuma | Monitor website uptime | One-click service |
| Google Analytics | Visitor analytics | External (GA4) |

### Architecture
```
Visitors → nginx (static site) → reads CMS content from PocketBase API at runtime
Admin → admin.html → signs in with PocketBase → edits → saves to PocketBase
GitHub → source control only → auto-deploys via webhook on push
```

### Key files
- `js/cms-config.js` — PocketBase URL, collection name, Google Analytics ID. Empty `pocketbaseUrl` = **Local mode** (browser `localStorage` only).
- `js/cms.js` — `loadState`/`saveState` keep `localStorage` as offline fallback; `refreshState()` pulls from PocketBase (admin); `signIn()`/`signOut()` handle PocketBase auth.
- `admin.html` — authenticated admin login gate, backend mode indicator.
- `Dockerfile` + `nginx.conf` — serve the static site through Nginx on Coolify.
- `DEPLOYMENT.md` — complete step-by-step setup guide (9 phases, from repo visibility to custom domain).

### Flow
`Admin → Save → PocketBase (on Coolify)`. Visitors load the static site which reads content from PocketBase's API at runtime. No baking, no redeployment for content changes. Code changes (HTML/CSS/JS) auto-deploy via GitHub webhook.
