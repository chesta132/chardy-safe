import type { EncryptedData } from "../types/crypto";
import { pick } from "./manipulate/object";

/** Serializes encrypted parts as a semicolon-delimited string: iv;salt;ciphertext */
export function format({ iv, salt, ciphertext }: EncryptedData) {
  return `${iv};${salt};${ciphertext}`;
}

/**
 * Parses an encrypted string back into its parts.
 * Also handles the legacy JSON format for backwards compatibility.
 */
export function unformat(text: string): Result<EncryptedData> {
  // try legacy JSON format first
  try {
    const parsed = JSON.parse(text);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.iv === "string" &&
      typeof parsed.salt === "string" &&
      typeof parsed.ciphertext === "string"
    ) {
      return { success: true, data: pick(parsed, ["ciphertext", "iv", "salt"] satisfies (keyof EncryptedData)[]) };
    }
  } catch {
    // not JSON, fall through to current format
  }

  if (typeof text !== "string") {
    return { success: false, error: new Error("Text is not a string") };
  }

  const parts = text.split(";");
  if (parts.length !== 3) {
    return { success: false, error: new Error("Invalid format") };
  }

  return { success: true, data: { iv: parts[0], salt: parts[1], ciphertext: parts[2] } };
}
