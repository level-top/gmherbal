import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCreateOrderInput } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const validated = validateCreateOrderInput(payload);

  if (!validated.ok || !validated.data) {
    return NextResponse.json(
      { ok: false, error: validated.error ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const cartLines = (validated.data.items ?? []).map((it) => {
      const v = it.variant ? ` (${it.variant})` : "";
      return `- ${it.name}${v} x${it.qty}`;
    });

    const cartSummary = cartLines.length > 0 ? `\n\nCart:\n${cartLines.join("\n")}` : "";
    const addressWithCart = `${validated.data.address}${cartSummary}`;

    const order = await prisma.order.create({
      data: {
        productId: validated.data.items?.[0]?.productId,
        name: validated.data.name,
        fatherName: validated.data.fatherName,
        address: addressWithCart,
        phone1: validated.data.phone1,
        phone2: validated.data.phone2,
      },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, order });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Database is not configured yet" },
      { status: 503 },
    );
  }
}
