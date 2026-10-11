import { NextResponse } from "next/server";
import path from "node:path";
import { promises as fs } from "node:fs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const storageRoot = path.resolve(process.env.HACKMITTEN_STORAGE_ROOT || path.join(process.cwd(), "storage"));
    const uploadRoot = path.resolve(process.env.HM3_PUBLIC_UPLOAD_DIR || path.join(storageRoot, "public"));
    const customQrPath = path.join(uploadRoot, "payment-qr.png");

    try {
      const bytes = await fs.readFile(customQrPath);
      return new Response(new Uint8Array(bytes), {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch {
      // Custom uploaded QR does not exist; try default location
    }

    // Try reading default static image from frontend public dir
    const defaultCandidates = [
      path.resolve(process.cwd(), "..", "frontend", "public", "images", "QRcode", "payment-qr.png"),
      path.resolve(process.cwd(), "public", "images", "QRcode", "payment-qr.png"),
    ];

    for (const candidate of defaultCandidates) {
      try {
        const bytes = await fs.readFile(candidate);
        return new Response(new Uint8Array(bytes), {
          headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=300",
            "X-Content-Type-Options": "nosniff",
          },
        });
      } catch {
        continue;
      }
    }

    // Fallback: Redirect to static path
    return NextResponse.redirect(new URL("/images/QRcode/payment-qr.png", "http://localhost:3000"), 307);
  } catch {
    return NextResponse.json({ error: "Payment QR not found" }, { status: 404 });
  }
}
