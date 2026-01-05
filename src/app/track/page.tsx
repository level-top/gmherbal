import Link from "next/link";
import { SiteHeader } from "@/app/_components/SiteHeader";
import { BRAND } from "@/lib/constants";
import { TrackForm } from "./trackForm";

export default function TrackPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="py-10">
          <div className="mx-auto max-w-5xl px-4">
            <h1 className="text-3xl font-semibold tracking-tight text-heading">Track Order</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Enter your order ID and the phone number you used when ordering.
            </p>

            <div className="mt-6 rounded-3xl border border-earth/20 bg-surface p-6 shadow-sm">
              <TrackForm />
              <p className="mt-4 text-xs text-muted">
                Tip: If you placed the order via WhatsApp, message us and we’ll help you.
              </p>
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
            <Link href="/support" className="hover:text-heading">WhatsApp</Link>
            <Link href="/privacy-policy" className="hover:text-heading">Privacy Policy</Link>
            <Link href="/contact-us" className="hover:text-heading">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
