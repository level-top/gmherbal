import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "desc" }, { createdAt: "desc" }],
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
    // If DB isn't configured yet, return a safe starter list so the UI still works.
    const fallback = [
      {
        id: "fallback_desi_ghee",
        name: "Desi Ghee",
        slug: "desi-ghee",
        description:
          "Premium desi ghee with rich aroma and traditional taste. Small-batch handling for freshness.",
        category: "GHEE",
        oilType: null,
        variant: null,
        extraction: null,
        sizeLabel: null,
        price: null,
        imageUrl: "/hero.png",
        isFeatured: true,
        sortOrder: 10,
      },
      {
        id: "fallback_mustard_oil_purified",
        name: "Mustard Oil (Purified) — Kohlu Cold-Pressed",
        slug: "mustard-oil-purified",
        description:
          "Purified for a cleaner taste and lighter aroma. Ideal for everyday cooking.",
        category: "OIL",
        oilType: "MUSTARD",
        variant: "PURIFIED",
        extraction: "KOHLU_COLD_PRESS",
        sizeLabel: null,
        price: null,
        imageUrl: "/hero.png",
        isFeatured: true,
        sortOrder: 20,
      },
      {
        id: "fallback_mustard_oil_unpurified",
        name: "Mustard Oil (Unpurified) — Kohlu Cold-Pressed",
        slug: "mustard-oil-unpurified",
        description:
          "Less processed. Strong traditional aroma. Natural settling/sediment may be present.",
        category: "OIL",
        oilType: "MUSTARD",
        variant: "UNPURIFIED",
        extraction: "KOHLU_COLD_PRESS",
        sizeLabel: null,
        price: null,
        imageUrl: "/hero.png",
        isFeatured: false,
        sortOrder: 19,
      },
      {
        id: "fallback_black_seed_oil_purified",
        name: "Black Seed Oil (Purified) — Kohlu Cold-Pressed",
        slug: "black-seed-oil-purified",
        description:
          "Purified for a smoother experience with a clean finish.",
        category: "OIL",
        oilType: "BLACK_SEED",
        variant: "PURIFIED",
        extraction: "KOHLU_COLD_PRESS",
        sizeLabel: null,
        price: null,
        imageUrl: "/hero.png",
        isFeatured: false,
        sortOrder: 18,
      },
    ];

    return NextResponse.json({ ok: true, products: fallback });
  }
}
