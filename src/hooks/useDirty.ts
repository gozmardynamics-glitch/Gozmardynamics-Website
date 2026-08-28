import * as React from "react";
import { cmsStore } from "../stores/cmsStore";

/** beforeunload guard + dirty flag */
export function useDirty() {
  const [dirty, setDirty] = React.useState(cmsStore.getDirty());
  React.useEffect(() => cmsStore.subscribe(() => setDirty(cmsStore.getDirty())), []);
  React.useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (cmsStore.getDirty()) { e.preventDefault(); e.returnValue = ""; }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);
  return dirty;
}
