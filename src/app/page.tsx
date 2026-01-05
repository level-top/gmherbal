import Image from "next/image";
import Link from "next/link";
import { BuySection } from "@/app/_components/BuySection";
import { FeaturedSliderClient } from "@/app/_components/FeaturedSliderClient";
import { ProductsSection } from "@/app/_components/ProductsSection";
import { SiteHeader } from "@/app/_components/SiteHeader";
import { WhatsappButton } from "@/app/_components/WhatsappButton";
import { IconChat, IconDroplet, IconLeaf, IconShieldCheck, IconStar } from "@/app/_components/Icons";
import { BRAND } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

type HomeReview = {
  id: string;
  customerName: string;
  city: string | null;
  content: string;
  rating: number | null;
  product: { name: string; slug: string } | null;
};

type HomeFaqItem = { id: string; q: string; a: string };

type HomeFeaturedItem = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  price: number | null;
  sizeLabel: string | null;
};

async function loadHomeReviews(): Promise<{ reviews: HomeReview[]; dbOk: boolean }> {
  try {
    const reviews = await prisma.testimonial.findMany({
      where: { isApproved: true },
      orderBy: [{ createdAt: "desc" }],
      take: 3,
      select: {
        id: true,
        customerName: true,
        city: true,
        content: true,
        rating: true,
        product: { select: { name: true, slug: true } },
      },
    });
    return { reviews: reviews as unknown as HomeReview[], dbOk: true };
  } catch {
    return { reviews: [], dbOk: false };
  }
}

async function loadHomeFaqs(): Promise<{ faqs: HomeFaqItem[]; dbOk: boolean }> {
  try {
    const faqs = await prisma.faq.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "desc" }, { createdAt: "desc" }],
      take: 4,
      select: { id: true, question: true, answer: true },
    });

    return {
      faqs: faqs.map((f) => ({ id: f.id, q: f.question, a: f.answer })),
      dbOk: true,
    };
  } catch {
    return { faqs: [], dbOk: false };
  }
}

async function loadHomeFeatured(): Promise<{ items: HomeFeaturedItem[]; dbOk: boolean }> {
  try {
    const items = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: [{ sortOrder: "desc" }, { createdAt: "desc" }],
      take: 12,
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        price: true,
        sizeLabel: true,
      } as any,
    });

    return { items: items as unknown as HomeFeaturedItem[], dbOk: true };
  } catch {
    return {
      items: [
        {
          id: "fallback_featured_1",
          name: "Featured product",
          slug: "featured-product",
          imageUrl: "/hero.png",
          price: null,
          sizeLabel: null,
        },
      ],
      dbOk: false,
    };
  }
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="py-12">
          <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 md:grid-cols-2">
            <div>
              <p className="inline-flex rounded-full bg-surface px-3 py-1 text-xs font-semibold text-forest">
                Herbal • Pure • Fresh
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-heading sm:text-5xl">
                Kohlu cold-pressed oils & premium desi ghee
              </h1>
              <p className="mt-4 text-base leading-7 text-body">
                Traditional Kohlu extraction with careful handling. Choose <span className="font-semibold">Purified</span> (clean taste) or <span className="font-semibold">Unpurified</span> (raw, traditional).
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-hover"
                >
                  Shop now
                </Link>
                <Link
                  href="#buy"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-earth/20 bg-bg px-5 text-sm font-semibold text-heading hover:bg-surface"
                >
                  Fast checkout
                </Link>
                <Link
                  href="/support"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-gold px-5 text-sm font-semibold text-white hover:bg-gold-hover"
                >
                  Ask on WhatsApp
                </Link>
              </div>

              <div className="mt-6 grid gap-3 rounded-2xl border border-earth/20 bg-surface p-4 text-sm text-body">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-bg px-3 py-1">
                    <IconDroplet className="h-4 w-4 text-forest" aria-hidden="true" />
                    Cold-Pressed (Kohlu)
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-bg px-3 py-1">
                    <IconShieldCheck className="h-4 w-4 text-forest" aria-hidden="true" />
                    Sealed packaging
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-bg px-3 py-1">
                    <IconChat className="h-4 w-4 text-forest" aria-hidden="true" />
                    Guidance on WhatsApp
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted">
                  <Link href="/learn/purified-vs-unpurified" className="hover:text-heading">Purified vs Unpurified</Link>
                  <Link href="/reviews" className="hover:text-heading">Customer reviews</Link>
                  <Link href="/faq" className="hover:text-heading">FAQ</Link>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-earth/20 bg-surface p-6 shadow-sm">
              <Image
                src="/hero.png"
                alt="Kohlu cold-pressed oils"
                width={640}
                height={420}
                className="h-auto w-full"
                priority
              />
            </div>
          </div>
        </section>

        <HomeFeaturedSlider />

        <section className="pb-4">
          <div className="mx-auto max-w-5xl px-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-earth/20 bg-surface p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <IconLeaf className="h-5 w-5 text-leaf" aria-hidden="true" />
                  <h2 className="text-lg font-semibold text-heading">Purified vs Unpurified</h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Purified is settled/filtered for a cleaner taste and lighter aroma. Unpurified is less processed and may have natural settling.
                </p>
                <div className="mt-4">
                  <Link href="/learn/purified-vs-unpurified" className="inline-flex text-sm font-semibold text-forest hover:text-forest-hover">
                    Learn the difference
                  </Link>
                </div>
              </div>
              <div className="rounded-3xl border border-earth/20 bg-surface p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <IconShieldCheck className="h-5 w-5 text-leaf" aria-hidden="true" />
                  <h2 className="text-lg font-semibold text-heading">High trust, fast ordering</h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Browse products in the shop, or use the fast checkout form. For quickest help, message on WhatsApp.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href="/shop" className="inline-flex h-11 items-center justify-center rounded-xl bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-hover">
                    Shop
                  </Link>
                  <Link href="/track" className="inline-flex h-11 items-center justify-center rounded-xl border border-earth/20 bg-bg px-5 text-sm font-semibold text-heading hover:bg-surface">
                    Track order
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ProductsSection />
        <HomeTestimonials />
        <HomeFaq />
        <BuySection />
      </main>

      <footer className="border-t border-earth/20 py-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {BRAND.name}</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/shop" className="hover:text-heading">Shop</Link>
            <Link href="/process" className="hover:text-heading">Our Process</Link>
            <Link href="/reviews" className="hover:text-heading">Reviews</Link>
            <Link href="/faq" className="hover:text-heading">FAQ</Link>
            <Link href="/track" className="hover:text-heading">Track</Link>
            <Link href="/privacy-policy" className="hover:text-heading">Privacy Policy</Link>
            <Link href="/contact-us" className="hover:text-heading">Contact Us</Link>
          </div>
        </div>
      </footer>

      <WhatsappButton
        phoneE164NoPlus={BRAND.whatsappNumberE164NoPlus}
        defaultText="Assalam o Alaikum, I want to buy gmherbal products."
      />
    </div>
  );
}

