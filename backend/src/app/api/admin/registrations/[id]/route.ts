import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission, jsonError } from "@/lib/api-auth";
import { generateQrToken } from "@/lib/constants";

/**
 * GET /api/admin/registrations/:id — full detail incl. payment screenshots
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("registration:view");
    const { id } = await params;
    const team = await db.team.findUnique({
      where: { id },
      select: {
        id: true,
        teamName: true,
        registrationId: true,
        status: true,
        college: true,
        degree: true,
        domainId: true,
        domainName: true,
        domain: { select: { id: true, name: true, degrees: true } },
        createdAt: true,
        members: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            college: true,
            degree: true,
            participantId: true,
            qrToken: true,
            passVerified: true,
            isLeader: true,
            participantImagePath: true,
          },
          orderBy: { isLeader: "desc" },
        },
        payment: {
          select: {
            id: true,
            status: true,
            transactionId: true,
            rejectionReason: true,
            verifiedAt: true,
            verifiedBy: { select: { name: true, email: true } },
            screenshots: {
              select: { id: true, fileName: true, mimeType: true, sizeBytes: true },
            },
          },
        },
      },
    });
    if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Ensure all members have an active qrToken for food and pass check-in
    for (const member of team.members) {
      if (!member.qrToken) {
        const token = generateQrToken();
        await db.participant.update({
          where: { id: member.id },
          data: { qrToken: token },
        });
        member.qrToken = token;
      }
    }

    const safeTeam = {
      ...team,
      members: team.members.map(({ participantImagePath, ...member }) => ({
        ...member,
        hasParticipantImage: Boolean(participantImagePath),
      })),
    };
    return NextResponse.json({ team: safeTeam });
  } catch (err) {
    return jsonError(err);
  }
}
