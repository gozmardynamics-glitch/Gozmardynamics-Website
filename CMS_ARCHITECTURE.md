# CMS Dashboard — Comprehensive Architecture Plan

> **Gozmar Dynamics CMS v2 — Scalable Frontend Architecture**
> Next.js 14+ · TypeScript · Tailwind CSS · Zustand + TanStack Query · PocketBase
> Replaces the vanilla `admin.html` with a modular, production-grade dashboard without touching front-end markup contracts in `index.html`.

---

## 1. System Overview

```
Visitors ──▶ Static Site (index.html / Next.js public) ──▶ PocketBase API (read public)
Admin    ──▶ /admin (Next.js App Router) ──▶ PocketBase API (auth + write) ──▶ Draft → Preview → Publish
                                      │
                                      └─▶ localStorage fallback (offline) + Export/Import JSON
```

**Core principle:** The consumer site never imports admin code. `js/cms.js` remains the front-end binder — the new dashboard only writes to `cms_content.data` (same shape as `js/cms-data.js`). Migration is zero-downtime.

### Design Goals
| Goal | How |
|---|---|
| **Every section is CRUD** | Each `site.*` + `products.*` is a resource with `GET/PUT` + optimistic update + revert |
| **Non-technical UX** | Viewing vs Editing is a single toggle; edit controls sit next to content (Component Closeness) |
| **Safety** | Draft & Preview (staging) + Publish Live (atomic PocketBase PATCH) + Version history |
| **Scale** | Feature-sliced folders, strict types, API abstraction — new section = 1 folder + 1 schema |

---

## 2. UI/UX — Wireframe Concepts

### 2.1 Global Shell

```
┌─ Topbar (60px, ink #1d1d1f) ────────────────────────────────────────────┐
│ [◼ Gozmar CMS]  [● Unsaved] [View site ↗] [Save to DB] [Sign out]       │
├──────────┬────────────────────────────┬──────────────────────────────────┤
│ Sidebar  │  Canvas (Current ↔ Edit)   │  Live Preview (sticky)           │
│ 230px    │  760px max, scroll-y       │  360px, iframe or DOM mirror     │
│ Product  │                            │                                  │
│  DMS ●   │  ┌ SectionBlock ────────┐  │  ┌ PreviewCard ─────────┐       │
│  Family  │  │ h2 Details      [Edit]│  │  │ tagline — title       │       │
│  Freight │  │ tagline [___________] │  │  │ features • • •        │       │
│  Mylife  │  │ title   [___________] │  │  │ ┌ price-grid ──────┐  │       │
│  Task    │  │ summary [textarea  ]  │  │  │ │ Starter  Pro  Ent │  │       │
│  Auction │  └───────────────────────┘  │  └───────────────────────┘       │
│ ───────  │  [Toast: Changes saved ✓]  │                                  │
│ Site     │                            │                                  │
│  Hero    │  [Draft ▼] [Preview] [Publish Live]                            │
│  About   │                            │                                  │
└──────────┴────────────────────────────┴──────────────────────────────────┘
```

Responsive: `>1100px` 3-col · `900-1100px` 2-col (preview drawer) · `<900px` single col + bottom preview sheet.

### 2.2 Dual-View Interface (per section)

**State machine:**

```
VIEW ──(click Edit / pencil)──▶ EDITING ──(Save ✓ / Cancel ✕)──▶ VIEW
 │                                   │
 │  Visual contrast:                 │  Autosave debounce 600ms
 │  VIEW  = muted border, gray bg     │  Dirty flag in topbar
 │  EDIT  = blue ring, white card,   │  Instant preview sync
 │          amber "Editing" badge     │  Error → inline + toast
```

**Component:** `features/sections/SectionBlock.tsx` at `src/features/sections/SectionBlock.tsx:1`

```tsx
<SectionBlock
  title="Details & descriptions"
  badge="Editing" // or hidden in VIEW
  mode={mode} // 'view' | 'edit'
  onEdit={() => setMode('edit')}
  onSave={handleSave} // validates, persists, shows toast
  onCancel={() => setMode('view')}
>
  {mode === 'view' ? <CurrentStateView data={p} /> : <InlineEditingForm data={p} />}
  <MediaHub visible={mode==='edit'} value={p.media.hero} onChange={...} />
</SectionBlock>
```

**Rules:**
- Edit button sits 8px right of the section `h2` (Component Closeness).
- Media uploader sits directly under the field it controls — never in a separate tab.
- Pricing cards are linked: changing `Pro.monthly` updates the preview tier instantly (real-time).

### 2.3 Visual Media Hub

