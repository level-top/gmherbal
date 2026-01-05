import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/app/_components/SiteHeader";
import { PartnerSignupForm } from "@/app/partner/registerForm";
import { getPartnerFromSession } from "@/lib/partnerSession";

export default async function PartnerPage() {
  const partner = await getPartnerFromSession();
  if (partner) {
    redirect("/partner/dashboard");
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-heading">
          Partner / Dropshipping
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Create your partner account and manage orders, profit, API keys, and payout details.
        </p>

        <div className="mt-8 rounded-2xl border border-earth/20 bg-surface p-6 shadow-sm">
          <h2 className="text-base font-semibold text-heading">How it works</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Simple steps to start dropshipping with GM Herbal.
          </p>

          <div className="mt-4 grid gap-3 rounded-xl border border-earth/20 bg-bg p-4 text-sm text-body">
            <ol className="grid gap-2">
              <li>
                <span className="font-semibold text-heading">1) Create account</span> — sign up with your details.
              </li>
              <li>
                <span className="font-semibold text-heading">2) Create API keys</span> — generate keys from your dashboard.
              </li>
              <li>
                <span className="font-semibold text-heading">3) Use partner API</span> — call our endpoints using the API key header.
              </li>
              <li>
                <span className="font-semibold text-heading">4) Create orders</span> — set your selling price; profit is the difference.
              </li>
              <li>
                <span className="font-semibold text-heading">5) Profit payout</span> — after COD delivery we pay you the extra amount.
              </li>
            </ol>

            <p className="text-xs text-muted">Payout details help us send your profit.</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-earth/20 bg-surface p-6 shadow-sm">
          <h2 className="text-base font-semibold text-heading">API access</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Create an API key from your dashboard. Use it in the <span className="font-mono">x-api-key</span> header.
          </p>

          <div className="mt-4 rounded-xl border border-earth/20 bg-bg p-4 text-sm">
            <p className="font-semibold text-heading">Example</p>
            <p className="mt-2 text-body">
              GET <span className="font-mono">/api/partner/products</span>
            </p>
            <p className="mt-1 text-body">
              Header: <span className="font-mono">x-api-key: YOUR_KEY</span>
            </p>
            <p className="mt-3 text-xs text-muted">
              Response includes your partner info + product list.
            </p>
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/partner/register"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-gold px-5 text-sm font-semibold text-white hover:bg-gold-hover"
              >
                Create account
              </Link>
              <Link
                href="/partner/login"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-hover"
              >
                Partner login
              </Link>
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-earth/20 bg-bg px-5 text-sm font-semibold text-heading hover:bg-surface"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>

        <PartnerRegister />
      </main>
    </div>
  );
}

function PartnerRegister() {
  return (
    <section className="mt-8 rounded-2xl border border-earth/20 bg-surface p-6 shadow-sm">
      <h2 className="text-base font-semibold text-heading">Create account</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Sign up to access your partner dashboard.
      </p>
      <PartnerSignupForm />
    </section>
  );
}
