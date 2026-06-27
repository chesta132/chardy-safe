import { arrayBufferToBase64, base64ToArrayBuffer, stringToUint8, uint8ToString } from "./buffer";
import { format, unformat } from "./format";

/** Derives an AES-GCM key from a password + salt using PBKDF2 (100k iterations, SHA-256) */
async function deriveKey(password: string, salt: BufferSource) {
  const passwordBuffer = await stringToUint8(password);
  const keyMaterial = await crypto.subtle.importKey("raw", passwordBuffer, { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, keyMaterial, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}

export async function encryptData(data: string, key: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const derivedKey = await deriveKey(key, salt);

  const encryptedContent = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, derivedKey, await stringToUint8(data));

  return format({
    iv: arrayBufferToBase64(iv),
    salt: arrayBufferToBase64(salt),
    ciphertext: arrayBufferToBase64(encryptedContent),
  });
}

export async function decryptData(encrypted: string, key: string): Promise<Result<string>> {
  try {
    const unformatted = unformat(encrypted);
    if (!unformatted.success) throw unformatted.error;

    const { ciphertext, iv, salt } = unformatted.data;
    const derivedKey = await deriveKey(key, base64ToArrayBuffer(salt));

    const decryptedContent = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64ToArrayBuffer(iv) }, derivedKey, base64ToArrayBuffer(ciphertext));

    return { success: true, data: await uint8ToString(new Uint8Array(decryptedContent)) };
  } catch (e) {
    const desc = e instanceof Error ? e.message : "unknown error";
    return { success: false, error: desc === "" ? new Error("Password wrong") : new Error("Decryption failed: " + desc) };
  }
}
