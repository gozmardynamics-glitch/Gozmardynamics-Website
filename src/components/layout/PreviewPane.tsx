import * as React from "react";
import type { CMSState } from "../../types/cms";

/** Live preview — mirrors the consumer site card for the current path. Keep sticky. */
export function PreviewPane({ state, currentPath }: { state: CMSState; currentPath: string }) {
  const [parts] = React.useState(() => currentPath.split("."));
  // re-derive on change without remount
  const segs = currentPath.split(".");
  let inner: React.ReactNode = null;
  if (segs[0] === "products") {
    const p = state.products[segs[1]];
    if (p) inner = (
      <div className="rounded-2xl border border-[#d2d2d7] p-4">
        <div className="text-xs uppercase tracking-wide text-[#86868b]">{p.tagline}</div>
        <h3 className="font-bold">{p.title}</h3>
        <p className="text-sm text-[#6e6e73] mt-1">{p.summary.slice(0, 140)}</p>
        <ul className="mt-3 text-sm space-y-1">{p.features.slice(0,4).map((f,i)=><li key={i} className="flex gap-1.5"><i className="fas fa-check-circle text-[#0071e3] mt-0.5" />{f}</li>)}</ul>
        <div className="grid gap-2 mt-4">{p.pricing.tiers.map((t,i)=>(<div key={i} className={`rounded-xl border p-3 ${i===1?"border-[#0071e3] shadow":"border-[#d2d2d7]"}`}><div className="font-semibold text-sm">{t.name}</div><div className="text-[#0071e3] font-bold">{t.monthly}</div><ul className="text-xs mt-1">{t.features.slice(0,2).map((f,j)=><li key={j}>• {f}</li>)}</ul></div>))}</div>
      </div>
    );
  } else {
    const s: any = (state.site as any)[segs[1]];
    inner = <pre className="text-xs whitespace-pre-wrap break-words bg-[#f5f5f7] p-3 rounded-xl">{JSON.stringify(s, null, 2)}</pre>;
  }
  return (
    <aside className="w-[360px] shrink-0 bg-white border-l border-[#d2d2d7] overflow-y-auto hidden xl:block">
      <div className="sticky top-0 bg-[#1d1d1f] text-white px-4 py-3 text-sm font-semibold">Live preview</div>
      <div className="p-4">{inner}</div>
    </aside>
  );
}
