import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/app/_components/SiteHeader";
import { BRAND } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Review = {
  id: string;
  customerName: string;
  city: string | null;
  content: string;
  rating: number | null;
  videoUrl: string | null;
  createdAt: Date;
  product: { name: string; slug: string } | null;
};

async function loadReviews(): Promise<Review[]> {
  try {
    const reviews = await prisma.testimonial.findMany({
      where: { isApproved: true },
      orderBy: [{ createdAt: "desc" }],
      take: 20,
      select: {
        id: true,
        customerName: true,
        city: true,
        content: true,
        rating: true,
        videoUrl: true,
        createdAt: true,
        product: { select: { name: true, slug: true } },
      },
    });

    return reviews as unknown as Review[];
  } catch {
    return [];
  }
}

async function canReachDb(): Promise<boolean> {
  try {
    await prisma.testimonial.count();
    return true;
  } catch {
    return false;
  }
}

export default async function ReviewsPage() {
  const reviews = await loadReviews();
  const dbOk = await canReachDb();

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="py-10">
          <div className="mx-auto max-w-5xl px-4">
            <h1 className="text-3xl font-semibold tracking-tight text-heading">Reviews</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Real feedback from customers. For video reviews, we can share via WhatsApp.
            </p>

            {reviews.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-earth/20 bg-surface p-5 text-sm text-muted">
                {dbOk ? "No reviews yet." : "Database not ready — start MySQL (XAMPP) and check DATABASE_URL."}
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-earth/20 bg-surface p-5 shadow-sm">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div>
                        <p className="text-sm font-semibold text-heading">
                          {r.customerName || "Customer"}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {r.city ? r.city : ""}{r.product ? ` • ${r.product.name}` : ""}
                        </p>
                      </div>
                      {typeof r.rating === "number" ? (
                        <span className="rounded-full bg-bg px-3 py-1 text-xs font-semibold text-forest">
                          {r.rating}/5
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-3 text-sm leading-6 text-body">{r.content}</p>

                    {r.videoUrl ? (
                      <a
                        href={r.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex text-sm font-semibold text-forest hover:text-forest-hover"
                      >
                        Watch video review
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-10 rounded-3xl border border-earth/20 bg-surface p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-heading">Want to share a review?</h2>
              <p className="mt-2 text-sm text-muted">
                Send your feedback (and optional short video) on WhatsApp and we’ll add it.
              </p>
              <div className="mt-5">
                <Link href="/support" className="inline-flex h-11 items-center justify-center rounded-xl bg-gold px-5 text-sm font-semibold text-white hover:bg-gold-hover">
                  WhatsApp support
                </Link>
              </div>
            </div>
          </div>
        </section>
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
    </div>
  );
}
