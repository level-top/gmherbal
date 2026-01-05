"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type CartItem = {
  key: string;
  productId: string;
  name: string;
  variant?: string | null;
  qty: number;
};

type CartState = {
  items: CartItem[];
};

const STORAGE_KEY = "gm_cart_v1";
const EVENT_NAME = "gm-cart";

function safeParse(json: string | null): CartState {
  if (!json) return { items: [] };
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!parsed || typeof parsed !== "object") return { items: [] };
    const items = (parsed as any).items;
    if (!Array.isArray(items)) return { items: [] };

    const cleaned: CartItem[] = items
      .map((it: any) => {
        const productId = typeof it?.productId === "string" ? it.productId : "";
        const name = typeof it?.name === "string" ? it.name : "";
        const variant = typeof it?.variant === "string" ? it.variant : null;
        const qty = typeof it?.qty === "number" && Number.isFinite(it.qty) ? it.qty : 0;
        if (!productId || !name || qty <= 0) return null;
        const key = typeof it?.key === "string" && it.key ? it.key : buildKey(productId, variant);
        return { key, productId, name, variant, qty } satisfies CartItem;
      })
      .filter(Boolean) as CartItem[];

    return { items: cleaned };
  } catch {
    return { items: [] };
  }
}

function buildKey(productId: string, variant?: string | null): string {
  const v = variant ? variant.trim() : "";
  return v ? `${productId}::${v}` : productId;
}

function readCart(): CartState {
  if (typeof window === "undefined") return { items: [] };
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

function writeCart(next: CartState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function useCart() {
  const [state, setState] = useState<CartState>({ items: [] });

  useEffect(() => {
    setState(readCart());

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setState(readCart());
    };

    const onInternal = () => setState(readCart());

    window.addEventListener("storage", onStorage);
    window.addEventListener(EVENT_NAME, onInternal);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(EVENT_NAME, onInternal);
    };
  }, []);

  const count = useMemo(() => state.items.reduce((sum, it) => sum + it.qty, 0), [state.items]);

  const addItem = useCallback(
    (item: Omit<CartItem, "key" | "qty"> & { qty?: number }) => {
      const qtyToAdd = Math.max(1, Math.floor(item.qty ?? 1));
      const key = buildKey(item.productId, item.variant);

      const current = readCart();
      const existing = current.items.find((x) => x.key === key);
      const nextItems = existing
        ? current.items.map((x) => (x.key === key ? { ...x, qty: x.qty + qtyToAdd } : x))
        : [...current.items, { key, productId: item.productId, name: item.name, variant: item.variant ?? null, qty: qtyToAdd }];

      writeCart({ items: nextItems });
    },
    [],
  );

  const removeItem = useCallback((key: string) => {
    const current = readCart();
    writeCart({ items: current.items.filter((x) => x.key !== key) });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    const nextQty = Math.max(1, Math.floor(qty));
    const current = readCart();
    writeCart({ items: current.items.map((x) => (x.key === key ? { ...x, qty: nextQty } : x)) });
  }, []);

  const clear = useCallback(() => {
    writeCart({ items: [] });
  }, []);

  return { items: state.items, count, addItem, removeItem, setQty, clear };
}
