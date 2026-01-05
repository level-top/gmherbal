import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminAuth";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function asString(input: unknown): string {
  return typeof input === "string" ? input.trim() : "";
}

function asNullableInt(input: unknown): number | null {
  if (input === null) return null;
  if (typeof input === "number" && Number.isFinite(input)) return Math.trunc(input);
  if (typeof input === "string") {
    const n = Number.parseInt(input, 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function faqDbNotReady(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2021: table does not exist
    if (error.code === "P2021") {
      return NextResponse.json(
        {
          ok: false,
          error: "FAQ table not found. Run `npx prisma migrate dev` to apply migrations.",
        },
        { status: 503 },
      );
    }
  }

  return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
}

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const faqs = await prisma.faq.findMany({
      orderBy: [{ sortOrder: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ ok: true, faqs });
  } catch (e) {
    return faqDbNotReady(e);
  }
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const question = asString(body?.question);
  const answer = asString(body?.answer);
  const isActive = typeof body?.isActive === "boolean" ? body.isActive : true;
  const sortOrder = asNullableInt(body?.sortOrder) ?? 0;

  if (!question) return NextResponse.json({ ok: false, error: "Question is required" }, { status: 400 });
  if (!answer) return NextResponse.json({ ok: false, error: "Answer is required" }, { status: 400 });

  try {
    const faq = await prisma.faq.create({
      data: { question, answer, isActive, sortOrder },
    });

    return NextResponse.json({ ok: true, faq });
  } catch (e) {
    return faqDbNotReady(e);
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const id = asString(body?.id);
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (typeof body?.question === "string") {
    const v = asString(body.question);
    if (!v) return NextResponse.json({ ok: false, error: "Invalid question" }, { status: 400 });
    data.question = v;
  }
  if (typeof body?.answer === "string") {
    const v = asString(body.answer);
    if (!v) return NextResponse.json({ ok: false, error: "Invalid answer" }, { status: 400 });
    data.answer = v;
  }
  if (typeof body?.isActive === "boolean") data.isActive = body.isActive;
  if (body && ("sortOrder" in body)) data.sortOrder = asNullableInt(body.sortOrder) ?? 0;

  try {
    const faq = await prisma.faq.update({ where: { id }, data });
    return NextResponse.json({ ok: true, faq });
  } catch (e) {
    return faqDbNotReady(e);
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const id = asString(body?.id);
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

  try {
    await prisma.faq.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return faqDbNotReady(e);
  }
}
