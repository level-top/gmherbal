import crypto from "crypto";

export function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

export function hmacSha256Hex(secret: string, input: string): string {
  return crypto.createHmac("sha256", secret).update(input, "utf8").digest("hex");
}

export function randomApiKey(): { plain: string; prefix: string; hash: string } {
  const bytes = crypto.randomBytes(32).toString("base64url");
  const plain = `gm_${bytes}`;
  const prefix = plain.slice(0, 8);
  const hash = sha256Hex(plain);
  return { plain, prefix, hash };
}

function parseEncryptionSecret(secret: string): Buffer {
  const trimmed = secret.trim();

  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, "hex");
  }

  // Best-effort base64 parsing. If it doesn't decode to 32 bytes, fall back to hashing.
  try {
    const b64 = Buffer.from(trimmed, "base64");
    if (b64.length === 32) return b64;
  } catch {
    // ignore
  }

  return crypto.createHash("sha256").update(trimmed, "utf8").digest();
}

function getApiKeyEncryptionKey(): Buffer {
  const secret = process.env.API_KEY_ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error("API_KEY_ENCRYPTION_SECRET is not set");
  }
  const key = parseEncryptionSecret(secret);
  if (key.length !== 32) {
    throw new Error("API_KEY_ENCRYPTION_SECRET must produce a 32-byte key");
  }
  return key;
}

export function encryptApiKey(plainKey: string): string {
  const key = getApiKeyEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plainKey, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `${iv.toString("base64")}.${tag.toString("base64")}.${ciphertext.toString("base64")}`;
}

export function decryptApiKey(encrypted: string): string {
  const key = getApiKeyEncryptionKey();
  const parts = encrypted.split(".");
  if (parts.length !== 3) throw new Error("Invalid encrypted api key format");

  const [ivB64, tagB64, ctB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const ciphertext = Buffer.from(ctB64, "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return plaintext.toString("utf8");
}