```
┌─ MediaHub ──────────────────────────────────────────┐
│  URL [ https://...______________ ] [Upload] [Paste] │
│  ┌──────────────┐  Alt text [________________]       │
│  │ Drop here or │  Hint: describes image for SEO    │
│  │ click to     │  [✓ Valid] [✗ Invalid URL]        │
│  │ upload  (preview thumb 120×76)                   │
│  └──────────────┘  Drag & drop → preview + validate  │
└─────────────────────────────────────────────────────┘
```

- Accepts: URL paste, file drop (converts to objectURL or uploads to PocketBase `files`), clipboard.
- Shows: thumbnail, alt-text input, validation, remove.
- Helper: `utils/image.ts` — `validateImageUrl`, `compressImage`, `generateAltTextHint`.

### 2.4 Connected Pricing Cards

```
┌ Quick price correction (amber #fff8e6) ───────────┐
│ Starter [$—]  Pro [$—]  Enterprise [Custom]          │  ← edits tier.monthly live
└────────────────────────────────────────────────────┘
┌ TierCard (featured = blue ring) ─────────────────┐
│ Tier name [Pro]  Monthly [$29]  Annual [$290]     │
│ Volume % [15]  Min seats [10]  CTA [Start trial]  │
│ Features: [Up to 50 users] [✕]  [+ Add]             │  ← each feature is editable
└────────────────────────────────────────────────────┘
```

All tiers share `services/pricing.ts` for computed display: `effectivePrice = monthly * (1 - volumeDiscount/100)` shown as helper text.

### 2.5 Product Update Workflow — Step-by-Step Wizard

```
Step 1: Basics  →  Step 2: Media & Features  →  Step 3: Pricing & Relations  →  Step 4: Preview & Publish
 ●━━━━━━━●━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━●
 [Name, tagline, summary]  [Hero+gallery, features]  [Tiers, category link, discounts]  [Draft toggle → Preview iframe → Publish Live]
```

- **Wizard component:** `features/products/ProductWizard.tsx:1`
- **Relationship Mapping:** dropdown `Link to category` = `site.values.items[]` + `pricing.tiers[]` selector (simple `<select>` bound to `product.categoryId`).
- **Draft & Preview:** `stores/draftStore.ts` keeps `draft` vs `published`. Toggle `isDraft` — Preview renders `draft` in a sandboxed iframe (`/preview?draft=1`) that reuses `cms.js` binder. `Publish` = `PATCH cms_content` + `cacheLocal` + toast + `storage` event.
- **Validation:** Zod schema per step; blocked Next button shows inline errors. Loading spinner on Publish; success alert `✓ Published live`; error alert with retry.

### 2.6 Instant Feedback System

| Event | UI |
|---|---|
| Save / Publish | Toast bottom-center, 1.8s, `✓ Changes saved` (ink pill) + topbar `● Unsaved` clears |
| Error | Inline field error (red border + hint) + toast `✗ Save failed` |
| Loading | Button spinner `<i class="fa-spinner fa-spin">` disabled state |
| Draft | Amber badge `Draft` + toggle `Preview staging` |
| Viewing vs Editing | `Viewing` = gray `50%` opacity badge · `Editing` = blue `100%` + focus ring |

---

## 3. Data Model & API

### 3.1 TypeScript Types (`types/cms.ts`)

```ts
type Media = { hero: string; gallery: [string,string,string]; altTexts?: Record<string,string> }
type PricingTier = { name:string; monthly:string; annual:string; volumeDiscount:string; minSeats:string; features:string[]; cta:string }
type Product = { navLabel:string; tagline:string; title:string; summary:string; ctaPrimary:string; detailTitle:string; detailIntro:string; detailHeading:string; detailParagraphs:[string,string]; features:string[]; media:Media; pricing:{tiers:PricingTier[]} }
type SiteSection = Hero|About|Stats|Values|Testimonials|FAQ|Contact|Footer
type CMSState = { products: Record<string,Product>; site: SiteState }
type DraftState = { draft: CMSState; published: CMSState; isDraft:boolean }
```

Mirrors `js/cms-data.js` exactly — no backend migration needed.

### 3.2 Services (`services/cms.ts`, `services/pocketbase.ts`)

```ts
// services/cms.ts — single abstraction, swappable backend
export const cmsService = {
  load(): Promise<CMSState>,
  save(state: CMSState): Promise<boolean>,
  clear(): Promise<boolean>,
  refresh(): Promise<CMSState|null>, // PocketBase → cacheLocal + applyState
  signIn(email,password): Promise<Session>,
  signOut(): Promise<void>,
}
// services/pocketbase.ts — handles pbUrl(), pbHeaders(), fetch with auth, retry, timeout
```

