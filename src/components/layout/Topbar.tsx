import * as React from "react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Card";

export function Topbar({
  dirty, mode, onSave, onReset, onExport, onImport, onPublish, onSignOut, saving,
}: {
  dirty: boolean; mode: string; saving?: boolean;
  onSave: () => void; onReset: () => void; onExport: () => void; onImport: () => void;
  onPublish?: () => void; onSignOut?: () => void;
}) {
  return (
    <header className="h-[60px] sticky top-0 z-10 flex items-center justify-between px-5 bg-[#1d1d1f] text-white">
      <div className="font-bold flex items-center gap-2"><i className="fas fa-cube" /> Gozmar <span className="text-[#5ac8fa]">CMS</span>
        <span className="ml-2 hidden md:inline-flex text-[0.7rem] tracking-widest uppercase bg-white/10 px-2 py-1 rounded-full">{mode}</span>
      </div>
      <div className="flex items-center gap-2">
        {dirty && <span className="text-[#ffd60a] text-sm mr-1">● Unsaved</span>}
        <a href="index.html" target="_blank" className="hidden md:inline-flex rounded-full border border-white/30 px-3.5 py-2 text-sm hover:bg-white/10">View site ↗</a>
        <Button variant="ghost" size="sm" onClick={onReset}>Reset</Button>
        <Button variant="ghost" size="sm" onClick={onExport}>Export</Button>
        <Button variant="ghost" size="sm" onClick={onImport}>Import</Button>
        {onPublish && <Button variant="ghost" size="sm" onClick={onPublish}>Publish Live</Button>}
        {onSignOut && <Button variant="ghost" size="sm" onClick={onSignOut}>Sign out</Button>}
        <Button size="sm" loading={saving} onClick={onSave}>Save changes</Button>
      </div>
    </header>
  );
}
