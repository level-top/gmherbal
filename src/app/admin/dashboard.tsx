"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string | null;
  oilType: string | null;
  variant: string | null;
  extraction: string | null;
  sizeLabel: string | null;
  price: number | null;
  imageUrl: string | null;
  isFeatured: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
};

type Order = {
  id: string;
  source?: "PUBLIC" | "PARTNER";
  status: "NEW" | "CONFIRMED" | "SHIPPED" | "CANCELLED";
  name: string;
  fatherName: string;
  address: string;
  phone1: string;
  phone2: string | null;
  createdAt: string;
  product: { id: string; name: string; slug: string } | null;
  totalBaseAmount?: number | null;
  totalPartnerAmount?: number | null;
  partnerProfit?: number | null;
  partnerPayoutStatus?: "PENDING" | "PAID" | null;
  partnerPayoutPaidAt?: string | null;
  partner?: { id: string; name: string } | null;
};

type ApiKeyMeta = {
  id: string;
  prefix: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
};

type Certification = {
  id: string;
  title: string;
  authority: string;
  refNo: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
};

type Testimonial = {
  id: string;
  customerName: string;
  city: string | null;
  content: string;
  videoUrl: string | null;
  rating: number | null;
  isApproved: boolean;
  createdAt: string;
  product: { id: string; name: string; slug: string } | null;
};

type Partner = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  payoutMethod?: string | null;
  payoutAccountName?: string | null;
  payoutAccountNumber?: string | null;
  payoutBankName?: string | null;
  payoutIban?: string | null;
  payoutPhone?: string | null;
  payoutNotes?: string | null;
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  createdAt: string;
  apiKeys?: ApiKeyMeta[];
};

type Faq = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
};

type AdminAnalytics = {
  products: { total: number; active: number };
  orders: {
    total: number;
    byStatus: Record<string, number>;
    last7Days: Array<{ day: string; count: number }>;
  };
  reviews: { total: number; approved: number };
  partners: { total: number };
};

export function AdminDashboard() {
  return (
    <div className="grid gap-6">
      <AdminNavBar />
      <AdminAnalyticsPanel />
      <section id="certifications" className="scroll-mt-24">
        <CertificationsAdmin />
      </section>
      <section id="reviews" className="scroll-mt-24">
        <TestimonialsAdmin />
      </section>
      <section id="faqs" className="scroll-mt-24">
        <FaqsAdmin />
      </section>
      <section id="partners" className="scroll-mt-24">
        <PartnersAdmin />
      </section>
    </div>
  );
}

const orderStatuses = ["NEW", "CONFIRMED", "SHIPPED", "CANCELLED"] as const;
const payoutStatuses = ["PENDING", "PAID"] as const;

type ProductOption = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

function AdminNavBar() {
  const [newCount, setNewCount] = useState<number>(0);
  const [countError, setCountError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setCountError(null);
        const res = await fetch("/api/admin/orders?status=NEW&mode=count", { cache: "no-store" });
        const json = (await res.json().catch(() => null)) as { ok?: boolean; count?: number; error?: string } | null;
        if (!res.ok || !json?.ok) throw new Error(json?.error ?? "Unable to load new orders");
        if (!cancelled) setNewCount(Math.max(0, Math.floor(Number(json.count ?? 0) || 0)));
      } catch (e: any) {
        if (!cancelled) setCountError(typeof e?.message === "string" ? e.message : "Unable to load new orders");
      }
    }

    load();
    const t = setInterval(load, 20_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  return (
    <div className="sticky top-[60px] z-30 rounded-2xl border border-earth/20 bg-surface p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted">
          Tip: set a strong <span className="font-mono">ADMIN_PASSWORD</span> before deployment.
        </p>

        <div className="flex flex-wrap gap-2">
          <Link href="/admin/products" className="rounded-xl border border-earth/20 bg-bg px-3 py-2 text-xs font-semibold text-heading hover:bg-surface">
            Products
          </Link>
          <Link href="/admin/orders" className="relative rounded-xl border border-earth/20 bg-bg px-3 py-2 text-xs font-semibold text-heading hover:bg-surface">
            Orders
            {newCount > 0 ? (
              <span className="ml-2 inline-flex min-w-[18px] items-center justify-center rounded-full bg-forest px-2 py-0.5 text-[11px] font-semibold text-white">
                {newCount}
              </span>
            ) : null}
          </Link>
          <Link href="/admin#reviews" className="rounded-xl border border-earth/20 bg-bg px-3 py-2 text-xs font-semibold text-heading hover:bg-surface">
            Reviews
          </Link>
          <Link href="/admin#faqs" className="rounded-xl border border-earth/20 bg-bg px-3 py-2 text-xs font-semibold text-heading hover:bg-surface">
            FAQs
          </Link>
          <Link href="/admin#partners" className="rounded-xl border border-earth/20 bg-bg px-3 py-2 text-xs font-semibold text-heading hover:bg-surface">
            Partners
          </Link>
          <Link href="/admin#certifications" className="rounded-xl border border-earth/20 bg-bg px-3 py-2 text-xs font-semibold text-heading hover:bg-surface">
            Certifications
          </Link>
          <button
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
              window.location.reload();
            }}
            className="rounded-xl bg-forest px-3 py-2 text-xs font-semibold text-white hover:bg-forest-hover"
          >
            Logout
          </button>
        </div>
      </div>

      {countError ? (
        <p className="mt-2 text-xs text-muted">{countError}</p>
      ) : null}
    </div>
  );
}

