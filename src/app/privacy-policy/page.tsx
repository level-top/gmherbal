import Link from "next/link";
import { SiteHeader } from "@/app/_components/SiteHeader";
import { BRAND } from "@/lib/constants";

export const metadata = {
  title: `Privacy Policy • ${BRAND.name}`,
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-heading">Privacy Policy</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Last updated: January 5, 2026</p>

        <div className="mt-8 grid gap-6 rounded-2xl border border-earth/20 bg-surface p-6 text-sm text-body shadow-sm">
          <section className="grid gap-2">
            <h2 className="text-base font-semibold text-heading">Overview</h2>
            <p className="text-muted">
              This Privacy Policy explains how {BRAND.name} collects, uses, and protects information when you visit our
              website and place an order.
            </p>
          </section>

          <section className="grid gap-2">
            <h2 className="text-base font-semibold text-heading">Information we collect</h2>
            <ul className="list-disc pl-5 text-muted">
              <li>Contact details you provide (name, phone number, address).</li>
              <li>Order details (products, quantity, pricing, delivery notes).</li>
              <li>Basic technical data (device/browser info, approximate location, and pages visited).</li>
            </ul>
          </section>

          <section className="grid gap-2">
            <h2 className="text-base font-semibold text-heading">How we use your information</h2>
            <ul className="list-disc pl-5 text-muted">
              <li>To confirm and deliver your order.</li>
              <li>To provide support (including WhatsApp support).</li>
              <li>To improve site performance and user experience.</li>
            </ul>
          </section>

          <section className="grid gap-2">
            <h2 className="text-base font-semibold text-heading">Sharing</h2>
            <p className="text-muted">
              We may share necessary details with delivery partners to fulfill your order. We do not sell your personal
              information.
            </p>
          </section>

          <section className="grid gap-2">
            <h2 className="text-base font-semibold text-heading">Cookies</h2>
            <p className="text-muted">
              We may use cookies or similar technologies to keep the site working and to understand traffic. You can
              control cookies through your browser settings.
            </p>
          </section>

          <section className="grid gap-2">
            <h2 className="text-base font-semibold text-heading">Data security</h2>
            <p className="text-muted">
              We use reasonable security measures to protect your information. No method of transmission or storage is
              100% secure.
            </p>
          </section>

          <section className="grid gap-2">
            <h2 className="text-base font-semibold text-heading">Contact</h2>
            <p className="text-muted">
              For privacy questions, please contact us via our support page.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/support"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-gold px-5 text-sm font-semibold text-white hover:bg-gold-hover"
              >
                WhatsApp support
              </Link>
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-earth/20 bg-bg px-5 text-sm font-semibold text-heading hover:bg-surface"
              >
                Back to home
              </Link>
            </div>
          </section>
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
