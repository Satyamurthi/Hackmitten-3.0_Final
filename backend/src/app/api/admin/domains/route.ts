import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission, jsonError } from "@/lib/api-auth";
import { z } from "zod";

const VALID_DEGREES = ["Diploma", "UG", "PG"] as const;

const domainCreateSchema = z.object({
  name: z.string().trim().min(2, "Domain name must be at least 2 characters").max(100),
  degrees: z
    .array(z.enum(VALID_DEGREES))
    .min(1, "At least one applicable degree category must be selected"),
  enabled: z.boolean().default(true),
});

/**
 * GET /api/admin/domains
 * Returns all domains for administration.
 */
export async function GET() {
  try {
    await requirePermission("config:view");
    const domains = await db.domain.findMany({
      include: {
        _count: {
          select: { teams: true },
        },
      },
      orderBy: [{ enabled: "desc" }, { name: "asc" }],
    });
    const formatted = domains.map((d) => ({
      ...d,
      teamCount: d._count?.teams ?? 0,
    }));
    return NextResponse.json({ domains: formatted });
  } catch (err) {
    return jsonError(err);
  }
}

/**
 * POST /api/admin/domains
 * Creates a new domain.
 */
export async function POST(req: Request) {
  try {
    await requirePermission("config:edit");
    const body = await req.json().catch(() => ({}));

    const parsed = domainCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(" | "), issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { name, degrees, enabled } = parsed.data;

    const existing = await db.domain.findUnique({
      where: { name },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Domain '${name}' already exists.` },
        { status: 409 },
      );
    }

    const domain = await db.domain.create({
      data: {
        name,
        degrees,
        enabled,
      },
    });

    return NextResponse.json({ domain }, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}
