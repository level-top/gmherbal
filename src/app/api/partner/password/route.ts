import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPartnerFromSession } from "@/lib/partnerSession";
import { hashPassword, verifyPassword } from "@/lib/password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const partner = await getPartnerFromSession().catch(() => null);
  if (!partner) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { currentPassword?: unknown; newPassword?: unknown }
    | null;

  const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (!currentPassword) {
    return NextResponse.json({ ok: false, error: "Current password is required" }, { status: 400 });
  }
  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json(
      { ok: false, error: "New password must be at least 6 characters" },
      { status: 400 },
    );
  }

  try {
    const row = (await prisma.partner.findFirst(
      {
        where: { id: partner.id },
        select: { id: true, passwordHash: true },
      } as any,
    )) as any;

    if (!row?.passwordHash) {
      return NextResponse.json({ ok: false, error: "Password is not set" }, { status: 400 });
    }

    const ok = verifyPassword(currentPassword, row.passwordHash);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "Current password is incorrect" }, { status: 400 });
    }

    const passwordHash = hashPassword(newPassword);
    await prisma.partner.update(
      {
        where: { id: partner.id },
        data: { passwordHash },
        select: { id: true },
      } as any,
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
  }
}
