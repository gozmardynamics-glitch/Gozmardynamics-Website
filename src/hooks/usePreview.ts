import * as React from "react";
import { cmsStore } from "../stores/cmsStore";
import { draftStore } from "../stores/draftStore";

/** Syncs preview pane on state change (debounced 300ms) */
export function usePreview(debounceMs = 300) {
  const [previewState, setPreview] = React.useState(() => cmsStore.getState());
  React.useEffect(() => {
    let t: any;
    const unsub = cmsStore.subscribe(() => {
      clearTimeout(t);
      t = setTimeout(() => setPreview(JSON.parse(JSON.stringify(cmsStore.getState()))), debounceMs);
    });
    const unsub2 = draftStore.subscribe(() => setPreview(draftStore.getPreviewState()));
    return () => { clearTimeout(t); unsub(); unsub2(); };
  }, [debounceMs]);
  return previewState;
}
