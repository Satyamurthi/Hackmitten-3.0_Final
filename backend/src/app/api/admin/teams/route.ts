import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission, jsonError } from "@/lib/api-auth";
import { normalizeRegistrationMembers, registrationSchema } from "@/lib/validators";
import { ADMIN_TEAM_SELECT } from "@/lib/admin-team-view";
import {
  generateQrToken,
  generateRegistrationId,
  generateParticipantId,
  nextRegistrationSequence,
} from "@/lib/constants";
import { storeParticipantImage, storePaymentScreenshot, deletePrivateFile } from "@/lib/upload";
import { sendEmail, approvalEmailHtml, approvalEmailText } from "@/lib/email";
import { attemptRegistrationAcknowledgement } from "@/lib/registration-acknowledgement";
import { normalizeTeamName } from "@/lib/team-name";

function sanitizeAdminTeam(team: any) {
  if (!team) return team;
  return {
    ...team,
    members: team.members?.map(({ participantImagePath, participantImageMimeType, ...member }: any) => ({
      ...member,
      hasParticipantImage: Boolean(participantImagePath),
    })),
  };
}

/**
 * GET /api/admin/teams
 * Returns all teams (for admin team management). SUPER_ADMIN only.
 */
export async function GET() {
  try {
    await requirePermission("registration:view");
    const teams = await db.team.findMany({
      select: ADMIN_TEAM_SELECT,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ teams: teams.map(sanitizeAdminTeam) });
  } catch (err) {
    return jsonError(err);
  }
}

/**
 * POST /api/admin/teams
 * Manually create a team (super admin). Supports immediate approval.
 * Supports JSON or multipart/form-data (with member photos & payment screenshot).
 */
