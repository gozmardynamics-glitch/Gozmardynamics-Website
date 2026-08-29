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
| 5 | Audience slideshow | `audiences` | Auto-sliding carousel (7s): image left, copy + floating chips right, blurred backdrop |
| 6 | Why Choose Us / Values | `values` | 4 cards, dark section |
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

## 11. Roadmap / Backlog (updated 2026-08-28 — post scalable CMS)

**Completed in this iteration (§1–6)**
- [x] **Scalable Multi-Product:** ONE reusable template (`js/cms.js:productTemplateHTML`) — `index.html#productsMount` renders unlimited products from `js/cms-data.js` (no code change for new products).
- [x] **Backend-driven frontend:** All visible fields now from CMS — name/tagline, `commerce.price|compareAtPrice|badge|stockStatus`, `taxonomy.category|tags`, `specifications[]`, `features|featureCards`, `media.images[]` with `featuredIndex`, `banners`, `pricing.tiers[]`. Optional fields gracefully hidden (`commerceHTML/taxonomyHTML/specsHTML` guards).
- [x] **Well-labelled Admin:** `js/admin.js:renderProduct` groups into Basic Info / Pricing / Images / Details / Visibility with explicit labels (e.g. “Product Title — frontend H2 & nav”).
- [x] **Gallery System:** `media.images[]` unlimited + `★ Set Featured` (card thumbnail & hero + slider). `js/cms.js:getFeaturedSrc/getGalleryUrls` + `js/admin.js:galleryImagesEditor` — active for all 6 existing (migrated) and new products. `normalizeProduct()` migrates legacy `hero/gallery`.
- [x] **Admin UI overhaul:** `css/admin.css` warm aurora gradient topbar, card lift, focus glow, 200ms transitions, toast success/error, spinner on Save, `confirm()` on delete/discard, tab count + draft/archived badges, scrollbar polish.
- [x] **QA sweep:** Fixed `CMS.getSession` string handling (was `access_token` check), blob URL revoke, wizard `media.images` init, missing `compareAtPrice` display, dead `src/` react scaffold excluded from prod.

**Still pending — do next**
- [ ] Replace Unsplash placeholders with licensed on-brand imagery (+ real `og-image.png`).
- [ ] Wire contact form + newsletter to real backend (Formspree/Resend/PocketBase).
- [ ] Real legal review of Terms & Privacy copy.
- [ ] Replace Font Awesome CDN with inline SVG (optional, dependency-free).
- [ ] Add PocketBase image file uploads (currently URL/blob; move to `pb.files` for persistence).
- [ ] Add product search/filter in admin when >15 products (tabs scroll).
- [ ] E2E Cypress/Playwright: automate the create→featured→save→view flow (manual E2E verified via `e2e-test.js`).

---

## 12. How to Run

Open `index.html` in any modern browser — no server or build required. For a live preview with auto-reload, run a static server, e.g.:

```bash
python -m http.server 8000   # then open http://localhost:8000
```

---

## 13. Admin CMS (content management) — scalable, backend-driven

**Architecture now:** ONE product template, unlimited products, fully editable from admin. No hardcoding.

- `js/cms-data.js` — source of truth (`GOZMAR_DEFAULTS`). Each product: `title/navLabel/tagline`, `commerce{price,compareAtPrice,badge,stockStatus}`, `taxonomy{category,tags}`, `specifications[]`, `features|featureCards`, `media{images:[{src,alt,featured}],featuredIndex,hero,gallery,slider}`, `banners`, `pricing.tiers[]`, `status`. `normalizeProduct()` migrates legacy `hero/gallery` → `images[]` so existing `localStorage`/PocketBase data is preserved.
- `js/cms.js` — `productTemplateHTML(key,product,index)` is the single source (used by every product). Helpers: `getFeaturedSrc()`, `getGalleryUrls()`, `commerceHTML()`, `taxonomyHTML()`, `specsHTML()` hide empty sections. `renderAllProductsDynamic()` mounts into `index.html#productsMount` (backend-driven); fallback patches legacy static articles. `renderSlider()` now reads `media.images[]`; `setMedia()` syncs featured.
- `admin.html` + `css/admin.css` + `js/admin.js` — Dashboard: tabs show `Products (n)` + draft/archived hints. Per-product editor grouped **Basic Info / Pricing / Images / Details / Visibility** with well-labelled fields (e.g. “Product Title — frontend H2”). Gallery: unlimited images, drag-drop/file upload, `★ Set Featured`, alt text, reorder, confirm on delete. `Duplicate` + `Delete product` (confirm). Top bar: Draft toggle → Preview staging → Publish Live, Save (spinner), Reset/Export/Import with confirm/toast. Live preview pane. Visual overhaul: gradient ink topbar, lift on hover, focus glow, toast variants, pulse on dirty.
- `www.gozmardynamics.com` wired as canonical/OG/JSON-LD.

**Note:** Empty `pocketbaseUrl` in `js/cms-config.js` = Local mode (`localStorage` only). With PocketBase set, `CMS.saveState` → `pb.files` (image blob URLs currently local; migrate to file upload for persistence).

### Roadmap status (updated 2026-08-28)
- [x] Per-product detail pages + scalable single template
- [x] Admin CMS with grouped labelled sections, gallery featured, commerce/taxonomy/specs, status
- [x] `www.gozmardynamics.com` wired (canonical/OG/JSON-LD)
- [x] Backend-driven frontend (every visible element from CMS, optional hide)
- [x] PocketBase + auth + localStorage fallback
- [x] Analytics (Google Analytics — configure in `cms-config.js`)
- [ ] Replace Unsplash placeholders with licensed imagery (+ real `og-image.png`)
- [ ] Wire contact form + newsletter to real backend
- [ ] Real legal review of Terms & Privacy
- [ ] Replace Font Awesome CDN with inline SVG (optional)
- [ ] PocketBase file upload for gallery persistence (currently URL/blob)

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
