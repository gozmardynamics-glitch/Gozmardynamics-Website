/** Low-level PocketBase helpers — re-exported via services/cms.ts */
export { cmsService as pocketbaseService } from "./cms";
export function pbUrl(collection = "cms_content"): string {
  const base = (window as any).CMS_CONFIG?.pocketbaseUrl || "";
  return `${String(base).replace(/\/$/, "")}/api/collections/${collection}/records`;
}
