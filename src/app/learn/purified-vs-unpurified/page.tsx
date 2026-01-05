import Image from "next/image";
import Link from "next/link";
import { IconDroplet, IconLeaf, IconShieldCheck } from "@/app/_components/Icons";
import { SiteHeader } from "@/app/_components/SiteHeader";
import { BRAND } from "@/lib/constants";

export default function LearnPurifiedPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="py-10">
          <div className="mx-auto max-w-5xl px-4">
            <p className="inline-flex rounded-full bg-bg px-3 py-1 text-xs font-semibold text-forest">
              Learn
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-heading">
              Purified vs Unpurified Oils — Simple Explanation
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              Both are cold-pressed (Kohlu) oils. The difference is how much we process/settle/filter for clarity and taste.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <CompareCard
                title="Purified"
                subtitle="Clean taste, lighter aroma"
                bullets={[
                  "Filtered/settled for more clarity",
                  "Best for everyday cooking",
                  "Lower chance of visible particles",
                ]}
              />
              <CompareCard
                title="Unpurified (Raw)"
                subtitle="Traditional strong aroma"
                bullets={[
                  "Less processed, more traditional character",
                  "Strong aroma and bold taste",
                  "Natural settling/sediment may appear",
                ]}
              />
            </div>

            <div className="mt-8 rounded-3xl border border-earth/20 bg-surface p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-heading">Which one should I buy?</h2>
              <div className="mt-3 grid gap-3 text-sm text-body">
                <p>
                  If you want a mild taste and daily-cooking convenience, choose <span className="font-semibold">Purified</span>.
                </p>
                <p>
                  If you prefer a traditional strong aroma and raw character, choose <span className="font-semibold">Unpurified</span>.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/shop" className="inline-flex h-11 items-center justify-center rounded-xl bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-hover">
                  Shop oils
                </Link>
                <Link href="/support" className="inline-flex h-11 items-center justify-center rounded-xl bg-gold px-5 text-sm font-semibold text-white hover:bg-gold-hover">
                  Ask on WhatsApp
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-12">
          <div className="mx-auto max-w-5xl px-4">
            <div className="rounded-3xl border border-earth/20 bg-surface p-6 shadow-sm">
              <div className="grid gap-6 md:grid-cols-2 md:items-center">
                <div>
                  <p className="inline-flex rounded-full bg-bg px-3 py-1 text-xs font-semibold text-forest">
                    Our Process
                  </p>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-heading">
                    Kohlu (Cold-Press) Tradition — with Modern Hygiene
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-body">
                    We focus on slow extraction and careful handling so you get the natural character you expect — and consistent, sealed packaging.
                  </p>
                  <div className="mt-5">
                    <Link href="/process" className="text-sm font-semibold text-forest hover:text-forest-hover">
                      Read full process →
                    </Link>
                  </div>
                </div>
                <div className="overflow-hidden rounded-3xl border border-earth/20 bg-bg">
                  <Image src="/hero.png" alt="Kohlu cold-pressed" width={960} height={720} className="h-auto w-full" />
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
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

function CompareCard({
  title,
  subtitle,
  bullets,
}: {
  title: string;
  subtitle: string;
  bullets: string[];
}) {
  return (
    <div className="rounded-3xl border border-earth/20 bg-surface p-6 shadow-sm">
      <p className="text-sm font-semibold text-heading">{title}</p>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
      <ul className="mt-4 grid gap-2 text-sm text-body">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="mt-2 inline-block h-2 w-2 rounded-full bg-leaf" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
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
