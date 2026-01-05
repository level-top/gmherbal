import { NextResponse } from "next/server";
import { setAdminCookie } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { password?: unknown }
    | null;

  const password = typeof body?.password === "string" ? body.password : "";
  const expected = process.env.ADMIN_PASSWORD ?? "";

  if (!expected || password !== expected) {
    return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 });
  }

  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24h
  await setAdminCookie(expiresAt);

  return NextResponse.json({ ok: true });
}
