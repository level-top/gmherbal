"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";

type FormState = {
  name: string;
  fatherName: string;
  address: string;
  phone1: string;
  phone2: string;
};

const initialState: FormState = {
  name: "",
  fatherName: "",
  address: "",
  phone1: "",
  phone2: "",
};

export function BuySection() {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string>("");
  const cart = useCart();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/public/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          fatherName: form.fatherName,
          address: form.address,
          phone1: form.phone1,
          phone2: form.phone2 || undefined,
          items: cart.items.map((it) => ({
            productId: it.productId,
            name: it.name,
            variant: it.variant ?? undefined,
            qty: it.qty,
          })),
        }),
      });

      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatus("error");
        setMessage(json.error ?? "Unable to submit your request");
        return;
      }

      setStatus("success");
      setMessage("Thanks! We will contact you soon.");
      setForm(initialState);
      cart.clear();
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <section id="buy" className="py-12">
      <div className="mx-auto max-w-5xl px-4">
        <div className="rounded-3xl border border-earth/20 bg-surface p-6 shadow-sm sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
            <div>
              <p className="inline-flex rounded-full bg-bg px-3 py-1 text-xs font-semibold text-forest">
                Fast checkout
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-heading">
                Confirm your order
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Share your details. We’ll confirm availability, price, and delivery on call/WhatsApp.
              </p>

              <div className="mt-6 grid gap-3 rounded-2xl border border-earth/20 bg-bg p-4 text-sm text-body">
                <p className="font-semibold text-heading">How it works</p>
                <ol className="grid gap-2 text-sm text-body">
                  <li>1) Submit your details</li>
                  <li>2) We confirm on call/WhatsApp</li>
                  <li>3) Dispatch & share tracking</li>
                </ol>
                <p className="text-xs text-muted">
                  Tip: If you already chose products, mention them on WhatsApp for faster confirmation.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-earth/20 bg-bg p-5 sm:p-6">
              <div className="mb-5 rounded-2xl border border-earth/20 bg-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-heading">Cart</p>
                  <p className="text-xs text-muted">{cart.count} item(s)</p>
                </div>

                {cart.items.length === 0 ? (
                  <p className="mt-2 text-sm text-muted">
                    No products added yet. Use “Fast checkout” on a product card.
                  </p>
                ) : (
                  <div className="mt-3 grid gap-3">
                    {cart.items.map((it) => (
                      <div
                        key={it.key}
                        className="flex flex-col gap-3 rounded-xl border border-earth/20 bg-bg px-3 py-3 sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-heading">{it.name}</p>
                          {it.variant ? (
                            <p className="mt-0.5 text-xs text-muted">{it.variant}</p>
                          ) : null}
                        </div>

                        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                          <input
                            value={it.qty}
                            onChange={(e) => cart.setQty(it.key, Number(e.target.value || 1))}
                            inputMode="numeric"
                            className="h-9 w-20 rounded-xl border border-earth/20 bg-surface px-2 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
                            aria-label={`Quantity for ${it.name}`}
                          />
                          <button
                            type="button"
                            onClick={() => cart.removeItem(it.key)}
                            className="inline-flex h-9 items-center justify-center rounded-xl border border-earth/20 bg-bg px-3 text-xs font-semibold text-heading hover:bg-surface"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-sm font-semibold text-heading">Name</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-12 rounded-2xl border border-earth/20 bg-surface px-4 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
                    placeholder="Your full name"
                    required
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-semibold text-heading">Father Name</span>
                  <input
                    value={form.fatherName}
                    onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                    className="h-12 rounded-2xl border border-earth/20 bg-surface px-4 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
                    placeholder="Father name"
                    required
                  />
                </label>

                <label className="grid gap-1 sm:col-span-2">
                  <span className="text-sm font-semibold text-heading">Address</span>
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="min-h-28 rounded-2xl border border-earth/20 bg-surface px-4 py-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
                    placeholder="House/Street, Area, City"
                    required
                  />
                  <span className="text-xs text-muted">
                    Add city + nearest landmark for easy delivery.
                  </span>
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-semibold text-heading">Contact Number (1)</span>
                  <input
                    value={form.phone1}
                    onChange={(e) => setForm({ ...form, phone1: e.target.value })}
                    className="h-12 rounded-2xl border border-earth/20 bg-surface px-4 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
                    placeholder="03xxxxxxxxx"
                    required
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-semibold text-heading">Contact Number (2)</span>
                  <input
                    value={form.phone2}
                    onChange={(e) => setForm({ ...form, phone2: e.target.value })}
                    className="h-12 rounded-2xl border border-earth/20 bg-surface px-4 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
                    placeholder="Optional"
                  />
                </label>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gold px-6 text-sm font-semibold text-white hover:bg-gold-hover disabled:opacity-60"
                  >
                    {status === "submitting" ? "Submitting…" : "Submit request"}
                  </button>

                  {message ? (
                    <div
                      className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                        status === "success"
                          ? "border-earth/20 bg-surface text-forest"
                          : "border-red-200 bg-red-50 text-red-700"
                      }`}
                    >
                      {message}
                    </div>
                  ) : null}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
