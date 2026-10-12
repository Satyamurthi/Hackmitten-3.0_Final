import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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

      const fee = degree === "Diploma" ? "₹500" : "₹1,000";

      if (qrRecord) {
        return NextResponse.json({
          configured: true,
          qrUrl: `/api/payment-qr?degree=${encodeURIComponent(degree)}&t=${qrRecord.updatedAt.getTime()}`,
          upiId: qrRecord.upiId || "9364008472@kotak",
          label: qrRecord.label || `${degree} Payment QR`,
          degrees: qrRecord.degrees,
          degree,
          fee,
        });
      }

      // The existing payment QR code is specifically for UG and PG students
      if (degree === "UG" || degree === "PG") {
        return NextResponse.json({
          configured: true,
          qrUrl: `/api/payment-qr?degree=${encodeURIComponent(degree)}`,
          upiId: "9364008472@kotak",
          label: "UG & PG Payment QR",
          degrees: ["UG", "PG"],
          degree,
          fee,
        });
      }

      return NextResponse.json({
        configured: false,
        qrUrl: null,
        upiId: "9364008472@kotak",
        message: `Payment QR code has not been configured for ${degree}. Please contact the event administrator.`,
        degree,
        fee,
      });
    }

    // Default when no degree specified
    const latestQr = await db.paymentQrCode.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    });

    if (latestQr) {
      return NextResponse.json({
        configured: true,
        qrUrl: `/api/payment-qr?t=${latestQr.updatedAt.getTime()}`,
        upiId: latestQr.upiId || "9364008472@kotak",
        label: latestQr.label || "UG & PG Payment QR",
        degrees: latestQr.degrees,
        fee: "₹1,000",
      });
    }

    return NextResponse.json({
      configured: true,
      qrUrl: "/api/payment-qr",
      upiId: "9364008472@kotak",
      label: "UG & PG Payment QR",
      degrees: ["UG", "PG"],
      fee: "₹1,000",
    });
  } catch {
    return NextResponse.json({
      configured: false,
      error: "Failed to fetch payment QR info",
    }, { status: 500 });
  }
}
