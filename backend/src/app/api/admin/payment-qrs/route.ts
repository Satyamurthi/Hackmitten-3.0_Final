import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission, jsonError } from "@/lib/api-auth";
import { storeImage, validateImageFile, UploadError } from "@/lib/upload";
import { z } from "zod";

const VALID_DEGREES = ["Diploma", "UG", "PG"] as const;

/**
 * GET /api/admin/payment-qrs
 * Returns all configured payment QR codes.
 */
export async function GET() {
  try {
    await requirePermission("config:view");
    const qrs = await db.paymentQrCode.findMany({
      orderBy: { createdAt: "desc" },
    });

    const hasUgOrPg = qrs.some((q) => q.degrees.includes("UG") || q.degrees.includes("PG"));

    const result = qrs.map((qr) => ({
      ...qr,
      url: qr.filePath,
    }));

    if (!hasUgOrPg) {
      result.unshift({
        id: "default-ug-pg-qr",
        label: "UG & PG Payment QR (Default)",
        degrees: ["UG", "PG"],
        filePath: "/api/payment-qr",
        fileName: "payment-qr.png",
        mimeType: "image/png",
        sizeBytes: 0,
        upiId: "9364008472@kotak",
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date(),
        url: "/api/payment-qr",
      } as any);
    }

    return NextResponse.json({ qrs: result });
  } catch (err) {
    return jsonError(err);
  }
}

/**
 * POST /api/admin/payment-qrs
 * Upload and create a new payment QR code mapped to degree categories.
 */
export async function POST(req: Request) {
  try {
    await requirePermission("config:edit");
    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Payment QR image file is required" }, { status: 400 });
    }

    // Validate degrees
    const degreesRaw = formData.get("degrees");
    let degrees: string[] = [];
    try {
      degrees = typeof degreesRaw === "string" ? JSON.parse(degreesRaw) : [];
    } catch {
      if (typeof degreesRaw === "string") degrees = [degreesRaw];
    }

    const degreesParsed = z.array(z.enum(VALID_DEGREES)).min(1, "Select at least one degree category (Diploma, UG, PG)").safeParse(degrees);
    if (!degreesParsed.success) {
      return NextResponse.json(
        { error: degreesParsed.error.issues[0]?.message || "Invalid degree categories" },
        { status: 400 },
      );
    }

    const label = (formData.get("label") as string)?.trim() || null;
    const upiId = (formData.get("upiId") as string)?.trim() || null;

    // Validate image file
    try {
      await validateImageFile(file, { maxSize: 10 * 1024 * 1024 });
    } catch (err) {
      const message = err instanceof UploadError ? err.message : "Invalid image format";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    // Store image
    const stored = await storeImage({ file, prefix: "pay_qr" });

    // Create database record
    const qrRecord = await db.paymentQrCode.create({
      data: {
        label,
        degrees: degreesParsed.data,
        filePath: stored.relativePath,
        fileName: stored.fileName,
        mimeType: stored.mimeType,
        sizeBytes: stored.sizeBytes,
        upiId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        qr: {
          ...qrRecord,
          url: qrRecord.filePath,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    return jsonError(err);
  }
}
