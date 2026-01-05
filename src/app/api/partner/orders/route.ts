import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPartnerFromApiKey } from "@/lib/partnerAuth";
import { getPartnerFromSession } from "@/lib/partnerSession";
import { validatePartnerCreateOrderInput } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const apiKey = request.headers.get("x-api-key") ?? "";
    const partner = apiKey ? await getPartnerFromApiKey(apiKey) : await getPartnerFromSession();
    if (!partner) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { partnerId: partner.id },
      orderBy: [{ createdAt: "desc" }],
      take: 50,
      select: {
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
      },
    } as any);

    return NextResponse.json({ ok: true, partner, orders });
  } catch {
    return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const validated = validatePartnerCreateOrderInput(payload);
  if (!validated.ok || !validated.data) {
    return NextResponse.json(
      { ok: false, error: validated.error ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const apiKey = request.headers.get("x-api-key") ?? "";
    const partner = apiKey ? await getPartnerFromApiKey(apiKey) : await getPartnerFromSession();
    if (!partner) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const uniqueProductIds = Array.from(
      new Set(validated.data.items.map((i) => i.productId)),
    );

    const products = await prisma.product.findMany({
      where: { id: { in: uniqueProductIds }, isActive: true },
      select: { id: true, name: true, price: true },
    });

    const productById = new Map(products.map((p) => [p.id, p] as const));

    for (const it of validated.data.items) {
      const p = productById.get(it.productId);
      if (!p) {
        return NextResponse.json(
          { ok: false, error: `Invalid product: ${it.productId}` },
          { status: 400 },
        );
      }
      if (typeof p.price !== "number" || !Number.isFinite(p.price) || p.price <= 0) {
        return NextResponse.json(
          { ok: false, error: `Product has no price: ${p.name}` },
          { status: 400 },
        );
      }
      if (it.partnerUnitPrice < p.price) {
        return NextResponse.json(
          {
            ok: false,
            error: `partnerUnitPrice must be >= base price for ${p.name}`,
          },
          { status: 400 },
        );
      }
    }

    let totalBaseAmount = 0;
    let totalPartnerAmount = 0;
    let partnerProfit = 0;

    const itemsData = validated.data.items.map((it) => {
      const p = productById.get(it.productId)!;
      const baseUnitPrice = p.price as number;
      const partnerUnitPrice = it.partnerUnitPrice;

      totalBaseAmount += baseUnitPrice * it.qty;
      totalPartnerAmount += partnerUnitPrice * it.qty;
      partnerProfit += (partnerUnitPrice - baseUnitPrice) * it.qty;

      return {
        productId: p.id,
        productName: p.name,
        quantity: it.qty,
        baseUnitPrice,
        partnerUnitPrice,
      };
    });

    const firstProductId = itemsData[0]?.productId ?? null;

    const order = await prisma.order.create(
      {
        data: {
          productId: firstProductId,
          source: "PARTNER",
          partnerId: partner.id,
          status: "NEW",
          name: validated.data.name,
          fatherName: validated.data.fatherName,
          address: validated.data.address,
          phone1: validated.data.phone1,
          phone2: validated.data.phone2,
          totalBaseAmount,
          totalPartnerAmount,
          partnerProfit,
          partnerPayoutStatus: "PENDING",
          items: {
            create: itemsData,
          },
        },
        select: {
          id: true,
          createdAt: true,
          status: true,
          totalBaseAmount: true,
          totalPartnerAmount: true,
          partnerProfit: true,
          partnerPayoutStatus: true,
        },
      } as any,
    );

    return NextResponse.json({ ok: true, order });
  } catch {
    return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
  }
}
