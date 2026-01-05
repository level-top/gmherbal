export type CreateOrderInput = {
  name: string;
  fatherName: string;
  address: string;
  phone1: string;
  phone2?: string;
  items?: Array<{
    productId: string;
    name: string;
    variant?: string;
    qty: number;
  }>;
};

export type PartnerCreateOrderInput = {
  name: string;
  fatherName: string;
  address: string;
  phone1: string;
  phone2?: string;
  items: Array<{
    productId: string;
    qty: number;
    partnerUnitPrice: number;
  }>;
};

function isNonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateCreateOrderInput(payload: unknown): {
  ok: boolean;
  data?: CreateOrderInput;
  error?: string;
} {
  if (payload == null || typeof payload !== "object") {
    return { ok: false, error: "Invalid payload" };
  }

  const body = payload as Record<string, unknown>;

  if (!isNonEmpty(body.name)) return { ok: false, error: "Name is required" };
  if (!isNonEmpty(body.fatherName)) {
    return { ok: false, error: "Father name is required" };
  }
  if (!isNonEmpty(body.address)) {
    return { ok: false, error: "Address is required" };
  }
  if (!isNonEmpty(body.phone1)) {
    return { ok: false, error: "Contact number is required" };
  }

  const phone2 = typeof body.phone2 === "string" ? body.phone2.trim() : undefined;

  let items: CreateOrderInput["items"] | undefined;
  if (Array.isArray(body.items)) {
    const parsed = body.items
      .map((it) => {
        if (!it || typeof it !== "object") return null;
        const r = it as Record<string, unknown>;
        const productId = typeof r.productId === "string" ? r.productId.trim() : "";
        const name = typeof r.name === "string" ? r.name.trim() : "";
        const variant = typeof r.variant === "string" ? r.variant.trim() : undefined;
        const qtyRaw = typeof r.qty === "number" ? r.qty : Number(r.qty);
        const qty = Number.isFinite(qtyRaw) ? Math.floor(qtyRaw) : 0;
        if (!productId || !name || qty <= 0) return null;
        return { productId, name, variant: variant && variant.length > 0 ? variant : undefined, qty };
      })
      .filter(Boolean) as NonNullable<CreateOrderInput["items"]>[number][];

    items = parsed.length > 0 ? parsed : undefined;
  }

  return {
    ok: true,
    data: {
      name: body.name.trim(),
      fatherName: (body.fatherName as string).trim(),
      address: (body.address as string).trim(),
      phone1: (body.phone1 as string).trim(),
      phone2: phone2 && phone2.length > 0 ? phone2 : undefined,
      items,
    },
  };
}

export function validatePartnerCreateOrderInput(payload: unknown): {
  ok: boolean;
  data?: PartnerCreateOrderInput;
  error?: string;
} {
  if (payload == null || typeof payload !== "object") {
    return { ok: false, error: "Invalid payload" };
  }

  const body = payload as Record<string, unknown>;

  if (!isNonEmpty(body.name)) return { ok: false, error: "Name is required" };
  if (!isNonEmpty(body.address)) {
    return { ok: false, error: "Address is required" };
  }
  if (!isNonEmpty(body.phone1)) {
    return { ok: false, error: "Contact number is required" };
  }

  const fatherName = isNonEmpty(body.fatherName) ? body.fatherName.trim() : "-";
  const phone2 = typeof body.phone2 === "string" ? body.phone2.trim() : undefined;

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return { ok: false, error: "Items are required" };
  }

  const items = body.items
    .map((it) => {
      if (!it || typeof it !== "object") return null;
      const r = it as Record<string, unknown>;
      const productId = typeof r.productId === "string" ? r.productId.trim() : "";
      const qtyRaw = typeof r.qty === "number" ? r.qty : Number(r.qty);
      const qty = Number.isFinite(qtyRaw) ? Math.floor(qtyRaw) : 0;
      const pRaw = typeof r.partnerUnitPrice === "number" ? r.partnerUnitPrice : Number(r.partnerUnitPrice);
      const partnerUnitPrice = Number.isFinite(pRaw) ? Math.floor(pRaw) : 0;
      if (!productId || qty <= 0 || partnerUnitPrice <= 0) return null;
      return { productId, qty, partnerUnitPrice };
    })
    .filter(Boolean) as PartnerCreateOrderInput["items"];

  if (items.length === 0) return { ok: false, error: "Items are required" };

  return {
    ok: true,
    data: {
      name: body.name.trim(),
      fatherName,
      address: (body.address as string).trim(),
      phone1: (body.phone1 as string).trim(),
      phone2: phone2 && phone2.length > 0 ? phone2 : undefined,
      items,
    },
  };
}
