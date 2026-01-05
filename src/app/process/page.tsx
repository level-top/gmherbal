import Image from "next/image";
import Link from "next/link";
import { IconDroplet, IconLeaf, IconShieldCheck } from "@/app/_components/Icons";
import { SiteHeader } from "@/app/_components/SiteHeader";
import { BRAND } from "@/lib/constants";

export default function ProcessPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="py-10">
          <div className="mx-auto grid max-w-5xl gap-8 px-4 md:grid-cols-2 md:items-center">
            <div>
              <p className="inline-flex rounded-full bg-surface px-3 py-1 text-xs font-semibold text-forest">
                Our Process
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-heading">
                Kohlu (Cold-Press) Tradition — with Modern Hygiene
              </h1>
              <p className="mt-4 text-sm leading-6 text-body">
                We focus on slow extraction and careful handling so you get the natural character you expect — and consistent, sealed packaging.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/shop" className="inline-flex h-11 items-center justify-center rounded-xl bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-hover">
                  Shop products
                </Link>
                <Link href="/learn/purified-vs-unpurified" className="inline-flex h-11 items-center justify-center rounded-xl border border-earth/20 bg-bg px-5 text-sm font-semibold text-heading hover:bg-surface">
                  Purified vs Unpurified
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-earth/20 bg-surface p-4 shadow-sm">
              <Image src="/hero.png" alt="Kohlu cold-pressed" width={960} height={720} className="h-auto w-full" priority />
            </div>
          </div>
        </section>

        <section className="pb-12">
          <div className="mx-auto max-w-5xl px-4">
            <div className="grid gap-4 md:grid-cols-3">
              <StepCard icon="leaf" title="1) Quality seeds" desc="We start with quality seed selection and proper storage." />
              <StepCard icon="droplet" title="2) Slow cold-press" desc="Traditional Kohlu extraction for authentic aroma and character." />
              <StepCard icon="shield" title="3) Purified or Unpurified" desc="Choose purified (cleaner taste) or unpurified (raw, traditional)." />
            </div>

            <div className="mt-8 rounded-3xl border border-earth/20 bg-surface p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-heading">What you receive</h2>
              <ul className="mt-3 grid gap-2 text-sm text-body">
                <li>Sealed bottle/jar packaging</li>
                <li>Clear labeling for product and variant</li>
                <li>Storage guidance for best freshness</li>
              </ul>
              <p className="mt-4 text-xs text-muted">
                Note: Natural settling can happen, especially for unpurified oils — this is normal.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-earth/20 py-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {BRAND.name}</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/shop" className="hover:text-heading">Shop</Link>
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

function StepCard({
  icon,
  title,
  desc,
}: {
  icon: "leaf" | "droplet" | "shield";
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-earth/20 bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-2">
        {icon === "leaf" ? (
          <IconLeaf className="h-5 w-5 text-leaf" aria-hidden="true" />
        ) : icon === "droplet" ? (
          <IconDroplet className="h-5 w-5 text-leaf" aria-hidden="true" />
        ) : (
          <IconShieldCheck className="h-5 w-5 text-leaf" aria-hidden="true" />
        )}
        <p className="text-sm font-semibold text-heading">{title}</p>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted">{desc}</p>
    </div>
  );
}
