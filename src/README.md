# src/ — Scalable CMS Dashboard Scaffold

> Next.js 14+ / Vite + TypeScript + Tailwind — feature-sliced architecture for Gozmar CMS.
> See `../CMS_ARCHITECTURE.md` for the full system design and `../cms-wireframes.html` for interactive wireframes.

## Quick start

```bash
# Option A: Next.js
npx create-next-app@latest . --typescript --tailwind --app
npm install zustand @tanstack/react-query zod
# then this src/ is already in place — run:
npm run dev
# open http://localhost:3000/admin

# Option B: Vite
npm create vite@latest . -- --template react-ts
npm install zustand @tanstack/react-query zod tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm run dev
```

## What's inside

- `app/` — App Router shell (Topbar + Sidebar + PreviewPane)
- `components/ui/` — Button, Input, Card/SectionBlock, Toast, Alert (no business logic)
- `components/cms/` — MediaHub (drag-drop + alt-text), InlineEditToggle
- `features/sections/` — dual-view SectionBlock (CurrentStateView ↔ InlineEditingForm)
- `features/products/` — ProductWizard (4 steps: Basics → Media → Pricing → Publish)
- `features/pricing/` — PricingEditor (quick correction + TierCard, real-time preview)
- `features/draft/` — PublishBar (Draft toggle → Preview iframe → Publish Live)
- `services/` — cmsService abstraction (PocketBase swappable with localStorage fallback)
- `stores/` — cmsStore, draftStore (Zustand-ready, vanilla fallback included)
- `hooks/` — useSection, useDirty, usePreview, useMediaUpload
- `utils/` — image helpers, validation (Zod-ready), cn
- `types/cms.ts` — CMSState mirrors `js/cms-data.js` exactly
- `lib/config.ts` — reads `window.CMS_CONFIG`

## Migration

The scaffold reuses the existing `GOZMAR_DEFAULTS` shape — no backend migration. Point `/admin` to `src/app/admin` when ready; keep `admin.html` as fallback.

## Wireframes

Open `../cms-wireframes.html` in a browser — interactive dual-view, Media Hub, Pricing Cards, and Wizard previews.