export async function POST(req: Request) {
  const storedFiles: string[] = [];
  try {
    const ctx = await requirePermission("team:approve"); // super admin only

    let bodyData: any = {};
    const memberFiles: (File | null)[] = [];
    let paymentScreenshotFile: File | null = null;

    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      const form = await req.formData();
      const rawPayload = form.get("registration") || form.get("team");
      if (typeof rawPayload !== "string") {
        return NextResponse.json({ error: "Missing team registration details in upload." }, { status: 400 });
      }
      try {
        bodyData = JSON.parse(rawPayload);
      } catch {
        return NextResponse.json({ error: "Malformed JSON payload in registration data." }, { status: 400 });
      }

      for (let i = 0; i < 4; i++) {
        const file = form.get(`participantImage${i}`);
        if (file instanceof File && file.size > 0) {
          memberFiles.push(file);
        } else {
          memberFiles.push(null);
        }
      }

      const screenshot = form.get("paymentScreenshot");
      if (screenshot instanceof File && screenshot.size > 0) {
        paymentScreenshotFile = screenshot;
      }
    } else {
      bodyData = await req.json();
    }

    const parsed = registrationSchema.safeParse({
      teamName: bodyData.teamName,
      college: bodyData.college,
      members: bodyData.members,
    });
    if (!parsed.success) {
      const formattedIssues = parsed.error.issues
        .map((issue) => {
          const field = issue.path.join(".");
          return field ? `${field}: ${issue.message}` : issue.message;
        })
        .join(" | ");
      return NextResponse.json(
        { error: formattedIssues || "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { teamName, college } = parsed.data;
    const members = normalizeRegistrationMembers(parsed.data.members);
    const wantApproved = bodyData.status === "APPROVED";
    const transactionId = typeof bodyData.transactionId === "string" ? bodyData.transactionId.trim() : "";

    // Check team name uniqueness (normalized match)
    const norm = normalizeTeamName(teamName);
    const matches = await db.$queryRaw<Array<{ teamName: string }>>`
      SELECT "teamName"
      FROM "Team"
      WHERE lower(regexp_replace(trim("teamName"), '\\s+', ' ', 'g')) = ${norm}
      LIMIT 1
    `;
    if (matches.length > 0) {
      return NextResponse.json(
        { error: "Team name already exists. Please choose a different team name.", code: "TEAM_NAME_TAKEN" },
        { status: 409 },
      );
    }

    const degree = bodyData.degree ? String(bodyData.degree).trim() : null;
    if (degree && !["Diploma", "UG", "PG"].includes(degree)) {
      return NextResponse.json({ error: "Invalid degree category. Must be Diploma, UG, or PG." }, { status: 400 });
    }

    const domainId = bodyData.domainId ? String(bodyData.domainId).trim() : null;
    let domainRecord: { id: string; name: string; degrees: string[] } | null = null;
    if (domainId) {
      domainRecord = await db.domain.findUnique({ where: { id: domainId } });
      if (!domainRecord) {
        return NextResponse.json({ error: "Selected domain not found" }, { status: 400 });
      }
      if (degree && !domainRecord.degrees.includes(degree)) {
        return NextResponse.json(
          { error: `Domain '${domainRecord.name}' is not applicable for ${degree} degree.` },
          { status: 400 },
        );
      }
    } else if (degree) {
      const activeDomainsForDegree = await db.domain.count({
        where: { degrees: { has: degree }, enabled: true },
      });
      if (activeDomainsForDegree > 0) {
        return NextResponse.json(
          { error: `Please select an applicable competition domain for ${degree}.` },
          { status: 400 },
        );
      }
    }

    // Process participant images if provided
    const storedMemberImages: Array<{ relativePath: string; mimeType: string } | null> = [];
    for (let i = 0; i < members.length; i++) {
      const file = memberFiles[i];
      if (file) {
        const stored = await storeParticipantImage(file);
        storedFiles.push(stored.relativePath);
        storedMemberImages.push(stored);
      } else {
        storedMemberImages.push(null);
      }
    }

    // Transactional creation
    const { createdTeam, regIdForEmail } = await db.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: {
          teamName,
          college: college ?? members[0]?.college ?? null,
          degree: degree ?? null,
          domainId: domainRecord?.id ?? null,
          domainName: domainRecord?.name ?? null,
          status: wantApproved ? "APPROVED" : "SUBMITTED",
        },
      });

      // Create members
      const createdMembers: Awaited<ReturnType<typeof tx.participant.create>>[] = [];
      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        const img = storedMemberImages[i];
        const participant = await tx.participant.create({
          data: {
            teamId: team.id,
            fullName: m.fullName,
            email: m.email.toLowerCase().trim(),
            phone: m.phone.trim(),
            college: m.college,
            degree: m.degree || null,
            isLeader: m.isLeader,
            participantImagePath: img?.relativePath ?? null,
            participantImageMimeType: img?.mimeType ?? null,
          },
        });
        createdMembers.push(participant);
      }

      let generatedRegId: string | null = null;

      // If approved, generate registration ID + participant IDs + QR tokens
      if (wantApproved) {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('hackmitten-registration-sequence'))`;
        const allocatedIds = await tx.team.findMany({
          where: { registrationId: { not: null } },
          select: { registrationId: true },
        });
        const seq = nextRegistrationSequence(allocatedIds.map((row) => row.registrationId));
        generatedRegId = generateRegistrationId(seq);

        await tx.team.update({
          where: { id: team.id },
          data: { status: "APPROVED", registrationId: generatedRegId },
        });

        for (let i = 0; i < createdMembers.length; i++) {
          await tx.participant.update({
            where: { id: createdMembers[i].id },
            data: {
              participantId: generateParticipantId(seq, i + 1),
              qrToken: generateQrToken(),
              passVerified: true,
            },
          });
        }
      }

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          teamId: team.id,
          transactionId: transactionId || (wantApproved ? `MANUAL-${generatedRegId}` : null),
          status: wantApproved ? "VERIFIED" : (bodyData.paymentStatus || "SUBMITTED"),
          verifiedById: wantApproved ? ctx.userId : null,
          verifiedAt: wantApproved ? new Date() : null,
        },
      });

      // Handle payment screenshot if uploaded
      if (paymentScreenshotFile) {
        const storedScreenshot = await storePaymentScreenshot({
          file: paymentScreenshotFile,
          paymentId: payment.id,
        });
        storedFiles.push(storedScreenshot.relativePath);
        await tx.paymentScreenshot.create({
          data: {
            paymentId: payment.id,
            fileName: storedScreenshot.fileName,
            filePath: storedScreenshot.relativePath,
            mimeType: storedScreenshot.mimeType,
            sizeBytes: storedScreenshot.sizeBytes,
          },
        });
      }

      const freshTeam = await tx.team.findUniqueOrThrow({
        where: { id: team.id },
        select: ADMIN_TEAM_SELECT,
      });

      return { createdTeam: freshTeam, regIdForEmail: generatedRegId };
    });

    // ─── Post-creation emails ────────────────────────────────────────────────
    if (wantApproved && regIdForEmail) {
      // Send approval emails with digital pass links to all members
      const baseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "";
      const allMembers = await db.participant.findMany({
        where: { teamId: createdTeam.id },
        select: { email: true, qrToken: true, fullName: true, participantId: true, isLeader: true },
      });

      if (baseUrl) {
        for (const member of allMembers) {
          if (!member.email || !member.qrToken) continue;
          const passUrl = `${baseUrl}/pass/${member.qrToken}`;
          sendEmail({
            to: member.email,
            subject: "Hackmitten 3.0 — Team Approved",
            html: approvalEmailHtml({
              participantName: member.fullName,
              teamName: createdTeam.teamName,
              registrationId: regIdForEmail,
              participantId: member.participantId ?? "",
              passUrl,
              whatsappGroupUrl: "https://chat.whatsapp.com/CKjNXeNALPzAymQ0GhfMCj",
            }),
            text: approvalEmailText({
              participantName: member.fullName,
              teamName: createdTeam.teamName,
              registrationId: regIdForEmail,
              participantId: member.participantId ?? "",
              passUrl,
              whatsappGroupUrl: "https://chat.whatsapp.com/CKjNXeNALPzAymQ0GhfMCj",
            }),
          }).catch((err) => {
            console.error("[admin/teams] Failed to send approval email to member:", member.email, err);
          });
        }
      }
    } else if (!wantApproved) {
      // Send acknowledgement email to team leader
      attemptRegistrationAcknowledgement(createdTeam.id).catch((err) => {
        console.error("[admin/teams] Failed to send registration acknowledgement:", err);
      });
    }

    return NextResponse.json({ team: sanitizeAdminTeam(createdTeam) }, { status: 201 });
  } catch (err) {
    // Clean up stored files if the transaction or handler failed
    await Promise.allSettled(storedFiles.map(deletePrivateFile));
    return jsonError(err);
  }
}
