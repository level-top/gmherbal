import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Kind = "category" | "oilType" | "variant" | "extraction";

function parseKind(input: unknown): Kind | null {
  if (input === "category" || input === "oilType" || input === "variant" || input === "extraction") return input;
  return null;
}

function normalizeCode(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64);
}

function modelFor(kind: Kind): any {
  switch (kind) {
    case "category":
      return (prisma as any).productCategoryOption;
    case "oilType":
      return (prisma as any).oilTypeOption;
    case "variant":
      return (prisma as any).productVariantOption;
    case "extraction":
      return (prisma as any).extractionMethodOption;
  }
}

export async function GET(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const kind = parseKind(url.searchParams.get("kind"));
  if (!kind) {
    return NextResponse.json({ ok: false, error: "kind is required" }, { status: 400 });
  }

  try {
    const rows = await modelFor(kind).findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, code: true, name: true, sortOrder: true, isActive: true } as any,
    });
    return NextResponse.json({ ok: true, options: rows });
  } catch {
    return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const kind = parseKind(url.searchParams.get("kind"));
  if (!kind) {
    return NextResponse.json({ ok: false, error: "kind is required" }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        name?: unknown;
        code?: unknown;
        sortOrder?: unknown;
        isActive?: unknown;
      }
    | null;

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ ok: false, error: "Name is required" }, { status: 400 });
  }

  const code = typeof body?.code === "string" && body.code.trim() ? normalizeCode(body.code) : normalizeCode(name);
  if (!code) {
    return NextResponse.json({ ok: false, error: "Invalid code" }, { status: 400 });
  }

  const sortOrder = typeof body?.sortOrder === "number" && Number.isFinite(body.sortOrder) ? Math.floor(body.sortOrder) : 0;
  const isActive = typeof body?.isActive === "boolean" ? body.isActive : true;

  try {
    const created = await modelFor(kind).create({
      data: { code, name, sortOrder, isActive } as any,
      select: { id: true, code: true, name: true, sortOrder: true, isActive: true } as any,
    });
    return NextResponse.json({ ok: true, option: created });
  } catch (e: any) {
    const msg = typeof e?.message === "string" ? e.message : "Unable to create";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const kind = parseKind(url.searchParams.get("kind"));
  if (!kind) {
    return NextResponse.json({ ok: false, error: "kind is required" }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        id?: unknown;
        name?: unknown;
        code?: unknown;
        sortOrder?: unknown;
        isActive?: unknown;
      }
    | null;

  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body?.name === "string") {
    const name = body.name.trim();
    if (!name) return NextResponse.json({ ok: false, error: "Invalid name" }, { status: 400 });
    data.name = name;
  }
  if (typeof body?.code === "string") {
    const code = normalizeCode(body.code);
    if (!code) return NextResponse.json({ ok: false, error: "Invalid code" }, { status: 400 });
    data.code = code;
  }
  if (Object.prototype.hasOwnProperty.call(body ?? {}, "sortOrder")) {
    const v = body?.sortOrder;
    data.sortOrder = typeof v === "number" && Number.isFinite(v) ? Math.floor(v) : 0;
  }
  if (typeof body?.isActive === "boolean") data.isActive = body.isActive;

  try {
    const updated = await modelFor(kind).update({
      where: { id } as any,
      data,
      select: { id: true, code: true, name: true, sortOrder: true, isActive: true } as any,
    });
    return NextResponse.json({ ok: true, option: updated });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to update" }, { status: 400 });
  }
}
