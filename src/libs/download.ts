/** Downloads a string as a .txt file with the given filename */
export function downloadTxt(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Returns unix timestamp in seconds as a string */
export function unixNow() {
  return String(Math.floor(Date.now() / 1000));
}
