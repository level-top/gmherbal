"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PartnerLoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    const res = await fetch("/api/partner/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

    if (!res.ok || !json?.ok) {
      setStatus("error");
      setMessage(json?.error ?? "Unable to login");
      return;
    }

    router.push("/partner/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <label className="grid gap-1 sm:col-span-2">
        <span className="text-sm font-medium text-body">Email or Phone</span>
        <input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
          required
        />
      </label>

      <label className="grid gap-1 sm:col-span-2">
        <span className="text-sm font-medium text-body">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
          required
        />
      </label>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-hover disabled:opacity-60"
        >
          {status === "submitting" ? "Signing in…" : "Sign in"}
        </button>

        {message ? (
          <p className="mt-3 text-sm text-red-700">{message}</p>
        ) : (
          <p className="mt-2 text-xs text-muted">
            Don’t have an account? Create one from the partner page.
          </p>
        )}
      </div>
    </form>
  );
}
