import { NextResponse } from "next/server";
import { requirePermission, jsonError } from "@/lib/api-auth";
import { validateImageFile, UploadError } from "@/lib/upload";
import path from "node:path";
import { promises as fs } from "node:fs";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/config/payment-qr
 * Replaces the existing payment QR image with a newly uploaded image.
 * Requires `config:edit` permission.
 */
export async function POST(req: Request) {
  try {
    await requirePermission("config:edit");

    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Payment QR image file is required" }, { status: 400 });
    }

    try {
      await validateImageFile(file, { maxSize: 10 * 1024 * 1024 });
    } catch (err) {
      const message = err instanceof UploadError ? err.message : "Invalid image file format";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const storageRoot = path.resolve(process.env.HACKMITTEN_STORAGE_ROOT || path.join(process.cwd(), "storage"));
    const uploadRoot = path.resolve(process.env.HM3_PUBLIC_UPLOAD_DIR || path.join(storageRoot, "public"));
    await fs.mkdir(uploadRoot, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const destinationPath = path.join(uploadRoot, "payment-qr.png");
    await fs.writeFile(destinationPath, buffer);

    // Also synchronize to frontend public directory if present in local workspace
    const frontendPublicPath = path.resolve(process.cwd(), "..", "frontend", "public", "images", "QRcode");
    try {
      await fs.mkdir(frontendPublicPath, { recursive: true });
      await fs.writeFile(path.join(frontendPublicPath, "payment-qr.png"), buffer);
    } catch {
      // In standalone production, frontend directory may not be directly reachable
    }

    return NextResponse.json({
      success: true,
      message: "Payment QR code updated successfully",
      url: `/api/payment-qr?t=${Date.now()}`,
    });
  } catch (err) {
    return jsonError(err);
  }
}
