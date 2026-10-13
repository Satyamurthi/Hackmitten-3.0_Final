import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission, jsonError } from "@/lib/api-auth";
import { z } from "zod";
import { deletePrivateFile, storeParticipantImage, storePaymentScreenshot } from "@/lib/upload";
import { ADMIN_TEAM_SELECT } from "@/lib/admin-team-view";
import { sendParticipantUpdateEmail, ParticipantUpdateChange, sendEmail, approvalEmailHtml, approvalEmailText, sendCredentialsEmailToTeam } from "@/lib/email";
import { GMAIL_REGEX } from "@/lib/validators";
import bcrypt from "bcryptjs";
import {
  generateQrToken,
  generateRegistrationId,
  generateParticipantId,
  nextRegistrationSequence,
} from "@/lib/constants";
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
 * GET /api/admin/teams/:id
 * Fetches single team details for admin editing and viewing.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("registration:view");
    const { id } = await params;
    const team = await db.team.findUnique({
      where: { id },
      select: ADMIN_TEAM_SELECT,
    });
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
    return NextResponse.json({ team: sanitizeAdminTeam(team) });
  } catch (err) {
    return jsonError(err);
  }
}

/**
 * PATCH /api/admin/teams/:id
 * Edit a team (name, college, member info, status, payment). SUPER_ADMIN only.
 * Supports JSON or multipart/form-data.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const newUploadedFiles: string[] = [];
  try {
    const ctx = await requirePermission("team:approve");
    const { id } = await params;

    let body: any = {};
    const memberFiles: (File | null)[] = [];
    let paymentScreenshotFile: File | null = null;

    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      const form = await req.formData();
      const rawPayload = form.get("registration") || form.get("team");
      if (typeof rawPayload !== "string") {
        return NextResponse.json({ error: "Missing team payload in upload." }, { status: 400 });
      }
      try {
        body = JSON.parse(rawPayload);
      } catch {
        return NextResponse.json({ error: "Malformed JSON payload in upload." }, { status: 400 });
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
      body = await req.json();
    }

    const team = await db.team.findUnique({
      where: { id },
      include: { members: true, payment: { include: { screenshots: true } } },
    });
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    // Update team name + college + status + degree + domain + credentials
    const updateData: {
      teamName?: string;
      college?: string | null;
      status?: "SUBMITTED" | "APPROVED";
      degree?: string | null;
      domainId?: string | null;
      domainName?: string | null;
      participantPassword?: string | null;
      loginUsername?: string | null;
    } = {};

    const assignedPassword = (
      typeof body.participantPassword === "string" && body.participantPassword.trim()
        ? body.participantPassword.trim()
        : typeof body.password === "string" && body.password.trim()
        ? body.password.trim()
        : undefined
    );
    if (assignedPassword !== undefined) {
      updateData.participantPassword = assignedPassword;
    }

    const assignedUsername = (
      typeof body.loginUsername === "string" && body.loginUsername.trim()
        ? body.loginUsername.trim().toLowerCase()
        : typeof body.username === "string" && body.username.trim()
        ? body.username.trim().toLowerCase()
        : undefined
    );
    if (assignedUsername !== undefined) {
      updateData.loginUsername = assignedUsername;
    }
    if (body.teamName && body.teamName.trim() !== team.teamName) {
      const norm = normalizeTeamName(body.teamName);
      const matches = await db.$queryRaw<Array<{ id: string }>>`
        SELECT "id"
        FROM "Team"
        WHERE lower(regexp_replace(trim("teamName"), '\\s+', ' ', 'g')) = ${norm}
          AND "id" != ${id}
        LIMIT 1
      `;
      if (matches.length > 0) {
        return NextResponse.json({ error: "That team name is already in use." }, { status: 409 });
      }
      updateData.teamName = body.teamName.trim();
    }
    if (body.college !== undefined) updateData.college = body.college.trim() || null;

    if (body.degree !== undefined) {
      const deg = body.degree ? String(body.degree).trim() : null;
      if (deg && !["Diploma", "UG", "PG"].includes(deg)) {
        return NextResponse.json({ error: "Invalid degree category. Must be Diploma, UG, or PG." }, { status: 400 });
      }
      updateData.degree = deg;
    }

    if (body.domainId !== undefined) {
      const dId = body.domainId ? String(body.domainId).trim() : null;
      if (dId) {
        const dom = await db.domain.findUnique({ where: { id: dId } });
        if (!dom) {
          return NextResponse.json({ error: "Domain not found" }, { status: 400 });
        }
        const effectiveDegree = updateData.degree !== undefined ? updateData.degree : team.degree;
        if (effectiveDegree && !dom.degrees.includes(effectiveDegree)) {
          return NextResponse.json(
            { error: `Domain '${dom.name}' is not compatible with degree '${effectiveDegree}'.` },
            { status: 400 },
          );
        }
        updateData.domainId = dom.id;
        updateData.domainName = dom.name;
      } else {
        const effectiveDegree = updateData.degree !== undefined ? updateData.degree : team.degree;
        if (effectiveDegree) {
          const activeDomainsCount = await db.domain.count({
            where: { degrees: { has: effectiveDegree }, enabled: true },
          });
          if (activeDomainsCount > 0) {
            return NextResponse.json(
              { error: `Please select an applicable competition domain for ${effectiveDegree}.` },
              { status: 400 },
            );
          }
        }
        updateData.domainId = null;
        updateData.domainName = null;
      }
    } else if (updateData.degree !== undefined && updateData.degree !== team.degree) {
      if (team.domainId && updateData.degree) {
        const curDom = await db.domain.findUnique({ where: { id: team.domainId } });
        if (curDom && !curDom.degrees.includes(updateData.degree)) {
          return NextResponse.json(
            { error: `Current domain '${curDom.name}' is not compatible with '${updateData.degree}'. Please select a valid domain.` },
            { status: 400 },
          );
        }
      }
    }

    const teamNameChanged = Boolean(updateData.teamName && updateData.teamName !== team.teamName);
    const collegeChanged = Boolean(updateData.college !== undefined && updateData.college !== team.college);
    const effectiveTeamName = updateData.teamName || team.teamName;

    const emailNotifications: Array<{
      to: string;
      participantName: string;
      teamName: string;
      changes: ParticipantUpdateChange[];
    }> = [];

    const oldFilesToDelete: string[] = [];

    // Update members if provided
    let parsedMembers: any[] | null = null;
    if (Array.isArray(body.members)) {
      const membersSchema = z
        .array(
          z.object({
            id: z.string().optional(),
            fullName: z.string().min(2, "Full name must be at least 2 characters").max(100).regex(/^[^\d]*$/, "Name cannot contain numbers"),
            email: z.string().trim().regex(GMAIL_REGEX, "Email must be a valid @gmail.com address"),
            phone: z.string().trim().regex(/^[6-9][0-9]{9}$/, "Phone must be a valid 10-digit Indian mobile number"),
            college: z.string().min(2, "College name must be at least 2 characters").max(150).regex(/^[^\d]*$/, "College name cannot contain numbers"),
            degree: z.string().trim().min(1, "Degree is required").max(60),
            isLeader: z.boolean().optional(),
          })
        )
        .min(3, "Minimum 3 members required")
        .max(4, "Maximum 4 members allowed")
        .superRefine((membersList, ctxRef) => {
          const emails = membersList.map((m) => m.email.toLowerCase().trim());
          const seen = new Set<string>();
          emails.forEach((email, idx) => {
            if (seen.has(email)) {
              ctxRef.addIssue({
                code: z.ZodIssueCode.custom,
                path: [idx, "email"],
                message: "Duplicate email within team",
              });
            }
            seen.add(email);
          });
        });

      const parsed = membersSchema.safeParse(body.members);
      if (!parsed.success) {
        const issuesSummary = parsed.error.issues
          .map((i) => {
            const p = i.path.join(".");
            return p ? `${p}: ${i.message}` : i.message;
          })
          .join(" | ");
        return NextResponse.json({ error: issuesSummary || "Invalid members", issues: parsed.error.issues }, { status: 400 });
      }
      parsedMembers = parsed.data;

      const newMemberIds = parsedMembers.filter((m) => m.id).map((m) => m.id!);
      const currentMemberIds = new Set(team.members.map((member) => member.id));
      if (new Set(newMemberIds).size !== newMemberIds.length || newMemberIds.some((memberId) => !currentMemberIds.has(memberId))) {
        return NextResponse.json({ error: "Member IDs must be unique and belong to this team" }, { status: 400 });
      }
      if ((team.registrationId || team.status === "APPROVED") && newMemberIds.length !== team.members.length) {
        return NextResponse.json(
          { error: "Members cannot be added or removed after passes are issued" },
          { status: 409 },
        );
      }

      // Collect change log for participant update emails
      for (const newM of parsedMembers) {
        const changes: ParticipantUpdateChange[] = [];
        const oldM = newM.id ? team.members.find((m) => m.id === newM.id) : null;

        if (teamNameChanged) {
          changes.push({ field: "Team Name", from: team.teamName, to: effectiveTeamName });
        }

        if (oldM) {
          if (oldM.fullName !== newM.fullName) {
            changes.push({ field: "Full Name", from: oldM.fullName, to: newM.fullName });
          }
          if (oldM.email.toLowerCase() !== newM.email.toLowerCase()) {
            changes.push({ field: "Email Address", from: oldM.email, to: newM.email });
          }
          if (oldM.phone !== newM.phone) {
            changes.push({ field: "Phone Number", from: oldM.phone, to: newM.phone });
          }
          if (oldM.college !== newM.college) {
            changes.push({ field: "College", from: oldM.college, to: newM.college });
          }
          if ((oldM.degree || "") !== (newM.degree || "")) {
            changes.push({ field: "Degree", from: oldM.degree || "—", to: newM.degree || "—" });
          }
        } else {
          changes.push({ field: "Team Membership", from: "—", to: `Added to ${effectiveTeamName}` });
        }

        if (changes.length > 0) {
          emailNotifications.push({
            to: newM.email.trim(),
            participantName: newM.fullName,
            teamName: effectiveTeamName,
            changes,
          });
          if (oldM && oldM.email.toLowerCase() !== newM.email.toLowerCase()) {
            emailNotifications.push({
              to: oldM.email.trim(),
              participantName: oldM.fullName,
              teamName: effectiveTeamName,
              changes,
            });
          }
        }
      }
    }

    // Process new member images
    const storedMemberImages: Array<{ relativePath: string; mimeType: string } | null> = [];
    if (parsedMembers) {
      for (let i = 0; i < parsedMembers.length; i++) {
        const file = memberFiles[i];
        if (file) {
          const stored = await storeParticipantImage(file);
          newUploadedFiles.push(stored.relativePath);
          storedMemberImages.push(stored);
        } else {
          storedMemberImages.push(null);
        }
      }
    }

    // Handle status change request
    const wantApproved = body.status === "APPROVED";
    let needsPassGeneration = false;
    if (wantApproved && team.status !== "APPROVED") {
      updateData.status = "APPROVED";
      needsPassGeneration = true;
    }

    let newlyApprovedRegId: string | null = null;

    // Database transaction
    await db.$transaction(async (tx) => {
      // 1. Update team basic info
      if (Object.keys(updateData).length > 0) {
        await tx.team.update({ where: { id }, data: updateData });
      }

      // 2. Update members if provided
      if (parsedMembers) {
        const newMemberIds = parsedMembers.filter((m) => m.id).map((m) => m.id!);
        // Delete members removed from list
        const removedMembers = team.members.filter((member) => !newMemberIds.includes(member.id));
        for (const rem of removedMembers) {
          if (rem.participantImagePath) oldFilesToDelete.push(rem.participantImagePath);
        }
        await tx.participant.deleteMany({
          where: { teamId: id, id: { notIn: newMemberIds } },
        });

        // Upsert members
        for (let i = 0; i < parsedMembers.length; i++) {
          const m = parsedMembers[i];
          const newImg = storedMemberImages[i];
          const oldM = m.id ? team.members.find((existing) => existing.id === m.id) : null;

          const memberData: any = {
            fullName: m.fullName.trim(),
            email: m.email.toLowerCase().trim(),
            phone: m.phone.trim(),
            college: m.college.trim(),
            degree: m.degree ? m.degree.trim() : null,
            isLeader: typeof m.isLeader === "boolean" ? m.isLeader : i === 0,
          };

          if (newImg) {
            memberData.participantImagePath = newImg.relativePath;
            memberData.participantImageMimeType = newImg.mimeType;
            if (oldM?.participantImagePath) {
              oldFilesToDelete.push(oldM.participantImagePath);
            }
          }

          if (m.id) {
            await tx.participant.update({
              where: { id: m.id },
              data: memberData,
            });
          } else {
            await tx.participant.create({
              data: {
                teamId: id,
                ...memberData,
              },
            });
          }
        }
      }

      // 3. Handle pass generation if transitioning to APPROVED
      if (needsPassGeneration) {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('hackmitten-registration-sequence'))`;
        let regId = team.registrationId;
        if (!regId) {
          const allocatedIds = await tx.team.findMany({
            where: { registrationId: { not: null } },
            select: { registrationId: true },
          });
          const seq = nextRegistrationSequence(allocatedIds.map((row) => row.registrationId));
          regId = generateRegistrationId(seq);
          newlyApprovedRegId = regId;

          await tx.team.update({
            where: { id },
            data: { status: "APPROVED", registrationId: regId },
          });

          const currentMembers = await tx.participant.findMany({
            where: { teamId: id },
            orderBy: [{ isLeader: "desc" }, { createdAt: "asc" }],
          });

          for (let index = 0; index < currentMembers.length; index++) {
            await tx.participant.update({
              where: { id: currentMembers[index].id },
              data: {
                participantId: generateParticipantId(seq, index + 1),
                qrToken: generateQrToken(),
                passVerified: true,
              },
            });
          }
        }
      }

      // 4. Update / create payment record
      const transactionId = typeof body.transactionId === "string" ? body.transactionId.trim() : undefined;
      const paymentStatus = body.paymentStatus || (wantApproved ? "VERIFIED" : undefined);

      let paymentId = team.payment?.id;
      if (team.payment) {
        const paymentUpdate: any = {};
        if (transactionId !== undefined) paymentUpdate.transactionId = transactionId || null;
        if (paymentStatus) {
          paymentUpdate.status = paymentStatus;
          if (paymentStatus === "VERIFIED") {
            paymentUpdate.verifiedById = ctx.userId;
            paymentUpdate.verifiedAt = new Date();
          }
        }
        if (Object.keys(paymentUpdate).length > 0) {
          await tx.payment.update({ where: { id: team.payment.id }, data: paymentUpdate });
        }
      } else if (transactionId || paymentStatus || paymentScreenshotFile) {
        const createdPay = await tx.payment.create({
          data: {
            teamId: id,
            transactionId: transactionId || (wantApproved ? `MANUAL-${newlyApprovedRegId || team.registrationId}` : null),
            status: paymentStatus || (wantApproved ? "VERIFIED" : "SUBMITTED"),
            verifiedById: (paymentStatus === "VERIFIED" || wantApproved) ? ctx.userId : null,
            verifiedAt: (paymentStatus === "VERIFIED" || wantApproved) ? new Date() : null,
          },
        });
        paymentId = createdPay.id;
      }

      // 5. Handle payment screenshot upload
      if (paymentScreenshotFile && paymentId) {
        const storedScreenshot = await storePaymentScreenshot({
          file: paymentScreenshotFile,
          paymentId,
        });
        newUploadedFiles.push(storedScreenshot.relativePath);
        await tx.paymentScreenshot.create({
          data: {
            paymentId,
            fileName: storedScreenshot.fileName,
            filePath: storedScreenshot.relativePath,
            mimeType: storedScreenshot.mimeType,
            sizeBytes: storedScreenshot.sizeBytes,
          },
        });
      }

      // 6. Sync User credentials if password or username was modified
      const currentLeader = parsedMembers?.find((m: any) => m.isLeader) || team.members.find((m) => m.isLeader) || team.members[0];
      const targetLeaderEmail = currentLeader?.email?.toLowerCase().trim();
      if (targetLeaderEmail && (assignedPassword !== undefined || assignedUsername !== undefined)) {
        const passwordToHash = assignedPassword || team.participantPassword || team.registrationId || team.id;
        const passwordHash = await bcrypt.hash(passwordToHash, 10);
        const finalUsername = assignedUsername || updateData.loginUsername || team.loginUsername || targetLeaderEmail;

        await tx.user.upsert({
          where: { email: targetLeaderEmail },
          update: {
            username: finalUsername,
            name: currentLeader.fullName,
            role: "PARTICIPANT",
            passwordHash,
          },
          create: {
            email: targetLeaderEmail,
            username: finalUsername,
            name: currentLeader.fullName,
            role: "PARTICIPANT",
            passwordHash,
          },
        });
      }
    });

    // Cleanup replaced files
    await Promise.allSettled(oldFilesToDelete.map(deletePrivateFile));

    // Send notifications to updated participants
    if (emailNotifications.length > 0) {
      Promise.allSettled(
        emailNotifications.map((notif) =>
          sendParticipantUpdateEmail(notif).catch((err) => {
            console.error("[admin/teams] Failed to send participant update email:", err);
          })
        )
      );
    }

    // Send approval emails if team was newly approved
    if (needsPassGeneration && newlyApprovedRegId) {
      const baseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "";
      const allMembers = await db.participant.findMany({
        where: { teamId: id },
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
              teamName: effectiveTeamName,
              registrationId: newlyApprovedRegId,
              participantId: member.participantId ?? "",
              passUrl,
              whatsappGroupUrl: "https://chat.whatsapp.com/CKjNXeNALPzAymQ0GhfMCj",
            }),
            text: approvalEmailText({
              participantName: member.fullName,
              teamName: effectiveTeamName,
              registrationId: newlyApprovedRegId,
              participantId: member.participantId ?? "",
              passUrl,
              whatsappGroupUrl: "https://chat.whatsapp.com/CKjNXeNALPzAymQ0GhfMCj",
            }),
          }).catch((err) => {
            console.error("[admin/teams] Failed to send approval email on edit:", member.email, err);
          });
        }
      }
    }

    // Send credentials update email if requested or explicitly triggered
    if (body.sendCredentialsEmail === true || (assignedPassword !== undefined && body.sendCredentialsEmail !== false)) {
      const currentLeader = parsedMembers?.find((m: any) => m.isLeader) || team.members.find((m) => m.isLeader) || team.members[0];
      const finalUsername = assignedUsername || updateData.loginUsername || team.loginUsername || currentLeader?.email || "";
      const finalPassword = assignedPassword || updateData.participantPassword || team.participantPassword || team.registrationId || team.id;

      sendCredentialsEmailToTeam({
        teamId: id,
        teamName: effectiveTeamName,
        username: finalUsername,
        password: finalPassword,
      }).catch((err) => {
        console.error("[admin/teams/[id]] Failed to send credentials email on edit:", err);
      });
    }

    const updated = await db.team.findUniqueOrThrow({ where: { id }, select: ADMIN_TEAM_SELECT });

    return NextResponse.json({ team: sanitizeAdminTeam(updated) });
  } catch (err) {
    // If failure happened, clean up newly uploaded files
    await Promise.allSettled(newUploadedFiles.map(deletePrivateFile));
    return jsonError(err);
  }
}

/**
 * DELETE /api/admin/teams/:id
 * Permanently deletes a team and all related records. SUPER_ADMIN only.
 *
 * Handles relationships:
 *   - PaymentScreenshot (cascade from Payment)
 *   - Payment (cascade from Team)
 *   - FoodCheckIn (cascade from Participant)
 *   - Participant (cascade from Team)
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("team:approve");
    const { id } = await params;

    const team = await db.team.findUnique({
      where: { id },
      include: {
        members: true,
        payment: { include: { screenshots: true } },
      },
    });
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });


    // Delete the team — cascades handle participants, payments, screenshots, food check-ins
    await db.team.delete({ where: { id } });
    const privateFiles = [
      ...team.members.map((member) => member.participantImagePath),
      ...(team.payment?.screenshots.map((screenshot) => screenshot.filePath) ?? []),
    ].filter((filePath): filePath is string => Boolean(filePath?.startsWith("private://")));
    await Promise.allSettled(privateFiles.map(deletePrivateFile));

    return NextResponse.json({ success: true });
  } catch (err) {
    return jsonError(err);
  }
}
