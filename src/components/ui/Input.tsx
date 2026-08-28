import * as React from "react";
import { cn } from "../../utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}
export function Input({ label, hint, error, className, id, ...props }: InputProps) {
  const autoId = React.useId();
  const inputId = id || autoId;
  return (
    <div className="field mb-4">
      {label && <label htmlFor={inputId} className="block text-[0.85rem] font-semibold mb-1.5 text-[#1d1d1f]">{label}</label>}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-[10px] border px-3 py-2.5 text-[0.92rem] transition",
          "focus:outline-none focus:border-[#0071e3] focus:ring-[0_0_0_3px_rgba(0,113,227,.18)]",
          error ? "border-[#d70015] bg-[#fff0f0]" : "border-[#d2d2d7] bg-white",
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {error ? <div id={`${inputId}-error`} className="mt-1 text-[0.78rem] text-[#d70015]">{error}</div>
        : hint ? <div id={`${inputId}-hint`} className="mt-1 text-[0.78rem] text-[#86868b]">{hint}</div> : null}
    </div>
  );
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}
export function Textarea({ label, hint, error, className, id, ...props }: TextareaProps) {
  const autoId = React.useId();
  const inputId = id || autoId;
  return (
    <div className="field mb-4">
      {label && <label htmlFor={inputId} className="block text-[0.85rem] font-semibold mb-1.5">{label}</label>}
      <textarea
        id={inputId}
        className={cn("w-full min-h-[90px] resize-y rounded-[10px] border px-3 py-2.5 text-[0.92rem]", error ? "border-[#d70015]" : "border-[#d2d2d7]", "focus:outline-none focus:border-[#0071e3] focus:ring-[0_0_0_3px_rgba(0,113,227,.18)]", className)}
        aria-invalid={!!error}
        {...props}
      />
      {error ? <div className="mt-1 text-[0.78rem] text-[#d70015]">{error}</div> : hint ? <div className="mt-1 text-[0.78rem] text-[#86868b]">{hint}</div> : null}
    </div>
  );
}
