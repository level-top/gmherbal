"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type State = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const initial: State = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export function PartnerSignupForm() {
  const router = useRouter();
  const [form, setForm] = useState<State>(initial);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string>("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    if (!form.email.trim() && !form.phone.trim()) {
      setStatus("error");
      setMessage("Email or phone is required");
      return;
    }
    if (!form.password || form.password.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("/api/partner/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email || undefined,
          phone: form.phone || undefined,
          password: form.password,
        }),
      });

      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatus("error");
        setMessage(json.error ?? "Unable to submit");
        return;
      }

      setStatus("success");
      setMessage("Account created. Redirecting…");
      setForm(initial);
      router.push("/partner/dashboard");
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
      <label className="grid gap-1">
        <span className="text-sm font-medium text-body">Name</span>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
          required
        />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium text-body">Email</span>
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
          type="email"
        />
      </label>

      <label className="grid gap-1 sm:col-span-2">
        <span className="text-sm font-medium text-body">Phone</span>
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
        />
      </label>

      <label className="grid gap-1 sm:col-span-2">
        <span className="text-sm font-medium text-body">Password</span>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
          required
        />
      </label>

      <label className="grid gap-1 sm:col-span-2">
        <span className="text-sm font-medium text-body">Confirm password</span>
        <input
          type="password"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
          required
        />
      </label>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-gold px-5 text-sm font-semibold text-white hover:bg-gold-hover disabled:opacity-60"
        >
          {status === "submitting" ? "Creating…" : "Create account"}
        </button>

        {message ? (
          <p
            className={`mt-3 text-sm ${
              status === "success" ? "text-forest" : "text-red-700"
            }`}
          >
            {message}
          </p>
        ) : (
          <p className="mt-2 text-xs text-muted">
            You can add payout/bank details in the dashboard.
          </p>
        )}
      </div>
    </form>
  );
}
