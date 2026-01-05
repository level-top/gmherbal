import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isoDay(d: Date): string {
  const copy = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  return copy.toISOString().slice(0, 10);
}

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [productsTotal, productsActive, partnersTotal, testimonialsTotal, testimonialsApproved] =
      await Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { isActive: true } }),
        prisma.partner.count(),
        prisma.testimonial.count(),
        prisma.testimonial.count({ where: { isApproved: true } }),
      ]);

    const ordersTotal = await prisma.order.count();

    // Orders by status (fallback to JS if groupBy is unavailable)
    let ordersByStatus: Record<string, number> = { NEW: 0, CONFIRMED: 0, SHIPPED: 0, CANCELLED: 0 };
    try {
      const grouped = await (prisma.order as any).groupBy({
        by: ["status"],
        _count: { _all: true },
      });

      if (Array.isArray(grouped)) {
        for (const row of grouped) {
          const status = String(row.status);
          const count = Number(row?._count?._all ?? 0);
          ordersByStatus[status] = count;
        }
      }
    } catch {
      const all = await prisma.order.findMany({ select: { status: true } });
      ordersByStatus = all.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] ?? 0) + 1;
        return acc;
      }, { NEW: 0, CONFIRMED: 0, SHIPPED: 0, CANCELLED: 0 } as Record<string, number>);
    }

    // Last 7 days orders time series
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const recent = await prisma.order.findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true },
    });

    const buckets: { day: string; count: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      buckets.push({ day: isoDay(d), count: 0 });
    }

    const byDay = new Map<string, number>();
    for (const o of recent) {
      const day = isoDay(new Date(o.createdAt));
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
    }

    for (const b of buckets) b.count = byDay.get(b.day) ?? 0;

    return NextResponse.json({
      ok: true,
      analytics: {
        products: { total: productsTotal, active: productsActive },
        orders: { total: ordersTotal, byStatus: ordersByStatus, last7Days: buckets },
        reviews: { total: testimonialsTotal, approved: testimonialsApproved },
        partners: { total: partnersTotal },
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
  }
}