`load()` tries PocketBase if `CMS_CONFIG.pocketbaseUrl`, else localStorage. All callers use `cmsService` — zero direct `fetch` in components.

### 3.3 State Management

```
Zustand: useCMSStore (CMSState + dirty + mode)  — persisted to localStorage via middleware
TanStack Query: useCMSQuery(['cms']) for server state, optimistic updates, background refetch, cross-tab sync via `storage` event
Draft: useDraftStore (draft/published/isDraft) — publish = promote draft → published + cmsService.save(published)
```

---

## 4. Clean Folder Structure (React/Next.js style)

```
Gozmar-Dynamics-Website/
├── CMS_ARCHITECTURE.md          # this file
├── cms-wireframes.html          # interactive wireframe preview (open in browser)
├── src/                         # scalable dashboard source (Next.js-ready)
│   ├── app/                     # Next.js App Router (or Vite entry)
│   │   ├── layout.tsx           # admin shell: Topbar + Sidebar + Preview
│   │   ├── page.tsx             # redirects to /admin/products/dms
│   │   ├── globals.css          # Tailwind + design tokens
│   │   └── admin/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── products/[key]/page.tsx   # dynamic product editor
│   │       ├── site/[section]/page.tsx   # dynamic site section editor
│   │       └── preview/page.tsx          # staging iframe
│   ├── components/              # reusable UI (no business logic)
│   │   ├── ui/
│   │   │   ├── Button.tsx       # variants: primary/outline/ghost + loading
│   │   │   ├── Input.tsx        # text/url/number + error + hint
│   │   │   ├── Textarea.tsx
│   │   │   ├── Card.tsx         # SectionBlock, TierCard
│   │   │   ├── Badge.tsx        # Editing/Viewing/Draft
│   │   │   ├── Toast.tsx        # global toast provider
│   │   │   ├── Spinner.tsx
│   │   │   └── Alert.tsx        # success/error inline
│   │   ├── layout/
│   │   │   ├── Topbar.tsx       # mode + dirty + actions
│   │   │   ├── Sidebar.tsx      # product + site nav (active state)
│   │   │   └── PreviewPane.tsx  # live preview mirror
│   │   └── cms/
│   │       ├── MediaHub.tsx     # drag-drop + preview + alt-text
│   │       └── InlineEditToggle.tsx # View ↔ Edit switch
│   ├── features/                # business features (compose components + hooks)
│   │   ├── sections/
│   │   │   ├── SectionBlock.tsx      # dual-view container
│   │   │   ├── CurrentStateView.tsx  # read-only live data
│   │   │   └── InlineEditingForm.tsx # form + validation
│   │   ├── products/
│   │   │   ├── ProductWizard.tsx     # 4-step wizard
│   │   │   ├── ProductForm.tsx       # details/descriptions
│   │   │   ├── FeaturesEditor.tsx    # string list editor
│   │   │   └── wizardSteps.ts        # step defs + Zod schemas
│   │   ├── pricing/
│   │   │   ├── PricingEditor.tsx     # quick correction + tier cards
│   │   │   ├── TierCard.tsx          # single tier with features
│   │   │   └── priceCalculations.ts  # effective price helpers
│   │   ├── media/
│   │   │   └── MediaHubFeature.tsx   # wired MediaHub + validation
│   │   └── draft/
│   │       ├── DraftToggle.tsx       # Draft ↔ Preview switch
│   │       └── PublishBar.tsx        # Preview + Publish Live
│   ├── services/                # API + persistence
│   │   ├── cms.ts               # cmsService (load/save/refresh)
│   │   ├── pocketbase.ts        # pbUrl, pbHeaders, fetch helpers
│   │   └── api.ts               # re-export + types
│   ├── stores/                  # Zustand stores
│   │   ├── cmsStore.ts          # CMSState, dirty, currentPath
│   │   └── draftStore.ts        # draft/published/isDraft
│   ├── hooks/                   # reusable hooks
│   │   ├── useSection.ts        # getPath/setPath for a section
│   │   ├── useDirty.ts          # dirty flag + beforeunload guard
│   │   ├── usePreview.ts        # sync preview on state change
│   │   └── useMediaUpload.ts    # drag-drop + validation
│   ├── utils/
│   │   ├── image.ts             # validateImageUrl, compress, alt hint
│   │   ├── validation.ts        # Zod schemas for products/site
│   │   └── cn.ts                # clsx/twMerge helper
│   ├── types/
│   │   └── cms.ts               # Product, CMSState, DraftState, etc.
│   └── lib/
│       └── config.ts            # reads window.CMS_CONFIG, env
├── js/                          # existing front-end binder (unchanged)
│   ├── cms-data.js              # GOZMAR_DEFAULTS (source of truth)
│   ├── cms.js                   # applyState, loadState, saveState
│   ├── cms-config.js            # pocketbaseUrl, collection, GA
│   ├── admin.js                 # legacy admin (kept, v2 is src/)
│   └── main.js
├── css/
│   ├── styles.css               # front-end tokens
│   └── admin.css                # legacy admin styles (v2 uses Tailwind)
└── admin.html                   # legacy entry (v2 entry is src/app/admin)
```

