import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { orderId?: unknown; phone?: unknown }
    | null;

  const orderId = typeof body?.orderId === "string" ? body.orderId.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";

  if (!orderId) {
    return NextResponse.json({ ok: false, error: "Order ID is required" }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json({ ok: false, error: "Phone number is required" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        OR: [{ phone1: phone }, { phone2: phone }],
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        product: { select: { name: true, slug: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, order });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Database is not configured yet" },
      { status: 503 },
    );
  }
}
