"use client";

import { useEffect, useMemo, useState } from "react";

type Payout = {
  payoutMethod: string | null;
  payoutAccountName: string | null;
  payoutAccountNumber: string | null;
  payoutBankName: string | null;
  payoutIban: string | null;
  payoutPhone: string | null;
  payoutNotes: string | null;
};

export function PartnerBankDetailsClient() {
  const [payout, setPayout] = useState<Payout | null>(null);
  const [state, setState] = useState<Payout>({
    payoutMethod: "",
    payoutAccountName: "",
    payoutAccountNumber: "",
    payoutBankName: "",
    payoutIban: "",
    payoutPhone: "",
    payoutNotes: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    setError(null);
    setSuccess(null);
    const res = await fetch("/api/partner/payout", { cache: "no-store" });
    const json = (await res.json().catch(() => null)) as any;
    if (!res.ok || !json?.ok) throw new Error(json?.error ?? "Unable to load");
    setPayout(json.payout ?? null);
  }

  useEffect(() => {
    load().catch((e) => setError(e?.message ?? "Unable to load"));
  }, []);

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

  async function save() {
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/partner/payout", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });

    const json = (await res.json().catch(() => null)) as any;
    if (!res.ok || !json?.ok) {
      setError(json?.error ?? "Unable to save");
      return;
    }

    setPayout(json.payout ?? null);
    setSuccess("Bank details saved");
  }

  return (
    <section className="rounded-2xl border border-earth/20 bg-surface p-6 shadow-sm">
      <h2 className="text-base font-semibold text-heading">Bank / Payout Details</h2>
      <p className="mt-1 text-sm text-muted">Where we should send your profit.</p>

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

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-sm font-medium text-body">Method</span>
          <input
            value={state.payoutMethod ?? ""}
            onChange={(e) => setState({ ...state, payoutMethod: e.target.value })}
            placeholder="JazzCash / EasyPaisa / Bank"
            className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
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
          <span className="text-sm font-medium text-body">Payout phone (if wallet)</span>
          <input
            value={state.payoutPhone ?? ""}
            onChange={(e) => setState({ ...state, payoutPhone: e.target.value })}
            className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-body">Bank name (if bank)</span>
          <input
            value={state.payoutBankName ?? ""}
            onChange={(e) => setState({ ...state, payoutBankName: e.target.value })}
            className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-body">IBAN (if bank)</span>
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
            onClick={() => save().catch(() => setError("Unable to save"))}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-hover disabled:opacity-60"
          >
            Save
          </button>
        </div>
      </div>
    </section>
  );
}
