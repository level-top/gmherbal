import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const certifications = await prisma.certification.findMany({
      where: { isActive: true },
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        authority: true,
        refNo: true,
        imageUrl: true,
      },
    });

    return NextResponse.json({ ok: true, certifications });
  } catch {
    return NextResponse.json({ ok: true, certifications: [] });
  }
}
