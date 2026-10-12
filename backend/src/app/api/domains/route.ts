import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/domains
 * Public endpoint to fetch active domains, optionally filtered by degree category.
 * Query params: ?degree=Diploma | UG | PG
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const degree = searchParams.get("degree");

    let whereClause: any = { enabled: true };
    if (degree && ["Diploma", "UG", "PG"].includes(degree)) {
      whereClause = {
        enabled: true,
        degrees: {
          has: degree,
        },
      };
    }

    const domains = await db.domain.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        degrees: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ domains });
  } catch (err) {
    return jsonError(err);
  }
}
