import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission, jsonError } from "@/lib/api-auth";
import { generateParticipantCard } from "@/lib/id-card-generator";

/**
 * GET /api/admin/teams/:id/id-cards
 * Returns generated front & back preview data for all members of the team.
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

    const cards: Array<{
      participantId: string;
      fullName: string;
      college: string;
      degree: string | null;
      isLeader: boolean;
      officialId: string;
      hasPhoto: boolean;
      missingFields: string[];
      frontDataUrl: string;
      backDataUrl: string;
    }> = [];
    for (const member of team.members) {
      const card = await generateParticipantCard(member, team);
      cards.push({
        participantId: member.id,
        fullName: member.fullName,
        college: member.college,
        degree: member.degree,
        isLeader: member.isLeader,
        officialId: card.idNumber,
        hasPhoto: card.hasPhoto,
        missingFields: card.missingFields,
        frontDataUrl: card.frontDataUrl,
        backDataUrl: card.backDataUrl,
      });
    }

    const hasMissingPhotos = cards.some((c) => !c.hasPhoto);

    return NextResponse.json({
      team: {
        id: team.id,
        teamName: team.teamName,
        registrationId: team.registrationId,
        status: team.status,
        degree: team.degree,
        college: team.college,
      },
      cards,
      hasMissingPhotos,
    });
  } catch (err) {
    return jsonError(err);
  }
}
