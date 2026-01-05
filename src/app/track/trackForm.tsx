"use client";

import { useState } from "react";

export function TrackForm() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string>("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/public/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, phone }),
      });

      const json = (await res.json()) as
        | {
            ok: true;
            order: { id: string; status: string; createdAt: string; product?: { name: string } | null };
          }
        | { ok: false; error?: string };

      if (!res.ok || !json.ok) {
        setStatus("error");
        setMessage((json as any).error ?? "Unable to find order");
        return;
      }

      setStatus("success");
      setMessage(
        `Order ${json.order.id} is ${json.order.status}. Created at ${new Date(json.order.createdAt).toLocaleString()}.`,
      );
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
      <label className="grid gap-1 sm:col-span-2">
        <span className="text-sm font-medium text-body">Order ID</span>
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
          placeholder="Example: clx..."
          required
        />
      </label>

      <label className="grid gap-1 sm:col-span-2">
        <span className="text-sm font-medium text-body">Phone Number</span>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
          placeholder="Same number used in order"
          required
        />
      </label>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-gold px-5 text-sm font-semibold text-white hover:bg-gold-hover disabled:opacity-60"
        >
          {status === "loading" ? "Checking…" : "Track order"}
        </button>

        {message ? (
          <p
            className={`mt-3 text-sm ${
              status === "success" ? "text-forest" : "text-red-700"
            }`}
          >
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
