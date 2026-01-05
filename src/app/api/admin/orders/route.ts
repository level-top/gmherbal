import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminAuth";
import { OrderStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseOrderStatus(input: unknown): OrderStatus | null {
  if (typeof input !== "string") return null;
  if (input === "NEW") return OrderStatus.NEW;
  if (input === "CONFIRMED") return OrderStatus.CONFIRMED;
  if (input === "SHIPPED") return OrderStatus.SHIPPED;
  if (input === "CANCELLED") return OrderStatus.CANCELLED;
  return null;
}

export async function GET(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const qRaw = url.searchParams.get("q") ?? "";
  const q = qRaw.trim();
  const sourceRaw = (url.searchParams.get("source") ?? "").trim().toUpperCase();
  const source = sourceRaw === "PUBLIC" || sourceRaw === "PARTNER" ? sourceRaw : "";
  const status = parseOrderStatus((url.searchParams.get("status") ?? "").trim().toUpperCase());
  const mode = (url.searchParams.get("mode") ?? "").trim().toLowerCase();

  try {
    const where =
      q || source || status
        ? {
            ...(source ? { source: source as any } : {}),
            ...(status ? { status } : {}),
            ...(q
              ? {
                  OR: [
                    { id: { contains: q } },
                    { phone1: { contains: q } },
                    { phone2: { contains: q } },
                    { name: { contains: q } },
                  ],
                }
              : {}),
          }
        : undefined;

    if (mode === "count") {
      const count = await prisma.order.count({ where });
      return NextResponse.json({ ok: true, count });
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      take: 50,
      select: {
        id: true,
        source: true,
        status: true,
        name: true,
        fatherName: true,
        address: true,
        phone1: true,
        phone2: true,
        createdAt: true,
        totalBaseAmount: true,
        totalPartnerAmount: true,
        partnerProfit: true,
        partnerPayoutStatus: true,
        partnerPayoutPaidAt: true,
        partner: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ ok: true, orders });
  } catch {
    return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { orderId?: unknown; status?: unknown; partnerPayoutStatus?: unknown }
    | null;

  const orderId = typeof body?.orderId === "string" ? body.orderId : "";
  const status = parseOrderStatus(body?.status);
  const payoutStatusRaw = typeof body?.partnerPayoutStatus === "string" ? body.partnerPayoutStatus : "";
  const payoutStatus = payoutStatusRaw === "PENDING" || payoutStatusRaw === "PAID" ? payoutStatusRaw : null;

  if (!orderId) {
    return NextResponse.json({ ok: false, error: "orderId required" }, { status: 400 });
  }
  if (!status && !payoutStatus) {
    return NextResponse.json(
      { ok: false, error: "status or partnerPayoutStatus is required" },
      { status: 400 },
    );
  }

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(status ? { status } : {}),
        ...(payoutStatus
          ? {
              partnerPayoutStatus: payoutStatus,
              partnerPayoutPaidAt: payoutStatus === "PAID" ? new Date() : null,
            }
          : {}),
      },
      select: { id: true, status: true, partnerPayoutStatus: true },
    });

    return NextResponse.json({ ok: true, order });
  } catch {
    return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
  }
}
