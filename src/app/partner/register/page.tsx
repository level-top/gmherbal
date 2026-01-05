import Link from "next/link";
import { SiteHeader } from "@/app/_components/SiteHeader";
import { PartnerSignupForm } from "@/app/partner/registerForm";

export default function PartnerRegisterPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-heading">Create Partner Account</h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              Create an account to access your partner dashboard.
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
          <PartnerSignupForm />
        </div>

        <p className="mt-6 text-sm text-muted">
          Already have an account?{" "}
          <Link href="/partner/login" className="font-semibold text-heading hover:underline">
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
}