**Import rule:** `components/*` never imports from `features/*`. `features/*` composes `components/*` + `services/*` + `stores/*`. `services/*` never imports from `components/*`.

### File Naming
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Services/utils: `camelCase.ts`
- Types: `cms.ts` (singular domain)

---

## 5. Component Breakdown

| Component | Path | Responsibility |
|---|---|---|
| `Button` | `src/components/ui/Button.tsx:1` | Variants primary/outline/ghost, loading spinner, disabled |
| `Input/Textarea` | `src/components/ui/Input.tsx:1` | Controlled input, error, hint, focus ring |
| `Card/SectionBlock` | `src/components/ui/Card.tsx:1` | Section container with badge + Edit/Save/Cancel |
| `MediaHub` | `src/components/cms/MediaHub.tsx:1` | Drag-drop, URL, thumbnail, alt-text |
| `SectionBlock` (feature) | `src/features/sections/SectionBlock.tsx:1` | Dual-view orchestrator (view vs edit) |
| `ProductWizard` | `src/features/products/ProductWizard.tsx:1` | 4-step wizard with validation + progress |
| `PricingEditor` | `src/features/pricing/PricingEditor.tsx:1` | Quick correction + tier cards (real-time) |
| `TierCard` | `src/features/pricing/TierCard.tsx:1` | Single tier + features list |
| `DraftToggle/PublishBar` | `src/features/draft/PublishBar.tsx:1` | Draft toggle, Preview iframe, Publish Live |
| `Topbar/Sidebar/PreviewPane` | `src/components/layout/*.tsx:1` | Shell layout |
| `cmsService` | `src/services/cms.ts:1` | Load/save/refresh abstraction |
| `useSection` | `src/hooks/useSection.ts:1` | Path-based state access |
| `useMediaUpload` | `src/hooks/useMediaUpload.ts:1` | Drag-drop logic |

---

## 6. CRUD Flow (per section)

```
1. Read   — useCMSQuery(['cms', path]) → getPath('products.dms') → CurrentStateView
2. Edit   — setMode('edit') → InlineEditingForm (controlled inputs → setPath → touch → dirty)
3. Update — onSave: Zod validate → cmsStore.set → optimistic preview → cmsService.save → toast
4. Delete — list editors (features, stats) have ✕ per item → splice → touch → save
5. Create — ProductWizard step 1 creates products[newKey] with defaults → save
6. Revert — Reset button → CMS.clearState() → GOZMAR_DEFAULTS → toast
```

All writes debounce 600ms for preview; Save is immediate.

---

## 7. Draft & Preview System

```
Admin edits → draftStore.draft (local, dirty)
          → Preview pane shows draft (iframe srcdoc with cms.js applyState(draft))
          → Toggle "Preview staging" opens /admin/preview (full-page mirror)
          → Publish Live → draft → published → cmsService.save(published) → visitors see it
          → Export/Import JSON snapshots for backup
```

No live break: visitors always read `published` until Publish.

---

## 8. Migration Path

1. Keep `admin.html` + `js/admin.js` working (no regression).
2. Scaffold `src/` as above — it reuses `GOZMAR_DEFAULTS` shape, so no data migration.
3. When ready, point `/admin` to `src/app/admin` (Next.js) and deprecate `admin.html` or keep as fallback.
4. Add `src/lib/config.ts` to read `window.CMS_CONFIG.pocketbaseUrl` so Local vs PocketBase mode is identical.

---

## 9. How to Run (v2 scaffold)

```bash
# This scaffold is framework-agnostic — wire it to Next.js or Vite:
npx create-next-app@latest . --typescript --tailwind --app
# then move src/ in, npm install zustand @tanstack/react-query zod

# Or preview the wireframes now (no build):
open cms-wireframes.html
open CMS_ARCHITECTURE.md
```

All `src/` files are self-contained TypeScript React components — copy into any React/Next.js project and they compile.
