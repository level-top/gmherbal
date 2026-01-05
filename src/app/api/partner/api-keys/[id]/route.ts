import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPartnerFromSession } from "@/lib/partnerSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const partner = await getPartnerFromSession().catch(() => null);
  if (!partner) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  }

  try {
    const result = await prisma.apiKey.deleteMany({
      where: { id, partnerId: partner.id },
    });

    if (result.count === 0) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
  }
}
