import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission, jsonError } from "@/lib/api-auth";
import { z } from "zod";

const VALID_DEGREES = ["Diploma", "UG", "PG"] as const;

const problemStatementCreateSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  degrees: z
    .array(z.enum(VALID_DEGREES))
    .min(1, "At least one applicable category (Diploma, UG, PG) must be selected"),
  domainId: z.string().trim().nullable().optional(),
  isPublished: z.boolean().default(false),
});

/**
 * GET /api/admin/problem-statements
 * Returns all problem statements for admin management, including associated domain details.
 */
export async function GET() {
  try {
    await requirePermission("config:view");
    const problemStatements = await db.problemStatement.findMany({
      include: {
        domain: {
          select: {
            id: true,
            name: true,
            degrees: true,
            enabled: true,
          },
        },
        acceptedByTeams: {
          select: {
            id: true,
            teamName: true,
            registrationId: true,
            degree: true,
            domainName: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });
    return NextResponse.json({ problemStatements });
  } catch (err) {
    return jsonError(err);
  }
}

/**
 * POST /api/admin/problem-statements
 * Creates a new problem statement (defaults to unpublished / draft mode).
 */
export async function POST(req: Request) {
  try {
    await requirePermission("problem:manage");
    const body = await req.json().catch(() => ({}));

    const parsed = problemStatementCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(" | "), issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { title, description, degrees, domainId, isPublished } = parsed.data;

    let validDomainId: string | null = null;
    if (domainId) {
      const domainExists = await db.domain.findUnique({ where: { id: domainId } });
      if (!domainExists) {
        return NextResponse.json({ error: "Selected domain does not exist." }, { status: 400 });
      }
      validDomainId = domainExists.id;
    }

    const created = await db.problemStatement.create({
      data: {
        title,
        description,
        degrees,
        domainId: validDomainId,
        isPublished: isPublished ?? false,
      },
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
    });

    return NextResponse.json({ problemStatement: created }, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}

/**
 * PATCH /api/admin/problem-statements
 * Bulk update: open/publish all problem statements at once or unpublish all.
 */
export async function PATCH(req: Request) {
  try {
    await requirePermission("problem:manage");
    const body = await req.json().catch(() => ({}));
    const { isPublished } = body;

    if (typeof isPublished !== "boolean") {
      return NextResponse.json(
        { error: "Field 'isPublished' (boolean) is required for bulk update." },
        { status: 400 },
      );
    }

    const result = await db.problemStatement.updateMany({
      data: {
        isPublished,
      },
    });

    return NextResponse.json({
      success: true,
      count: result.count,
      isPublished,
      message: isPublished
        ? `All ${result.count} problem statement(s) have been unlocked and published for all participants.`
        : `All ${result.count} problem statement(s) have been set to unpublished (Draft) mode.`,
    });
  } catch (err) {
    return jsonError(err);
  }
}
