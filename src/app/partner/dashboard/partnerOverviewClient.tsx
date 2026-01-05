"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Partner = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
};

type Analytics = {
  ordersCount: number;
  totalProfit: number;
  pendingProfit: number;
  paidProfit: number;
};

export function PartnerOverviewClient() {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });

  useEffect(() => {
    Promise.all([
      fetch("/api/partner/me", { cache: "no-store" }),
      fetch("/api/partner/analytics", { cache: "no-store" }),
    ])
      .then(async ([meRes, aRes]) => {
        const me = (await meRes.json().catch(() => null)) as any;
        if (!meRes.ok || !me?.ok) throw new Error(me?.error ?? "Unauthorized");
        setPartner(me.partner);

        const a = (await aRes.json().catch(() => null)) as any;
        if (aRes.ok && a?.ok && a.analytics) {
          setAnalytics(a.analytics);
        }
      })
      .catch((e) => setError(e?.message ?? "Unable to load"));
  }, []);

  async function logout() {
    await fetch("/api/partner/logout", { method: "POST" }).catch(() => null);
    window.location.href = "/partner/login";
  }

  async function changePassword() {
    setError(null);
    setSuccess(null);

    if (!pw.currentPassword) {
      setError("Current password is required");
      return;
    }
    if (!pw.newPassword || pw.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (pw.newPassword !== pw.confirm) {
      setError("Passwords do not match");
      return;
    }

    const res = await fetch("/api/partner/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pw.currentPassword, newPassword: pw.newPassword }),
    });

    const json = (await res.json().catch(() => null)) as any;
    if (!res.ok || !json?.ok) {
      setError(json?.error ?? "Unable to change password");
      return;
    }

    setPw({ currentPassword: "", newPassword: "", confirm: "" });
    setSuccess("Password updated");
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-earth/20 bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-heading">Account</h2>
            <p className="mt-1 text-sm text-muted">
              {partner ? `${partner.name}${partner.email ? ` • ${partner.email}` : ""}` : "Loading…"}
            </p>
          </div>
          <button
            onClick={logout}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-earth/20 bg-bg px-4 text-sm font-semibold text-heading hover:bg-surface"
          >
            Logout
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {success}
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-earth/20 bg-surface p-6 shadow-sm">
        <h2 className="text-base font-semibold text-heading">Analytics</h2>
        <p className="mt-1 text-sm text-muted">Your orders and profit summary.</p>

        {!analytics ? (
          <div className="mt-4 rounded-xl border border-earth/20 bg-bg p-4 text-sm text-muted">Loading…</div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-earth/20 bg-bg p-4">
              <p className="text-xs text-muted">Orders</p>
              <p className="mt-1 text-lg font-semibold text-heading">{analytics.ordersCount}</p>
            </div>
            <div className="rounded-xl border border-earth/20 bg-bg p-4">
              <p className="text-xs text-muted">Total profit</p>
              <p className="mt-1 text-lg font-semibold text-heading">Rs {analytics.totalProfit}</p>
            </div>
            <div className="rounded-xl border border-earth/20 bg-bg p-4">
              <p className="text-xs text-muted">Pending payout</p>
              <p className="mt-1 text-lg font-semibold text-heading">Rs {analytics.pendingProfit}</p>
            </div>
            <div className="rounded-xl border border-earth/20 bg-bg p-4">
              <p className="text-xs text-muted">Paid</p>
              <p className="mt-1 text-lg font-semibold text-heading">Rs {analytics.paidProfit}</p>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-earth/20 bg-surface p-6 shadow-sm">
        <h2 className="text-base font-semibold text-heading">Quick links</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/partner/dashboard/orders"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-hover"
          >
            Create / View Orders
          </Link>
          <Link
            href="/partner/dashboard/api-keys"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-gold px-5 text-sm font-semibold text-white hover:bg-gold-hover"
          >
            Manage API Keys
          </Link>
          <Link
            href="/partner/dashboard/bank-details"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-earth/20 bg-bg px-5 text-sm font-semibold text-heading hover:bg-surface"
          >
            Bank Details
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-earth/20 bg-surface p-6 shadow-sm">
        <h2 className="text-base font-semibold text-heading">Change password</h2>
        <p className="mt-1 text-sm text-muted">Update your login password.</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-medium text-body">Current password</span>
            <input
              type="password"
              value={pw.currentPassword}
              onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
              className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-body">New password</span>
            <input
              type="password"
              value={pw.newPassword}
              onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
              className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-body">Confirm new password</span>
            <input
              type="password"
              value={pw.confirm}
              onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
            />
          </label>

          <div className="sm:col-span-2">
            <button
              onClick={() => changePassword().catch(() => setError("Unable to change password"))}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-hover"
            >
              Save password
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
