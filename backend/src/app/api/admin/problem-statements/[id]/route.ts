import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission, jsonError } from "@/lib/api-auth";
import { z } from "zod";

const VALID_DEGREES = ["Diploma", "UG", "PG"] as const;

const problemStatementUpdateSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200).optional(),
  description: z.string().trim().min(10, "Description must be at least 10 characters").optional(),
  degrees: z
    .array(z.enum(VALID_DEGREES))
    .min(1, "At least one applicable category (Diploma, UG, PG) must be selected")
    .optional(),
  domainId: z.string().trim().nullable().optional(),
  isPublished: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/problem-statements/:id
 * Updates an existing problem statement.
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    await requirePermission("problem:manage");
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const parsed = problemStatementUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(" | "), issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const existing = await db.problemStatement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Problem statement not found." }, { status: 404 });
    }

    const dataToUpdate: Record<string, unknown> = {};

    if (parsed.data.title !== undefined) dataToUpdate.title = parsed.data.title;
    if (parsed.data.description !== undefined) dataToUpdate.description = parsed.data.description;
    if (parsed.data.degrees !== undefined) dataToUpdate.degrees = parsed.data.degrees;
    if (parsed.data.isPublished !== undefined) dataToUpdate.isPublished = parsed.data.isPublished;

    if (parsed.data.domainId !== undefined) {
      if (parsed.data.domainId === null || parsed.data.domainId === "") {
        dataToUpdate.domainId = null;
      } else {
        const domainExists = await db.domain.findUnique({ where: { id: parsed.data.domainId } });
        if (!domainExists) {
          return NextResponse.json({ error: "Selected domain does not exist." }, { status: 400 });
        }
        dataToUpdate.domainId = domainExists.id;
      }
    }

    const updated = await db.problemStatement.update({
      where: { id },
      data: dataToUpdate,
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

    return NextResponse.json({ problemStatement: updated });
  } catch (err) {
    return jsonError(err);
  }
}

/**
 * DELETE /api/admin/problem-statements/:id
 * Deletes a problem statement.
 */
export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    await requirePermission("problem:manage");
    const { id } = await params;

    const existing = await db.problemStatement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Problem statement not found." }, { status: 404 });
    }

    await db.problemStatement.delete({ where: { id } });

    return NextResponse.json({ success: true, message: `Problem statement '${existing.title}' deleted successfully.` });
  } catch (err) {
    return jsonError(err);
  }
}
