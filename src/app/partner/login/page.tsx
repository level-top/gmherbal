import Link from "next/link";
import { SiteHeader } from "@/app/_components/SiteHeader";
import { PartnerLoginForm } from "@/app/partner/login/partnerLoginForm";

export default function PartnerLoginPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-heading">
              Partner Login
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              Login to manage orders, profit, and payout details.
            </p>
          </div>
          <Link
            href="/partner"
            className="inline-flex h-10 items-center justify-center self-start rounded-xl border border-earth/20 bg-bg px-4 text-sm font-semibold text-heading hover:bg-surface"
          >
            Back
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-earth/20 bg-surface p-6 shadow-sm">
          <PartnerLoginForm />

          <div className="mt-6">
            <Link
              href="/partner/register"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-gold px-5 text-sm font-semibold text-white hover:bg-gold-hover"
            >
              Create account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
