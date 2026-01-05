"use client";

import { useEffect, useState } from "react";

type ApiKey = {
  id: string;
  prefix: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
  canReveal?: boolean;
};

export function PartnerApiKeysClient() {
  const [keys, setKeys] = useState<ApiKey[] | null>(null);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    setError(null);
    setSuccess(null);
    const res = await fetch("/api/partner/api-keys", { cache: "no-store" });
    const json = (await res.json().catch(() => null)) as any;
    if (!res.ok || !json?.ok) throw new Error(json?.error ?? "Unable to load");
    setKeys(Array.isArray(json.apiKeys) ? json.apiKeys : []);
  }

  useEffect(() => {
    load().catch((e) => setError(e?.message ?? "Unable to load"));
  }, []);

  async function createKey() {
    setError(null);
    setSuccess(null);
    setCreatedKey(null);

    const res = await fetch("/api/partner/api-keys", { method: "POST" });
    const json = (await res.json().catch(() => null)) as any;

    if (!res.ok || !json?.ok) {
      setError(json?.error ?? "Unable to create API key");
      return;
    }

    setCreatedKey(String(json.apiKey ?? ""));
    setSuccess("API key created. Copy and store it safely.");
    await load();
  }

  async function deleteKey(id: string) {
    setError(null);
    setSuccess(null);

    const ok = window.confirm("Delete this API key? Any integrations using it will stop working.");
    if (!ok) return;

    const res = await fetch(`/api/partner/api-keys/${id}`, { method: "DELETE" });
    const json = (await res.json().catch(() => null)) as any;

    if (!res.ok || !json?.ok) {
      setError(json?.error ?? "Unable to delete API key");
      return;
    }

    setSuccess("API key deleted");
    await load();
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess("Copied to clipboard");
    } catch {
      setError("Unable to copy. Please copy manually.");
    }
  }

  async function copyExistingKey(id: string) {
    setError(null);
    setSuccess(null);

    const res = await fetch(`/api/partner/api-keys/${id}/reveal`, { cache: "no-store" });
    const json = (await res.json().catch(() => null)) as any;
    if (!res.ok || !json?.ok) {
      setError(json?.error ?? "Unable to copy this key");
      return;
    }

    await copy(String(json.apiKey ?? ""));
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-earth/20 bg-surface p-6 shadow-sm">
        <h2 className="text-base font-semibold text-heading">API Keys</h2>
        <p className="mt-1 text-sm text-muted">
          Create keys for integrations. You’ll only see a new key once.
        </p>

        <div className="mt-4 rounded-xl border border-earth/20 bg-bg p-4 text-sm text-body">
          <p className="font-semibold text-heading">How to use</p>
          <p className="mt-2 text-muted">Base URL: <span className="font-mono">http://localhost:3000</span></p>
          <p className="mt-2 text-muted">
            Send your key in the <span className="font-mono">x-api-key</span> header.
          </p>

          <div className="mt-5 grid gap-5">
            <div className="rounded-xl border border-earth/20 bg-surface p-4">
              <p className="text-sm font-semibold text-heading">1) List products</p>
              <p className="mt-1 text-xs text-muted">
                <span className="font-mono">GET /api/partner/products</span>
              </p>
              <pre className="mt-3 overflow-x-auto rounded-lg border border-earth/20 bg-bg p-3 text-[11px] text-heading">
{`curl -H "x-api-key: YOUR_KEY" \
  http://localhost:3000/api/partner/products`}
              </pre>
            </div>

            <div className="rounded-xl border border-earth/20 bg-surface p-4">
              <p className="text-sm font-semibold text-heading">2) List your orders</p>
              <p className="mt-1 text-xs text-muted">
                <span className="font-mono">GET /api/partner/orders</span>
              </p>
              <pre className="mt-3 overflow-x-auto rounded-lg border border-earth/20 bg-bg p-3 text-[11px] text-heading">
{`curl -H "x-api-key: YOUR_KEY" \
  http://localhost:3000/api/partner/orders`}
              </pre>
            </div>

            <div className="rounded-xl border border-earth/20 bg-surface p-4">
              <p className="text-sm font-semibold text-heading">3) Create an order</p>
              <p className="mt-1 text-xs text-muted">
                <span className="font-mono">POST /api/partner/orders</span>
              </p>
              <p className="mt-2 text-xs text-muted">
                You can send multiple items. Each item needs your selling price (PKR).
              </p>
              <pre className="mt-3 overflow-x-auto rounded-lg border border-earth/20 bg-bg p-3 text-[11px] text-heading">
{`curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_KEY" \
  -d '{
    "name": "Customer Name",
    "address": "Customer Address",
    "phone1": "03001234567",
    "items": [
      { "productId": "PRODUCT_ID_1", "qty": 1, "partnerUnitPrice": 2500 },
      { "productId": "PRODUCT_ID_2", "qty": 2, "partnerUnitPrice": 1800 }
    ]
  }' \
  http://localhost:3000/api/partner/orders`}
              </pre>
            </div>

            <div className="rounded-xl border border-earth/20 bg-surface p-4">
              <p className="text-sm font-semibold text-heading">4) Get one order</p>
              <p className="mt-1 text-xs text-muted">
                <span className="font-mono">GET /api/partner/orders/:id</span>
              </p>
              <pre className="mt-3 overflow-x-auto rounded-lg border border-earth/20 bg-bg p-3 text-[11px] text-heading">
{`curl -H "x-api-key: YOUR_KEY" \
  http://localhost:3000/api/partner/orders/ORDER_ID`}
              </pre>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={() => createKey().catch(() => setError("Unable to create API key"))}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-gold px-5 text-sm font-semibold text-white hover:bg-gold-hover"
          >
            Create API key
          </button>
        </div>

        {createdKey ? (
          <div className="mt-4 rounded-xl border border-earth/20 bg-bg p-4">
            <p className="text-sm font-semibold text-heading">Your new API key</p>
            <p className="mt-2 break-all rounded-lg border border-earth/20 bg-surface px-3 py-2 font-mono text-xs text-heading">
              {createdKey}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => copy(createdKey).catch(() => setError("Unable to copy"))}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-forest px-4 text-sm font-semibold text-white hover:bg-forest-hover"
              >
                Copy
              </button>
              <p className="text-xs text-muted self-center">Copy it now and store it safely.</p>
            </div>
          </div>
        ) : null}

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
        <h2 className="text-base font-semibold text-heading">Existing keys</h2>

        {!keys ? (
          <div className="mt-4 rounded-xl border border-earth/20 bg-bg p-4 text-sm text-muted">Loading…</div>
        ) : keys.length === 0 ? (
          <div className="mt-4 rounded-xl border border-earth/20 bg-bg p-4 text-sm text-muted">No keys yet.</div>
        ) : (
          <div className="mt-4 grid gap-3">
            {keys.map((k) => (
              <div key={k.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-earth/20 bg-bg p-4">
                <div>
                  <p className="text-sm font-semibold text-heading">{k.prefix}…</p>
                  <p className="mt-1 text-xs text-muted">
                    Created: {new Date(k.createdAt).toLocaleString()}
                    {k.lastUsedAt ? ` • Last used: ${new Date(k.lastUsedAt).toLocaleString()}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => copyExistingKey(k.id).catch(() => setError("Unable to copy key"))}
                    disabled={!k.canReveal}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-forest px-4 text-sm font-semibold text-white hover:bg-forest-hover disabled:opacity-60"
                    title={k.canReveal ? "Copy full key" : "Key is only shown once. Create a new key."}
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => deleteKey(k.id).catch(() => setError("Unable to delete API key"))}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-earth/20 bg-bg px-4 text-sm font-semibold text-heading hover:bg-surface"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
