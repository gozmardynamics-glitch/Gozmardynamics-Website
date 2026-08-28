import * as React from "react";
import { Button } from "../../components/ui/Button";
import { Input, Textarea } from "../../components/ui/Input";
import { Alert, Spinner } from "../../components/ui/Alert";
import { MediaHub } from "../../components/cms/MediaHub";
import { PricingEditor } from "../pricing/PricingEditor";
import type { Product } from "../../types/cms";
import { validateProduct } from "../../utils/validation";

type Step = 1 | 2 | 3 | 4;

const STEPS: { n: Step; label: string; desc: string }[] = [
  { n: 1, label: "Basics", desc: "Name, tagline, summary" },
  { n: 2, label: "Media & Features", desc: "Images + feature list" },
  { n: 3, label: "Pricing & Relations", desc: "Tiers + category link" },
  { n: 4, label: "Preview & Publish", desc: "Draft → Preview → Live" },
];

/**
 * Step-by-Step Wizard for product rollouts.
 * Guided multi-step form + Relationship Mapping (category dropdown) + Draft & Preview toggle.
 */
export function ProductWizard({
  product, onChange, onSave, categories, saving, error,
}: {
  product: Product;
  onChange: (p: Product) => void;
  onSave: (publish: boolean) => void; // publish=true → Publish Live
  categories: { id: string; label: string }[];
  saving?: boolean;
  error?: string;
}) {
  const [step, setStep] = React.useState<Step>(1);
  const errs = validateProduct(product);
  const canNext = errs.length === 0;

  return (
    <div className="rounded-2xl border border-[#d2d2d7] bg-white overflow-hidden">
      {/* Progress */}
      <div className="flex items-center gap-2 px-5 py-4 bg-[#fbfbfd] border-b border-[#d2d2d7] overflow-x-auto">
        {STEPS.map((s) => (
          <React.Fragment key={s.n}>
            <button onClick={() => setStep(s.n)} className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${step === s.n ? "bg-[#0071e3] text-white" : step > s.n ? "bg-[#e6f5ec] text-[#0a7a3a] border border-[#b7e5c7]" : "bg-white border border-[#d2d2d7]"}`}>
              <span className={`w-6 h-6 rounded-full grid place-items-center text-xs ${step === s.n ? "bg-white text-[#0071e3]" : "bg-white border"}`}>{s.n}</span>
              <span><span className="hidden sm:inline">{s.label}</span><span className="sm:hidden">{s.label.slice(0,3)}</span></span>
            </button>
            {s.n < 4 && <span className="text-[#d2d2d7]">—</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="p-5 md:p-6">
        {error && <Alert tone="error" className="mb-4">{error}</Alert>}

        {step === 1 && (
          <div className="space-y-3">
            <Input label="Product name (title)" value={product.title} onChange={(e) => onChange({ ...product, title: e.target.value, navLabel: e.target.value })} />
            <Input label="Tagline" value={product.tagline} onChange={(e) => onChange({ ...product, tagline: e.target.value })} />
            <Textarea label="Summary (feature row)" value={product.summary} onChange={(e) => onChange({ ...product, summary: e.target.value })} />
            <Textarea label="Detail intro" value={product.detailIntro} onChange={(e) => onChange({ ...product, detailIntro: e.target.value })} />
            <Input label="Detail heading" value={product.detailHeading} onChange={(e) => onChange({ ...product, detailHeading: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Detail paragraph 1" value={product.detailParagraphs[0] as string} onChange={(e) => onChange({ ...product, detailParagraphs: [e.target.value, product.detailParagraphs[1]] as any })} />
              <Input label="Detail paragraph 2" value={product.detailParagraphs[1] as string} onChange={(e) => onChange({ ...product, detailParagraphs: [product.detailParagraphs[0], e.target.value] as any })} />
            </div>
            <Input label="CTA button label" value={product.ctaPrimary} onChange={(e) => onChange({ ...product, ctaPrimary: e.target.value })} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <MediaHub label="Hero image" value={product.media.hero} onChange={(v) => onChange({ ...product, media: { ...product.media, hero: v } })} />
            <div className="grid md:grid-cols-3 gap-3">
              {[0,1,2].map((i) => (
                <MediaHub key={i} label={`Gallery ${i+1}`} value={product.media.gallery[i]} onChange={(v) => {
                  const g = [...product.media.gallery] as [string,string,string]; (g as any)[i]=v; onChange({ ...product, media: { ...product.media, gallery: g } });
                }} />
              ))}
            </div>
            <div>
              <div className="text-sm font-semibold mb-2">Features (each is a bullet)</div>
              <div className="space-y-2">
                {product.features.map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <input className="flex-1 rounded-lg border border-[#d2d2d7] px-3 py-2 text-sm" value={f} onChange={(e) => {
                      const nf = [...product.features]; nf[i]=e.target.value; onChange({ ...product, features: nf });
                    }} />
                    <button className="w-9 h-9 rounded-lg border text-[#d70015]" onClick={() => onChange({ ...product, features: product.features.filter((_, idx) => idx !== i) })}>✕</button>
                  </div>
                ))}
                <button className="rounded-lg border border-dashed border-[#0071e3] bg-[#e6f1ff] text-[#0071e3] px-3 py-2 text-sm font-semibold" onClick={() => onChange({ ...product, features: [...product.features, ""] })}>+ Add feature</button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Link to category (Relationship Mapping)</label>
              <select className="w-full rounded-[10px] border border-[#d2d2d7] px-3 py-2.5 text-sm bg-white" value={product.categoryId || ""} onChange={(e) => onChange({ ...product, categoryId: e.target.value })}>
                <option value="">— No category —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <div className="text-xs text-[#86868b] mt-1">Simple dropdown to link this product to an existing category or pricing table.</div>
            </div>
            <PricingEditor pricing={product.pricing} onChange={(pricing) => onChange({ ...product, pricing })} />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <Alert tone="warn">Draft & Preview: changes are staged. Use Preview to view in staging, then Publish Live.</Alert>
            <div className="rounded-xl border border-[#d2d2d7] p-4 bg-[#fbfbfd]">
              <div className="text-xs uppercase tracking-wide text-[#86868b]">{product.tagline}</div>
              <h3 className="font-bold text-lg">{product.title}</h3>
              <p className="text-sm text-[#6e6e73] mt-1">{product.summary}</p>
              <div className="flex gap-2 mt-3">
                <button className="rounded-full border border-[#d2d2d7] bg-white px-3 py-1.5 text-xs font-semibold" onClick={() => window.open("#preview", "_blank")}>Open Preview ↗</button>
                <span className="text-xs text-[#86868b] self-center">Preview updates in real-time as you edit.</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onSave(false)} disabled={saving}>{saving ? <Spinner label="Saving draft…" /> : "Save as Draft"}</Button>
              <Button onClick={() => onSave(true)} disabled={saving || !canNext} loading={saving}>Publish Live</Button>
            </div>
            {errs.length > 0 && <Alert tone="error">Fix: {errs.map((e) => e.message).join(" · ")}</Alert>}
          </div>
        )}

        {/* Nav */}
        <div className="flex justify-between mt-6 pt-4 border-t border-[#d2d2d7]">
          <Button variant="outline" disabled={step === 1} onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}>Back</Button>
          {step < 4 ? <Button onClick={() => setStep((s) => Math.min(4, s + 1) as Step)}>Next →</Button> : <span className="text-xs text-[#86868b] self-center">Review then publish</span>}
        </div>
      </div>
    </div>
  );
}
