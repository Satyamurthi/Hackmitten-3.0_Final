import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission, jsonError } from "@/lib/api-auth";
import { z } from "zod";

const VALID_DEGREES = ["Diploma", "UG", "PG"] as const;

const domainUpdateSchema = z.object({
  name: z.string().trim().min(2, "Domain name must be at least 2 characters").max(100).optional(),
  degrees: z
    .array(z.enum(VALID_DEGREES))
    .min(1, "At least one applicable degree category must be selected")
    .optional(),
  enabled: z.boolean().optional(),
});

/**
 * PATCH /api/admin/domains/:id
 * Updates an existing domain.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("config:edit");
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const parsed = domainUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(" | "), issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const domain = await db.domain.findUnique({ where: { id } });
    if (!domain) return NextResponse.json({ error: "Domain not found" }, { status: 404 });

    if (parsed.data.name && parsed.data.name !== domain.name) {
      const clash = await db.domain.findUnique({ where: { name: parsed.data.name } });
      if (clash && clash.id !== id) {
        return NextResponse.json(
          { error: `Domain '${parsed.data.name}' already exists.` },
          { status: 409 },
        );
      }
    }

    const updated = await db.domain.update({
      where: { id },
      data: parsed.data,
    });

    // Also update denormalized domainName in teams referencing this domain if name changed
    if (parsed.data.name && parsed.data.name !== domain.name) {
      await db.team.updateMany({
        where: { domainId: id },
        data: { domainName: parsed.data.name },
      });
    }

    return NextResponse.json({ domain: updated });
  } catch (err) {
    return jsonError(err);
  }
}

/**
 * DELETE /api/admin/domains/:id
 * Deletes a domain safely. Dissociates teams without breaking registration records.
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("config:edit");
    const { id } = await params;

    const domain = await db.domain.findUnique({ where: { id } });
    if (!domain) return NextResponse.json({ error: "Domain not found" }, { status: 404 });

    // Ensure teams preserve their domainName text, then delete domain
    await db.$transaction(async (tx) => {
      await tx.team.updateMany({
        where: { domainId: id },
        data: { domainName: domain.name },
      });
      await tx.domain.delete({ where: { id } });
    });

    return NextResponse.json({ success: true, message: `Domain '${domain.name}' deleted successfully.` });
  } catch (err) {
    return jsonError(err);
  }
}
