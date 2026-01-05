import { NextResponse } from "next/server";
import { clearPartnerCookie } from "@/lib/partnerSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  await clearPartnerCookie();
  return NextResponse.json({ ok: true });
}
