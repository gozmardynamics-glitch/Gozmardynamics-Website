/** wizard step defs (reusable) */
export const WIZARD_STEPS = [
  { key: "basics", label: "Basics", fields: ["title","tagline","summary","detailTitle","detailIntro"] },
  { key: "media", label: "Media & Features", fields: ["media.hero","media.gallery","features"] },
  { key: "pricing", label: "Pricing & Relations", fields: ["pricing.tiers","categoryId"] },
  { key: "publish", label: "Preview & Publish", fields: [] },
] as const;
