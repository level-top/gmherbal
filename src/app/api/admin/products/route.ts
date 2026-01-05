import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveOptionIdByCode(kind: "category" | "oilType" | "variant" | "extraction", input: unknown): Promise<string | null> {
  if (input === null) return null;
  if (typeof input !== "string") return null;
  const code = input.trim();
  if (!code) return null;

  const model: any =
    kind === "category"
      ? (prisma as any).productCategoryOption
      : kind === "oilType"
        ? (prisma as any).oilTypeOption
        : kind === "variant"
          ? (prisma as any).productVariantOption
          : (prisma as any).extractionMethodOption;

  const row = await model.findFirst({
    where: { code, isActive: true } as any,
    select: { id: true } as any,
  });

  return row?.id ?? null;
}

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

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        category: { select: { code: true, name: true } },
        oilType: { select: { code: true, name: true } },
        variant: { select: { code: true, name: true } },
        extraction: { select: { code: true, name: true } },
        sizeLabel: true,
        price: true,
        imageUrl: true,
        isFeatured: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
      } as any,
    });

    const shaped = products.map((p: any) => ({
      ...p,
      category: p.category?.code ?? null,
      oilType: p.oilType?.code ?? null,
      variant: p.variant?.code ?? null,
      extraction: p.extraction?.code ?? null,
    }));

    return NextResponse.json({ ok: true, products: shaped });
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
        name?: unknown;
        description?: unknown;
        category?: unknown;
        oilType?: unknown;
        variant?: unknown;
        extraction?: unknown;
        sizeLabel?: unknown;
        price?: unknown;
        priceCents?: unknown;
        imageUrl?: unknown;
        isFeatured?: unknown;
        sortOrder?: unknown;
        isActive?: unknown;
      }
    | null;

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const description =
    typeof body?.description === "string" ? body.description.trim() : "";
  const isActive = typeof body?.isActive === "boolean" ? body.isActive : true;
  const isFeatured = typeof body?.isFeatured === "boolean" ? body.isFeatured : false;
  const sortOrder = parseNullableInt(body?.sortOrder) ?? 0;
  const sizeLabel = parseNullableString(body?.sizeLabel);
  const price = parseNullableInt(body?.price ?? body?.priceCents);
  const imageUrl = parseNullableString(body?.imageUrl);

  if (!name) {
    return NextResponse.json({ ok: false, error: "Name is required" }, { status: 400 });
  }
  if (!description) {
    return NextResponse.json(
      { ok: false, error: "Description is required" },
      { status: 400 },
    );
  }

  const baseSlug = slugify(name);
  if (!baseSlug) {
    return NextResponse.json({ ok: false, error: "Invalid name" }, { status: 400 });
  }

  try {
    const categoryId = await resolveOptionIdByCode("category", body?.category);
    const oilTypeId = await resolveOptionIdByCode("oilType", body?.oilType);
    const variantId = await resolveOptionIdByCode("variant", body?.variant);
    const extractionId = await resolveOptionIdByCode("extraction", body?.extraction);

    const existingCount = await prisma.product.count({
      where: { slug: { startsWith: baseSlug } },
    });

    const slug = existingCount > 0 ? `${baseSlug}-${existingCount + 1}` : baseSlug;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        categoryId,
        oilTypeId,
        variantId,
        extractionId,
        sizeLabel,
        price,
        imageUrl,
        isFeatured,
        sortOrder,
        isActive,
      } as any,
      select: { id: true, name: true, slug: true, isActive: true },
    });

    return NextResponse.json({ ok: true, product });
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
        name?: unknown;
        description?: unknown;
        category?: unknown;
        oilType?: unknown;
        variant?: unknown;
        extraction?: unknown;
        sizeLabel?: unknown;
        price?: unknown;
        priceCents?: unknown;
        imageUrl?: unknown;
        isFeatured?: unknown;
        sortOrder?: unknown;
        isActive?: unknown;
      }
    | null;

  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  if (typeof body?.name === "string") {
    const name = body.name.trim();
    if (!name) {
      return NextResponse.json({ ok: false, error: "Invalid name" }, { status: 400 });
    }
    data.name = name;
  }

  if (typeof body?.description === "string") {
    const description = body.description.trim();
    if (!description) {
      return NextResponse.json(
        { ok: false, error: "Invalid description" },
        { status: 400 },
      );
    }
    data.description = description;
  }

  if (Object.prototype.hasOwnProperty.call(body ?? {}, "category")) {
    data.categoryId = body?.category === null ? null : await resolveOptionIdByCode("category", body?.category);
  }
  if (Object.prototype.hasOwnProperty.call(body ?? {}, "oilType")) {
    data.oilTypeId = body?.oilType === null ? null : await resolveOptionIdByCode("oilType", body?.oilType);
  }
  if (Object.prototype.hasOwnProperty.call(body ?? {}, "variant")) {
    data.variantId = body?.variant === null ? null : await resolveOptionIdByCode("variant", body?.variant);
  }
  if (Object.prototype.hasOwnProperty.call(body ?? {}, "extraction")) {
    data.extractionId = body?.extraction === null ? null : await resolveOptionIdByCode("extraction", body?.extraction);
  }
  if (Object.prototype.hasOwnProperty.call(body ?? {}, "sizeLabel")) {
    data.sizeLabel = parseNullableString(body?.sizeLabel);
  }
  if (
    Object.prototype.hasOwnProperty.call(body ?? {}, "price") ||
    Object.prototype.hasOwnProperty.call(body ?? {}, "priceCents")
  ) {
    data.price = parseNullableInt((body as any)?.price ?? (body as any)?.priceCents);
  }
  if (Object.prototype.hasOwnProperty.call(body ?? {}, "imageUrl")) {
    data.imageUrl = parseNullableString(body?.imageUrl);
  }
  if (typeof body?.isFeatured === "boolean") data.isFeatured = body.isFeatured;
  if (typeof body?.isActive === "boolean") data.isActive = body.isActive;
  if (Object.prototype.hasOwnProperty.call(body ?? {}, "sortOrder")) {
    const sortOrder = parseNullableInt(body?.sortOrder);
    data.sortOrder = sortOrder ?? 0;
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        category: { select: { code: true, name: true } },
        oilType: { select: { code: true, name: true } },
        variant: { select: { code: true, name: true } },
        extraction: { select: { code: true, name: true } },
        sizeLabel: true,
        price: true,
        imageUrl: true,
        isFeatured: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
      } as any,
    });

    const shaped = {
      ...(product as any),
      category: (product as any)?.category?.code ?? null,
      oilType: (product as any)?.oilType?.code ?? null,
      variant: (product as any)?.variant?.code ?? null,
      extraction: (product as any)?.extraction?.code ?? null,
    };

    return NextResponse.json({ ok: true, product: shaped });
  } catch {
    return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const idFromQuery = url.searchParams.get("id");
  const body = (await request.json().catch(() => null)) as { id?: unknown } | null;
  const id = typeof idFromQuery === "string" && idFromQuery ? idFromQuery : typeof body?.id === "string" ? body.id : "";

  if (!id) {
    return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  }

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to delete product" },
      { status: 400 },
    );
  }
}
