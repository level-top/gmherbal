import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPartnerFromApiKey } from "@/lib/partnerAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const apiKey = request.headers.get("x-api-key") ?? "";
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "Missing API key" }, { status: 401 });
  }

  try {
    const partner = await getPartnerFromApiKey(apiKey);
    if (!partner) {
      return NextResponse.json({ ok: false, error: "Invalid API key" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        imageUrl: true,
      },
    });

    return NextResponse.json({ ok: true, partner, products });
  } catch {
    return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
  }
}
