import Link from "next/link";
import { SiteHeader } from "@/app/_components/SiteHeader";
import { BRAND } from "@/lib/constants";

export const metadata = {
  title: `Contact Us • ${BRAND.name}`,
};

function formatE164NoPlus(phoneE164NoPlus: string): string {
  if (!phoneE164NoPlus) return "";
  return `+${phoneE164NoPlus}`;
}

export default function ContactUsPage() {
  const phone = formatE164NoPlus(BRAND.whatsappNumberE164NoPlus);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-heading">Contact Us</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          For order questions, product guidance, or delivery support, message us on WhatsApp.
        </p>

        <div className="mt-8 rounded-2xl border border-earth/20 bg-surface p-6 text-sm text-body shadow-sm">
          <div className="grid gap-3">
            <div>
              <p className="text-xs font-semibold text-muted">WhatsApp</p>
              <p className="mt-1 text-base font-semibold text-heading">{phone}</p>
              <p className="mt-1 text-sm text-muted">Fastest way to reach us.</p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Link
                href="/support"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-gold px-5 text-sm font-semibold text-white hover:bg-gold-hover"
              >
                Open WhatsApp support
              </Link>
              <Link
                href="/shop"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-hover"
              >
                Shop
              </Link>
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-earth/20 bg-bg px-5 text-sm font-semibold text-heading hover:bg-surface"
              >
                Back to home
              </Link>
            </div>

            <div className="mt-2 rounded-xl border border-earth/20 bg-bg p-4 text-xs text-muted">
              Tip: If you already chose products, mention product name and quantity in your message.
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-earth/20 py-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {BRAND.name}</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/shop" className="hover:text-heading">Shop</Link>
            <Link href="/process" className="hover:text-heading">Our Process</Link>
            <Link href="/support" className="hover:text-heading">WhatsApp</Link>
            <Link href="/privacy-policy" className="hover:text-heading">Privacy Policy</Link>
            <Link href="/contact-us" className="hover:text-heading">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
