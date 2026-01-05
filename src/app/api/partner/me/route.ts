import { NextResponse } from "next/server";
import { getPartnerFromSession } from "@/lib/partnerSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const partner = await getPartnerFromSession().catch(() => null);
  if (!partner) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ ok: true, partner });
}
