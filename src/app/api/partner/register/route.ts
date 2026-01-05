import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { setPartnerCookie } from "@/lib/partnerSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        name?: unknown;
        email?: unknown;
        phone?: unknown;
        password?: unknown;
      }
    | null;

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";

  const password = typeof body?.password === "string" ? body.password : "";

  if (!name) {
    return NextResponse.json({ ok: false, error: "Name is required" }, { status: 400 });
  }

  if (!email && !phone) {
    return NextResponse.json({ ok: false, error: "Email or phone is required" }, { status: 400 });
  }

  if (!password || password.length < 6) {
    return NextResponse.json(
      { ok: false, error: "Password must be at least 6 characters" },
      { status: 400 },
    );
  }

  try {
    // Best-effort prevention of duplicate accounts.
    const existing = await prisma.partner.findFirst({
      where: {
        OR: [
          email ? { email } : undefined,
          phone ? { phone } : undefined,
        ].filter(Boolean) as any,
      },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "An account with this email/phone already exists" },
        { status: 409 },
      );
    }

    const passwordHash = hashPassword(password);

    const partner = await prisma.partner.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        passwordHash,
        status: "ACTIVE",
      },
      select: { id: true, status: true },
    });

    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14; // 14 days
    await setPartnerCookie(partner.id, expiresAt);

    return NextResponse.json({ ok: true, partner });
  } catch (e: any) {
    const msg = typeof e?.message === "string" ? e.message : "";
    if (msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("duplicate")) {
      return NextResponse.json(
        { ok: false, error: "An account with this email already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
  }
}
