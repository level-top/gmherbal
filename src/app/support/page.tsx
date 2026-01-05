import Link from "next/link";
import { SiteHeader } from "@/app/_components/SiteHeader";
import { BRAND } from "@/lib/constants";

function waLink(text: string): string {
  const phone = BRAND.whatsappNumberE164NoPlus;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export default function SupportPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="py-10">
          <div className="mx-auto max-w-5xl px-4">
            <h1 className="text-3xl font-semibold tracking-tight text-heading">WhatsApp Support</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Fast help for product selection (Purified vs Unpurified), ordering, and tracking.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <SupportCard
                title="Help me choose"
                desc="Tell us your use-case (cooking/hair/skin) and preference (mild vs traditional)."
                href={waLink(
                  "Assalam o Alaikum, please help me choose: Mustard / Black Seed / Coconut. Also guide me Purified vs Unpurified.",
                )}
                cta="Chat now"
              />
              <SupportCard
                title="Track my order"
                desc="Send your order ID and phone number used in checkout."
                href={waLink(
                  "Assalam o Alaikum, I want to track my order. Order ID: ____ , Phone: ____",
                )}
                cta="Send details"
              />
            </div>

            <div className="mt-10 rounded-3xl border border-earth/20 bg-surface p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-heading">Shop quickly</h2>
              <p className="mt-2 text-sm text-muted">
                Prefer browsing first? Visit the shop page.
              </p>
              <div className="mt-5">
                <Link href="/shop" className="inline-flex h-11 items-center justify-center rounded-xl bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-hover">
                  Go to Shop
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
            <Link href="/reviews" className="hover:text-heading">Reviews</Link>
            <Link href="/privacy-policy" className="hover:text-heading">Privacy Policy</Link>
            <Link href="/contact-us" className="hover:text-heading">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SupportCard({
  title,
  desc,
  href,
  cta,
}: {
  title: string;
  desc: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-3xl border border-earth/20 bg-surface p-6 shadow-sm">
      <p className="text-sm font-semibold text-heading">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{desc}</p>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-gold px-5 text-sm font-semibold text-white hover:bg-gold-hover"
      >
        {cta}
      </a>
    </div>
  );
}
