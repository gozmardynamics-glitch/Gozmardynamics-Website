# DESIGN.md — Gozmar Dynamics visual system

> Recorded from the built implementation ("Warm Aurora" — bold extension of the
> Apple-minimal incumbent, user-pinned brief). Ground truth lives in
> `css/styles.css`; this file documents it.

## World

Enterprise AI that feels human: the monochrome Apple skeleton wrapped in a
living aurora of electric blue, violet, and warm amber. White/light surfaces
carry layered depth; one dark ink section (`#values`, footer) paces the scroll.

## Color

| Role | Value |
|---|---|
| Base light | `#ffffff`, wash `#f5f5f7`, hero wash `#f7f9ff` |
| Ink | `#1d1d1f` (dark sections: `#14172a → #0d0f1d`, footer `#16182b → #0d0f1d`) |
| Primary accent | `#0071e3` (deep edge `#0052a8`, light `#5ac8fa`) |
| Violet | `#7c3aed` |
| Warm accents | amber `#f59e0b`, coral `#fb7185` (glows, icon chips, note icons — never body text) |
| Gradient set | `--gradient` blue→cyan; `--gradient-bold` blue→violet→cyan; `--gradient-warm` amber→coral |

Strategy: Committed — gradients own regions (hero field, CTA panel, borders,
icon chips), never body copy. Gradient *text* is reserved for the brand accent
(hero `<em>`, stat numbers, tier prices) — the pre-existing identity.

## Depth

Layered shadows with real offset + blur (`--shadow-sm/md/lg`), plus tinted
`--shadow-blue` / `--shadow-warm` glows on interactive and featured elements.
Section surfaces carry faint radial aurora tints (blue on odd products, warm on
even; FAQ, contact, media placeholders). Images sit on blurred gradient beds
(`.product-image::before`, `.about-image::before`).

## Type

System stack (unchanged). H1 clamp 2.5→4rem with `text-wrap: balance`;
H2 clamp 1.9→2.6rem, balanced. Gradient ink on hero `<em>` with slow
`gradientShift` (280% background-size, 9s).

## Buttons — 3D press pills

`linear-gradient(180deg, …)` face + `inset` top highlight + hard colored bottom
edge (`0 4px 0 var(--accent-deep)`) + tinted glow. Hover lifts (−2px, bigger
edge + glow); active presses (+2px, edge collapses). Variants: `btn-primary`,
`btn-outline` (light 3D), `btn-light`/`btn-ghost` (on gradient panels),
`nav-cta`, `back-to-top` — all share the grammar.

## Hero (first viewport)

Aurora field: three drifting blurred orbs (blue 20s, violet 26s reverse, warm
24s) over a dot grid masked by radial gradient. Left: badge pill → balanced H1
→ subcopy → dual 3D CTAs. Right (≥1100px): three floating glass chips
(`backdrop-filter` blur, staggered `floaty` 7s, delays −2.4s/−4.8s) with
gradient icon tiles (blue, violet, warm) — DMS / Freight / Task micro-copy.

## Sections

- **Rhythm:** `--section-pad: clamp(56px, 7vw, 76px)` (down from 100px);
  product articles add +16px bottom for seam breathing.
- **Stats:** elevated white cards on a `#f7f9ff` wash; count-up animation
  (ease-out cubic 1.4s, exact final string restored; reduced-motion safe).
- **Trust strip:** integration icons (Slack, Microsoft, Google, iOS, Android,
  Windows) — uppercase micro-title, muted, hover lift.
- **Values (dark ink):** aurora corner glows, glass cards, per-card gradient
  icon chips (blue / violet / cyan / warm).
- **Testimonials:** white cards, oversized muted quote glyph, hover lift.
- **FAQ:** explicit 2×2 grid (1-col ≤900px), gradient +/− chips, FAQ→contact
  CTA line.
- **Contact:** two columns — form card (1.15fr) + centered info card (0.85fr)
  with warm corner glow, icon chips, divider note.
- **CTA band:** rounded gradient panel (blue→violet) with warm/cyan corner
  glows, white 3D + ghost buttons. Footer: gradient hairline top edge.

## Motion

One system: reveals (opacity + 28px rise + 6px blur, `cubic-bezier(0.16,1,0.3,1)`,
0.7s), hero ambient drift/float, gradient shift, count-up, hover lifts. All
disabled under `prefers-reduced-motion`.

## Dark mode

Token-driven (`[data-theme="dark"]`); glass chips and hero badge get dark
overrides; shadows deepen. All components inherit.

## Responsive

1100px: hero chips hide. 900px: grids collapse to 1 column, contact stacks.
768px: sections 52px, mobile nav drawer, stats 2×2, hero auto-height.

## Boundaries

- Gradient text only on the three brand surfaces listed above; new emphasis
  uses weight/size.
- No em-accent borders on cards; card shadows always offset+blurred.
- Product detail media are CMS placeholders (`data-field`) — admins upload
  real screenshots via `admin.html`.
