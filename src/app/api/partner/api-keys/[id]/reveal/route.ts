import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPartnerFromSession } from "@/lib/partnerSession";
import { decryptApiKey } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const partner = await getPartnerFromSession().catch(() => null);
  if (!partner) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const apiKeyId = typeof id === "string" ? id.trim() : "";
  if (!apiKeyId) {
    return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  }

  try {
    const row = (await prisma.apiKey.findFirst(
      {
        where: { id: apiKeyId, partnerId: partner.id },
        select: { encryptedKey: true },
      } as any,
    )) as any;

    if (!row?.encryptedKey) {
      return NextResponse.json(
        {
          ok: false,
          error: "This key cannot be revealed again. Create a new key and store it safely.",
        },
        { status: 404 },
      );
    }

    try {
      const plain = decryptApiKey(row.encryptedKey);
      return NextResponse.json({ ok: true, apiKey: plain });
    } catch {
      return NextResponse.json(
        { ok: false, error: "Unable to decrypt key. Check API_KEY_ENCRYPTION_SECRET." },
        { status: 500 },
      );
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
  }
}
