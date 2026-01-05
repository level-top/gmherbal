"use client";

import { useState } from "react";

export function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string>("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatus("error");
        setMessage(json.error ?? "Login failed");
        return;
      }

      window.location.reload();
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="rounded-2xl border border-earth/20 bg-surface p-6 shadow-sm sm:max-w-md">
      <h2 className="text-base font-semibold text-heading">Login</h2>
      <p className="mt-2 text-sm text-muted">
        Enter admin password to continue.
      </p>

      <form onSubmit={submit} className="mt-4 grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm font-medium text-body">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
            required
          />
        </label>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-hover disabled:opacity-60"
        >
          {status === "submitting" ? "Signing in…" : "Sign in"}
        </button>

        {message ? (
          <p className="text-sm text-red-700">{message}</p>
        ) : null}
      </form>
    </div>
  );
}
