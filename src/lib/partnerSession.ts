import { cookies } from "next/headers";
import { hmacSha256Hex } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "gm_partner";

function getSecret(): string {
  return process.env.PARTNER_SESSION_SECRET ?? "";
}

export function signPartnerSession(partnerId: string, expiresAtEpochSeconds: number): string {
  const secret = getSecret();
  const payload = `${partnerId}.${expiresAtEpochSeconds}`;
  const sig = hmacSha256Hex(secret, payload);
  return `${payload}.${sig}`;
}

export function verifyPartnerSession(token: string | undefined | null): {
  ok: boolean;
  partnerId?: string;
} {
  if (!token) return { ok: false };
  const secret = getSecret();
  if (!secret) return { ok: false };

  const parts = token.split(".");
  // partnerId may contain dots? cuid doesn't. Expect: partnerId.exp.sig
  if (parts.length !== 3) return { ok: false };
  const [partnerId, expStr, sig] = parts;

  const exp = Number(expStr);
  if (!partnerId) return { ok: false };
  if (!Number.isFinite(exp) || exp <= 0) return { ok: false };
  if (Math.floor(Date.now() / 1000) > exp) return { ok: false };

  const expected = hmacSha256Hex(secret, `${partnerId}.${expStr}`);
  if (sig !== expected) return { ok: false };

  return { ok: true, partnerId };
}

export async function setPartnerCookie(partnerId: string, expiresAtEpochSeconds: number) {
  const value = signPartnerSession(partnerId, expiresAtEpochSeconds);
  const jar = await cookies();
  jar.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAtEpochSeconds * 1000),
  });
}

export async function clearPartnerCookie() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export async function getPartnerFromSession(): Promise<
  | {
      id: string;
      name: string;
      status: string;
      email: string | null;
      phone: string | null;
    }
  | null
> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  const verified = verifyPartnerSession(token);
  if (!verified.ok || !verified.partnerId) return null;

  const partner = await prisma.partner.findFirst({
    where: { id: verified.partnerId },
    select: { id: true, name: true, status: true, email: true, phone: true },
  });

  if (!partner) return null;
  if (partner.status !== "ACTIVE") return null;
  return partner;
}
