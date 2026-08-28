import * as React from "react";
import { SectionBlock as CardBlock } from "../../components/ui/Card";
import type { ViewMode } from "../../types/cms";

/**
 * Dual-view orchestrator.
 * VIEW: CurrentStateView (read-only live data)
 * EDIT: InlineEditingForm (controlled inputs, Component Closeness — edit controls next to content)
 * Visual hierarchy: Viewing = muted border, Editing = blue ring + amber badge.
 */
export function FeatureSectionBlock({
  title, icon, mode, onModeChange, onSave, onCancel, saving, view, edit,
}: {
  title: string; icon?: string; mode: ViewMode; onModeChange: (m: ViewMode) => void;
  onSave?: () => void; onCancel?: () => void; saving?: boolean;
  view: React.ReactNode; edit: React.ReactNode;
}) {
  return (
    <CardBlock
      title={title}
      icon={icon}
      badge={mode === "edit" ? "Editing" : "Viewing"}
      mode={mode}
      onEdit={() => onModeChange("edit")}
      onSave={onSave}
      onCancel={() => { onModeChange("view"); onCancel?.(); }}
      saving={saving}
    >
      {mode === "view" ? view : edit}
    </CardBlock>
  );
}

export function CurrentStateView({ children }: { children: React.ReactNode }) {
  return <div className="text-sm leading-relaxed text-[#1d1d1f]">{children}</div>;
}

export function InlineEditingForm({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3">{children}</div>;
}
