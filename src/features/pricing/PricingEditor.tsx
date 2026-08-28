import * as React from "react";
import { TierCard } from "./TierCard";
import { Badge } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import type { Pricing } from "../../types/cms";

/**
 * Connected Pricing Cards — quick correction + full tier editing.
 * Changes reflect in preview in real-time (parent passes pricing + onChange).
 */
export function PricingEditor({ pricing, onChange }: { pricing: Pricing; onChange: (p: Pricing) => void }) {
  function updateTier(i: number, patch: any) {
    const next = { ...pricing, tiers: pricing.tiers.map((t, idx) => (idx === i ? { ...t, ...patch } : t)) };
    onChange(next);
  }
  return (
    <div className="space-y-4">
      {/* Quick price correction — amber callout, Component Closeness: price edits directly above tier cards */}
      <div className="rounded-2xl bg-[#fff8e6] border border-[#ffd60a] p-4">
        <div className="font-bold flex items-center gap-2 text-sm"><i className="fas fa-bolt" /> Quick price correction</div>
        <p className="text-xs text-[#86868b] mb-3">Update any tier’s monthly price instantly — reflected in preview.</p>
        <div className="grid grid-cols-3 gap-3">
          {pricing.tiers.map((t, i) => (
            <Input key={i} label={`${t.name} — Monthly`} value={t.monthly} onChange={(e) => updateTier(i, { monthly: e.target.value })} />
          ))}
        </div>
      </div>
      {pricing.tiers.map((t, i) => (
        <TierCard
          key={i}
          tier={t}
          index={i}
          onChange={(patch) => updateTier(i, patch)}
          onRemoveFeature={(fi) => updateTier(i, { features: t.features.filter((_, idx) => idx !== fi) })}
          onAddFeature={() => updateTier(i, { features: [...t.features, ""] })}
        />
      ))}
    </div>
  );
}
