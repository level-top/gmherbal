import crypto from "crypto";

const ALGO = "pbkdf2_sha256";
const ITERATIONS = 200_000;
const KEYLEN = 32;

export function hashPassword(password: string): string {
  const pwd = password ?? "";
  if (pwd.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const salt = crypto.randomBytes(16).toString("base64");
  const derived = crypto.pbkdf2Sync(pwd, salt, ITERATIONS, KEYLEN, "sha256");
  const hash = derived.toString("base64");
  return `${ALGO}$${ITERATIONS}$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = (stored ?? "").split("$");
  if (parts.length !== 4) return false;
  const [algo, iterStr, salt, hash] = parts;
  if (algo !== ALGO) return false;
  const iterations = Number(iterStr);
  if (!Number.isFinite(iterations) || iterations <= 0) return false;

  const derived = crypto.pbkdf2Sync(password ?? "", salt, iterations, KEYLEN, "sha256");
  const candidate = Buffer.from(derived.toString("base64"), "utf8");
  const expected = Buffer.from(hash, "utf8");

  // Use timingSafeEqual only when lengths match.
  if (candidate.length !== expected.length) return false;
  return crypto.timingSafeEqual(candidate, expected);
}
