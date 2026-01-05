const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Ensure default product options exist.
  await prisma.productCategoryOption.upsert({
    where: { code: "GHEE" },
    update: { name: "Ghee", isActive: true, sortOrder: 10 },
    create: { code: "GHEE", name: "Ghee", isActive: true, sortOrder: 10 },
  });
  await prisma.productCategoryOption.upsert({
    where: { code: "OIL" },
    update: { name: "Oil", isActive: true, sortOrder: 20 },
    create: { code: "OIL", name: "Oil", isActive: true, sortOrder: 20 },
  });

  for (const oil of [
    { code: "MUSTARD", name: "Mustard", sortOrder: 10 },
    { code: "BLACK_SEED", name: "Black Seed", sortOrder: 20 },
    { code: "COCONUT", name: "Coconut", sortOrder: 30 },
    { code: "OTHER", name: "Other", sortOrder: 40 },
  ]) {
    await prisma.oilTypeOption.upsert({
      where: { code: oil.code },
      update: { name: oil.name, isActive: true, sortOrder: oil.sortOrder },
      create: { code: oil.code, name: oil.name, isActive: true, sortOrder: oil.sortOrder },
    });
  }

  for (const v of [
    { code: "PURIFIED", name: "Purified", sortOrder: 10 },
    { code: "UNPURIFIED", name: "Unpurified", sortOrder: 20 },
  ]) {
    await prisma.productVariantOption.upsert({
      where: { code: v.code },
      update: { name: v.name, isActive: true, sortOrder: v.sortOrder },
      create: { code: v.code, name: v.name, isActive: true, sortOrder: v.sortOrder },
    });
  }

  await prisma.extractionMethodOption.upsert({
    where: { code: "KOHLU_COLD_PRESS" },
    update: { name: "Kohlu Cold-Press", isActive: true, sortOrder: 10 },
    create: { code: "KOHLU_COLD_PRESS", name: "Kohlu Cold-Press", isActive: true, sortOrder: 10 },
  });

  const products = [
    {
      slug: "desi-ghee",
      name: "Desi Ghee",
      description:
        "Premium desi ghee with rich aroma and traditional taste. Small-batch handling for freshness.",
      category: { connect: { code: "GHEE" } },
      isFeatured: true,
      sortOrder: 10,
      imageUrl: "/hero.png",
    },
    {
      slug: "mustard-oil-purified",
      name: "Mustard Oil (Purified) — Kohlu Cold-Pressed",
      description:
        "Purified for a cleaner taste and lighter aroma. Ideal for everyday cooking.",
      category: { connect: { code: "OIL" } },
      oilType: { connect: { code: "MUSTARD" } },
      variant: { connect: { code: "PURIFIED" } },
      extraction: { connect: { code: "KOHLU_COLD_PRESS" } },
      isFeatured: true,
      sortOrder: 20,
      imageUrl: "/hero.png",
    },
    {
      slug: "mustard-oil-unpurified",
      name: "Mustard Oil (Unpurified) — Kohlu Cold-Pressed",
      description:
        "Less processed. Strong traditional aroma. Natural settling/sediment may be present.",
      category: { connect: { code: "OIL" } },
      oilType: { connect: { code: "MUSTARD" } },
      variant: { connect: { code: "UNPURIFIED" } },
      extraction: { connect: { code: "KOHLU_COLD_PRESS" } },
      sortOrder: 21,
      imageUrl: "/hero.png",
    },
    {
      slug: "black-seed-oil-purified",
      name: "Black Seed Oil (Purified) — Kohlu Cold-Pressed",
      description:
        "Purified for a smoother experience with a clean finish.",
      category: { connect: { code: "OIL" } },
      oilType: { connect: { code: "BLACK_SEED" } },
      variant: { connect: { code: "PURIFIED" } },
      extraction: { connect: { code: "KOHLU_COLD_PRESS" } },
      sortOrder: 30,
      imageUrl: "/hero.png",
    },
    {
      slug: "black-seed-oil-unpurified",
      name: "Black Seed Oil (Unpurified) — Kohlu Cold-Pressed",
      description:
        "Raw and traditional. Stronger natural aroma. Natural particles may be present.",
      category: { connect: { code: "OIL" } },
      oilType: { connect: { code: "BLACK_SEED" } },
      variant: { connect: { code: "UNPURIFIED" } },
      extraction: { connect: { code: "KOHLU_COLD_PRESS" } },
      sortOrder: 31,
      imageUrl: "/hero.png",
    },
    {
      slug: "coconut-oil-purified",
      name: "Coconut Oil (Purified) — Cold-Pressed",
      description:
        "Purified for a clean, versatile option across cooking and daily use.",
      category: { connect: { code: "OIL" } },
      oilType: { connect: { code: "COCONUT" } },
      variant: { connect: { code: "PURIFIED" } },
      extraction: { connect: { code: "KOHLU_COLD_PRESS" } },
      sortOrder: 40,
      imageUrl: "/hero.png",
    },
    {
      slug: "coconut-oil-unpurified",
      name: "Coconut Oil (Unpurified) — Cold-Pressed",
      description:
        "Less processed with a more natural character and aroma.",
      category: { connect: { code: "OIL" } },
      oilType: { connect: { code: "COCONUT" } },
      variant: { connect: { code: "UNPURIFIED" } },
      extraction: { connect: { code: "KOHLU_COLD_PRESS" } },
      sortOrder: 41,
      imageUrl: "/hero.png",
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...p, isActive: true },
      create: { ...p, isActive: true },
    });
  }

  const certifications = [
    {
      title: "Quality & Safety",
      authority: "Food Authority / Local Compliance",
      refNo: null,
      imageUrl: null,
      isActive: false,
    },
  ];

  for (const c of certifications) {
    await prisma.certification.upsert({
      where: { id: "seed_cert_quality" },
      update: c,
      create: { id: "seed_cert_quality", ...c },
    });
  }

  const desiGhee = await prisma.product.findUnique({ where: { slug: "desi-ghee" } });
  const mustardPurified = await prisma.product.findUnique({ where: { slug: "mustard-oil-purified" } });

  const testimonials = [
    {
      productId: desiGhee?.id ?? null,
      customerName: "Customer",
      city: "",
      content:
        "Packaging was sealed and delivery was fast. Taste and aroma were exactly what I expected.",
      rating: 5,
      videoUrl: null,
      isApproved: true,
    },
    {
      productId: mustardPurified?.id ?? null,
      customerName: "Customer",
      city: "",
      content:
        "Clean taste for cooking. I liked the clarity and the smooth aroma.",
      rating: 5,
      videoUrl: null,
      isApproved: true,
    },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t }).catch(() => null);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
