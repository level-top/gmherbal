import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isApproved: true },
      orderBy: [{ createdAt: "desc" }],
      take: 12,
      select: {
        id: true,
        customerName: true,
        city: true,
        content: true,
        rating: true,
        videoUrl: true,
        createdAt: true,
        product: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json({ ok: true, testimonials });
  } catch {
    return NextResponse.json({ ok: true, testimonials: [] });
  }
}
