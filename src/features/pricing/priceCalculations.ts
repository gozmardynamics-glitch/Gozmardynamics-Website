import type { PricingTier } from "../../types/cms";

export function effectiveMonthly(t: PricingTier): string {
  const base = parseFloat(String(t.monthly).replace(/[^0-9.]/g, ""));
  const disc = parseFloat(t.volumeDiscount || "0");
  if (isNaN(base) || isNaN(disc) || disc <= 0) return t.monthly;
  const eff = base * (1 - disc / 100);
  return `$${eff.toFixed(2)}`;
}

export function priceMeta(t: PricingTier): string[] {
  const out: string[] = [];
  if (t.annual && t.annual !== t.monthly) out.push(`Annual: ${t.annual}`);
  if (parseFloat(t.volumeDiscount) > 0) out.push(`${t.volumeDiscount}% off (min ${t.minSeats || 1} seats)`);
  return out;
}
