import * as React from "react";
import { cn } from "../../utils/cn";

export function Alert({ tone = "info", children, className }: { tone?: "success" | "error" | "info" | "warn"; children: React.ReactNode; className?: string }) {
  return (
    <div role="alert" className={cn("rounded-xl px-4 py-3 text-sm flex gap-2.5 items-start border", tone === "success" && "bg-[#e6f5ec] border-[#b7e5c7] text-[#0a5a2a]", tone === "error" && "bg-[#fff0f0] border-[#f5b5b5] text-[#8a0010]", tone === "warn" && "bg-[#fff8e6] border-[#ffd60a] text-[#6b4d00]", tone === "info" && "bg-[#e6f1ff] border-[#b5d3ff] text-[#00408a]", className)}>
      <i className={cn("fas mt-0.5", tone === "success" && "fa-check-circle", tone === "error" && "fa-triangle-exclamation", tone === "warn" && "fa-circle-info", tone === "info" && "fa-circle-info")} aria-hidden />
      <span>{children}</span>
    </div>
  );
}
export function Spinner({ label = "Loading…" }: { label?: string }) {
  return <span className="inline-flex items-center gap-2 text-sm text-[#86868b]"><i className="fas fa-spinner fa-spin" aria-hidden /> {label}</span>;
}
