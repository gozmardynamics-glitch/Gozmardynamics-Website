import * as React from "react";
import { Input } from "../../components/ui/Input";
import type { PricingTier } from "../../types/cms";

export function TierCard({
  tier, index, onChange, onRemoveFeature, onAddFeature,
}: {
  tier: PricingTier; index: number;
  onChange: (patch: Partial<PricingTier>) => void;
  onRemoveFeature: (i: number) => void;
  onAddFeature: () => void;
}) {
  const featured = index === 1;
  return (
    <div className={`rounded-2xl border p-4 ${featured ? "border-[#0071e3] shadow-[0_4px_14px_rgba(0,113,227,.12)]" : "border-[#d2d2d7]"}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold flex items-center gap-2">{tier.name || "Untitled"} <span className="text-xs text-[#86868b]">Tier {index + 1}</span></h3>
        {featured && <span className="text-[0.68rem] bg-[#0071e3] text-white px-2 py-1 rounded-full font-semibold">Featured</span>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Tier name" value={tier.name} onChange={(e) => onChange({ name: e.target.value })} />
        <Input label="Monthly" value={tier.monthly} onChange={(e) => onChange({ monthly: e.target.value })} placeholder="$29 / Custom" />
        <Input label="Annual" value={tier.annual} onChange={(e) => onChange({ annual: e.target.value })} />
        <Input label="Volume discount %" value={tier.volumeDiscount} onChange={(e) => onChange({ volumeDiscount: e.target.value })} hint="Bulk discount" />
        <Input label="Min seats" value={tier.minSeats} onChange={(e) => onChange({ minSeats: e.target.value })} />
        <Input label="CTA label" value={tier.cta} onChange={(e) => onChange({ cta: e.target.value })} />
      </div>
      <div className="mt-3">
        <div className="text-xs font-semibold mb-1.5">Features</div>
        <div className="space-y-2">
          {tier.features.map((f, i) => (
            <div key={i} className="flex gap-2">
              <input className="flex-1 rounded-lg border border-[#d2d2d7] px-3 py-2 text-sm focus:outline-none focus:border-[#0071e3]" value={f} onChange={(e) => {
                const next = [...tier.features]; next[i] = e.target.value; onChange({ features: next });
              }} />
              <button className="w-9 h-9 rounded-lg border border-[#d2d2d7] text-[#d70015] hover:bg-[#fff0f0]" onClick={() => onRemoveFeature(i)} aria-label="Remove feature">✕</button>
            </div>
          ))}
          <button className="rounded-lg border border-dashed border-[#0071e3] bg-[#e6f1ff] text-[#0071e3] px-3 py-2 text-sm font-semibold" onClick={onAddFeature}>+ Add feature</button>
        </div>
      </div>
    </div>
  );
}
