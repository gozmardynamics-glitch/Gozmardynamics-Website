import * as React from "react";
import { cmsStore } from "../stores/cmsStore";

/** Hook for path-based section access (e.g. "products.dms" or "site.hero") */
export function useSection(path: string) {
  const [, tick] = React.useState(0);
  React.useEffect(() => cmsStore.subscribe(() => tick((n) => n + 1)), []);
  return {
    value: cmsStore.getAt(path),
    set: (v: any) => cmsStore.setAt(path, v),
    state: cmsStore.getState(),
    dirty: cmsStore.getDirty(),
    save: () => cmsStore.save(),
  };
}

export function useCurrentPath() {
  const [, tick] = React.useState(0);
  React.useEffect(() => cmsStore.subscribe(() => tick((n) => n + 1)), []);
  return { path: cmsStore.getPath(), setPath: (p: string) => cmsStore.setPath(p) };
}
