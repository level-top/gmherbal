import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminAuth";
import { decryptApiKey, encryptApiKey, randomApiKey } from "@/lib/crypto";
import { hashPassword } from "@/lib/password";
import { PartnerStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parsePartnerStatus(input: unknown): PartnerStatus | null {
  if (typeof input !== "string") return null;
  if (input === "PENDING") return PartnerStatus.PENDING;
  if (input === "ACTIVE") return PartnerStatus.ACTIVE;
  if (input === "SUSPENDED") return PartnerStatus.SUSPENDED;
  return null;
}

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const partners = await prisma.partner.findMany({
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        payoutMethod: true,
        payoutAccountName: true,
        payoutAccountNumber: true,
        payoutBankName: true,
        payoutIban: true,
        payoutPhone: true,
        payoutNotes: true,
        status: true,
        createdAt: true,
        apiKeys: {
          orderBy: [{ createdAt: "desc" }],
          select: {
            id: true,
            prefix: true,
            isActive: true,
            createdAt: true,
            lastUsedAt: true,
          },
        },
      },
    } as any);

    return NextResponse.json({ ok: true, partners });
  } catch {
    return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        partnerId?: unknown;
        action?: unknown;
        status?: unknown;
        apiKeyId?: unknown;
        password?: unknown;
      }
    | null;

  const partnerId = typeof body?.partnerId === "string" ? body.partnerId : "";
  const action = typeof body?.action === "string" ? body.action : "";

  if (!partnerId) {
    return NextResponse.json({ ok: false, error: "partnerId required" }, { status: 400 });
  }

  try {
    if (action === "setStatus") {
      const status = parsePartnerStatus(body?.status);
      if (!status) {
        return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
      }

      const partner = await prisma.partner.update({
        where: { id: partnerId },
        data: { status },
        select: { id: true, status: true },
      });

      return NextResponse.json({ ok: true, partner });
    }

    if (action === "createApiKey") {
      const { plain, prefix, hash } = randomApiKey();

      let encryptedKey: string;
      try {
        encryptedKey = encryptApiKey(plain);
      } catch {
        return NextResponse.json(
          {
            ok: false,
            error:
              "API key storage is not configured. Set API_KEY_ENCRYPTION_SECRET in .env",
          },
          { status: 500 },
        );
      }

      await prisma.apiKey.create(
        {
          data: {
            partnerId,
            prefix,
            keyHash: hash,
            encryptedKey,
          },
        } as any,
      );

      return NextResponse.json({ ok: true, apiKey: plain });
    }

    if (action === "revealApiKey") {
      const apiKeyId = typeof body?.apiKeyId === "string" ? body.apiKeyId : "";
      if (!apiKeyId) {
        return NextResponse.json({ ok: false, error: "apiKeyId required" }, { status: 400 });
      }

      const key = (await prisma.apiKey.findFirst(
        {
          where: { id: apiKeyId, partnerId },
          select: { id: true, encryptedKey: true },
        } as any,
      )) as any;

      if (!key?.encryptedKey) {
        return NextResponse.json(
          { ok: false, error: "API key cannot be revealed (not stored)" },
          { status: 404 },
        );
      }

      try {
        const plain = decryptApiKey(key.encryptedKey);
        return NextResponse.json({ ok: true, apiKey: plain });
      } catch {
        return NextResponse.json(
          { ok: false, error: "Unable to decrypt API key. Check API_KEY_ENCRYPTION_SECRET" },
          { status: 500 },
        );
      }
    }

    if (action === "setPassword") {
      const password = typeof body?.password === "string" ? body.password : "";
      if (!password || password.length < 6) {
        return NextResponse.json(
          { ok: false, error: "Password must be at least 6 characters" },
          { status: 400 },
        );
      }

      const passwordHash = hashPassword(password);
      await prisma.partner.update(
        {
          where: { id: partnerId },
          data: { passwordHash },
          select: { id: true },
        } as any,
      );

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
  }
}
