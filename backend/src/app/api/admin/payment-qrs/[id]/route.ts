import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission, jsonError } from "@/lib/api-auth";
import { storeImage, validateImageFile, deletePublicFile, UploadError } from "@/lib/upload";
import { z } from "zod";

const VALID_DEGREES = ["Diploma", "UG", "PG"] as const;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    await requirePermission("config:edit");
    const { id } = await params;

    let existing = await db.paymentQrCode.findUnique({
      where: { id },
    });
    if (!existing) {
      if (id === "default-ug-pg-qr") {
        existing = await db.paymentQrCode.create({
          data: {
            label: "UG & PG Payment QR",
            degrees: ["UG", "PG"],
            filePath: "/api/payment-qr",
            fileName: "payment-qr.png",
            mimeType: "image/png",
            sizeBytes: 0,
            upiId: "9364008472@kotak",
          },
        });
      } else {
        return NextResponse.json({ error: "Payment QR code not found" }, { status: 404 });
      }
    }

    const contentType = req.headers.get("content-type") || "";
    let degrees: string[] | undefined = undefined;
    let label: string | null | undefined = undefined;
    let upiId: string | null | undefined = undefined;
    let newFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const degreesRaw = formData.get("degrees");
      if (degreesRaw !== null) {
        try {
          degrees = typeof degreesRaw === "string" ? JSON.parse(degreesRaw) : [];
        } catch {
          if (typeof degreesRaw === "string") degrees = [degreesRaw];
        }
      }

      if (formData.has("label")) {
        label = (formData.get("label") as string)?.trim() || null;
      }
      if (formData.has("upiId")) {
        upiId = (formData.get("upiId") as string)?.trim() || null;
      }

      const fileEntry = formData.get("file");
      if (fileEntry instanceof File && fileEntry.size > 0) {
        newFile = fileEntry;
      }
    } else {
      const body = await req.json().catch(() => ({}));
      if (body.degrees !== undefined) degrees = body.degrees;
      if (body.label !== undefined) label = body.label ? String(body.label).trim() : null;
      if (body.upiId !== undefined) upiId = body.upiId ? String(body.upiId).trim() : null;
    }

    const dataToUpdate: Record<string, unknown> = {};

    if (degrees !== undefined) {
      const parsedDegrees = z
        .array(z.enum(VALID_DEGREES))
        .min(1, "Select at least one degree category (Diploma, UG, PG)")
        .safeParse(degrees);
      if (!parsedDegrees.success) {
        return NextResponse.json(
          { error: parsedDegrees.error.issues[0]?.message || "Invalid degrees" },
          { status: 400 },
        );
      }
      dataToUpdate.degrees = parsedDegrees.data;
    }

    if (label !== undefined) dataToUpdate.label = label;
    if (upiId !== undefined) dataToUpdate.upiId = upiId;

    if (newFile) {
      try {
        await validateImageFile(newFile, { maxSize: 10 * 1024 * 1024 });
      } catch (err) {
        const msg = err instanceof UploadError ? err.message : "Invalid image format";
        return NextResponse.json({ error: msg }, { status: 400 });
      }

      const stored = await storeImage({ file: newFile, prefix: "pay_qr" });
      dataToUpdate.filePath = stored.relativePath;
      dataToUpdate.fileName = stored.fileName;
      dataToUpdate.mimeType = stored.mimeType;
      dataToUpdate.sizeBytes = stored.sizeBytes;

      // Delete old file if present
      if (existing.filePath) {
        await deletePublicFile(existing.filePath).catch(() => {});
      }
    }

    const updated = await db.paymentQrCode.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      qr: {
        ...updated,
        url: updated.filePath,
      },
    });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    await requirePermission("config:edit");
    const { id } = await params;

    if (id === "default-ug-pg-qr") {
      return NextResponse.json({ success: true, message: "Default QR code reset" });
    }

    const existing = await db.paymentQrCode.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Payment QR code not found" }, { status: 404 });
    }

    await db.paymentQrCode.delete({
      where: { id },
    });

    if (existing.filePath) {
      await deletePublicFile(existing.filePath).catch(() => {});
    }

    return NextResponse.json({ success: true, message: "Payment QR code deleted" });
  } catch (err) {
    return jsonError(err);
  }
}
