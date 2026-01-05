import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/app/_components/SiteHeader";
import { getPartnerFromSession } from "@/lib/partnerSession";

export default async function PartnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const partner = await getPartnerFromSession().catch(() => null);
  if (!partner) {
    redirect("/partner/login");
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-heading">
              Partner Dashboard
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              Manage your account, API keys, orders, and payout details.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/partner"
              className="inline-flex h-10 items-center justify-center self-start rounded-xl border border-earth/20 bg-bg px-4 text-sm font-semibold text-heading hover:bg-surface"
            >
              Partner page
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/partner/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-earth/20 bg-bg px-4 text-sm font-semibold text-heading hover:bg-surface"
          >
            Overview
          </Link>
          <Link
            href="/partner/dashboard/orders"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-earth/20 bg-bg px-4 text-sm font-semibold text-heading hover:bg-surface"
          >
            Orders
          </Link>
          <Link
            href="/partner/dashboard/api-keys"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-earth/20 bg-bg px-4 text-sm font-semibold text-heading hover:bg-surface"
          >
            API Keys
          </Link>
          <Link
            href="/partner/dashboard/bank-details"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-earth/20 bg-bg px-4 text-sm font-semibold text-heading hover:bg-surface"
          >
            Bank Details
          </Link>
        </div>

        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
