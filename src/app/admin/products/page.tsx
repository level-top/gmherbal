import Link from "next/link";
import { isAdminRequest } from "@/lib/adminAuth";
import { AdminLoginForm } from "@/app/admin/loginForm";
import { ProductsAdmin } from "@/app/admin/dashboard";

export default async function AdminProductsPage() {
  const authed = await isAdminRequest();

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-heading">Admin • Products</h1>
          <p className="mt-2 text-sm leading-6 text-muted">Create and manage products shown on the site.</p>
        </div>
        <Link
          href="/admin"
          className="inline-flex h-10 items-center justify-center self-start rounded-xl border border-earth/20 bg-bg px-4 text-sm font-semibold text-heading hover:bg-surface"
        >
          Back
        </Link>
      </div>

      <div className="mt-8">
        {authed ? <ProductsAdmin /> : <AdminLoginForm />}
      </div>
    </main>
  );
}
