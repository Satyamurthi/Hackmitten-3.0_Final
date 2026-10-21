import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission, jsonError } from "@/lib/api-auth";
import { generateParticipantCard, buildTeamIdCardsPdf, GeneratedParticipantCard } from "@/lib/id-card-generator";

/**
 * GET /api/admin/teams/:id/id-cards/pdf
 * Generates and streams a duplex print-ready PDF containing all members' front & back cards.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("registration:view");
    const { id } = await params;

    const team = await db.team.findUnique({
      where: { id },
      include: {
        members: {
          orderBy: [{ isLeader: "desc" }, { createdAt: "asc" }],
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    if (!team.members || team.members.length === 0) {
      return NextResponse.json({ error: "Team has no registered members" }, { status: 400 });
    }

    const cards: GeneratedParticipantCard[] = [];
    for (const member of team.members) {
      const card = await generateParticipantCard(member, team);
      cards.push(card);
    }

    const pdfBuffer = await buildTeamIdCardsPdf(cards);

    const safeTeamName = (team.registrationId || team.teamName).replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `${safeTeamName}_ID_Cards.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    return jsonError(err);
  }
}
