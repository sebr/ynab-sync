import { createCipher, createDecipher } from "crypto";

export interface Secrets {
  ENCRYPTION_KEY: string;
  YNAB_API_TOKEN: string;
  PUSHOVER_USER?: string;
  PUSHOVER_TOKEN?: string;
}

const ENCRYPTION_ALGORITHM = "aes-192-cbc";

export function decryptValue(value: string, password: string): string {
  const decipher = createDecipher(ENCRYPTION_ALGORITHM, password);
  let decrypted = decipher.update(value, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export async function encryptValue(value: string, password: string): Promise<string> {
  const cipher = createCipher(ENCRYPTION_ALGORITHM, password);
  let encrypted = cipher.update(value, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}