async function HomeTestimonials() {
  const { reviews, dbOk } = await loadHomeReviews();

  return (
    <section id="testimonials" className="scroll-mt-24 py-10">
      <div className="mx-auto max-w-5xl px-4">
        <div className="rounded-3xl border border-earth/20 bg-surface p-6 shadow-sm sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="inline-flex rounded-full bg-bg px-3 py-1 text-xs font-semibold text-forest">
                Testimonials
              </p>
              <div className="mt-4 flex items-center gap-2">
                <IconStar className="h-5 w-5 text-gold" aria-hidden="true" />
                <h2 className="text-xl font-semibold tracking-tight text-heading">Customer reviews</h2>
              </div>
              <p className="mt-2 text-sm text-muted">Quick feedback from recent customers.</p>
            </div>
            <Link
              href="/reviews"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-earth/20 bg-bg px-4 text-sm font-semibold text-heading hover:bg-surface"
            >
              View all
            </Link>
          </div>

          {!dbOk ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
              Database not ready — start MySQL (XAMPP) and check <span className="font-mono">DATABASE_URL</span>.
            </div>
          ) : null}

          {reviews.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-earth/20 bg-bg p-5 text-sm text-muted">
              No reviews yet.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-3xl border border-earth/20 bg-bg p-5 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <div>
                      <p className="text-sm font-semibold text-heading">
                        {r.customerName || "Customer"}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {r.city ? r.city : ""}{r.product ? ` • ${r.product.name}` : ""}
                      </p>
                    </div>
                    {typeof r.rating === "number" ? (
                      <span className="rounded-full border border-earth/20 bg-surface px-3 py-1 text-xs font-semibold text-forest">
                        {r.rating}/5
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-body">{r.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

async function HomeFeaturedSlider() {
  const { items, dbOk } = await loadHomeFeatured();

  if (!items || items.length === 0) return null;

  return <FeaturedSliderClient items={items as any} dbOk={dbOk} />;
}

async function HomeFaq() {
  const fallbackFaqs = [
    {
      q: "What is Kohlu (cold-press) oil?",
      a: "Kohlu cold-press is a traditional slow extraction method that helps preserve the oil’s natural character and aroma.",
    },
    {
      q: "Purified vs Unpurified — what’s the difference?",
      a: "Purified is settled/filtered for a cleaner taste and lighter aroma. Unpurified is less processed and may have natural settling/sediment.",
    },
    {
      q: "Is sediment in unpurified oil normal?",
      a: "Yes. Natural settling can happen. Shake gently if needed, or let it settle again.",
    },
    {
      q: "How do I place an order?",
      a: "Use the fast checkout form below or message us on WhatsApp for quickest ordering.",
    },
  ] as const;

  const { faqs } = await loadHomeFaqs();
  const items = faqs.length > 0 ? faqs : fallbackFaqs.map((f) => ({ id: f.q, q: f.q, a: f.a }));

  return (
    <section id="faq" className="scroll-mt-24 pb-10">
      <div className="mx-auto max-w-5xl px-4">
        <div className="rounded-3xl border border-earth/20 bg-surface p-6 shadow-sm sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="inline-flex rounded-full bg-bg px-3 py-1 text-xs font-semibold text-forest">
                Help
              </p>
              <div className="mt-4 flex items-center gap-2">
                <IconChat className="h-5 w-5 text-leaf" aria-hidden="true" />
                <h2 className="text-xl font-semibold tracking-tight text-heading">FAQ</h2>
              </div>
              <p className="mt-2 text-sm text-muted">Quick answers before you order.</p>
            </div>
            <Link
              href="/faq"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-earth/20 bg-bg px-4 text-sm font-semibold text-heading hover:bg-surface"
            >
              View all
            </Link>
          </div>

          <div className="mt-6 grid gap-3">
            {items.map((f) => (
              <details key={f.id} className="rounded-3xl border border-earth/20 bg-bg p-5 shadow-sm">
                <summary className="cursor-pointer select-none text-sm font-semibold text-heading">
                  {f.q}
                </summary>
                <p className="mt-3 text-sm leading-6 text-body">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
