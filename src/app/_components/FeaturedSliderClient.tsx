"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/constants";
import { useCart } from "@/lib/cart";

type FeaturedItem = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  price: number | null;
  sizeLabel: string | null;
};

function waOrderLink(productName: string): string {
  const text = encodeURIComponent(
    `Assalam o Alaikum, I want to order: ${productName}. Please guide me about Purified vs Unpurified and available sizes.`,
  );
  return `https://wa.me/${BRAND.whatsappNumberE164NoPlus}?text=${text}`;
}

function formatPricePkr(price: number | null | undefined): string {
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

export function FeaturedSliderClient(props: { items: FeaturedItem[]; dbOk: boolean }) {
  const { items, dbOk } = props;
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const cart = useCart();
  const stepPx = useMemo(() => {
    // gap-4 = 16px
    return 16;
  }, []);

  function cardStep(): number {
    const el = scrollerRef.current;
    if (!el) return 320 + stepPx;
    const firstCard = el.querySelector<HTMLElement>("[data-slider-card]");
    if (!firstCard) return 320 + stepPx;
    const w = Math.round(firstCard.getBoundingClientRect().width);
    return w + stepPx;
  }

  function scrollNext() {
    const el = scrollerRef.current;
    if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
    if (atEnd) {
      el.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    el.scrollBy({ left: cardStep(), behavior: "smooth" });
  }

  function scrollPrev() {
    const el = scrollerRef.current;
    if (!el) return;
    const atStart = el.scrollLeft <= 8;
    if (atStart) {
      el.scrollTo({ left: Math.max(0, el.scrollWidth - el.clientWidth), behavior: "smooth" });
      return;
    }
    el.scrollBy({ left: -cardStep(), behavior: "smooth" });
  }

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const t = window.setInterval(() => {
      scrollNext();
    }, 3500);

    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  if (!items || items.length === 0) return null;

  return (
    <section className="pb-6">
      <div className="mx-auto max-w-5xl px-4">
        <div className="rounded-3xl border border-earth/20 bg-surface p-6 shadow-sm sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="inline-flex rounded-full bg-bg px-3 py-1 text-xs font-semibold text-forest">Featured</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-heading">Featured images</h2>
              <p className="mt-2 text-sm leading-6 text-muted">A quick look at our highlighted products.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={scrollPrev}
                aria-label="Previous"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-earth/20 bg-bg text-sm font-semibold text-heading hover:bg-surface"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={scrollNext}
                aria-label="Next"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-earth/20 bg-bg text-sm font-semibold text-heading hover:bg-surface"
              >
                ›
              </button>
              <Link
                href="/shop"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-earth/20 bg-bg px-4 text-sm font-semibold text-heading hover:bg-surface"
              >
                View all
              </Link>
            </div>
          </div>

          {!dbOk ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
              Database not ready — showing a starter featured image.
            </div>
          ) : null}

          <div
            ref={scrollerRef}
            className="mt-6 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory scroll-smooth"
          >
            {items.map((p) => (
              <div key={p.id} className="w-[260px] shrink-0 snap-start sm:w-[320px]" data-slider-card>
                <div className="overflow-hidden rounded-3xl border border-earth/20 bg-surface shadow-sm">
                  <div className="relative overflow-hidden border-b border-earth/20 bg-bg">
                    {(() => {
                      const key = cartKey(p.id, null);
                      const qty = cart.items.find((it) => it.key === key)?.qty ?? 0;

                      return (
                        <>
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
                                variant: null,
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
                        </>
                      );
                    })()}

                    <div className="absolute left-3 top-3">
                      <span className="rounded-full border border-earth/20 bg-surface px-3 py-1 text-xs font-semibold text-forest">Featured</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                      <p className="text-base font-semibold tracking-tight text-heading">{p.name}</p>
                      <span className="shrink-0 text-base font-semibold text-heading">{formatPricePkr(p.price)}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {p.sizeLabel ? (
                        <span className="rounded-full border border-earth/20 bg-bg px-3 py-1 text-xs font-semibold text-muted">
                          {p.sizeLabel}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 grid gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          cart.addItem({
                            productId: p.id,
                            name: p.name,
                            variant: null,
                            qty: 1,
                          });
                          document.getElementById("buy")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-hover"
                      >
                        Fast checkout
                      </button>
                      <a
                        href={waOrderLink(p.name)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-earth/20 bg-bg px-5 text-sm font-semibold text-heading hover:bg-surface"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
