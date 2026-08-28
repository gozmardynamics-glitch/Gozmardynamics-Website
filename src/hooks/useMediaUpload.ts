import * as React from "react";
import { validateImageUrl, compressImage } from "../utils/image";

export function useMediaUpload(onUrl: (url: string) => void) {
  const [dragOver, setDragOver] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onDrop = React.useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      try {
        const blob = await compressImage(file);
        onUrl(URL.createObjectURL(blob));
      } catch {
        onUrl(URL.createObjectURL(file));
      }
      return;
    }
    const url = e.dataTransfer.getData("text/plain") || e.dataTransfer.getData("text/uri-list");
    if (url) {
      const v = validateImageUrl(url.trim());
      if (!v.valid) setError(v.error || "Invalid URL");
      else onUrl(url.trim());
    }
  }, [onUrl]);

  return {
    dragOver, error, setError,
    handlers: {
      onDragOver: (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); },
      onDragLeave: () => setDragOver(false),
      onDrop,
    },
  };
}
