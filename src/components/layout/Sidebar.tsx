import * as React from "react";
import { cn } from "../../utils/cn";
import type { CMSState } from "../../types/cms";

export function Sidebar({ state, currentPath, onNavigate }: { state: CMSState; currentPath: string; onNavigate: (p: string) => void }) {
  return (
    <nav className="w-[230px] shrink-0 bg-white border-r border-[#d2d2d7] overflow-y-auto p-2.5" aria-label="Content sections">
      <div className="text-[0.72rem] uppercase tracking-widest font-bold text-[#86868b] px-3 pt-3 pb-1.5">Products</div>
      {Object.entries(state.products).map(([key, p]) => {
        const active = currentPath === `products.${key}`;
        return (
          <button key={key} onClick={() => onNavigate(`products.${key}`)} className={cn("w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[0.92rem] transition", active ? "bg-[#0071e3] text-white" : "hover:bg-[#f0f1f5] text-[#1d1d1f]")}>
            <i className="fas fa-cube w-[18px] text-center" aria-hidden /> {p.navLabel}
          </button>
        );
      })}
      <div className="text-[0.72rem] uppercase tracking-widest font-bold text-[#86868b] px-3 pt-4 pb-1.5">Site</div>
      {[
        { k: "hero", l: "Hero", i: "fa-bullhorn" },
        { k: "about", l: "About", i: "fa-building" },
        { k: "stats", l: "Stats band", i: "fa-chart-bar" },
        { k: "values", l: "Values", i: "fa-star" },
        { k: "testimonials", l: "Testimonials", i: "fa-quote-right" },
        { k: "faq", l: "FAQ", i: "fa-question" },
        { k: "contact", l: "Contact", i: "fa-envelope" },
        { k: "footer", l: "Footer", i: "fa-shoe-prints" },
      ].map((s) => {
        const active = currentPath === `site.${s.k}`;
        return (
          <button key={s.k} onClick={() => onNavigate(`site.${s.k}`)} className={cn("w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[0.92rem] transition", active ? "bg-[#0071e3] text-white" : "hover:bg-[#f0f1f5]")}>
            <i className={cn("fas w-[18px] text-center", s.i)} aria-hidden /> {s.l}
          </button>
        );
      })}
    </nav>
  );
}
