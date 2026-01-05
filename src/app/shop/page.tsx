import Link from "next/link";
import { SiteHeader } from "@/app/_components/SiteHeader";
import { BuySection } from "@/app/_components/BuySection";
import { WhatsappButton } from "@/app/_components/WhatsappButton";
import { prisma } from "@/lib/prisma";
import { BRAND } from "@/lib/constants";
import { ShopProductsClient } from "@/app/shop/ShopProductsClient";

export const dynamic = "force-dynamic";

type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string | null;
  oilType: string | null;
  variant: string | null;
  extraction: string | null;
  imageUrl: string | null;
  sizeLabel: string | null;
  price: number | null;
};

function waLink(productName: string): string {
  const phone = BRAND.whatsappNumberE164NoPlus;
  const text = encodeURIComponent(
    `Assalam o Alaikum, I want to order: ${productName}. Please guide me about Purified vs Unpurified and available sizes.`,
  );
  return `https://wa.me/${phone}?text=${text}`;
}

async function loadProducts(): Promise<PublicProduct[]> {
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
        imageUrl: true,
        sizeLabel: true,
        price: true,
      } as any,
    });

    return products.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      category: p.category?.code ?? null,
      oilType: p.oilType?.code ?? null,
      variant: p.variant?.code ?? null,
      extraction: p.extraction?.code ?? null,
      imageUrl: p.imageUrl ?? null,
      sizeLabel: p.sizeLabel ?? null,
      price: p.price ?? null,
    })) as PublicProduct[];
  } catch {
    return [];
  }
}

export default async function ShopPage() {
  const products = await loadProducts();

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="py-10">
          <div className="mx-auto max-w-5xl px-4">
            <h1 className="text-3xl font-semibold tracking-tight text-heading">
              Shop
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Desi Ghee and Kohlu cold-pressed oils. Choose Purified (clean taste) or Unpurified (raw, traditional).
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/learn/purified-vs-unpurified"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-earth/20 bg-bg px-5 text-sm font-semibold text-heading hover:bg-surface"
                >
                  Purified vs Unpurified
                </Link>
                <a
                  href={waLink("Help me choose")}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-gold px-5 text-sm font-semibold text-white hover:bg-gold-hover"
                >
                  WhatsApp support
                </a>
              </div>
            </div>

            <ShopProductsClient products={products} />
          </div>
        </section>

        <BuySection />
      </main>

      <footer className="border-t border-earth/20 py-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {BRAND.name}</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/process" className="hover:text-heading">Our Process</Link>
            <Link href="/faq" className="hover:text-heading">FAQ</Link>
            <Link href="/track" className="hover:text-heading">Track Order</Link>
            <Link href="/privacy-policy" className="hover:text-heading">Privacy Policy</Link>
            <Link href="/contact-us" className="hover:text-heading">Contact Us</Link>
          </div>
        </div>
      </footer>

      <WhatsappButton
        phoneE164NoPlus={BRAND.whatsappNumberE164NoPlus}
        defaultText="Assalam o Alaikum, I need help choosing products from the shop. Please guide me about Purified vs Unpurified and available sizes."
      />
    </div>
  );
}
