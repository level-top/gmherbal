import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setPartnerCookie } from "@/lib/partnerSession";
import { verifyPassword } from "@/lib/password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { identifier?: unknown; password?: unknown }
    | null;

  const identifier = typeof body?.identifier === "string" ? body.identifier.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!identifier) {
    return NextResponse.json({ ok: false, error: "Email or phone is required" }, { status: 400 });
  }
  if (!password) {
    return NextResponse.json({ ok: false, error: "Password is required" }, { status: 400 });
  }

  try {
    const partner = (await prisma.partner.findFirst(
      {
        where: {
          OR: [{ email: identifier }, { phone: identifier }],
        },
        select: { id: true, status: true, passwordHash: true },
      } as any,
    )) as any;

    if (!partner || partner.status !== "ACTIVE" || !partner.passwordHash) {
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    }

    const ok = verifyPassword(password, partner.passwordHash);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    }

    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14; // 14 days
    await setPartnerCookie(partner.id, expiresAt);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
  }
}
