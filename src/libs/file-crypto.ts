import { stringToUint8 } from "./buffer";

// reuse the same deriveKey logic as crypto.ts
async function deriveKey(password: string, salt: BufferSource) {
  const passwordBuffer = await stringToUint8(password);
  const keyMaterial = await crypto.subtle.importKey("raw", passwordBuffer, { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, keyMaterial, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}

export type FileHeader = {
  name: string;
  mime: string;
};

/**
 * .enc binary layout:
 * [4 bytes: header length (uint32 BE)] [header JSON bytes] [16 bytes: salt] [12 bytes: iv] [ciphertext]
 */

export async function encryptFile(file: File, password: string): Promise<ArrayBuffer> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const derivedKey = await deriveKey(password, salt);

  const fileBuffer = await file.arrayBuffer();
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, derivedKey, fileBuffer);

  // encode metadata so we can restore filename + mime on decrypt
  const header: FileHeader = { name: file.name, mime: file.type || "application/octet-stream" };
  const headerBytes = await stringToUint8(JSON.stringify(header));

  // write header length as 4-byte big-endian uint32
  const headerLen = new Uint8Array(4);
  new DataView(headerLen.buffer).setUint32(0, headerBytes.byteLength, false);

  // concat everything into one ArrayBuffer
  const total = headerLen.byteLength + headerBytes.byteLength + salt.byteLength + iv.byteLength + ciphertext.byteLength;
  const out = new Uint8Array(total);
  let offset = 0;

  out.set(headerLen, offset);
  offset += headerLen.byteLength;
  out.set(headerBytes, offset);
  offset += headerBytes.byteLength;
  out.set(salt, offset);
  offset += salt.byteLength;
  out.set(iv, offset);
  offset += iv.byteLength;
  out.set(new Uint8Array(ciphertext), offset);

  return out.buffer;
}

export type DecryptedFile = {
  data: ArrayBuffer;
  header: FileHeader;
};

export async function decryptFile(encBuffer: ArrayBuffer, password: string): Promise<Result<DecryptedFile>> {
  try {
    const view = new DataView(encBuffer);
    const bytes = new Uint8Array(encBuffer);
    let offset = 0;

    // read header
    const headerLen = view.getUint32(0, false);
    offset += 4;

    const headerBytes = bytes.slice(offset, offset + headerLen);
    offset += headerLen;

    const header: FileHeader = JSON.parse(new TextDecoder().decode(headerBytes));

    // read salt + iv + ciphertext
    const salt = bytes.slice(offset, offset + 16);
    offset += 16;
    const iv = bytes.slice(offset, offset + 12);
    offset += 12;
    const ciphertext = bytes.slice(offset);

    const derivedKey = await deriveKey(password, salt);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, derivedKey, ciphertext);

    return { success: true, data: { data: decrypted, header } };
  } catch (e) {
    const desc = e instanceof SyntaxError ? "invalid .enc file" : e instanceof Error ? e.message : "unknown error";
    return { success: false, error: desc === "" ? new Error("Password wrong") : new Error("Decryption failed: " + desc) };
  }
}
