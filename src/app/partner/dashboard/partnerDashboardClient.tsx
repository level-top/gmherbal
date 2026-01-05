"use client";

import { useEffect, useMemo, useState } from "react";

type Partner = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
};

type Product = {
  id: string;
  name: string;
  price: number | null;
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

type Payout = {
  payoutMethod: string | null;
  payoutAccountName: string | null;
  payoutAccountNumber: string | null;
  payoutBankName: string | null;
  payoutIban: string | null;
  payoutPhone: string | null;
  payoutNotes: string | null;
};

export function PartnerDashboardClient() {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [payout, setPayout] = useState<Payout | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [orderForm, setOrderForm] = useState({
    name: "",
    address: "",
    phone1: "",
    productId: "",
    qty: 1,
    partnerUnitPrice: "",
  });

  async function refreshAll() {
    setError(null);
    setSuccess(null);

    const [meRes, ordersRes, payoutRes, productsRes] = await Promise.all([
      fetch("/api/partner/me", { cache: "no-store" }),
      fetch("/api/partner/orders", { cache: "no-store" }),
      fetch("/api/partner/payout", { cache: "no-store" }),
      fetch("/api/public/products", { cache: "no-store" }),
    ]);

    const meJson = (await meRes.json().catch(() => null)) as any;
    if (!meRes.ok || !meJson?.ok) throw new Error(meJson?.error ?? "Unauthorized");

    const ordersJson = (await ordersRes.json().catch(() => null)) as any;
    const payoutJson = (await payoutRes.json().catch(() => null)) as any;
    const productsJson = (await productsRes.json().catch(() => null)) as any;

    setPartner(meJson.partner);
    setOrders(Array.isArray(ordersJson?.orders) ? ordersJson.orders : []);
    setPayout(payoutJson?.payout ?? null);

    const list = Array.isArray(productsJson?.products) ? productsJson.products : [];
    setProducts(
      list.map((p: any) => ({ id: p.id, name: p.name, price: p.price ?? null })),
    );
  }

  useEffect(() => {
    refreshAll().catch((e) => setError(e?.message ?? "Unable to load"));
  }, []);

  const selectedProduct = useMemo(() => {
    if (!products) return null;
    return products.find((p) => p.id === orderForm.productId) ?? null;
  }, [products, orderForm.productId]);

  async function savePayout(next: Payout) {
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/partner/payout", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });

    const json = (await res.json().catch(() => null)) as any;
    if (!res.ok || !json?.ok) {
      setError(json?.error ?? "Unable to save payout");
      return;
    }

    setPayout(json.payout);
    setSuccess("Payout details updated");
  }

  async function createOrder() {
    setError(null);
    setSuccess(null);

    const qty = Math.max(1, Math.floor(Number(orderForm.qty) || 1));
    const partnerUnitPrice = Math.floor(Number(orderForm.partnerUnitPrice) || 0);

    const res = await fetch("/api/partner/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: orderForm.name,
        address: orderForm.address,
        phone1: orderForm.phone1,
        items: [
          {
            productId: orderForm.productId,
            qty,
            partnerUnitPrice,
          },
        ],
      }),
    });

    const json = (await res.json().catch(() => null)) as any;
    if (!res.ok || !json?.ok) {
      setError(json?.error ?? "Unable to create order");
      return;
    }

    setSuccess(`Order created: ${json.order.id}`);
    setOrderForm({ name: "", address: "", phone1: "", productId: "", qty: 1, partnerUnitPrice: "" });
    await refreshAll();
  }

  async function logout() {
    await fetch("/api/partner/logout", { method: "POST" }).catch(() => null);
    window.location.href = "/partner/login";
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-earth/20 bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-heading">Account</h2>
            <p className="mt-1 text-sm text-muted">
              {partner ? `${partner.name}` : "Loading…"}
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
        <h2 className="text-base font-semibold text-heading">Create Order</h2>
        <p className="mt-1 text-sm text-muted">
          Set your selling price. Profit is the price difference.
        </p>

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

          <label className="grid gap-1">
            <span className="text-sm font-medium text-body">Product</span>
            <select
              value={orderForm.productId}
              onChange={(e) => setOrderForm({ ...orderForm, productId: e.target.value })}
              className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
            >
              <option value="">Select product…</option>
              {(products ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-body">Qty</span>
            <input
              type="number"
              value={orderForm.qty}
              onChange={(e) => setOrderForm({ ...orderForm, qty: Number(e.target.value) })}
              className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
              min={1}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-body">Your selling price (PKR)</span>
            <input
              value={orderForm.partnerUnitPrice}
              onChange={(e) => setOrderForm({ ...orderForm, partnerUnitPrice: e.target.value })}
              className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
              placeholder={selectedProduct?.price ? `Base: ${selectedProduct.price}` : ""}
            />
          </label>

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
        <h2 className="text-base font-semibold text-heading">Payout Details</h2>
        <p className="mt-1 text-sm text-muted">
          Where we should send your profit.
        </p>

        <PayoutForm
          payout={payout}
          onSave={(next) => savePayout(next)}
        />
      </section>

      <section className="rounded-2xl border border-earth/20 bg-surface p-6 shadow-sm">
        <h2 className="text-base font-semibold text-heading">Orders</h2>
        <p className="mt-1 text-sm text-muted">
          Your latest orders and profit.
        </p>

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

function PayoutForm({
  payout,
  onSave,
}: {
  payout: Payout | null;
  onSave: (next: Payout) => void;
}) {
  const [state, setState] = useState<Payout>({
    payoutMethod: payout?.payoutMethod ?? "",
    payoutAccountName: payout?.payoutAccountName ?? "",
    payoutAccountNumber: payout?.payoutAccountNumber ?? "",
    payoutBankName: payout?.payoutBankName ?? "",
    payoutIban: payout?.payoutIban ?? "",
    payoutPhone: payout?.payoutPhone ?? "",
    payoutNotes: payout?.payoutNotes ?? "",
  });

  useEffect(() => {
    setState({
      payoutMethod: payout?.payoutMethod ?? "",
      payoutAccountName: payout?.payoutAccountName ?? "",
      payoutAccountNumber: payout?.payoutAccountNumber ?? "",
      payoutBankName: payout?.payoutBankName ?? "",
      payoutIban: payout?.payoutIban ?? "",
      payoutPhone: payout?.payoutPhone ?? "",
      payoutNotes: payout?.payoutNotes ?? "",
    });
  }, [payout]);

  const disabled = useMemo(() => false, []);

  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <label className="grid gap-1">
        <span className="text-sm font-medium text-body">Method</span>
        <input
          value={state.payoutMethod ?? ""}
          onChange={(e) => setState({ ...state, payoutMethod: e.target.value })}
          className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
          placeholder="JazzCash / EasyPaisa / Bank"
        />
      </label>
      <label className="grid gap-1">
        <span className="text-sm font-medium text-body">Account name</span>
        <input
          value={state.payoutAccountName ?? ""}
          onChange={(e) => setState({ ...state, payoutAccountName: e.target.value })}
          className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
        />
      </label>
      <label className="grid gap-1">
        <span className="text-sm font-medium text-body">Wallet / Account number</span>
        <input
          value={state.payoutAccountNumber ?? ""}
          onChange={(e) => setState({ ...state, payoutAccountNumber: e.target.value })}
          className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
        />
      </label>
      <label className="grid gap-1">
        <span className="text-sm font-medium text-body">Payout phone</span>
        <input
          value={state.payoutPhone ?? ""}
          onChange={(e) => setState({ ...state, payoutPhone: e.target.value })}
          className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
        />
      </label>
      <label className="grid gap-1">
        <span className="text-sm font-medium text-body">Bank name</span>
        <input
          value={state.payoutBankName ?? ""}
          onChange={(e) => setState({ ...state, payoutBankName: e.target.value })}
          className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
        />
      </label>
      <label className="grid gap-1">
        <span className="text-sm font-medium text-body">IBAN</span>
        <input
          value={state.payoutIban ?? ""}
          onChange={(e) => setState({ ...state, payoutIban: e.target.value })}
          className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
        />
      </label>
      <label className="grid gap-1 sm:col-span-2">
        <span className="text-sm font-medium text-body">Notes</span>
        <textarea
          value={state.payoutNotes ?? ""}
          onChange={(e) => setState({ ...state, payoutNotes: e.target.value })}
          className="min-h-20 rounded-xl border border-earth/20 bg-bg px-3 py-2 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
        />
      </label>

      <div className="sm:col-span-2">
        <button
          disabled={disabled}
          onClick={() => onSave(state)}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-earth/20 bg-bg px-5 text-sm font-semibold text-heading hover:bg-surface"
        >
          Save payout details
        </button>
      </div>
    </div>
  );
}
