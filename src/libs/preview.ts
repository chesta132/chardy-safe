/** Returns the preview type based on MIME, or null if not previewable in-browser */
export function getPreviewType(mime: string): "image" | "video" | "audio" | "pdf" | null {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime === "application/pdf") return "pdf";
  return null;
}

/** Creates a temporary object URL from an ArrayBuffer + MIME type */
export function createObjectUrl(buffer: ArrayBuffer, mime: string) {
  const blob = new Blob([buffer], { type: mime });
  return URL.createObjectURL(blob);
}
