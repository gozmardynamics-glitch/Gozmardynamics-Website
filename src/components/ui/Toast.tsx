import * as React from "react";

type Toast = { id: string; message: string; tone?: "success" | "error" | "info" };
const Ctx = React.createContext<{ push: (msg: string, tone?: Toast["tone"]) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const push = React.useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2200);
  }, []);
  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} role="status" className={`px-5 py-3 rounded-full text-sm font-medium shadow-lg ${t.tone === "error" ? "bg-[#d70015] text-white" : t.tone === "info" ? "bg-[#1d1d1f] text-white" : "bg-[#1d1d1f] text-white"}`}>
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
export function useToast() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useToast outside provider");
  return ctx;
}
