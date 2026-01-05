import { cookies } from "next/headers";
import { hmacSha256Hex } from "@/lib/crypto";

const COOKIE_NAME = "gm_admin";

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

export function signAdminSession(expiresAtEpochSeconds: number): string {
  const secret = getSecret();
  const payload = String(expiresAtEpochSeconds);
  const sig = hmacSha256Hex(secret, payload);
  return `${payload}.${sig}`;
}

export function verifyAdminSession(token: string | undefined | null): boolean {
  if (!token) return false;
  const secret = getSecret();
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [expStr, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp <= 0) return false;
  if (Math.floor(Date.now() / 1000) > exp) return false;

  const expected = hmacSha256Hex(secret, expStr);
  return sig === expected;
}

export async function isAdminRequest(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  return verifyAdminSession(token);
}

export async function setAdminCookie(expiresAtEpochSeconds: number) {
  const value = signAdminSession(expiresAtEpochSeconds);
  const jar = await cookies();
  jar.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAtEpochSeconds * 1000),
  });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}
