import { prisma } from "@/lib/prisma";
import { sha256Hex } from "@/lib/crypto";

export async function getPartnerFromApiKey(plainKey: string) {
  const hash = sha256Hex(plainKey);

  const key = await prisma.apiKey.findFirst({
    where: { keyHash: hash, isActive: true },
    select: {
      id: true,
      partnerId: true,
      partner: {
        select: { id: true, name: true, status: true },
      },
    },
  });

  if (!key) return null;
  if (key.partner.status !== "ACTIVE") return null;

  await prisma.apiKey.update({
    where: { id: key.id },
    data: { lastUsedAt: new Date() },
  });

  return key.partner;
}
