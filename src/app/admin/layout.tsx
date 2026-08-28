import * as React from "react";
import { Topbar } from "../../components/layout/Topbar";
import { Sidebar } from "../../components/layout/Sidebar";
import { PreviewPane } from "../../components/layout/PreviewPane";
import { ToastProvider } from "../../components/ui/Toast";
import { useCurrentPath } from "../../hooks/useCurrentPath";
import { useDirty } from "../../hooks/useDirty";
import { usePreview } from "../../hooks/usePreview";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { path, setPath } = useCurrentPath();
  const dirty = useDirty();
  const previewState: any = usePreview();
  // In real Next.js, state is provided via context/provider. This scaffold shows wiring.
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col">
        <Topbar dirty={dirty} mode="Backend: PocketBase" onSave={() => {}} onReset={() => {}} onExport={() => {}} onImport={() => {}} onPublish={() => {}} />
        <div className="flex flex-1 min-h-0">
          {/* Sidebar needs CMSState — pass previewState; real app uses store provider */}
          <Sidebar state={previewState} currentPath={path} onNavigate={setPath} />
          <main className="flex-1 overflow-y-auto p-7">{children}</main>
          <PreviewPane state={previewState} currentPath={path} />
        </div>
      </div>
    </ToastProvider>
  );
}