function AdminAnalyticsPanel() {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(null);
      const res = await fetch("/api/admin/analytics", { cache: "no-store" });
      const json = (await res.json()) as { ok: boolean; analytics?: AdminAnalytics; error?: string };

      if (!res.ok || !json.ok || !json.analytics) {
        if (!cancelled) setError(json.error ?? "Unable to load analytics");
        return;
      }

      if (!cancelled) setData(json.analytics);
    }

    load().catch(() => setError("Unable to load analytics"));
    return () => {
      cancelled = true;
    };
  }, []);

  const kpi = useMemo(() => {
    if (error) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      );
    }
    if (!data) {
      return (
        <div className="rounded-2xl border border-earth/20 bg-bg p-5 text-sm text-muted">
          Loading analytics…
        </div>
      );
    }

    const byStatus = data.orders.byStatus ?? {};
    const maxDay = Math.max(1, ...data.orders.last7Days.map((d) => d.count));

    return (
      <div className="rounded-3xl border border-earth/20 bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex rounded-full bg-bg px-3 py-1 text-xs font-semibold text-forest">Analytics</p>
            <h2 className="mt-3 text-lg font-semibold text-heading">Overview</h2>
            <p className="mt-1 text-sm text-muted">Quick numbers to monitor activity.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Products" value={`${data.products.active}/${data.products.total}`} note="Active / Total" />
          <KpiCard label="Orders" value={`${data.orders.total}`} note="All-time" />
          <KpiCard label="Reviews" value={`${data.reviews.approved}/${data.reviews.total}`} note="Approved / Total" />
          <KpiCard label="Partners" value={`${data.partners.total}`} note="All-time" />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-earth/20 bg-bg p-5">
            <p className="text-sm font-semibold text-heading">Orders by status</p>
            <div className="mt-4 grid gap-3">
              {([
                ["NEW", "New"],
                ["CONFIRMED", "Confirmed"],
                ["SHIPPED", "Shipped"],
                ["CANCELLED", "Cancelled"],
              ] as const).map(([key, label]) => {
                const value = Number(byStatus[key] ?? 0);
                const max = Math.max(1, ...Object.values(byStatus).map((v) => Number(v ?? 0)));
                const pct = Math.round((value / max) * 100);
                return (
                  <div key={key} className="grid gap-1">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span className="font-semibold text-heading">{label}</span>
                      <span>{value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface">
                      <div className="h-2 rounded-full bg-forest" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-earth/20 bg-bg p-5">
            <p className="text-sm font-semibold text-heading">Orders (last 7 days)</p>
            <div className="mt-4 grid grid-cols-7 items-end gap-2">
              {data.orders.last7Days.map((d) => (
                <div key={d.day} className="grid gap-1">
                  <div
                    className="w-full rounded-lg bg-gold"
                    style={{ height: `${Math.max(8, Math.round((d.count / maxDay) * 72))}px` }}
                    title={`${d.day}: ${d.count}`}
                  />
                  <span className="text-[10px] text-muted">{d.day.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }, [data, error]);

  return kpi;
}

function KpiCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-earth/20 bg-bg p-4">
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-heading">{value}</p>
      <p className="mt-1 text-xs text-muted">{note}</p>
    </div>
  );
}

function FaqsAdmin() {
  const [faqs, setFaqs] = useState<Faq[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  async function refresh() {
    setError(null);
    const res = await fetch("/api/admin/faqs", { cache: "no-store" });
    const json = (await res.json()) as { ok: boolean; faqs?: Faq[]; error?: string };

    if (!res.ok || !json.ok || !Array.isArray(json.faqs)) {
      setError(json.error ?? "Unable to load FAQs");
      setFaqs([]);
      return;
    }

    setFaqs(json.faqs);
  }

  useEffect(() => {
    const t = setTimeout(() => {
      refresh().catch(() => setError("Unable to load FAQs"));
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const list = useMemo(() => {
    if (error) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      );
    }

    if (!faqs) {
      return (
        <div className="rounded-xl border border-earth/20 bg-bg p-4 text-sm text-muted">
          Loading…
        </div>
      );
    }

    if (faqs.length === 0) {
      return (
        <div className="rounded-xl border border-earth/20 bg-bg p-4 text-sm text-muted">
          No FAQs yet.
        </div>
      );
    }

    return (
      <div className="grid gap-3">
        {faqs.map((f) => (
          <div key={f.id} className="rounded-xl border border-earth/20 bg-surface p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-heading">{f.question}</p>
                <p className="mt-1 text-sm leading-6 text-body">{f.answer}</p>
              </div>
              <span className={`rounded-full bg-bg px-3 py-1 text-xs font-semibold ${f.isActive ? "text-forest" : "text-muted"}`}
              >
                {f.isActive ? "Active" : "Hidden"}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="grid gap-1">
                <span className="text-xs font-medium text-body">Sort order</span>
                <input
                  defaultValue={String(f.sortOrder ?? 0)}
                  onBlur={async (e) => {
                    await fetch("/api/admin/faqs", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: f.id, sortOrder: e.target.value }),
                    }).catch(() => null);
                    await refresh();
                  }}
                  className="h-10 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
                />
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-earth/20 bg-bg px-3">
                <input
                  type="checkbox"
                  defaultChecked={f.isActive}
                  onChange={async (e) => {
                    await fetch("/api/admin/faqs", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: f.id, isActive: e.target.checked }),
                    }).catch(() => null);
                    await refresh();
                  }}
                  className="h-4 w-4"
                />
                <span className="text-sm font-semibold text-heading">Visible</span>
              </label>

              <button
                onClick={async () => {
                  if (!confirm("Delete this FAQ?")) return;
                  await fetch("/api/admin/faqs", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: f.id }),
                  }).catch(() => null);
                  await refresh();
                }}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-red-200 bg-bg px-4 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }, [error, faqs]);

  return (
    <section className="rounded-2xl border border-earth/20 bg-surface p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-heading">FAQs</h2>
          <p className="mt-1 text-sm text-muted">Create and manage frequently asked questions.</p>
        </div>
        <button
          onClick={() => refresh().catch(() => setError("Unable to load FAQs"))}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-earth/20 bg-bg px-4 text-sm font-semibold text-heading hover:bg-surface"
        >
          Refresh
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-earth/20 bg-bg p-4">
        <p className="text-sm font-semibold text-heading">Add FAQ</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-xs font-medium text-body">Question</span>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="h-10 rounded-xl border border-earth/20 bg-surface px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
              placeholder="Question"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-body">Sort order</span>
            <input
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="h-10 rounded-xl border border-earth/20 bg-surface px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
              placeholder="0"
            />
          </label>

          <label className="grid gap-1 md:col-span-2">
            <span className="text-xs font-medium text-body">Answer</span>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="min-h-24 rounded-xl border border-earth/20 bg-surface px-3 py-2 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
              placeholder="Answer"
            />
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-earth/20 bg-surface px-3">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4" />
            <span className="text-sm font-semibold text-heading">Visible</span>
          </label>

          <button
            onClick={async () => {
              const res = await fetch("/api/admin/faqs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question, answer, sortOrder, isActive }),
              }).catch(() => null);

              if (!res) {
                setError("Network error");
                return;
              }
              const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
              if (!res.ok || !json?.ok) {
                setError(json?.error ?? "Unable to create FAQ");
                return;
              }

              setQuestion("");
              setAnswer("");
              setSortOrder("0");
              setIsActive(true);
              await refresh();
            }}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-forest px-4 text-sm font-semibold text-white hover:bg-forest-hover"
          >
            Add
          </button>
        </div>
      </div>

      <div className="mt-5">{list}</div>
    </section>
  );
}

export function ProductsAdmin() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [categoryOptions, setCategoryOptions] = useState<ProductOption[]>([]);
  const [oilTypeOptions, setOilTypeOptions] = useState<ProductOption[]>([]);
  const [variantOptions, setVariantOptions] = useState<ProductOption[]>([]);
  const [extractionOptions, setExtractionOptions] = useState<ProductOption[]>([]);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [newOptionKind, setNewOptionKind] = useState<"category" | "oilType" | "variant" | "extraction">("category");
  const [newOptionName, setNewOptionName] = useState("");
  const [isCreatingOption, setIsCreatingOption] = useState(false);

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<
    | {
        id: string;
        name: string;
        description: string;
        category: string;
        oilType: string;
        variant: string;
        extraction: string;
        sizeLabel: string;
        price: string;
        imageUrl: string;
        sortOrder: string;
        isFeatured: boolean;
        isActive: boolean;
      }
    | null
  >(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [oilType, setOilType] = useState("");
  const [variant, setVariant] = useState("");
  const [extraction, setExtraction] = useState("");
  const [sizeLabel, setSizeLabel] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("/hero.png");
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState("0");

  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const editUploadInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploadingEditId, setUploadingEditId] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    const res = await fetch("/api/admin/products", { cache: "no-store" });
    const json = (await res.json()) as { ok: boolean; products?: Product[]; error?: string };

    if (!res.ok || !json.ok || !Array.isArray(json.products)) {
      setError(json.error ?? "Unable to load products");
      setProducts([]);
      return;
    }

    setProducts(json.products);
  }

  async function refreshOptions() {
    setOptionsError(null);
    try {
      const [catsRes, oilsRes, varsRes, extsRes] = await Promise.all([
        fetch("/api/admin/product-options?kind=category", { cache: "no-store" }),
        fetch("/api/admin/product-options?kind=oilType", { cache: "no-store" }),
        fetch("/api/admin/product-options?kind=variant", { cache: "no-store" }),
        fetch("/api/admin/product-options?kind=extraction", { cache: "no-store" }),
      ]);

      const parse = async (r: Response) =>
        (await r.json().catch(() => null)) as { ok?: boolean; options?: ProductOption[]; error?: string } | null;
      const [catsJson, oilsJson, varsJson, extsJson] = await Promise.all([
        parse(catsRes),
        parse(oilsRes),
        parse(varsRes),
        parse(extsRes),
      ]);

      if (!catsRes.ok || !catsJson?.ok || !Array.isArray(catsJson.options)) {
        throw new Error(catsJson?.error ?? "Unable to load categories");
      }
      if (!oilsRes.ok || !oilsJson?.ok || !Array.isArray(oilsJson.options)) {
        throw new Error(oilsJson?.error ?? "Unable to load oil types");
      }
      if (!varsRes.ok || !varsJson?.ok || !Array.isArray(varsJson.options)) {
        throw new Error(varsJson?.error ?? "Unable to load variants");
      }
      if (!extsRes.ok || !extsJson?.ok || !Array.isArray(extsJson.options)) {
        throw new Error(extsJson?.error ?? "Unable to load extraction methods");
      }

      setCategoryOptions(catsJson.options);
      setOilTypeOptions(oilsJson.options);
      setVariantOptions(varsJson.options);
      setExtractionOptions(extsJson.options);

      setExtraction((curr) => {
        if (curr) return curr;
        const firstActive = (extsJson.options ?? []).find((o) => o.isActive);
        return firstActive?.code ?? "";
      });
    } catch (e: any) {
      setOptionsError(typeof e?.message === "string" ? e.message : "Unable to load options");
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      refresh().catch(() => setError("Unable to load products"));
      refreshOptions().catch(() => setOptionsError("Unable to load options"));
    }, 0);

    return () => clearTimeout(t);
  }, []);

  const categoryCodes = useMemo(() => ["", ...categoryOptions.filter((o) => o.isActive).map((o) => o.code)], [categoryOptions]);
  const oilTypeCodes = useMemo(() => ["", ...oilTypeOptions.filter((o) => o.isActive).map((o) => o.code)], [oilTypeOptions]);
  const variantCodes = useMemo(() => ["", ...variantOptions.filter((o) => o.isActive).map((o) => o.code)], [variantOptions]);
  const extractionCodes = useMemo(() => ["", ...extractionOptions.filter((o) => o.isActive).map((o) => o.code)], [extractionOptions]);

  function labelFor(kind: "category" | "oilType" | "variant" | "extraction", code: string): string {
    const list =
      kind === "category"
        ? categoryOptions
        : kind === "oilType"
          ? oilTypeOptions
          : kind === "variant"
            ? variantOptions
            : extractionOptions;
    const hit = list.find((o) => o.code === code);
    return hit?.name ?? code;
  }

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!products) return products;
    if (!q) return products;
    return products.filter((p) => {
      const hay = [
        p.name,
        p.slug,
        p.description,
        p.category ?? "",
        p.oilType ?? "",
        p.variant ?? "",
        p.extraction ?? "",
        p.sizeLabel ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [products, search]);

  const list = useMemo(() => {
    if (error) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      );
    }

    if (!filteredProducts) {
      return (
        <div className="rounded-xl border border-earth/20 bg-bg p-4 text-sm text-muted">
          Loading…
        </div>
      );
    }

    if (filteredProducts.length === 0) {
      return (
        <div className="rounded-xl border border-earth/20 bg-bg p-4 text-sm text-muted">
          No products found.
        </div>
      );
    }

    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {filteredProducts.map((p) => (
          <div key={p.id} className="rounded-xl border border-earth/20 bg-surface p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-heading">{p.name}</p>
                <p className="mt-1 text-xs text-muted">/{p.slug}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  p.isActive
                    ? "bg-bg text-forest"
                    : "bg-bg text-muted"
                }`}
              >
                {p.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            {editingId === p.id && draft ? (
              <div className="mt-4 grid gap-3">
                <label className="grid gap-1">
                  <span className="text-xs font-medium text-body">Name</span>
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    className="h-10 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-medium text-body">Description</span>
                  <textarea
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    className="min-h-20 rounded-xl border border-earth/20 bg-bg px-3 py-2 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
                  />
                </label>
              </div>
            ) : (
              <details className="mt-3">
                <summary className="cursor-pointer select-none text-xs font-medium text-forest">
                  Description
                </summary>
                <p className="mt-2 text-sm leading-6 text-body">{p.description}</p>
              </details>
            )}

            <div className="mt-4 grid gap-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs font-medium text-body">Category</span>
                  <select
                    value={editingId === p.id && draft ? draft.category : p.category ?? ""}
                    onChange={async (e) => {
                      const v = e.target.value;
                      if (editingId === p.id && draft) {
                        setDraft({ ...draft, category: v });
                        return;
                      }
                      await fetch("/api/admin/products", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: p.id, category: v ? v : null }),
                      }).catch(() => null);
                      await refresh();
                    }}
                    className="h-10 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
                  >
                    {categoryCodes.map((c) => (
                      <option key={c} value={c}>
                        {c ? labelFor("category", c) : "—"}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-medium text-body">Variant</span>
                  <select
                    value={editingId === p.id && draft ? draft.variant : p.variant ?? ""}
                    onChange={async (e) => {
                      const v = e.target.value;
                      if (editingId === p.id && draft) {
                        setDraft({ ...draft, variant: v });
                        return;
                      }
                      await fetch("/api/admin/products", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: p.id, variant: v ? v : null }),
                      }).catch(() => null);
                      await refresh();
                    }}
                    className="h-10 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
                  >
                    {variantCodes.map((c) => (
                      <option key={c} value={c}>
                        {c ? labelFor("variant", c) : "—"}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-medium text-body">Oil type</span>
                  <select
                    value={editingId === p.id && draft ? draft.oilType : p.oilType ?? ""}
                    onChange={async (e) => {
                      const v = e.target.value;
                      if (editingId === p.id && draft) {
                        setDraft({ ...draft, oilType: v });
                        return;
                      }
                      await fetch("/api/admin/products", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: p.id, oilType: v ? v : null }),
                      }).catch(() => null);
                      await refresh();
                    }}
                    className="h-10 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
                  >
                    {oilTypeCodes.map((c) => (
                      <option key={c} value={c}>
                        {c ? labelFor("oilType", c) : "—"}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-medium text-body">Extraction</span>
                  <select
                    value={editingId === p.id && draft ? draft.extraction : p.extraction ?? ""}
                    onChange={async (e) => {
                      const v = e.target.value;
                      if (editingId === p.id && draft) {
                        setDraft({ ...draft, extraction: v });
                        return;
                      }
                      await fetch("/api/admin/products", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: p.id, extraction: v ? v : null }),
                      }).catch(() => null);
                      await refresh();
                    }}
                    className="h-10 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
                  >
                    {extractionCodes.map((c) => (
                      <option key={c} value={c}>
                        {c ? labelFor("extraction", c) : "—"}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs font-medium text-body">Size label</span>
                  <input
                    value={editingId === p.id && draft ? draft.sizeLabel : p.sizeLabel ?? ""}
                    onChange={(e) => {
                      if (editingId === p.id && draft) setDraft({ ...draft, sizeLabel: e.target.value });
                    }}
                    onBlur={async (e) => {
                      if (editingId === p.id) return;
                      await fetch("/api/admin/products", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: p.id, sizeLabel: e.target.value || null }),
                      }).catch(() => null);
                      await refresh();
                    }}
                    className="h-10 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
                    placeholder="e.g. 500ml"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-medium text-body">Price (PKR)</span>
                  <input
                    value={editingId === p.id && draft ? draft.price : String(p.price ?? "")}
                    onChange={(e) => {
                      if (editingId === p.id && draft) setDraft({ ...draft, price: e.target.value });
                    }}
                    onBlur={async (e) => {
                      if (editingId === p.id) return;
                      const raw = e.target.value.trim();
                      const val = raw ? Number.parseInt(raw, 10) : null;
                      await fetch("/api/admin/products", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: p.id, price: Number.isFinite(val as number) ? val : null }),
                      }).catch(() => null);
                      await refresh();
                    }}
                    className="h-10 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
                    inputMode="numeric"
                    placeholder="e.g. 1990"
                  />
                </label>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="grid gap-1">
                    <span className="text-xs font-medium text-body">Image URL</span>
                    <input
                      value={editingId === p.id && draft ? draft.imageUrl : p.imageUrl ?? ""}
                      onChange={(e) => {
                        if (editingId === p.id && draft) setDraft({ ...draft, imageUrl: e.target.value });
                      }}
                      onBlur={async (e) => {
                        if (editingId === p.id) return;
                        await fetch("/api/admin/products", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: p.id, imageUrl: e.target.value || null }),
                        }).catch(() => null);
                        await refresh();
                      }}
                      className="h-10 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
                      placeholder="/hero.png"
                    />
                  </label>

                  {editingId === p.id && draft ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        ref={(el) => {
                          editUploadInputRefs.current[p.id] = el;
                        }}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          setError(null);
                          setUploadingEditId(p.id);
                          try {
                            const form = new FormData();
                            form.append("file", file);

                            const res = await fetch("/api/admin/upload-image", {
                              method: "POST",
                              body: form,
                            }).catch(() => null);

                            if (!res) {
                              setError("Network error");
                              return;
                            }

                            const json = (await res.json().catch(() => null)) as { ok?: boolean; url?: string; error?: string } | null;
                            if (!res.ok || !json?.ok || !json.url) {
                              setError(json?.error ?? "Unable to upload image");
                              return;
                            }

                            const uploadedUrl = json.url;

                            setDraft((curr) => {
                              if (!curr || curr.id !== p.id) return curr;
                              return { ...curr, imageUrl: uploadedUrl };
                            });
                          } finally {
                            setUploadingEditId(null);
                            e.target.value = "";
                          }
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => editUploadInputRefs.current[p.id]?.click()}
                        disabled={uploadingEditId === p.id}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-earth/20 bg-bg px-3 text-xs font-semibold text-heading hover:bg-surface disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {uploadingEditId === p.id ? "Uploading…" : "Upload image"}
                      </button>
                    </div>
                  ) : null}
                </div>

                <label className="grid gap-1">
                  <span className="text-xs font-medium text-body">Sort order</span>
                  <input
                    value={editingId === p.id && draft ? draft.sortOrder : String(p.sortOrder)}
                    onChange={(e) => {
                      if (editingId === p.id && draft) setDraft({ ...draft, sortOrder: e.target.value });
                    }}
                    onBlur={async (e) => {
                      if (editingId === p.id) return;
                      const raw = e.target.value.trim();
                      const val = raw ? Number.parseInt(raw, 10) : 0;
                      await fetch("/api/admin/products", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: p.id, sortOrder: Number.isFinite(val) ? val : 0 }),
                      }).catch(() => null);
                      await refresh();
                    }}
                    className="h-10 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
                    inputMode="numeric"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={async () => {
                    if (editingId === p.id && draft) {
                      setDraft({ ...draft, isFeatured: !draft.isFeatured });
                      return;
                    }
                    await fetch("/api/admin/products", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: p.id, isFeatured: !p.isFeatured }),
                    }).catch(() => null);
                    await refresh();
                  }}
                  className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold ${
                    (editingId === p.id && draft ? draft.isFeatured : p.isFeatured)
                      ? "bg-forest text-white hover:bg-forest-hover"
                      : "border border-earth/20 bg-bg text-heading hover:bg-surface"
                  }`}
                >
                  {(editingId === p.id && draft ? draft.isFeatured : p.isFeatured) ? "Featured" : "Not featured"}
                </button>

                <button
                  onClick={async () => {
                    if (editingId === p.id && draft) {
                      setDraft({ ...draft, isActive: !draft.isActive });
                      return;
                    }
                    await fetch("/api/admin/products", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: p.id, isActive: !p.isActive }),
                    }).catch(() => null);
                    await refresh();
                  }}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-earth/20 bg-bg px-3 text-xs font-semibold text-heading hover:bg-surface"
                >
                  {(editingId === p.id && draft ? draft.isActive : p.isActive) ? "Set inactive" : "Set active"}
                </button>

                {editingId === p.id ? (
                  <>
                    <button
                      onClick={async () => {
                        if (!draft) return;
                        setError(null);

                        const priceRaw = draft.price.trim();
                        const priceVal = priceRaw ? Number.parseInt(priceRaw, 10) : null;
                        const sortRaw = draft.sortOrder.trim();
                        const sortVal = sortRaw ? Number.parseInt(sortRaw, 10) : 0;

                        const res = await fetch("/api/admin/products", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            id: draft.id,
                            name: draft.name,
                            description: draft.description,
                            category: draft.category ? draft.category : null,
                            oilType: draft.oilType ? draft.oilType : null,
                            variant: draft.variant ? draft.variant : null,
                            extraction: draft.extraction ? draft.extraction : null,
                            sizeLabel: draft.sizeLabel || null,
                            price: Number.isFinite(priceVal as number) ? priceVal : null,
                            imageUrl: draft.imageUrl || null,
                            sortOrder: Number.isFinite(sortVal) ? sortVal : 0,
                            isFeatured: draft.isFeatured,
                            isActive: draft.isActive,
                          }),
                        }).catch(() => null);

                        if (!res) {
                          setError("Network error");
                          return;
                        }

                        const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
                        if (!res.ok || !json?.ok) {
                          setError(json?.error ?? "Unable to update product");
                          return;
                        }

                        setEditingId(null);
                        setDraft(null);
                        await refresh();
                      }}
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-forest px-3 text-xs font-semibold text-white hover:bg-forest-hover"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setDraft(null);
                      }}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-earth/20 bg-bg px-3 text-xs font-semibold text-heading hover:bg-surface"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(p.id);
                        setDraft({
                          id: p.id,
                          name: p.name,
                          description: p.description,
                          category: p.category ?? "",
                          oilType: p.oilType ?? "",
                          variant: p.variant ?? "",
                          extraction: p.extraction ?? "",
                          sizeLabel: p.sizeLabel ?? "",
                          price: String(p.price ?? ""),
                          imageUrl: p.imageUrl ?? "",
                          sortOrder: String(p.sortOrder ?? 0),
                          isFeatured: Boolean(p.isFeatured),
                          isActive: Boolean(p.isActive),
                        });
                      }}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-earth/20 bg-bg px-3 text-xs font-semibold text-heading hover:bg-surface"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        const ok = window.confirm(`Delete “${p.name}”?`);
                        if (!ok) return;

                        setError(null);
                        const res = await fetch(`/api/admin/products?id=${encodeURIComponent(p.id)}`, {
                          method: "DELETE",
                        }).catch(() => null);

                        if (!res) {
                          setError("Network error");
                          return;
                        }

                        const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
                        if (!res.ok || !json?.ok) {
                          setError(json?.error ?? "Unable to delete product");
                          return;
                        }

                        await refresh();
                      }}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }, [draft, editingId, error, filteredProducts]);

  return (
    <section className="rounded-2xl border border-earth/20 bg-surface p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-heading">Products</h2>
          <p className="mt-1 text-sm text-muted">
            Add products for the landing page.
          </p>
        </div>
        <button
          onClick={() => refresh().catch(() => setError("Unable to load products"))}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-earth/20 bg-bg px-4 text-sm font-semibold text-heading hover:bg-surface"
        >
          Refresh
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-earth/20 bg-bg p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-heading">Product options</p>
            <p className="mt-1 text-xs text-muted">Add new categories/oil types/variants/extractions anytime.</p>
          </div>
          <button
            type="button"
            onClick={() => refreshOptions().catch(() => setOptionsError("Unable to load options"))}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-earth/20 bg-surface px-3 text-xs font-semibold text-heading hover:bg-bg"
          >
            Refresh options
          </button>
        </div>

        {optionsError ? <p className="mt-2 text-xs text-red-700">{optionsError}</p> : null}

        <form
          className="mt-3 grid gap-3 sm:grid-cols-[160px_1fr_auto]"
          onSubmit={async (e) => {
            e.preventDefault();
            const name = newOptionName.trim();
            if (!name) return;

            setOptionsError(null);
            setIsCreatingOption(true);
            try {
              const res = await fetch(`/api/admin/product-options?kind=${encodeURIComponent(newOptionKind)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
              }).catch(() => null);

              if (!res) throw new Error("Network error");
              const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
              if (!res.ok || !json?.ok) throw new Error(json?.error ?? "Unable to create option");

              setNewOptionName("");
              await refreshOptions();
            } catch (err: any) {
              setOptionsError(typeof err?.message === "string" ? err.message : "Unable to create option");
            } finally {
              setIsCreatingOption(false);
            }
          }}
        >
          <label className="grid gap-1">
            <span className="text-xs font-medium text-body">Type</span>
            <select
              value={newOptionKind}
              onChange={(e) => setNewOptionKind(e.target.value as any)}
              className="h-10 rounded-xl border border-earth/20 bg-surface px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
            >
              <option value="category">Category</option>
              <option value="oilType">Oil type</option>
              <option value="variant">Variant</option>
              <option value="extraction">Extraction</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-body">Name</span>
            <input
              value={newOptionName}
              onChange={(e) => setNewOptionName(e.target.value)}
              className="h-10 rounded-xl border border-earth/20 bg-surface px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
              placeholder="e.g. Olive Oil"
            />
          </label>

          <button
            type="submit"
            disabled={isCreatingOption || !newOptionName.trim()}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-forest px-4 text-sm font-semibold text-white hover:bg-forest-hover disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isCreatingOption ? "Adding…" : "Add"}
          </button>
        </form>
      </div>

      <form
        className="mt-5 grid gap-4 sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);

          const res = await fetch("/api/admin/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              description,
              category: category || null,
              oilType: oilType || null,
              variant: variant || null,
              extraction: extraction || null,
              sizeLabel: sizeLabel || null,
              price: price ? Number.parseInt(price, 10) : null,
              imageUrl: imageUrl || null,
              isFeatured,
              sortOrder: sortOrder ? Number.parseInt(sortOrder, 10) : 0,
              isActive: true,
            }),
          });

          const json = (await res.json()) as { ok: boolean; error?: string };
          if (!res.ok || !json.ok) {
            setError(json.error ?? "Unable to create product");
            return;
          }

          setName("");
          setDescription("");
          setCategory("");
          setOilType("");
          setVariant("");
          setExtraction("");
          setSizeLabel("");
          setPrice("");
          setImageUrl("/hero.png");
          setIsFeatured(false);
          setSortOrder("0");
          await refresh();
        }}
      >
        <label className="grid gap-1">
          <span className="text-sm font-medium text-body">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
            required
          />
        </label>

        <label className="grid gap-1 sm:col-span-2">
          <span className="text-sm font-medium text-body">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-24 rounded-xl border border-earth/20 bg-bg px-3 py-2 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-body">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
          >
            {categoryCodes.map((c) => (
              <option key={c} value={c}>
                {c ? labelFor("category", c) : "—"}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-body">Oil type</span>
          <select
            value={oilType}
            onChange={(e) => setOilType(e.target.value)}
            className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
          >
            {oilTypeCodes.map((c) => (
              <option key={c} value={c}>
                {c ? labelFor("oilType", c) : "—"}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-body">Variant</span>
          <select
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
            className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
          >
            {variantCodes.map((c) => (
              <option key={c} value={c}>
                {c ? labelFor("variant", c) : "—"}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-body">Extraction</span>
          <select
            value={extraction}
            onChange={(e) => setExtraction(e.target.value)}
            className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
          >
            {extractionCodes.map((c) => (
              <option key={c} value={c}>
                {c ? labelFor("extraction", c) : "—"}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-body">Size label</span>
          <input
            value={sizeLabel}
            onChange={(e) => setSizeLabel(e.target.value)}
            className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
            placeholder="e.g. 500ml"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-body">Price (PKR)</span>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
            inputMode="numeric"
            placeholder="e.g. 1990"
          />
        </label>

        <div className="grid gap-2 sm:col-span-2">
          <label className="grid gap-1">
            <span className="text-sm font-medium text-body">Image URL</span>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
              placeholder="/hero.png"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={uploadInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                setError(null);
                setIsUploadingImage(true);
                try {
                  const form = new FormData();
                  form.append("file", file);

                  const res = await fetch("/api/admin/upload-image", {
                    method: "POST",
                    body: form,
                  }).catch(() => null);

                  if (!res) {
                    setError("Network error");
                    return;
                  }

                  const json = (await res.json().catch(() => null)) as { ok?: boolean; url?: string; error?: string } | null;
                  if (!res.ok || !json?.ok || !json.url) {
                    setError(json?.error ?? "Unable to upload image");
                    return;
                  }

                  setImageUrl(json.url);
                } finally {
                  setIsUploadingImage(false);
                  // allow re-uploading the same file
                  e.target.value = "";
                }
              }}
            />

            <button
              type="button"
              onClick={() => uploadInputRef.current?.click()}
              disabled={isUploadingImage}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-earth/20 bg-bg px-4 text-sm font-semibold text-heading hover:bg-surface disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isUploadingImage ? "Uploading…" : "Upload image"}
            </button>

            <p className="text-xs text-muted">Uploads to <span className="font-mono">/public/uploads</span></p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-body">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4"
            />
            Featured
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-body">Sort order</span>
            <input
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="h-11 w-32 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
              inputMode="numeric"
            />
          </label>
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-hover"
          >
            Add product
          </button>
        </div>
      </form>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-sm font-medium text-body">Search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
            placeholder="Search by name, slug, category, size…"
          />
        </label>
        <div className="hidden sm:block" />
      </div>

      <div className="mt-6">{list}</div>
    </section>
  );
}

export function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"" | "PUBLIC" | "PARTNER">("");
  const [partnerPayoutFilter, setPartnerPayoutFilter] = useState<"" | "PENDING" | "PAID">("");

  async function refresh(query?: string, source?: "" | "PUBLIC" | "PARTNER") {
    setError(null);
    const params = new URLSearchParams();
    const qv = query && query.trim() ? query.trim() : "";
    if (qv) params.set("q", qv);
    const sv = source ?? "";
    if (sv) params.set("source", sv);
    const url = `/api/admin/orders${params.toString() ? `?${params.toString()}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    const json = (await res.json()) as { ok: boolean; orders?: Order[]; error?: string };
    if (!res.ok || !json.ok || !Array.isArray(json.orders)) {
      setError(json.error ?? "Unable to load orders");
      setOrders([]);
      return;
    }
    setOrders(json.orders);
  }

  useEffect(() => {
    const t = setTimeout(() => {
      refresh().catch(() => setError("Unable to load orders"));
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const filteredOrders = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];

    const payoutFiltered =
      sourceFilter === "PARTNER" && partnerPayoutFilter
        ? list.filter((o) => (o.partnerPayoutStatus ?? "PENDING") === partnerPayoutFilter)
        : list;

    const sorted = [...payoutFiltered].sort((a, b) => {
      const aNew = a.status === "NEW" ? 1 : 0;
      const bNew = b.status === "NEW" ? 1 : 0;
      if (aNew !== bNew) return bNew - aNew;

      const ad = Date.parse(a.createdAt);
      const bd = Date.parse(b.createdAt);
      if (Number.isFinite(ad) && Number.isFinite(bd)) return bd - ad;
      return String(b.createdAt).localeCompare(String(a.createdAt));
    });

    return sorted;
  }, [orders, sourceFilter, partnerPayoutFilter]);

  function TagButton(props: { active: boolean; label: string; onClick: () => void }) {
    return (
      <button
        type="button"
        onClick={props.onClick}
        className={
          props.active
            ? "rounded-full bg-forest px-4 py-2 text-xs font-semibold text-white"
            : "rounded-full border border-earth/20 bg-bg px-4 py-2 text-xs font-semibold text-muted hover:bg-surface hover:text-heading"
        }
      >
        {props.label}
      </button>
    );
  }

  return (
    <section className="rounded-2xl border border-earth/20 bg-surface p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-heading">Orders</h2>
          <p className="mt-1 text-sm text-muted">
            Update order status for tracking.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by order id / phone / name"
            className="h-10 w-64 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
          />
          <button
            onClick={() => refresh(q, sourceFilter).catch(() => setError("Unable to load orders"))}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-earth/20 bg-bg px-4 text-sm font-semibold text-heading hover:bg-surface"
          >
            Search
          </button>
          <button
            onClick={() => refresh(q, sourceFilter).catch(() => setError("Unable to load orders"))}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-earth/20 bg-bg px-4 text-sm font-semibold text-heading hover:bg-surface"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <TagButton
          active={sourceFilter === ""}
          label="All"
          onClick={() => {
            setSourceFilter("");
            setPartnerPayoutFilter("");
            refresh(q, "").catch(() => setError("Unable to load orders"));
          }}
        />
        <TagButton
          active={sourceFilter === "PUBLIC"}
          label="Public"
          onClick={() => {
            setSourceFilter("PUBLIC");
            setPartnerPayoutFilter("");
            refresh(q, "PUBLIC").catch(() => setError("Unable to load orders"));
          }}
        />
        <TagButton
          active={sourceFilter === "PARTNER"}
          label="Partner"
          onClick={() => {
            setSourceFilter("PARTNER");
            refresh(q, "PARTNER").catch(() => setError("Unable to load orders"));
          }}
        />

        {sourceFilter === "PARTNER" ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="ml-1 text-xs font-semibold text-muted">Payout</span>
            <TagButton
              active={partnerPayoutFilter === ""}
              label="All"
              onClick={() => setPartnerPayoutFilter("")}
            />
            <TagButton
              active={partnerPayoutFilter === "PENDING"}
              label="Pending"
              onClick={() => setPartnerPayoutFilter("PENDING")}
            />
            <TagButton
              active={partnerPayoutFilter === "PAID"}
              label="Paid"
              onClick={() => setPartnerPayoutFilter("PAID")}
            />
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!orders ? (
        <div className="mt-5 rounded-xl border border-earth/20 bg-bg p-4 text-sm text-muted">
          Loading…
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="mt-5 rounded-xl border border-earth/20 bg-bg p-4 text-sm text-muted">
          No orders yet.
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          {filteredOrders.map((o) => (
            <div key={o.id} className="rounded-xl border border-earth/20 bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-heading">
                    {o.product?.name ?? "(No product)"}
                  </p>
                  <p className="mt-1 text-xs text-muted break-all">Order: {o.id}</p>
                  {o.status === "NEW" ? (
                    <p className="mt-1 text-xs font-semibold text-forest">New order</p>
                  ) : null}
                  {o.source === "PARTNER" ? (
                    <p className="mt-1 text-xs text-muted">
                      Partner order{o.partner?.name ? ` • ${o.partner.name}` : ""}
                      {typeof o.partnerProfit === "number" ? ` • Profit: Rs ${o.partnerProfit}` : ""}
                      {o.partnerPayoutStatus ? ` • Payout: ${o.partnerPayoutStatus}` : ""}
                      {o.partnerPayoutPaidAt ? ` • Paid: ${new Date(o.partnerPayoutPaidAt).toLocaleString()}` : ""}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-muted">
                    {o.name} • {o.phone1}{o.phone2 ? ` / ${o.phone2}` : ""}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    defaultValue={o.status}
                    onChange={async (e) => {
                      const status = e.target.value;
                      const res = await fetch("/api/admin/orders", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orderId: o.id, status }),
                      });
                      const json = (await res.json()) as { ok: boolean; error?: string };
                      if (!res.ok || !json.ok) {
                        setError(json.error ?? "Unable to update status");
                        return;
                      }
                      await refresh(q, sourceFilter);
                    }}
                    className="h-9 rounded-lg border border-earth/20 bg-bg px-3 text-xs font-semibold text-heading outline-none focus:ring-2 focus:ring-leaf"
                  >
                    {orderStatuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  {o.source === "PARTNER" ? (
                    <select
                      defaultValue={o.partnerPayoutStatus ?? "PENDING"}
                      onChange={async (e) => {
                        const partnerPayoutStatus = e.target.value;
                        const res = await fetch("/api/admin/orders", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ orderId: o.id, partnerPayoutStatus }),
                        });
                        const json = (await res.json()) as { ok: boolean; error?: string };
                        if (!res.ok || !json.ok) {
                          setError(json.error ?? "Unable to update payout");
                          return;
                        }
                        await refresh(q, sourceFilter);
                      }}
                      className="h-9 rounded-lg border border-earth/20 bg-bg px-3 text-xs font-semibold text-heading outline-none focus:ring-2 focus:ring-leaf"
                    >
                      {payoutStatuses.map((s) => (
                        <option key={s} value={s}>
                          Payout: {s}
                        </option>
                      ))}
                    </select>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function CertificationsAdmin() {
  const [certifications, setCertifications] = useState<Certification[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [authority, setAuthority] = useState("");
  const [refNo, setRefNo] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  async function refresh() {
    setError(null);
    const res = await fetch("/api/admin/certifications", { cache: "no-store" });
    const json = (await res.json()) as { ok: boolean; certifications?: Certification[]; error?: string };
    if (!res.ok || !json.ok || !Array.isArray(json.certifications)) {
      setError(json.error ?? "Unable to load certifications");
      setCertifications([]);
      return;
    }
    setCertifications(json.certifications);
  }

  useEffect(() => {
    const t = setTimeout(() => {
      refresh().catch(() => setError("Unable to load certifications"));
    }, 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="rounded-2xl border border-earth/20 bg-surface p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-heading">Certifications</h2>
          <p className="mt-1 text-sm text-muted">Trust signals shown on the site.</p>
        </div>
        <button
          onClick={() => refresh().catch(() => setError("Unable to load certifications"))}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-earth/20 bg-bg px-4 text-sm font-semibold text-heading hover:bg-surface"
        >
          Refresh
        </button>
      </div>

      <form
        className="mt-5 grid gap-4 sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          const res = await fetch("/api/admin/certifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title,
              authority,
              refNo: refNo || null,
              imageUrl: imageUrl || null,
              isActive,
            }),
          });
          const json = (await res.json()) as { ok: boolean; error?: string };
          if (!res.ok || !json.ok) {
            setError(json.error ?? "Unable to create certification");
            return;
          }
          setTitle("");
          setAuthority("");
          setRefNo("");
          setImageUrl("");
          setIsActive(true);
          await refresh();
        }}
      >
        <label className="grid gap-1">
          <span className="text-sm font-medium text-body">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-body">Authority</span>
          <input
            value={authority}
            onChange={(e) => setAuthority(e.target.value)}
            className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-body">Ref no (optional)</span>
          <input
            value={refNo}
            onChange={(e) => setRefNo(e.target.value)}
            className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-body">Image URL (optional)</span>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
          />
        </label>

        <label className="inline-flex items-center gap-2 text-sm font-medium text-body sm:col-span-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4"
          />
          Active
        </label>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-hover"
          >
            Add certification
          </button>
        </div>
      </form>

      {error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!certifications ? (
        <div className="mt-5 rounded-xl border border-earth/20 bg-bg p-4 text-sm text-muted">
          Loading…
        </div>
      ) : certifications.length === 0 ? (
        <div className="mt-5 rounded-xl border border-earth/20 bg-bg p-4 text-sm text-muted">
          No certifications yet.
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          {certifications.map((c) => (
            <div key={c.id} className="rounded-xl border border-earth/20 bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-heading">{c.title}</p>
                  <p className="mt-1 text-xs text-muted">{c.authority}</p>
                  {c.refNo ? <p className="mt-1 text-xs text-muted">Ref: {c.refNo}</p> : null}
                </div>
                <button
                  onClick={async () => {
                    const res = await fetch("/api/admin/certifications", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: c.id, isActive: !c.isActive }),
                    });
                    const json = (await res.json()) as { ok: boolean; error?: string };
                    if (!res.ok || !json.ok) {
                      setError(json.error ?? "Unable to update certification");
                      return;
                    }
                    await refresh();
                  }}
                  className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold ${
                    c.isActive
                      ? "bg-forest text-white hover:bg-forest-hover"
                      : "border border-earth/20 bg-bg text-heading hover:bg-surface"
                  }`}
                >
                  {c.isActive ? "Active" : "Inactive"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function TestimonialsAdmin() {
  const [testimonials, setTestimonials] = useState<Testimonial[] | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [productId, setProductId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [city, setCity] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [rating, setRating] = useState("");
  const [isApproved, setIsApproved] = useState(true);

  async function refresh() {
    setError(null);
    const [resT, resP] = await Promise.all([
      fetch("/api/admin/testimonials", { cache: "no-store" }),
      fetch("/api/admin/products", { cache: "no-store" }),
    ]);

    const jsonT = (await resT.json()) as { ok: boolean; testimonials?: Testimonial[]; error?: string };
    const jsonP = (await resP.json()) as { ok: boolean; products?: Product[]; error?: string };

    if (!resT.ok || !jsonT.ok || !Array.isArray(jsonT.testimonials)) {
      setError(jsonT.error ?? "Unable to load testimonials");
      setTestimonials([]);
    } else {
      setTestimonials(jsonT.testimonials);
    }

    if (!resP.ok || !jsonP.ok || !Array.isArray(jsonP.products)) {
      setProducts([]);
    } else {
      setProducts(jsonP.products);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      refresh().catch(() => setError("Unable to load testimonials"));
    }, 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="rounded-2xl border border-earth/20 bg-surface p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-heading">Testimonials</h2>
          <p className="mt-1 text-sm text-muted">Approve and manage reviews.</p>
        </div>
        <button
          onClick={() => refresh().catch(() => setError("Unable to load testimonials"))}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-earth/20 bg-bg px-4 text-sm font-semibold text-heading hover:bg-surface"
        >
          Refresh
        </button>
      </div>

      <form
        className="mt-5 grid gap-4 sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);

          const res = await fetch("/api/admin/testimonials", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: productId || null,
              customerName,
              city: city || null,
              content,
              videoUrl: videoUrl || null,
              rating: rating ? Number.parseInt(rating, 10) : null,
              isApproved,
            }),
          });
          const json = (await res.json()) as { ok: boolean; error?: string };
          if (!res.ok || !json.ok) {
            setError(json.error ?? "Unable to create testimonial");
            return;
          }
          setProductId("");
          setCustomerName("");
          setCity("");
          setContent("");
          setVideoUrl("");
          setRating("");
          setIsApproved(true);
          await refresh();
        }}
      >
        <label className="grid gap-1">
          <span className="text-sm font-medium text-body">Customer name</span>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-body">City (optional)</span>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-body">Product (optional)</span>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
          >
            <option value="">—</option>
            {(products ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-body">Rating (1-5)</span>
          <input
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
            inputMode="numeric"
            placeholder="e.g. 5"
          />
        </label>

        <label className="grid gap-1 sm:col-span-2">
          <span className="text-sm font-medium text-body">Content</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-24 rounded-xl border border-earth/20 bg-bg px-3 py-2 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
            required
          />
        </label>

        <label className="grid gap-1 sm:col-span-2">
          <span className="text-sm font-medium text-body">Video URL (optional)</span>
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="h-11 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
          />
        </label>

        <label className="inline-flex items-center gap-2 text-sm font-medium text-body sm:col-span-2">
          <input
            type="checkbox"
            checked={isApproved}
            onChange={(e) => setIsApproved(e.target.checked)}
            className="h-4 w-4"
          />
          Approved
        </label>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-hover"
          >
            Add testimonial
          </button>
        </div>
      </form>

      {error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!testimonials ? (
        <div className="mt-5 rounded-xl border border-earth/20 bg-bg p-4 text-sm text-muted">
          Loading…
        </div>
      ) : testimonials.length === 0 ? (
        <div className="mt-5 rounded-xl border border-earth/20 bg-bg p-4 text-sm text-muted">
          No testimonials yet.
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          {testimonials.map((t) => (
            <div key={t.id} className="rounded-xl border border-earth/20 bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-heading">
                    {t.customerName}{t.city ? ` • ${t.city}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {t.product?.name ?? "(No product)"}
                    {typeof t.rating === "number" ? ` • ${t.rating}/5` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={async () => {
                      const res = await fetch("/api/admin/testimonials", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: t.id, isApproved: !t.isApproved }),
                      });
                      const json = (await res.json()) as { ok: boolean; error?: string };
                      if (!res.ok || !json.ok) {
                        setError(json.error ?? "Unable to update testimonial");
                        return;
                      }
                      await refresh();
                    }}
                    className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold ${
                      t.isApproved
                        ? "bg-forest text-white hover:bg-forest-hover"
                        : "border border-earth/20 bg-bg text-heading hover:bg-surface"
                    }`}
                  >
                    {t.isApproved ? "Approved" : "Not approved"}
                  </button>

                  <button
                    onClick={async () => {
                      if (!confirm("Delete this testimonial? This cannot be undone.")) return;
                      const res = await fetch("/api/admin/testimonials", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: t.id }),
                      });
                      const json = (await res.json()) as { ok: boolean; error?: string };
                      if (!res.ok || !json.ok) {
                        setError(json.error ?? "Unable to delete testimonial");
                        return;
                      }
                      await refresh();
                    }}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 bg-bg px-3 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <details className="mt-3">
                <summary className="cursor-pointer select-none text-xs font-medium text-forest">
                  Edit & content
                </summary>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-xs font-medium text-body">Customer name</span>
                    <input
                      defaultValue={t.customerName}
                      onBlur={async (e) => {
                        const v = e.target.value;
                        const res = await fetch("/api/admin/testimonials", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: t.id, customerName: v }),
                        });
                        const json = (await res.json()) as { ok: boolean; error?: string };
                        if (!res.ok || !json.ok) {
                          setError(json.error ?? "Unable to update testimonial");
                          return;
                        }
                        await refresh();
                      }}
                      className="h-10 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs font-medium text-body">City</span>
                    <input
                      defaultValue={t.city ?? ""}
                      onBlur={async (e) => {
                        const v = e.target.value;
                        const res = await fetch("/api/admin/testimonials", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: t.id, city: v || null }),
                        });
                        const json = (await res.json()) as { ok: boolean; error?: string };
                        if (!res.ok || !json.ok) {
                          setError(json.error ?? "Unable to update testimonial");
                          return;
                        }
                        await refresh();
                      }}
                      className="h-10 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs font-medium text-body">Product</span>
                    <select
                      defaultValue={t.product?.id ?? ""}
                      onChange={async (e) => {
                        const v = e.target.value;
                        const res = await fetch("/api/admin/testimonials", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: t.id, productId: v || null }),
                        });
                        const json = (await res.json()) as { ok: boolean; error?: string };
                        if (!res.ok || !json.ok) {
                          setError(json.error ?? "Unable to update testimonial");
                          return;
                        }
                        await refresh();
                      }}
                      className="h-10 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
                    >
                      <option value="">—</option>
                      {(products ?? []).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs font-medium text-body">Rating (1-5)</span>
                    <input
                      defaultValue={t.rating ?? ""}
                      onBlur={async (e) => {
                        const raw = e.target.value.trim();
                        const val = raw ? Number.parseInt(raw, 10) : null;
                        const res = await fetch("/api/admin/testimonials", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            id: t.id,
                            rating: Number.isFinite(val as number) ? val : null,
                          }),
                        });
                        const json = (await res.json()) as { ok: boolean; error?: string };
                        if (!res.ok || !json.ok) {
                          setError(json.error ?? "Unable to update testimonial");
                          return;
                        }
                        await refresh();
                      }}
                      className="h-10 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
                      inputMode="numeric"
                    />
                  </label>

                  <label className="grid gap-1 sm:col-span-2">
                    <span className="text-xs font-medium text-body">Video URL</span>
                    <input
                      defaultValue={t.videoUrl ?? ""}
                      onBlur={async (e) => {
                        const v = e.target.value;
                        const res = await fetch("/api/admin/testimonials", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: t.id, videoUrl: v || null }),
                        });
                        const json = (await res.json()) as { ok: boolean; error?: string };
                        if (!res.ok || !json.ok) {
                          setError(json.error ?? "Unable to update testimonial");
                          return;
                        }
                        await refresh();
                      }}
                      className="h-10 rounded-xl border border-earth/20 bg-bg px-3 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
                    />
                  </label>
                </div>

                <label className="mt-3 grid gap-1">
                  <span className="text-xs font-medium text-body">Content</span>
                  <textarea
                    defaultValue={t.content}
                    onBlur={async (e) => {
                      const v = e.target.value;
                      const res = await fetch("/api/admin/testimonials", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: t.id, content: v }),
                      });
                      const json = (await res.json()) as { ok: boolean; error?: string };
                      if (!res.ok || !json.ok) {
                        setError(json.error ?? "Unable to update testimonial");
                        return;
                      }
                      await refresh();
                    }}
                    className="min-h-24 rounded-xl border border-earth/20 bg-bg px-3 py-2 text-sm text-heading outline-none focus:ring-2 focus:ring-leaf"
                  />
                </label>
              </details>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PartnersAdmin() {
  const [partners, setPartners] = useState<Partner[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("");

  async function refresh() {
    setError(null);
    const res = await fetch("/api/admin/partners", { cache: "no-store" });
    const json = (await res.json()) as { ok: boolean; partners?: Partner[]; error?: string };

    if (!res.ok || !json.ok || !Array.isArray(json.partners)) {
      setError(json.error ?? "Unable to load partners");
      setPartners([]);
      return;
    }

    setPartners(json.partners);
  }

  useEffect(() => {
    const t = setTimeout(() => {
      refresh().catch(() => setError("Unable to load partners"));
    }, 0);

    return () => clearTimeout(t);
  }, []);

  return (
    <section className="rounded-2xl border border-earth/20 bg-surface p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-heading">Partners</h2>
          <p className="mt-1 text-sm text-muted">
            Approve partners and create API keys.
          </p>
        </div>
        <button
          onClick={() => refresh().catch(() => setError("Unable to load partners"))}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-earth/20 bg-bg px-4 text-sm font-semibold text-heading hover:bg-surface"
        >
          Refresh
        </button>
      </div>

      {apiKey ? (
        <div className="mt-5 rounded-xl border border-earth/20 bg-bg p-4 text-sm text-body">
          <p className="font-semibold">New API key (copy now):</p>
          <p className="mt-2 font-mono break-all">{apiKey}</p>
          <button
            onClick={() => setApiKey("")}
            className="mt-3 inline-flex h-9 items-center justify-center rounded-lg border border-earth/20 bg-bg px-3 text-xs font-semibold text-heading hover:bg-surface"
          >
            Hide
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!partners ? (
        <div className="mt-5 rounded-xl border border-earth/20 bg-bg p-4 text-sm text-muted">
          Loading…
        </div>
      ) : partners.length === 0 ? (
        <div className="mt-5 rounded-xl border border-earth/20 bg-bg p-4 text-sm text-muted">
          No partner applications yet.
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          {partners.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-earth/20 bg-surface p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-heading">{p.name}</p>
                  <p className="mt-1 text-xs text-muted">
                    {p.email ?? "—"} • {p.phone ?? "—"}
                  </p>

                  {p.payoutMethod || p.payoutAccountName || p.payoutAccountNumber || p.payoutBankName || p.payoutIban || p.payoutPhone || p.payoutNotes ? (
                    <div className="mt-2 text-xs text-muted">
                      <p className="font-semibold text-heading">Payout:</p>
                      <p className="mt-1">
                        {(p.payoutMethod ?? "").trim() ? `Method: ${p.payoutMethod}` : ""}
                        {(p.payoutAccountName ?? "").trim() ? `${(p.payoutMethod ?? "").trim() ? " • " : ""}Name: ${p.payoutAccountName}` : ""}
                      </p>
                      {(p.payoutAccountNumber ?? "").trim() ? (
                        <p className="mt-1">Account/Wallet: {p.payoutAccountNumber}</p>
                      ) : null}
                      {(p.payoutPhone ?? "").trim() ? (
                        <p className="mt-1">Payout phone: {p.payoutPhone}</p>
                      ) : null}
                      {(p.payoutBankName ?? "").trim() || (p.payoutIban ?? "").trim() ? (
                        <p className="mt-1">
                          {(p.payoutBankName ?? "").trim() ? `Bank: ${p.payoutBankName}` : ""}
                          {(p.payoutIban ?? "").trim() ? `${(p.payoutBankName ?? "").trim() ? " • " : ""}IBAN: ${p.payoutIban}` : ""}
                        </p>
                      ) : null}
                      {(p.payoutNotes ?? "").trim() ? (
                        <p className="mt-1">Notes: {p.payoutNotes}</p>
                      ) : null}
                    </div>
                  ) : null}

                  {Array.isArray(p.apiKeys) && p.apiKeys.length > 0 ? (
                    <div className="mt-2 text-xs text-muted">
                      <p className="font-semibold text-heading">API keys:</p>
                      <div className="mt-1 grid gap-1">
                        {p.apiKeys.map((k) => (
                          <div key={k.id} className="flex flex-wrap items-center gap-2">
                            <span className="font-mono">{k.prefix}…</span>
                            <span>{k.isActive ? "active" : "inactive"}</span>
                            <button
                              onClick={async () => {
                                setError(null);
                                const res = await fetch("/api/admin/partners", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    partnerId: p.id,
                                    action: "revealApiKey",
                                    apiKeyId: k.id,
                                  }),
                                });
                                const json = (await res.json()) as { ok: boolean; apiKey?: string; error?: string };
                                if (!res.ok || !json.ok || !json.apiKey) {
                                  setError(json.error ?? "Unable to reveal API key");
                                  return;
                                }
                                setApiKey(json.apiKey);
                              }}
                              className="inline-flex h-7 items-center justify-center rounded-lg border border-earth/20 bg-bg px-2 text-[11px] font-semibold text-heading hover:bg-surface"
                            >
                              Reveal
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      p.status === "ACTIVE"
                        ? "bg-bg text-forest"
                        : p.status === "SUSPENDED"
                          ? "bg-red-50 text-red-700"
                          : "bg-bg text-muted"
                    }`}
                  >
                    {p.status}
                  </span>

                  <button
                    onClick={async () => {
                      const res = await fetch("/api/admin/partners", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          partnerId: p.id,
                          action: "setStatus",
                          status: "ACTIVE",
                        }),
                      });
                      const json = (await res.json()) as { ok: boolean; error?: string };
                      if (!res.ok || !json.ok) {
                        setError(json.error ?? "Unable to update status");
                        return;
                      }
                      await refresh();
                    }}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-earth/20 bg-bg px-3 text-xs font-semibold text-heading hover:bg-surface"
                  >
                    Activate
                  </button>

                  <button
                    onClick={async () => {
                      const res = await fetch("/api/admin/partners", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          partnerId: p.id,
                          action: "setStatus",
                          status: "SUSPENDED",
                        }),
                      });
                      const json = (await res.json()) as { ok: boolean; error?: string };
                      if (!res.ok || !json.ok) {
                        setError(json.error ?? "Unable to update status");
                        return;
                      }
                      await refresh();
                    }}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-earth/20 bg-bg px-3 text-xs font-semibold text-heading hover:bg-surface"
                  >
                    Suspend
                  </button>

                  <button
                    onClick={async () => {
                      setError(null);
                      const res = await fetch("/api/admin/partners", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          partnerId: p.id,
                          action: "createApiKey",
                        }),
                      });
                      const json = (await res.json()) as { ok: boolean; apiKey?: string; error?: string };
                      if (!res.ok || !json.ok || !json.apiKey) {
                        setError(json.error ?? "Unable to create API key");
                        return;
                      }
                      setApiKey(json.apiKey);
                    }}
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-forest px-3 text-xs font-semibold text-white hover:bg-forest-hover"
                  >
                    Create API key
                  </button>

                  <button
                    onClick={async () => {
                      const password = window.prompt("Set partner password (min 6 chars)") ?? "";
                      if (!password) return;
                      setError(null);
                      const res = await fetch("/api/admin/partners", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          partnerId: p.id,
                          action: "setPassword",
                          password,
                        }),
                      });
                      const json = (await res.json()) as { ok: boolean; error?: string };
                      if (!res.ok || !json.ok) {
                        setError(json.error ?? "Unable to set password");
                        return;
                      }
                      setApiKey("");
                      setError(null);
                      await refresh();
                    }}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-earth/20 bg-bg px-3 text-xs font-semibold text-heading hover:bg-surface"
                  >
                    Set password
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
