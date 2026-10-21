import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission, jsonError } from "@/lib/api-auth";
import { generateParticipantCard, buildSingleParticipantPdf } from "@/lib/id-card-generator";

/**
 * GET /api/admin/participants/:id/id-card?format=pdf|front|back
 * Download an individual participant's card as a print-ready PDF or high-res PNG.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("registration:view");
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "pdf";

    const participant = await db.participant.findUnique({
      where: { id },
      include: { team: true },
    });

    if (!participant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    const card = await generateParticipantCard(participant, participant.team);
    const safeName = participant.fullName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const safePid = (card.idNumber || participant.id).replace(/[^a-zA-Z0-9_-]/g, "_");

    if (format === "front") {
      return new Response(new Uint8Array(card.frontBuffer), {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="${safePid}_${safeName}_front.png"`,
        },
      });
    }

    if (format === "back") {
      return new Response(new Uint8Array(card.backBuffer), {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="${safePid}_${safeName}_back.png"`,
        },
      });
    }

    // Default: PDF format
    const pdfBuffer = await buildSingleParticipantPdf(card);
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safePid}_${safeName}_ID_Card.pdf"`,
      },
    });
  } catch (err) {
    return jsonError(err);
  }
}
