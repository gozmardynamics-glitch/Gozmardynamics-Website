import * as React from "react";
import { validateImageUrl, generateAltTextHint } from "../../utils/image";
import { Input } from "../ui/Input";

/**
 * Visual Media Hub — drag-drop + paste URL + preview + alt-text
 * Keep this component physically next to the content it modifies (Component Closeness).
 */
export function MediaHub({
  label, value, altText, onChange, onAltChange,
}: {
  label: string;
  value: string;
  altText?: string;
  onChange: (url: string) => void;
  onAltChange?: (alt: string) => void;
}) {
  const [dragOver, setDragOver] = React.useState(false);
  const validation = validateImageUrl(value);
  const hint = generateAltTextHint(value);

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChange(url);
      return;
    }
    const url = e.dataTransfer.getData("text/plain") || e.dataTransfer.getData("text/uri-list");
    if (url) onChange(url.trim());
  }

  return (
    <div className="rounded-xl border border-[#d2d2d7] p-4 bg-[#fbfbfd]">
      <div className="text-[0.8rem] font-semibold tracking-wide uppercase text-[#86868b] mb-2">{label}</div>
      <div className="flex gap-3 items-start">
        <div className="flex-1">
          <Input
            aria-label={`${label} URL`}
            type="url"
            placeholder="https://... or drop image here"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            error={validation.valid ? undefined : validation.error}
            hint={validation.valid ? "Drag & drop, paste URL, or click Upload" : undefined}
          />
          {onAltChange && (
            <Input label="Alt text" placeholder={hint} value={altText || ""} onChange={(e) => onAltChange(e.target.value)} hint="For SEO & accessibility" />
          )}
        </div>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`w-[132px] h-[84px] shrink-0 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-white text-xs text-center transition ${dragOver ? "border-[#0071e3] bg-[#e6f1ff]" : "border-[#d2d2d7]"} ${value ? "p-0" : "p-2"}`}
          style={value ? { backgroundImage: `url("${value}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          role="img"
          aria-label={value ? `Preview of ${label}` : "No image"}
        >
          {!value && <span className="text-[#86868b] leading-tight">Drop<br />image</span>}
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0071e3] cursor-pointer">
          <i className="fas fa-upload" /> Upload
          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
            const f = e.target.files?.[0]; if (f) onChange(URL.createObjectURL(f));
          }} />
        </label>
        <span className="text-xs text-[#86868b]">or paste URL above</span>
        {value && <button className="ml-auto text-xs text-[#d70015] hover:underline" onClick={() => onChange("")}>Remove</button>}
      </div>
    </div>
  );
}
