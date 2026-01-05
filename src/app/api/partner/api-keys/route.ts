import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPartnerFromSession } from "@/lib/partnerSession";
import { encryptApiKey, randomApiKey } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const partner = await getPartnerFromSession().catch(() => null);
  if (!partner) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = (await prisma.apiKey.findMany(
      {
        where: { partnerId: partner.id },
        orderBy: [{ createdAt: "desc" }],
        select: {
          id: true,
          prefix: true,
          isActive: true,
          createdAt: true,
          lastUsedAt: true,
          encryptedKey: true,
        },
      } as any,
    )) as any[];

    const apiKeys = rows.map((k) => ({
      id: k.id,
      prefix: k.prefix,
      isActive: k.isActive,
      createdAt: k.createdAt,
      lastUsedAt: k.lastUsedAt,
      canReveal: Boolean(k.encryptedKey),
    }));

    return NextResponse.json({ ok: true, apiKeys });
  } catch {
    return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
  }
}

export async function POST() {
  const partner = await getPartnerFromSession().catch(() => null);
  if (!partner) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { plain, prefix, hash } = randomApiKey();

  let encryptedKey: string | null = null;
  try {
    encryptedKey = encryptApiKey(plain);
  } catch {
    // Optional: partner can still store the key themselves.
    encryptedKey = null;
  }

  try {
    await prisma.apiKey.create(
      {
        data: {
          partnerId: partner.id,
          prefix,
          keyHash: hash,
          encryptedKey,
        },
        select: { id: true },
      } as any,
    );

    return NextResponse.json({ ok: true, apiKey: plain });
  } catch {
    return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
  }
}
