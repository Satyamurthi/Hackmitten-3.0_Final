import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/problem-statements
 * Public and participant endpoint to fetch published problem statements.
 * Supports filtering by category (?degree=Diploma|UG|PG) and optionally by domain (?domainId=...).
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const degree = searchParams.get("degree");
    const domainId = searchParams.get("domainId");

    const whereClause: Record<string, unknown> = {
      isPublished: true,
    };

    if (degree && ["Diploma", "UG", "PG"].includes(degree)) {
      whereClause.degrees = {
        has: degree,
      };
    }

    if (domainId) {
      whereClause.domainId = domainId;
    }

    const problemStatements = await db.problemStatement.findMany({
      where: whereClause,
      include: {
        domain: {
          select: {
            id: true,
            name: true,
            degrees: true,
            enabled: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    return NextResponse.json({ problemStatements });
  } catch (err) {
    return jsonError(err);
  }
}
