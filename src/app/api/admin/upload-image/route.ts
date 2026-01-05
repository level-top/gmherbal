import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

function isAllowedImageType(type: string, name: string): boolean {
  const fromName = path.extname(name || "").toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".webp"].includes(fromName)) return true;
  if (type === "image/png") return true;
  if (type === "image/jpeg") return true;
  if (type === "image/webp") return true;
  return false;
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "file is required" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ ok: false, error: "Only image uploads are allowed" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ ok: false, error: "Image too large (max 5MB)" }, { status: 400 });
    }

    if (!isAllowedImageType(file.type, file.name)) {
      return NextResponse.json({ ok: false, error: "Unsupported image type" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const id = crypto.randomBytes(8).toString("hex");
    const filename = `product-${Date.now()}-${id}.webp`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const abs = path.join(uploadsDir, filename);

    // Convert to WebP to save bandwidth/storage. We do NOT store the original.
    const webp = await sharp(bytes)
      .rotate()
      .webp({ quality: 80 })
      .toBuffer();

    await writeFile(abs, webp);

    const url = `/uploads/${filename}`;
    return NextResponse.json({ ok: true, url });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to upload image" }, { status: 500 });
  }
}
