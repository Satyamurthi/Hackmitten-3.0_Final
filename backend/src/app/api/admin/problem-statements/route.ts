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
  isPublished: z.boolean().default(true),
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
 * Creates a new problem statement.
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
        isPublished: isPublished ?? true,
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
