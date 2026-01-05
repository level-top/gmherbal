import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPartnerFromSession } from "@/lib/partnerSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const partner = await getPartnerFromSession().catch(() => null);
  if (!partner) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const row = await prisma.partner.findFirst(
      {
        where: { id: partner.id },
        select: {
          payoutMethod: true,
          payoutAccountName: true,
          payoutAccountNumber: true,
          payoutBankName: true,
          payoutIban: true,
          payoutPhone: true,
          payoutNotes: true,
        },
      } as any,
    );

    return NextResponse.json({ ok: true, payout: row });
  } catch {
    return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const partner = await getPartnerFromSession().catch(() => null);
  if (!partner) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        payoutMethod?: unknown;
        payoutAccountName?: unknown;
        payoutAccountNumber?: unknown;
        payoutBankName?: unknown;
        payoutIban?: unknown;
        payoutPhone?: unknown;
        payoutNotes?: unknown;
      }
    | null;

  const payoutMethod = typeof body?.payoutMethod === "string" ? body.payoutMethod.trim() : "";
  const payoutAccountName =
    typeof body?.payoutAccountName === "string" ? body.payoutAccountName.trim() : "";
  const payoutAccountNumber =
    typeof body?.payoutAccountNumber === "string" ? body.payoutAccountNumber.trim() : "";
  const payoutBankName = typeof body?.payoutBankName === "string" ? body.payoutBankName.trim() : "";
  const payoutIban = typeof body?.payoutIban === "string" ? body.payoutIban.trim() : "";
  const payoutPhone = typeof body?.payoutPhone === "string" ? body.payoutPhone.trim() : "";
  const payoutNotes = typeof body?.payoutNotes === "string" ? body.payoutNotes.trim() : "";

  try {
    const updated = await prisma.partner.update(
      {
        where: { id: partner.id },
        data: {
          payoutMethod: payoutMethod || null,
          payoutAccountName: payoutAccountName || null,
          payoutAccountNumber: payoutAccountNumber || null,
          payoutBankName: payoutBankName || null,
          payoutIban: payoutIban || null,
          payoutPhone: payoutPhone || null,
          payoutNotes: payoutNotes || null,
        },
        select: {
          payoutMethod: true,
          payoutAccountName: true,
          payoutAccountNumber: true,
          payoutBankName: true,
          payoutIban: true,
          payoutPhone: true,
          payoutNotes: true,
        },
      } as any,
    );

    return NextResponse.json({ ok: true, payout: updated });
  } catch {
    return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
  }
}
