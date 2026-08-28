/** CMS service — abstraction over PocketBase / localStorage (mirrors js/cms.js) */
import type { CMSState } from "../types/cms";
import { getConfig, usePocketBase } from "../lib/config";

const STORAGE_KEY = "gozmar_cms_v1";
const AUTH_KEY = "gozmar_cms_auth_v1";

function deepClone<T>(o: T): T { return JSON.parse(JSON.stringify(o)); }
function getDefaults(): CMSState {
  // runtime: reads window.GOZMAR_DEFAULTS if available (js/cms-data.js)
  const w = (window as any).GOZMAR_DEFAULTS as CMSState | undefined;
  if (w) return deepClone(w);
  throw new Error("GOZMAR_DEFAULTS not loaded — include js/cms-data.js");
}

function pbUrl(collection?: string) {
  const c = getConfig();
  return `${c.pocketbaseUrl.replace(/\/$/, "")}/api/collections/${collection || c.collection}/records`;
}
function pbHeaders(): Record<string,string> {
  const h: Record<string,string> = { "Content-Type": "application/json" };
  try {
    const tok = localStorage.getItem(AUTH_KEY);
    if (tok) h["Authorization"] = tok;
  } catch {}
  return h;
}
function isValid(s: any): s is CMSState { return !!(s && s.products && s.site); }

async function loadFromPocketBase(): Promise<CMSState | null> {
  const res = await fetch(`${pbUrl()}?limit=1`);
  if (!res.ok) throw new Error(`pb load ${res.status}`);
  const data = await res.json();
  if (data.items?.[0]) {
    const rec = data.items[0];
    const content = typeof rec.data === "string" ? JSON.parse(rec.data) : rec.data;
    return isValid(content) ? content : null;
  }
  return null;
}
async function saveToPocketBase(state: CMSState): Promise<boolean> {
  const body = JSON.stringify({ data: state });
  const check = await fetch(`${pbUrl()}?limit=1`);
  if (!check.ok) throw new Error(`pb check ${check.status}`);
  const data = await check.json();
  let res: Response;
  if (data.items?.[0]) {
    res = await fetch(`${pbUrl()}/${data.items[0].id}`, { method: "PATCH", headers: pbHeaders(), body });
  } else {
    res = await fetch(pbUrl(), { method: "POST", headers: pbHeaders(), body });
  }
  if (!res.ok) throw new Error(`pb save ${res.status}`);
  return true;
}

function cacheLocal(state: CMSState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export const cmsService = {
  load(): CMSState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { const p = JSON.parse(raw); if (isValid(p)) return p; }
    } catch {}
    return getDefaults();
  },
  async refresh(): Promise<CMSState | null> {
    // if admin + PocketBase, pull remote; else no-op (caller uses load())
    const isAdmin = (window as any).CMS_ADMIN === true;
    if (isAdmin && usePocketBase()) {
      try {
        const remote = await loadFromPocketBase();
        if (remote) { cacheLocal(remote); return remote; }
      } catch {}
    }
    return null;
  },
  async save(state: CMSState): Promise<boolean> {
    const isAdmin = (window as any).CMS_ADMIN === true;
    if (isAdmin && usePocketBase()) {
      try { const ok = await saveToPocketBase(state); cacheLocal(state); return ok; } catch { cacheLocal(state); return false; }
    }
    cacheLocal(state); return true;
  },
  async clear(): Promise<boolean> {
    const isAdmin = (window as any).CMS_ADMIN === true;
    if (isAdmin && usePocketBase()) {
      try { await saveToPocketBase(getDefaults()); localStorage.removeItem(STORAGE_KEY); return true; } catch { return false; }
    }
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    return true;
  },
  async signIn(email: string, password: string) {
    const c = getConfig();
    const url = `${c.pocketbaseUrl.replace(/\/$/, "")}/api/collections/${c.authCollection}/auth-with-password`;
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identity: email, password }) });
    const data = await res.json();
    if (!res.ok || !data.token) throw new Error(data.message || "Sign-in failed");
    localStorage.setItem(AUTH_KEY, data.token);
    return data;
  },
  async signOut() { try { localStorage.removeItem(AUTH_KEY); } catch {} },
  getSession(): string | null { try { return localStorage.getItem(AUTH_KEY); } catch { return null; } },
  getDefaults,
};
