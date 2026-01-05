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

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const certifications = await prisma.certification.findMany({
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        authority: true,
        refNo: true,
        imageUrl: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, certifications });
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
        title?: unknown;
        authority?: unknown;
        refNo?: unknown;
        imageUrl?: unknown;
        isActive?: unknown;
      }
    | null;

  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const authority = typeof body?.authority === "string" ? body.authority.trim() : "";
  const refNo = parseNullableString(body?.refNo);
  const imageUrl = parseNullableString(body?.imageUrl);
  const isActive = typeof body?.isActive === "boolean" ? body.isActive : true;

  if (!title) {
    return NextResponse.json({ ok: false, error: "Title is required" }, { status: 400 });
  }
  if (!authority) {
    return NextResponse.json(
      { ok: false, error: "Authority is required" },
      { status: 400 },
    );
  }

  try {
    const certification = await prisma.certification.create({
      data: { title, authority, refNo, imageUrl, isActive },
      select: { id: true, title: true, authority: true, isActive: true },
    });

    return NextResponse.json({ ok: true, certification });
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
        title?: unknown;
        authority?: unknown;
        refNo?: unknown;
        imageUrl?: unknown;
        isActive?: unknown;
      }
    | null;

  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  if (typeof body?.title === "string") {
    const title = body.title.trim();
    if (!title) {
      return NextResponse.json({ ok: false, error: "Invalid title" }, { status: 400 });
    }
    data.title = title;
  }

  if (typeof body?.authority === "string") {
    const authority = body.authority.trim();
    if (!authority) {
      return NextResponse.json(
        { ok: false, error: "Invalid authority" },
        { status: 400 },
      );
    }
    data.authority = authority;
  }

  if (Object.prototype.hasOwnProperty.call(body ?? {}, "refNo")) {
    data.refNo = parseNullableString(body?.refNo);
  }

  if (Object.prototype.hasOwnProperty.call(body ?? {}, "imageUrl")) {
    data.imageUrl = parseNullableString(body?.imageUrl);
  }

  if (typeof body?.isActive === "boolean") data.isActive = body.isActive;

  try {
    const certification = await prisma.certification.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        authority: true,
        refNo: true,
        imageUrl: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, certification });
  } catch {
    return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
  }
}
