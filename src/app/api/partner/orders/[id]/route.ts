import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPartnerFromApiKey } from "@/lib/partnerAuth";
import { getPartnerFromSession } from "@/lib/partnerSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const orderId = typeof id === "string" ? id.trim() : "";
  if (!orderId) {
    return NextResponse.json({ ok: false, error: "orderId required" }, { status: 400 });
  }

  try {
    const apiKey = request.headers.get("x-api-key") ?? "";
    const partner = apiKey ? await getPartnerFromApiKey(apiKey) : await getPartnerFromSession();
    if (!partner) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findFirst({
      where: ({ id: orderId, partnerId: partner.id } as any),
      select: ({
        id: true,
        status: true,
        createdAt: true,
        name: true,
        fatherName: true,
        address: true,
        phone1: true,
        phone2: true,
        totalBaseAmount: true,
        totalPartnerAmount: true,
        partnerProfit: true,
        partnerPayoutStatus: true,
        partnerPayoutPaidAt: true,
        items: {
          select: {
            productId: true,
            productName: true,
            quantity: true,
            baseUnitPrice: true,
            partnerUnitPrice: true,
          },
        },
      } as any),
    } as any);

    if (!order) {
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, order });
  } catch {
    return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
  }
}
