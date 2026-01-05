"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  sizeLabel?: string | null;
  imageUrl?: string | null;
  price: number | null;
};

type CartLine = {
  productId: string;
  qty: number;
  partnerUnitPrice: string;
};

type OrderItem = {
  productId: string | null;
  productName: string;
  quantity: number;
  baseUnitPrice: number;
  partnerUnitPrice: number;
};

type Order = {
  id: string;
  status: "NEW" | "CONFIRMED" | "SHIPPED" | "CANCELLED";
  createdAt: string;
  name: string;
  address: string;
  phone1: string;
  totalBaseAmount: number | null;
  totalPartnerAmount: number | null;
  partnerProfit: number | null;
  partnerPayoutStatus: "PENDING" | "PAID" | null;
  partnerPayoutPaidAt: string | null;
  items: OrderItem[];
};

export function PartnerOrdersClient() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [orderForm, setOrderForm] = useState({
    name: "",
    address: "",
    phone1: "",
    lines: [{ productId: "", qty: 1, partnerUnitPrice: "" }] as CartLine[],
  });

  async function refresh() {
    setError(null);
    setSuccess(null);

    const [ordersRes, productsRes] = await Promise.all([
      fetch("/api/partner/orders", { cache: "no-store" }),
      fetch("/api/public/products", { cache: "no-store" }),
    ]);

    const ordersJson = (await ordersRes.json().catch(() => null)) as any;
    if (!ordersRes.ok || !ordersJson?.ok) throw new Error(ordersJson?.error ?? "Unable to load orders");

    const productsJson = (await productsRes.json().catch(() => null)) as any;
    const list = Array.isArray(productsJson?.products) ? productsJson.products : [];

    setOrders(Array.isArray(ordersJson?.orders) ? ordersJson.orders : []);
    setProducts(
      list.map((p: any) => ({
        id: p.id,
        name: p.name,
        sizeLabel: p.sizeLabel ?? null,
        imageUrl: p.imageUrl ?? null,
        price: p.price ?? null,
      })),
    );
  }

  useEffect(() => {
    refresh().catch((e) => setError(e?.message ?? "Unable to load"));
  }, []);

  const productById = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of products ?? []) map.set(p.id, p);
    return map;
  }, [products]);

  const cartTotals = useMemo(() => {
    let totalBase = 0;
    let totalPartner = 0;
    let totalProfit = 0;

    for (const line of orderForm.lines) {
      if (!line.productId) continue;
      const p = productById.get(line.productId);
      const base = typeof p?.price === "number" ? p.price : null;
      const qty = Math.max(1, Math.floor(Number(line.qty) || 1));
      const partnerUnitPrice = Math.floor(Number(line.partnerUnitPrice) || 0);
      if (base == null || base <= 0) continue;
      if (partnerUnitPrice <= 0) continue;
      totalBase += base * qty;
      totalPartner += partnerUnitPrice * qty;
      totalProfit += (partnerUnitPrice - base) * qty;
    }

    return { totalBase, totalPartner, totalProfit };
  }, [orderForm.lines, productById]);

  function updateLine(index: number, patch: Partial<CartLine>) {
    setOrderForm((prev) => {
      const next = [...prev.lines];
      next[index] = { ...next[index], ...patch };
      return { ...prev, lines: next };
    });
  }

  function addLine() {
    setOrderForm((prev) => ({
      ...prev,
      lines: [...prev.lines, { productId: "", qty: 1, partnerUnitPrice: "" }],
    }));
  }

  function removeLine(index: number) {
    setOrderForm((prev) => {
      const next = prev.lines.filter((_, i) => i !== index);
      return { ...prev, lines: next.length > 0 ? next : [{ productId: "", qty: 1, partnerUnitPrice: "" }] };
    });
  }

  async function createOrder() {
    setError(null);
    setSuccess(null);

    const items = orderForm.lines
      .map((line) => {
        const productId = String(line.productId || "").trim();
        const qty = Math.max(1, Math.floor(Number(line.qty) || 1));
        const partnerUnitPrice = Math.floor(Number(line.partnerUnitPrice) || 0);
        if (!productId || partnerUnitPrice <= 0) return null;
        return { productId, qty, partnerUnitPrice };
      })
      .filter(Boolean) as Array<{ productId: string; qty: number; partnerUnitPrice: number }>;

    if (items.length === 0) {
      setError("Add at least one product to the cart");
      return;
    }

    const res = await fetch("/api/partner/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: orderForm.name,
        address: orderForm.address,
        phone1: orderForm.phone1,
        items,
      }),
    });

    const json = (await res.json().catch(() => null)) as any;
    if (!res.ok || !json?.ok) {
      setError(json?.error ?? "Unable to create order");
      return;
    }

    setSuccess(`Order created: ${json.order.id}`);
    setOrderForm({ name: "", address: "", phone1: "", lines: [{ productId: "", qty: 1, partnerUnitPrice: "" }] });
    await refresh();
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-earth/20 bg-surface p-6 shadow-sm">
        <h2 className="text-base font-semibold text-heading">Create Order</h2>
        <p className="mt-1 text-sm text-muted">
          Use this page to create partner orders. You set your selling price; profit is the price difference.
        </p>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : null}
        {success ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{success}</div>
        ) : null}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-medium text-body">Customer name</span>
            <input
              value={orderForm.name}
              onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
              className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
            />
          </label>

          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-medium text-body">Address</span>
            <textarea
              value={orderForm.address}
              onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
              className="min-h-20 rounded-xl border border-earth/20 bg-bg px-3 py-2 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-body">Phone</span>
            <input
              value={orderForm.phone1}
              onChange={(e) => setOrderForm({ ...orderForm, phone1: e.target.value })}
              className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
            />
          </label>

          <div className="sm:col-span-2 rounded-xl border border-earth/20 bg-bg p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-heading">Cart</p>
              <button
                type="button"
                onClick={addLine}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-earth/20 bg-bg px-4 text-sm font-semibold text-heading hover:bg-surface"
              >
                Add product
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              {orderForm.lines.map((line, idx) => {
                const p = line.productId ? productById.get(line.productId) : null;
                const base = typeof p?.price === "number" ? p.price : null;
                const qty = Math.max(1, Math.floor(Number(line.qty) || 1));
                const partnerUnitPrice = Math.floor(Number(line.partnerUnitPrice) || 0);
                const lineProfit = base != null ? (partnerUnitPrice - base) * qty : 0;

                return (
                  <div key={idx} className="grid gap-3 rounded-xl border border-earth/20 bg-surface p-3">
                    <div className="grid gap-1">
                      <span className="text-xs font-medium text-muted">Product</span>
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-earth/20 bg-bg">
                          {p?.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="h-full w-full bg-bg" />
                          )}
                        </div>

                        <select
                          value={line.productId}
                          onChange={(e) => updateLine(idx, { productId: e.target.value })}
                          className="h-11 w-full rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
                        >
                          <option value="">Select product…</option>
                          {(products ?? []).map((pr) => (
                            <option key={pr.id} value={pr.id}>
                              {pr.name}
                              {pr.sizeLabel ? ` • ${pr.sizeLabel}` : ""}
                              {typeof pr.price === "number" ? ` • Rs ${pr.price}` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="text-[11px] text-muted">
                        Base price: {typeof base === "number" ? `Rs ${base}` : "—"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="grid gap-1">
                        <span className="text-xs font-medium text-muted">Qty</span>
                        <input
                          type="number"
                          value={line.qty}
                          onChange={(e) => updateLine(idx, { qty: Number(e.target.value) })}
                          className="h-11 w-full rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
                          min={1}
                        />
                      </label>

                      <div className="grid gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-muted">Your price (PKR)</span>
                          <button
                            type="button"
                            onClick={() => removeLine(idx)}
                            className="text-xs font-semibold text-heading hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          value={line.partnerUnitPrice}
                          onChange={(e) => updateLine(idx, { partnerUnitPrice: e.target.value })}
                          className="h-11 w-full rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
                          placeholder={typeof base === "number" ? `Min: ${base}` : ""}
                        />
                        <div className="flex items-center justify-between gap-2 text-[11px] text-muted">
                          <span>
                            Profit: {typeof base === "number" && partnerUnitPrice > 0 ? `Rs ${lineProfit}` : "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 grid gap-2 rounded-xl border border-earth/20 bg-bg p-4 text-sm">
              <p className="text-xs text-muted">Totals</p>
              <p className="text-body">Base total: <span className="font-semibold text-heading">Rs {cartTotals.totalBase}</span></p>
              <p className="text-body">Your total: <span className="font-semibold text-heading">Rs {cartTotals.totalPartner}</span></p>
              <p className="text-body">Profit: <span className="font-semibold text-heading">Rs {cartTotals.totalProfit}</span></p>
            </div>
          </div>

          <div className="sm:col-span-2">
            <button
              onClick={() => createOrder().catch(() => setError("Unable to create order"))}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-hover"
            >
              Create order
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-earth/20 bg-surface p-6 shadow-sm">
        <h2 className="text-base font-semibold text-heading">Orders</h2>
        <p className="mt-1 text-sm text-muted">Your latest orders and profit.</p>

        {!orders ? (
          <div className="mt-4 rounded-xl border border-earth/20 bg-bg p-4 text-sm text-muted">Loading…</div>
        ) : orders.length === 0 ? (
          <div className="mt-4 rounded-xl border border-earth/20 bg-bg p-4 text-sm text-muted">No orders yet.</div>
        ) : (
          <div className="mt-4 grid gap-3">
            {orders.map((o) => (
              <div key={o.id} className="rounded-xl border border-earth/20 bg-bg p-4">
                <p className="text-sm font-semibold text-heading">Order: {o.id}</p>
                <p className="mt-1 text-xs text-muted">
                  Status: {o.status}
                  {o.partnerPayoutStatus ? ` • Payout: ${o.partnerPayoutStatus}` : ""}
                  {o.partnerPayoutPaidAt ? ` • Paid: ${new Date(o.partnerPayoutPaidAt).toLocaleString()}` : ""}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Total: {typeof o.totalPartnerAmount === "number" ? `Rs ${o.totalPartnerAmount}` : "—"}
                  {typeof o.partnerProfit === "number" ? ` • Profit: Rs ${o.partnerProfit}` : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
