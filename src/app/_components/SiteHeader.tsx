"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND } from "@/lib/constants";
import { useCart } from "@/lib/cart";

function IconCart(props: { className?: string }) {
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
      <path d="M7 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
      <path d="M17 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
    </svg>
  );
}

function IconMenu(props: { className?: string }) {
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
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function IconClose(props: { className?: string }) {
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
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const cart = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const testimonialsHref = onHome ? "#testimonials" : "/#testimonials";
  const faqHref = onHome ? "#faq" : "/#faq";
  const cartHref = pathname === "/" || pathname === "/shop" ? "#buy" : "/shop#buy";

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-earth/25 bg-bg">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt={BRAND.name} width={36} height={36} className="h-9 w-9" priority />
            <span className="text-sm font-semibold tracking-tight text-heading">{BRAND.name}</span>
          </Link>

          <nav className="hidden items-center gap-2 text-sm font-medium sm:flex">
            <Link href="/shop" className="rounded-lg px-3 py-2 text-muted hover:bg-surface hover:text-forest">
            Shop
            </Link>
            <Link href={testimonialsHref} className="rounded-lg px-3 py-2 text-muted hover:bg-surface hover:text-forest">
            Testimonials
            </Link>
            <Link href={faqHref} className="rounded-lg px-3 py-2 text-muted hover:bg-surface hover:text-forest">
            FAQ
            </Link>

            <Link
              href={cartHref}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-earth/20 bg-bg text-heading hover:bg-surface"
              aria-label="Cart"
              title="Cart"
            >
              <IconCart className="h-5 w-5" />
              {cart.count > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-forest px-1.5 py-0.5 text-[11px] font-semibold text-white">
                  {cart.count}
                </span>
              ) : null}
            </Link>

            <Link href="/partner" className="rounded-lg px-3 py-2 text-muted hover:bg-surface hover:text-forest">
            Become a partner
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:hidden">
            <Link
              href={cartHref}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-earth/20 bg-bg text-heading hover:bg-surface"
              aria-label="Cart"
              title="Cart"
            >
              <IconCart className="h-5 w-5" />
              {cart.count > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-forest px-1.5 py-0.5 text-[11px] font-semibold text-white">
                  {cart.count}
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-earth/20 bg-bg text-heading hover:bg-surface"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="site-mobile-menu"
              title={menuOpen ? "Close menu" : "Menu"}
            >
              {menuOpen ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div id="site-mobile-menu" className="mt-3 rounded-2xl border border-earth/20 bg-surface p-2 sm:hidden">
            <div className="grid gap-1 text-sm font-medium">
              <Link
                href="/shop"
                className="rounded-xl px-3 py-2 text-muted hover:bg-bg hover:text-forest"
              >
                Shop
              </Link>
              <Link
                href={testimonialsHref}
                className="rounded-xl px-3 py-2 text-muted hover:bg-bg hover:text-forest"
              >
                Testimonials
              </Link>
              <Link
                href={faqHref}
                className="rounded-xl px-3 py-2 text-muted hover:bg-bg hover:text-forest"
              >
                FAQ
              </Link>
              <Link
                href="/partner"
                className="rounded-xl px-3 py-2 text-muted hover:bg-bg hover:text-forest"
              >
                Become a partner
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
