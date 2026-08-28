/**
 * Zustand CMS store (vanilla alternative shown — no dep required for scaffold).
 * For production: `npm i zustand` and replace with `create<CMSStore>()`.
 */
import type { CMSState } from "../types/cms";
import { cmsService } from "../services/cms";

// Lightweight observable store (no zustand dep — drop-in)
type Listener = () => void;
let state: CMSState = cmsService.load();
let dirty = false;
let currentPath = "products.dms";
const listeners = new Set<Listener>();

function notify() { listeners.forEach((l) => l()); }

export const cmsStore = {
  getState: () => state,
  getDirty: () => dirty,
  getPath: () => currentPath,
  setPath(p: string) { currentPath = p; notify(); },
  setState(next: CMSState) { state = next; dirty = true; notify(); },
  patch(patch: Partial<CMSState>) { state = { ...state, ...patch }; dirty = true; notify(); },
  setDirty(v: boolean) { dirty = v; notify(); },
  markDirty() { dirty = true; notify(); },
  async save() {
    const ok = await cmsService.save(state);
    if (ok) { dirty = false; notify(); }
    return ok;
  },
  async reset() {
    const def = cmsService.getDefaults();
    state = def; dirty = false; await cmsService.clear(); notify(); return def;
  },
  subscribe(fn: Listener) { listeners.add(fn); return () => listeners.delete(fn); },
  // path helpers
  getAt(path: string): any { return path.split(".").reduce((o: any, k) => o?.[k], state as any); },
  setAt(path: string, val: any) {
    const parts = path.split("."); let o: any = state;
    for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]];
    o[parts[parts.length - 1]] = val; dirty = true; notify();
  },
};
