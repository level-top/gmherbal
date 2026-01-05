import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseNullableString(input: unknown): string | null {
  if (input === null) return null;
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  return trimmed ? trimmed : null;
}

function parseNullableInt(input: unknown): number | null {
  if (input === null) return null;
  if (typeof input === "number" && Number.isInteger(input)) return input;
  if (typeof input === "string") {
    const n = Number.parseInt(input, 10);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        customerName: true,
        city: true,
        content: true,
        videoUrl: true,
        rating: true,
        isApproved: true,
        createdAt: true,
        product: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ ok: true, testimonials });
  } catch {
    return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        productId?: unknown;
        customerName?: unknown;
        city?: unknown;
        content?: unknown;
        videoUrl?: unknown;
        rating?: unknown;
        isApproved?: unknown;
      }
    | null;

  const productId = parseNullableString(body?.productId);
  const customerName = typeof body?.customerName === "string" ? body.customerName.trim() : "";
  const city = parseNullableString(body?.city);
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  const videoUrl = parseNullableString(body?.videoUrl);
  const rating = parseNullableInt(body?.rating);
  const isApproved = typeof body?.isApproved === "boolean" ? body.isApproved : true;

  if (!customerName) {
    return NextResponse.json(
      { ok: false, error: "Customer name is required" },
      { status: 400 },
    );
  }
  if (!content) {
    return NextResponse.json({ ok: false, error: "Content is required" }, { status: 400 });
  }
  if (rating !== null && (rating < 1 || rating > 5)) {
    return NextResponse.json({ ok: false, error: "Rating must be 1-5" }, { status: 400 });
  }

  try {
    const testimonial = await prisma.testimonial.create({
      data: {
        productId,
        customerName,
        city,
        content,
        videoUrl,
        rating,
        isApproved,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, testimonial });
  } catch {
    return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        id?: unknown;
        productId?: unknown;
        customerName?: unknown;
        city?: unknown;
        content?: unknown;
        videoUrl?: unknown;
        rating?: unknown;
        isApproved?: unknown;
      }
    | null;

  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  if (Object.prototype.hasOwnProperty.call(body ?? {}, "productId")) {
    data.productId = parseNullableString(body?.productId);
  }

  if (typeof body?.customerName === "string") {
    const customerName = body.customerName.trim();
    if (!customerName) {
      return NextResponse.json(
        { ok: false, error: "Invalid customer name" },
        { status: 400 },
      );
    }
    data.customerName = customerName;
  }

  if (Object.prototype.hasOwnProperty.call(body ?? {}, "city")) {
    data.city = parseNullableString(body?.city);
  }

  if (typeof body?.content === "string") {
    const content = body.content.trim();
    if (!content) {
      return NextResponse.json({ ok: false, error: "Invalid content" }, { status: 400 });
    }
    data.content = content;
  }

  if (Object.prototype.hasOwnProperty.call(body ?? {}, "videoUrl")) {
    data.videoUrl = parseNullableString(body?.videoUrl);
  }

  if (Object.prototype.hasOwnProperty.call(body ?? {}, "rating")) {
    const rating = parseNullableInt(body?.rating);
    if (rating !== null && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { ok: false, error: "Rating must be 1-5" },
        { status: 400 },
      );
    }
    data.rating = rating;
  }

  if (typeof body?.isApproved === "boolean") data.isApproved = body.isApproved;

  try {
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data,
      select: {
        id: true,
        isApproved: true,
        rating: true,
      },
    });

    return NextResponse.json({ ok: true, testimonial });
  } catch {
    return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { id?: unknown }
    | null;

  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  }

  try {
    await prisma.testimonial.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
  }
}
