import * as React from "react";
import { cn } from "../../utils/cn";

type Variant = "primary" | "outline" | "ghost" | "light";
type Size = "sm" | "md";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "btn inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "primary" && "bg-gradient-to-b from-[#0a84ff] to-[#0071e3] text-white shadow-[0_4px_0_#0052a8,0_8px_20px_rgba(0,113,227,.25)] hover:-translate-y-0.5 active:translate-y-0.5",
        variant === "outline" && "border border-[#d2d2d7] bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]",
        variant === "ghost" && "bg-transparent text-white/90 hover:bg-white/10",
        variant === "light" && "bg-white text-[#1d1d1f] shadow-sm",
        size === "sm" && "px-3.5 py-2 text-[0.85rem]",
        size === "md" && "px-5 py-2.5 text-[0.95rem]",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <i className="fas fa-spinner fa-spin" aria-hidden />}
      {children}
    </button>
  );
}
