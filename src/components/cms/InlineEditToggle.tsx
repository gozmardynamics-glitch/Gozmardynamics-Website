import * as React from "react";
import { cn } from "../../utils/cn";

export function InlineEditToggle({ mode, onToggle }: { mode: "view" | "edit"; onToggle: () => void }) {
  const editing = mode === "edit";
  return (
    <button
      onClick={onToggle}
      className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition", editing ? "bg-[#0071e3] text-white border-[#0071e3]" : "bg-white border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7]")}
      aria-pressed={editing}
      aria-label={editing ? "Switch to viewing mode" : "Switch to editing mode"}
    >
      <i className={cn("fas", editing ? "fa-eye" : "fa-pen")} aria-hidden />
      {editing ? "Editing" : "Viewing"} — click to {editing ? "view" : "edit"}
    </button>
  );
}
