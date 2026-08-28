import * as React from "react";
import { cn } from "../../utils/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-[#d2d2d7] bg-white p-5 md:p-6", className)} {...props} />;
}

export function SectionBlock({
  title, icon, badge, mode, onEdit, onSave, onCancel, saving, children, className,
}: {
  title: string; icon?: string; badge?: string; mode: "view" | "edit";
  onEdit?: () => void; onSave?: () => void; onCancel?: () => void; saving?: boolean;
  children: React.ReactNode; className?: string;
}) {
  const isEditing = mode === "edit";
  return (
    <div className={cn("rounded-2xl border bg-white p-5 md:p-6 mb-5 transition", isEditing ? "border-[#0071e3] shadow-[0_4px_14px_rgba(0,113,227,.12)] ring-1 ring-[#0071e3]/20" : "border-[#d2d2d7]", className)}>
      <div className="flex items-center gap-2 mb-4">
        {icon && <i className={cn("fas", icon)} aria-hidden />}
        <h2 className="text-[1.05rem] font-bold flex items-center gap-2">{title}
          {badge && <span className={cn("text-[0.68rem] px-2 py-0.5 rounded-full font-semibold", isEditing ? "bg-[#0071e3] text-white" : "bg-[#e6f1ff] text-[#0071e3]")}>{badge}</span>}
        </h2>
        <span className="ml-auto flex gap-2">
          {mode === "view" ? (
            <button onClick={onEdit} className="text-sm font-semibold text-[#0071e3] hover:underline inline-flex items-center gap-1.5"><i className="fas fa-pen text-xs" /> Edit</button>
          ) : (
            <>
              <button onClick={onCancel} className="rounded-full border border-[#d2d2d7] px-3 py-1.5 text-sm hover:bg-[#f5f5f7]">Cancel</button>
              <button onClick={onSave} disabled={saving} className="rounded-full bg-[#0071e3] text-white px-3.5 py-1.5 text-sm font-semibold disabled:opacity-50 inline-flex items-center gap-1.5">
                {saving ? <><i className="fas fa-spinner fa-spin" /> Saving…</> : <><i className="fas fa-check" /> Save</>}
              </button>
            </>
          )}
        </span>
      </div>
      {/* Visual hierarchy: viewing = 60% opacity on inputs (via CSS), editing = full contrast — handled by mode */}
      <div className={cn(mode === "view" && "opacity-[0.98]")}>{children}</div>
      {/* Component Closeness: edit controls are inside the Card, next to content they modify */}
    </div>
  );
}

export function Badge({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "warn" | "success" }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", tone === "info" && "bg-[#e6f1ff] text-[#0071e3]", tone === "warn" && "bg-[#fff8e6] text-[#7a5a00] border border-[#ffd60a]", tone === "success" && "bg-[#e6f5ec] text-[#0a7a3a]")}>{children}</span>;
}
