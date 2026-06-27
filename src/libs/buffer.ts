export async function stringToUint8(str: string) {
  return new TextEncoder().encode(str);
}

export async function uint8ToString(arr: Uint8Array | ArrayBuffer) {
  return new TextDecoder().decode(arr);
}

export function arrayBufferToBase64(buffer: Uint8Array | ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string) {
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
  return bytes.buffer;
}
