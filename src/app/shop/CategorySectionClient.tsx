"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { BRAND } from "@/lib/constants";

type PublicProduct = {
  id: string;
  name: string;
  description: string;
  category: string | null;
  variant: string | null;
  extraction: string | null;
  imageUrl: string | null;
  sizeLabel?: string | null;
  price?: number | null;
};

function waLink(productName: string): string {
  const phone = BRAND.whatsappNumberE164NoPlus;
  const text = encodeURIComponent(
    `Assalam o Alaikum, I want to order: ${productName}. Please guide me about Purified vs Unpurified and available sizes.`,
  );
  return `https://wa.me/${phone}?text=${text}`;
}

function variantLabel(v: PublicProduct["variant"]): string | null {
  if (v === "PURIFIED") return "Purified";
  if (v === "UNPURIFIED") return "Unpurified";
  return null;
}

function shortDescription(text: string): string {
  const s = (text ?? "").trim();
  if (!s) return "";
  if (s.length <= 120) return s;
  return `${s.slice(0, 117)}…`;
}

function formatPrice(price: number | null | undefined): string {
  if (typeof price !== "number" || !Number.isFinite(price)) return "Price on WhatsApp";
  const rupees = price;
  try {
    return `Rs. ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(rupees)}`;
  } catch {
    return `Rs. ${Math.round(rupees)}`;
  }
}

function IconCartPlus(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden="true"
    >
      <path d="M6 6h15l-2 9H7L6 6Z" />
      <path d="M6 6 5 3H2" />
      <path d="M9 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
      <path d="M18 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
      <path d="M12 9v6" />
      <path d="M9 12h6" />
    </svg>
  );
}

function cartKey(productId: string, variant?: string | null): string {
  const v = variant ? variant.trim() : "";
  return v ? `${productId}::${v}` : productId;
}

export function CategorySectionClient({
  title,
  products,
}: {
  title: string;
  products: PublicProduct[];
}) {
  const cart = useCart();

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold tracking-tight text-heading">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {products.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-3xl border border-earth/20 bg-surface shadow-sm">
            <div className="p-5">
              {(() => {
                const v = variantLabel(p.variant);
                const key = cartKey(p.id, v);
                const qty = cart.items.find((it) => it.key === key)?.qty ?? 0;

                return (
              <div className="relative overflow-hidden rounded-2xl border border-earth/20 bg-bg">
                <Image
                  src={p.imageUrl ?? "/hero.png"}
                  alt={p.name}
                  width={960}
                  height={720}
                  className="aspect-square w-full object-contain"
                />

                <button
                  type="button"
                  onClick={() =>
                    cart.addItem({
                      productId: p.id,
                      name: p.name,
                      variant: v,
                      qty: 1,
                    })
                  }
                  className="absolute bottom-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-earth/20 bg-bg text-heading hover:bg-surface"
                  aria-label={`Add ${p.name} to cart`}
                  title="Add to cart"
                >
                  <IconCartPlus className="h-5 w-5" />
                  {qty > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-forest px-1.5 py-0.5 text-[11px] font-semibold text-white">
                      {qty}
                    </span>
                  ) : null}
                </button>

                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                  {p.extraction === "KOHLU_COLD_PRESS" ? (
                    <span className="rounded-full border border-earth/20 bg-surface px-3 py-1 text-xs font-semibold text-heading">
                      Kohlu
                    </span>
                  ) : null}
                  {variantLabel(p.variant) ? (
                    <span className="rounded-full border border-earth/20 bg-surface px-3 py-1 text-xs font-semibold text-forest">
                      {variantLabel(p.variant)}
                    </span>
                  ) : null}
                </div>
              </div>
                );
              })()}

              <div className="mt-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                  <h3 className="text-base font-semibold tracking-tight text-heading">{p.name}</h3>
                  <span className="shrink-0 text-base font-semibold text-heading">{formatPrice(p.price)}</span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {p.sizeLabel ? (
                    <span className="rounded-full border border-earth/20 bg-bg px-3 py-1 text-xs font-semibold text-muted">
                      {p.sizeLabel}
                    </span>
                  ) : null}
                  <span className="rounded-full border border-earth/20 bg-bg px-3 py-1 text-xs font-semibold text-forest">Fresh</span>
                </div>

                <p className="mt-3 text-sm leading-6 text-body">{shortDescription(p.description)}</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      cart.addItem({
                        productId: p.id,
                        name: p.name,
                        variant: variantLabel(p.variant),
                        qty: 1,
                      });
                      document.getElementById("buy")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-hover"
                  >
                    Fast checkout
                  </button>
                  <a
                    href={waLink(p.name)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-earth/20 bg-bg px-5 text-sm font-semibold text-heading hover:bg-surface"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
