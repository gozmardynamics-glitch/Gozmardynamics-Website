/** image helpers for MediaHub */

export function validateImageUrl(url: string): { valid: boolean; error?: string } {
  if (!url.trim()) return { valid: true };
  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) return { valid: false, error: "URL must be http(s)" };
    if (!/\.(png|jpe?g|webp|avif|gif|svg)(\?|$)/i.test(u.pathname) && !u.hostname.includes("unsplash") && !u.hostname.includes("cloudinary")) {
      // allow any image host, but warn if extension missing
    }
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL" };
  }
}

export function generateAltTextHint(filenameOrUrl: string): string {
  if (!filenameOrUrl) return "Describe the image for SEO and accessibility";
  try {
    const name = new URL(filenameOrUrl).pathname.split("/").pop() || filenameOrUrl;
    return `Alt text for "${decodeURIComponent(name).slice(0, 40)}"`;
  } catch {
    return "Alt text for this image";
  }
}

// client-side compress via canvas (optional, used before PocketBase file upload)
export async function compressImage(file: File, maxW = 1600, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxW / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("compress failed"))), "image/webp", quality)
  );
}
