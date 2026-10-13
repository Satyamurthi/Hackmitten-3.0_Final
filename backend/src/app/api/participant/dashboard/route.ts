import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession, jsonError } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/participant/dashboard
 * Retrieves the authenticated participant's team information, category-specific dashboard details,
 * and only problem statements and domains assigned to their degree category (UG / PG / Diploma).
 */
export async function GET() {
  try {
    const ctx = await requireSession();

    if (ctx.role !== "PARTICIPANT" && ctx.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Only registered participants can access this dashboard." },
        { status: 403 },
      );
    }

    const participant = await db.participant.findFirst({
      where: { email: ctx.email.toLowerCase().trim() },
      include: {
        team: {
          include: {
            domain: true,
            payment: {
              include: {
                screenshots: {
                  orderBy: { createdAt: "desc" },
                  take: 1,
                },
              },
            },
            members: {
              orderBy: [{ isLeader: "desc" }, { createdAt: "asc" }],
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!participant || !participant.team) {
      return NextResponse.json(
        { error: "Team not found for participant credentials" },
        { status: 404 },
      );
    }

    const team = participant.team;
    const category = team.degree || "UG";
    const dashboardTitle =
      category === "Diploma"
        ? "Diploma Dashboard"
        : category === "PG"
          ? "PG Dashboard"
          : "UG Dashboard";

    // ─── Check Problem Statement Release Status ───
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

    // ─── Fetch Problem Statements (Only for the team's selected domain & category) ───
    let problemStatements: any[] = [];

    if (isUnlocked) {
      const psWhere: any = {
        isPublished: true,
        degrees: {
          has: category,
        },
      };

      // Only display the domain that the team selected
      if (team.domainId) {
        psWhere.domainId = team.domainId;
      } else if (team.domainName) {
        psWhere.domain = { name: team.domainName };
      }

      problemStatements = await db.problemStatement.findMany({
        where: psWhere,
        include: {
          domain: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
      });
    }

    // ─── Fetch Domains assigned to this participant's category ───
    const domains = await db.domain.findMany({
      where: {
        enabled: true,
        degrees: {
          has: category,
        },
      },
      orderBy: [{ name: "asc" }],
    });

    return NextResponse.json({
      success: true,
      category,
      dashboardTitle,
      isProblemStatementsLocked: !isUnlocked,
      problemStatementsReleaseTime: releaseTimeIso,
      selectedDomainName: team.domainName || team.domain?.name || null,
      team: {
        id: team.id,
        teamName: team.teamName,
        registrationId: team.registrationId,
        status: team.status,
        college: team.college,
        degree: team.degree,
        domainId: team.domainId,
        domainName: team.domainName || team.domain?.name || null,
        createdAt: team.createdAt,
        payment: team.payment
          ? {
              status: team.payment.status,
              transactionId: team.payment.transactionId,
              rejectionReason: team.payment.rejectionReason,
              verifiedAt: team.payment.verifiedAt,
            }
          : null,
        members: team.members.map((m) => ({
          id: m.id,
          fullName: m.fullName,
          email: m.email,
          phone: m.phone,
          college: m.college,
          degree: m.degree,
          isLeader: m.isLeader,
          participantId: m.participantId,
          qrToken: m.qrToken,
          passVerified: m.passVerified,
          participantImagePath: m.participantImagePath,
        })),
      },
      problemStatements: problemStatements.map((ps) => ({
        id: ps.id,
        title: ps.title,
        description: ps.description,
        degrees: ps.degrees,
        domain: ps.domain ? { id: ps.domain.id, name: ps.domain.name } : null,
        createdAt: ps.createdAt,
      })),
      domains: domains.map((d) => ({
        id: d.id,
        name: d.name,
        degrees: d.degrees,
      })),
    });
  } catch (err) {
    return jsonError(err);
  }
}
