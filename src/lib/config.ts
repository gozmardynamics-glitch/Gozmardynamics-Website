/** Reads runtime config (mirrors js/cms-config.js) */
export type CMSConfig = {
  pocketbaseUrl: string;
  collection: string;
  authCollection: string;
  gaMeasurementId: string;
  authEnabled: boolean;
};

declare global {
  interface Window {
    CMS_CONFIG?: Partial<CMSConfig>;
  }
}

export function getConfig(): CMSConfig {
  const w = (typeof window !== "undefined" ? window.CMS_CONFIG : undefined) || {};
  return {
    pocketbaseUrl: w.pocketbaseUrl || "",
    collection: w.collection || "cms_content",
    authCollection: w.authCollection || "users",
    gaMeasurementId: w.gaMeasurementId || "",
    authEnabled: w.authEnabled ?? true,
  };
}

export function usePocketBase(): boolean {
  return !!getConfig().pocketbaseUrl;
}
