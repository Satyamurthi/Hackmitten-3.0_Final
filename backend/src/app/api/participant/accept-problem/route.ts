import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession, jsonError } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/participant/accept-problem
 * Allows a registered participant team to select and accept exactly ONE problem statement.
 * Once accepted, the problem statement is locked for that team.
 */
export async function POST(req: Request) {
  try {
    const ctx = await requireSession();

    if (ctx.role !== "PARTICIPANT" && ctx.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Only registered participants can accept a problem statement." },
        { status: 403 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const problemStatementId = String(body.problemStatementId || "").trim();

    if (!problemStatementId) {
      return NextResponse.json(
        { error: "Problem statement ID is required." },
        { status: 400 },
      );
    }

    const participant = await db.participant.findFirst({
      where: { email: ctx.email.toLowerCase().trim() },
      include: {
        team: {
          include: {
            domain: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!participant || !participant.team) {
      return NextResponse.json(
        { error: "Team not found for participant credentials." },
        { status: 404 },
      );
    }

    const team = participant.team;

    // RULE: One team can accept only one problem
    if (team.acceptedProblemStatementId) {
      return NextResponse.json(
        {
          error: "Your team has already accepted a problem statement. Each team can accept only one problem statement.",
          acceptedProblemStatementId: team.acceptedProblemStatementId,
        },
        { status: 400 },
      );
    }

    // Check if problem statements are unlocked by release time or manual toggle
    const eventConfig = await db.eventConfig.findUnique({ where: { id: "singleton" } });
    const releaseTimeIso = eventConfig?.problemStatementsReleaseTime || null;
    const manuallyReleased = eventConfig?.problemStatementsReleased === true;

    let isUnlocked = manuallyReleased;
    if (!isUnlocked && releaseTimeIso) {
      const releaseTimestamp = new Date(releaseTimeIso).getTime();
      if (Number.isFinite(releaseTimestamp) && releaseTimestamp <= Date.now()) {
        isUnlocked = true;
      }
    }

    if (!isUnlocked) {
      return NextResponse.json(
        { error: "Problem statements are still locked by the event schedule." },
        { status: 403 },
      );
    }

    // Verify problem statement eligibility
    const ps = await db.problemStatement.findUnique({
      where: { id: problemStatementId },
      include: {
        domain: {
          select: { id: true, name: true },
        },
      },
    });

    if (!ps || !ps.isPublished) {
      return NextResponse.json(
        { error: "Problem statement not found or not published." },
        { status: 404 },
      );
    }

    const teamCategory = team.degree || "UG";
    if (!ps.degrees.includes(teamCategory)) {
      return NextResponse.json(
        { error: `This problem statement is not eligible for ${teamCategory} category participants.` },
        { status: 400 },
      );
    }

    // Check domain track matching
    if (team.domainId && ps.domainId && ps.domainId !== team.domainId) {
      return NextResponse.json(
        { error: "This problem statement does not belong to your team's registered domain track." },
        { status: 400 },
      );
    }

    // Lock and accept problem statement for this team
    const updatedTeam = await db.team.update({
      where: { id: team.id },
      data: {
        acceptedProblemStatementId: ps.id,
      },
      include: {
        acceptedProblemStatement: {
          include: {
            domain: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Problem statement "${ps.title}" accepted and locked for team ${team.teamName}.`,
      acceptedProblemStatementId: ps.id,
      acceptedProblemStatement: updatedTeam.acceptedProblemStatement,
    });
  } catch (err) {
    return jsonError(err);
  }
}
