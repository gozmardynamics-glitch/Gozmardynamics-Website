import type { CMSState } from "../types/cms";
import { cmsService } from "../services/cms";

let draft: CMSState = cmsService.load();
let published: CMSState = cmsService.load();
let isDraft = false;
const listeners = new Set<() => void>();
function notify() { listeners.forEach((l) => l()); }

export const draftStore = {
  getDraft: () => draft,
  getPublished: () => published,
  getIsDraft: () => isDraft,
  setDraft(d: CMSState) { draft = d; notify(); },
  setIsDraft(v: boolean) { isDraft = v; notify(); },
  // Promotes draft → published (Publish Live)
  async publish(): Promise<boolean> {
    published = JSON.parse(JSON.stringify(draft));
    const ok = await cmsService.save(published);
    if (ok) { isDraft = false; notify(); }
    return ok;
  },
  // Preview returns the staged draft (rendered in iframe via cms.js applyState)
  getPreviewState(): CMSState { return isDraft ? draft : published; },
  subscribe(fn: () => void) { listeners.add(fn); return () => listeners.delete(fn); },
};
