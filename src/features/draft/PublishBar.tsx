import * as React from "react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";

/** Draft & Preview System — toggle staging view before Publish Live */
export function PublishBar({
  isDraft, onToggleDraft, onPreview, onPublish, saving,
}: {
  isDraft: boolean; onToggleDraft: (v: boolean) => void; onPreview: () => void; onPublish: () => void; saving?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#d2d2d7] bg-white p-4">
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input type="checkbox" className="w-4 h-4 accent-[#0071e3]" checked={isDraft} onChange={(e) => onToggleDraft(e.target.checked)} />
        <span className="text-sm font-semibold">Draft mode</span>
        <Badge tone={isDraft ? "warn" : "success"}>{isDraft ? "Draft — not live" : "Live"}</Badge>
      </label>
      <span className="flex-1" />
      <Button variant="outline" size="sm" onClick={onPreview}><i className="fas fa-eye" /> Preview</Button>
      <Button size="sm" loading={saving} onClick={onPublish}><i className="fas fa-rocket" /> Publish Live</Button>
    </div>
  );
}

export function DraftToggle({ isDraft, onChange }: { isDraft: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={isDraft ? "text-[#86868b]" : "font-semibold"}>Live</span>
      <button
        role="switch"
        aria-checked={isDraft}
        onClick={() => onChange(!isDraft)}
        className={`relative w-11 h-6 rounded-full transition ${isDraft ? "bg-[#0071e3]" : "bg-[#d2d2d7]"}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition ${isDraft ? "right-0.5" : "left-0.5"}`} />
      </button>
      <span className={isDraft ? "font-semibold" : "text-[#86868b]"}>Draft</span>
    </div>
  );
}
