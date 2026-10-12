import { NextResponse } from "next/server";
import path from "node:path";
import { promises as fs } from "node:fs";
import { db } from "@/lib/db";
import { readPublicUpload } from "@/lib/upload";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const degree = searchParams.get("degree");

    if (degree && ["Diploma", "UG", "PG"].includes(degree)) {
      const qrRecord = await db.paymentQrCode.findFirst({
        where: {
          degrees: { has: degree },
          isActive: true,
        },
        orderBy: { updatedAt: "desc" },
      });

      if (qrRecord && qrRecord.filePath) {
        const match = qrRecord.filePath.match(/^\/api\/uploads\/([a-z0-9_-]{1,40}_[a-f0-9]{12}\.(?:jpg|png|webp|gif))$/);
        if (match) {
          const bytes = await readPublicUpload(match[1]);
          if (bytes) {
            return new Response(new Uint8Array(bytes), {
              headers: {
                "Content-Type": qrRecord.mimeType || "image/png",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "X-Content-Type-Options": "nosniff",
              },
            });
          }
        }
      }

      // If degree was specifically requested but not found in DB
      // The existing payment QR code is specifically for UG and PG students
      if (degree === "UG" || degree === "PG") {
        // Fall through to serve existing payment QR image below
      } else {
        return NextResponse.json(
          { error: `Payment QR not configured for ${degree}` },
          { status: 404 },
        );
      }
    }

    // Default / legacy fallback when no specific degree is requested
    const latestQr = await db.paymentQrCode.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    });
    if (latestQr && latestQr.filePath) {
      const match = latestQr.filePath.match(/^\/api\/uploads\/([a-z0-9_-]{1,40}_[a-f0-9]{12}\.(?:jpg|png|webp|gif))$/);
      if (match) {
        const bytes = await readPublicUpload(match[1]);
        if (bytes) {
          return new Response(new Uint8Array(bytes), {
            headers: {
              "Content-Type": latestQr.mimeType || "image/png",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              "X-Content-Type-Options": "nosniff",
            },
          });
        }
      }
    }

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

    const defaultCandidates = [
      path.resolve(process.cwd(), "..", "frontend", "public", "images", "QRcode", "payment-qr.png"),
      path.resolve(process.cwd(), "public", "images", "QRcode", "payment-qr.png"),
      path.resolve(process.cwd(), "frontend", "public", "images", "QRcode", "payment-qr.png"),
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

    return NextResponse.json({ error: "Payment QR not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Failed to load payment QR" }, { status: 500 });
  }
}
