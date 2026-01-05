import Link from "next/link";
import { SiteHeader } from "@/app/_components/SiteHeader";
import { BRAND } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

type PublicFaq = { id: string; question: string; answer: string };

async function loadFaqs(): Promise<PublicFaq[]> {
  try {
    const faqs = await prisma.faq.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "desc" }, { createdAt: "desc" }],
      select: { id: true, question: true, answer: true },
    });
    return faqs as unknown as PublicFaq[];
  } catch {
    return [];
  }
}

export default async function FaqPage() {
  const faqs = await loadFaqs();
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="py-10">
          <div className="mx-auto max-w-5xl px-4">
            <h1 className="text-3xl font-semibold tracking-tight text-heading">FAQ</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Quick answers about Kohlu oils, purified vs unpurified, and ordering.
            </p>

            <div className="mt-6 grid gap-3">
              {faqs.length > 0 ? (
                faqs.map((f) => (
                  <details
                    key={f.id}
                    className="rounded-2xl border border-earth/20 bg-surface p-5 shadow-sm"
                  >
                    <summary className="cursor-pointer select-none text-sm font-semibold text-heading">
                      {f.question}
                    </summary>
                    <p className="mt-3 text-sm leading-6 text-body">{f.answer}</p>
                  </details>
                ))
              ) : (
                <div className="rounded-2xl border border-earth/20 bg-surface p-5 text-sm text-muted">
                  FAQs will appear once the database is configured.
                </div>
              )}
            </div>

            <div className="mt-10 rounded-3xl border border-earth/20 bg-surface p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-heading">Still need help?</h2>
              <p className="mt-2 text-sm text-muted">
                Message us on WhatsApp and we’ll guide you.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/support" className="inline-flex h-11 items-center justify-center rounded-xl bg-gold px-5 text-sm font-semibold text-white hover:bg-gold-hover">
                  WhatsApp support
                </Link>
                <Link href="/track" className="inline-flex h-11 items-center justify-center rounded-xl border border-earth/20 bg-bg px-5 text-sm font-semibold text-heading hover:bg-surface">
                  Track order
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
            <Link href="/reviews" className="hover:text-heading">Reviews</Link>
            <Link href="/track" className="hover:text-heading">Track Order</Link>
            <Link href="/privacy-policy" className="hover:text-heading">Privacy Policy</Link>
            <Link href="/contact-us" className="hover:text-heading">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
