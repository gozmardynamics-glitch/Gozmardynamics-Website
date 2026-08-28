/** Zod schemas — lightweight. If zod not installed, these are plain validators. */
import type { CMSState, Product, PricingTier } from "../types/cms";

export type FieldError = { path: string; message: string };

export function validateProduct(p: Product): FieldError[] {
  const errs: FieldError[] = [];
  if (!p.title.trim()) errs.push({ path: "title", message: "Title is required" });
  if (!p.tagline.trim()) errs.push({ path: "tagline", message: "Tagline is required" });
  if (!p.summary.trim()) errs.push({ path: "summary", message: "Summary is required" });
  if (p.features.length === 0) errs.push({ path: "features", message: "Add at least one feature" });
  p.pricing.tiers.forEach((t, i) => {
    if (!t.name.trim()) errs.push({ path: `pricing.tiers[${i}].name`, message: "Tier name required" });
    if (t.volumeDiscount && isNaN(Number(t.volumeDiscount))) errs.push({ path: `pricing.tiers[${i}].volumeDiscount`, message: "Must be a number" });
  });
  return errs;
}

export function validatePricingTier(t: PricingTier): FieldError[] {
  const errs: FieldError[] = [];
  if (!t.name.trim()) errs.push({ path: "name", message: "Required" });
  if (!t.monthly.trim()) errs.push({ path: "monthly", message: "Monthly price required" });
  return errs;
}

export function validateCMSState(s: CMSState): FieldError[] {
  const errs: FieldError[] = [];
  for (const [k, p] of Object.entries(s.products)) {
    validateProduct(p).forEach((e) => errs.push({ path: `products.${k}.${e.path}`, message: e.message }));
  }
  if (!s.site.hero.title.trim()) errs.push({ path: "site.hero.title", message: "Hero title required" });
  return errs;
}
