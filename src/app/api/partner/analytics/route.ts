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
    const whereAll = { partnerId: partner.id, source: "PARTNER" } as any;

    const [count, totalProfitAgg, pendingAgg, paidAgg] = await Promise.all([
      prisma.order.count({ where: whereAll } as any),
      prisma.order.aggregate({ where: whereAll, _sum: { partnerProfit: true } } as any),
      prisma.order.aggregate({
        where: { ...whereAll, partnerPayoutStatus: "PENDING" },
        _sum: { partnerProfit: true },
      } as any),
      prisma.order.aggregate({
        where: { ...whereAll, partnerPayoutStatus: "PAID" },
        _sum: { partnerProfit: true },
      } as any),
    ]);

    return NextResponse.json({
      ok: true,
      analytics: {
        ordersCount: count,
        totalProfit: totalProfitAgg?._sum?.partnerProfit ?? 0,
        pendingProfit: pendingAgg?._sum?.partnerProfit ?? 0,
        paidProfit: paidAgg?._sum?.partnerProfit ?? 0,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
  }
}
