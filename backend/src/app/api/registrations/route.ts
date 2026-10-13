import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeRegistrationMembers, registrationSchema } from "@/lib/validators";
import { jsonError } from "@/lib/api-auth";
import { computeEventState, getEventState } from "@/lib/event-state";
import { normalizeTeamName } from "@/lib/team-name";
import { attemptRegistrationAcknowledgement } from "@/lib/registration-acknowledgement";
import { deletePrivateFile, storeParticipantImage, UploadError } from "@/lib/upload";
import { createRegistrationAccessToken, hashRegistrationAccessToken, registrationAccessCookieName, REGISTRATION_ACCESS_COOKIE_MAX_AGE_SECONDS } from "@/lib/registration-access";
import { generateQrToken } from "@/lib/constants";
import bcrypt from "bcryptjs";
import { sendNewTeamAdminAlertEmail } from "@/lib/email";
import { generateSimpleParticipantPassword } from "@/lib/auth";

type RawQueryClient = Pick<typeof db, "$queryRaw">;

async function findTeamWithNormalizedName(client: RawQueryClient, normalizedName: string) {
  const matches = await client.$queryRaw<Array<{ teamName: string }>>`
    SELECT "teamName"
    FROM "Team"
    WHERE lower(regexp_replace(trim("teamName"), '\\s+', ' ', 'g')) = ${normalizedName}
    LIMIT 1
  `;
  return matches[0] ?? null;
}

/**
 * POST /api/registrations
 * Create a new team registration (status = SUBMITTED).
 * Enforces:
 *   - registrationsOpen toggle (EventConfig) — if false, returns 403
 *   - Registration capacity (EventConfig) — if at capacity, returns 403
 *   - 3-4 members
 *   - First member is the sole team leader
 *   - College name required on every member
 *   - No duplicate member emails within the team
 *   - Unique team name (DB constraint)
 */
export async function POST(req: Request) {
  const storedParticipantImages: Array<{ relativePath: string; mimeType: string; sizeBytes: number }> = [];
  try {
    // ─── Event lifecycle enforcement ───────────────────────────────────
    const eventState = await getEventState();
    if (!eventState.registrationOpen) {
      return NextResponse.json(
        { error: eventState.registrationMessage || "Registration is closed.", code: "REG_CLOSED" },
        { status: 403 },
      );
    }

    // ─── registrationsOpen toggle (manual close) ─────────────────────────
    if (!eventState.registrationsOpen) {
      return NextResponse.json(
        { error: "Registrations are currently closed.", code: "REG_CLOSED_MANUAL" },
        { status: 403 },
      );
    }

    // ─── Capacity check (atomic with team creation via transaction) ─────
    if (eventState.registrationCapacity > 0 && eventState.currentCount >= eventState.registrationCapacity) {
      return NextResponse.json(
        { error: "Registration is full. All spots have been taken.", code: "REG_FULL" },
        { status: 403 },
      );
    }

    const contentLength = Number(req.headers.get("content-length") ?? 0);
    // Support multipart registrations with member avatars and metadata
    if (contentLength > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "Registration upload is too large." }, { status: 413 });
    }
    let body: unknown;
    const files: Array<File | null> = [];
    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      try {
        const form = await req.formData();
        const registration = form.get("registration");
        if (typeof registration !== "string") return NextResponse.json({ error: "Registration details are required." }, { status: 400 });
        body = JSON.parse(registration);
        for (let i = 0; i < 4; i++) {
          const value = form.get(`participantImage${i}`);
          if (value !== null && !(value instanceof File)) return NextResponse.json({ error: "Invalid participant image upload." }, { status: 400 });
          files.push(value instanceof File && value.size > 0 ? value : null);
        }
        if ([...form.keys()].some((key) => key.startsWith("participantImage") && !/^participantImage[0-3]$/.test(key))) {
          return NextResponse.json({ error: "Invalid participant image field." }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ error: "Malformed registration upload." }, { status: 400 });
      }
    } else {
      body = await req.json();
    }
    const parsed = registrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const { teamName, college } = parsed.data;
    const members = normalizeRegistrationMembers(parsed.data.members);
    if (files.some((file, index) => file && index >= members.length)) {
      return NextResponse.json({ error: "Image supplied for a missing team member." }, { status: 400 });
    }
    const normalizedTeamName = normalizeTeamName(teamName);
    if (normalizedTeamName.length < 2) {
      return NextResponse.json(
        { error: "Team name must be at least 2 characters long." },
        { status: 400 },
      );
    }

    // Check team name uniqueness (explicit error message for the user)
    const existing = await findTeamWithNormalizedName(db, normalizedTeamName);
    if (existing) {
      return NextResponse.json(
        { error: "Team name already exists. Please choose a different team name.", code: "TEAM_NAME_TAKEN" },
        { status: 409 },
      );
    }

    const degree = parsed.data.degree ?? null;

    // Check category-specific limits (Diploma capacity limit)
    if (degree === "Diploma") {
      const eventCfg = await db.eventConfig.findUnique({ where: { id: "singleton" } });
      if (eventCfg?.diplomaRegistrationLimit && eventCfg.diplomaRegistrationLimit > 0) {
        const diplomaCount = await db.team.count({ where: { degree: "Diploma" } });
        if (diplomaCount >= eventCfg.diplomaRegistrationLimit) {
          return NextResponse.json(
            { error: "Diploma category registration is full. All spots have been filled.", code: "DIPLOMA_REG_FULL" },
            { status: 403 },
          );
        }
      }
    }

    const domainId = parsed.data.domainId ?? null;
    let domainRecord: { id: string; name: string; degrees: string[]; enabled: boolean } | null = null;
    if (domainId) {
      domainRecord = await db.domain.findUnique({ where: { id: domainId } });
      if (!domainRecord || !domainRecord.enabled) {
        return NextResponse.json({ error: "Selected domain is not available." }, { status: 400 });
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

    const participantImages: Array<Awaited<ReturnType<typeof storeParticipantImage>>> = [];
    for (let index = 0; index < members.length; index++) {
      const file = files[index];
      if (!file) {
        return NextResponse.json(
          { error: `Participant photo is required for member ${index + 1} (${members[index].fullName || "Member"}).` },
          { status: 400 },
        );
      }
      const stored = await storeParticipantImage(file);
      storedParticipantImages.push(stored);
      participantImages.push(stored);
    }

    // ─── Transaction: re-check capacity atomically + create team ────────
    // Re-counting inside the transaction prevents the race where two registrations
    // slip through the capacity check simultaneously.
    const registrationAccessToken = createRegistrationAccessToken();
    let team;
    try {
      team = await db.$transaction(async (tx) => {
      // (Removed pg_advisory_xact_lock to support database connection poolers like PgBouncer/Neon/Supabase)
      const existingInTransaction = await findTeamWithNormalizedName(tx, normalizedTeamName);
      if (existingInTransaction) {
        throw new Error("TEAM_NAME_TAKEN");
      }

      const currentCount = await tx.team.count();
      const cfg = await tx.eventConfig.findUnique({ where: { id: "singleton" } });
      if (!cfg) throw new Error("EVENT_CONFIG_MISSING");
      const currentEventState = computeEventState({ ...cfg, currentCount });
      if (currentEventState.state !== "REGISTRATION_OPEN") {
        throw new Error("Registration is closed.");
      }
      const capacity = cfg.registrationLimit;
      const open = cfg.registrationEnabled;
      if (!open) {
        throw new Error("Registrations are currently closed.");
      }
      if (capacity !== null && currentCount >= capacity) {
        throw new Error("Registration is full. All spots have been taken.");
      }

      return tx.team.create({
        data: {
          teamName,
          college: college ?? members[0]?.college ?? null,
          degree: degree ?? null,
          domainId: domainRecord?.id ?? null,
          domainName: domainRecord?.name ?? null,
          status: "SUBMITTED",
          registrationAccessTokenHash: hashRegistrationAccessToken(registrationAccessToken),
          registrationAccessExpiresAt: new Date(Date.now() + REGISTRATION_ACCESS_COOKIE_MAX_AGE_SECONDS * 1000),
          members: {
            create: members.map((m, index) => ({
              fullName: m.fullName,
              email: m.email.toLowerCase().trim(),
              phone: m.phone.trim(),
              college: m.college,
              degree: m.degree || null,
              qrToken: generateQrToken(),
              participantImagePath: participantImages[index]?.relativePath ?? null,
              participantImageMimeType: participantImages[index]?.mimeType ?? null,
              participantImageSizeBytes: participantImages[index]?.sizeBytes ?? null,
              isLeader: m.isLeader,
            })),
          },
        },
        include: { members: true },
      });
      });
    } catch (error) {
      await Promise.all(storedParticipantImages.map((file) => deletePrivateFile(file.relativePath)));
      throw error;
    }

    // ─── Generate Simple Participant Login Password (Leader starting 4 letters + 4 digits) ───
    const leader = team.members.find((m) => m.isLeader) || team.members[0];
    const generatedPassword = generateSimpleParticipantPassword(leader?.fullName);

    // Save simple password on Team record
    await db.team.update({
      where: { id: team.id },
      data: { participantPassword: generatedPassword },
    });

    if (leader) {
      const leaderEmail = leader.email.toLowerCase().trim();
      const passwordHash = await bcrypt.hash(generatedPassword, 10);
      await db.user.upsert({
        where: { email: leaderEmail },
        update: {
          role: "PARTICIPANT",
          passwordHash,
          name: leader.fullName,
        },
        create: {
          email: leaderEmail,
          username: leaderEmail,
          name: leader.fullName,
          role: "PARTICIPANT",
          passwordHash,
        },
      }).catch((e) => console.warn("[registrations] leader user upsert non-blocking error:", e));
    }

    // ─── Send Acknowledgement Email with Login Credentials to Team Members ───
    const acknowledgementEmailSent = await attemptRegistrationAcknowledgement(team.id);

    // ─── Real-Time Admin Notification Email with Total & Registered Counts ───
    (async () => {
      try {
        const [totalTeams, registeredCount] = await Promise.all([
          db.team.count(),
          db.team.count({
            where: {
              status: { in: ["SUBMITTED", "PAYMENT_PENDING", "PAYMENT_VERIFIED", "APPROVED"] },
            },
          }),
        ]);
        const leaderMember = team.members.find((m) => m.isLeader) || team.members[0];
        await sendNewTeamAdminAlertEmail({
          teamName: team.teamName,
          college: team.college,
          degree: team.degree,
          domainName: team.domainName,
          leaderName: leaderMember?.fullName || "Team Leader",
          leaderEmail: leaderMember?.email || "N/A",
          leaderPhone: leaderMember?.phone || "N/A",
          memberCount: team.members.length,
          members: team.members.map((m) => ({
            fullName: m.fullName,
            email: m.email,
            phone: m.phone,
            degree: m.degree,
            college: m.college,
            isLeader: m.isLeader,
          })),
          teamId: team.id,
          password: generatedPassword,
          totalTeams,
          registeredCount,
        });
      } catch (adminMailErr) {
        console.warn("[registrations] admin new team notification non-blocking error:", adminMailErr);
      }
    })().catch(() => {});

    const {
      registrationAccessTokenHash: _registrationAccessTokenHash,
      registrationAccessExpiresAt: _registrationAccessExpiresAt,
      ...teamWithoutAccessHash
    } = team;
    const publicTeam = {
      ...teamWithoutAccessHash,
      participantPassword: generatedPassword,
      members: teamWithoutAccessHash.members.map(({ participantImagePath: _path, participantImageMimeType: _mime, participantImageSizeBytes: _size, ...member }) => member),
    };
    const credentials = leader
      ? {
          username: leader.email.toLowerCase().trim(),
          password: generatedPassword,
          teamId: team.id,
        }
      : null;
    const response = NextResponse.json({ team: publicTeam, credentials, acknowledgementEmailSent }, { status: 201 });
    const cookieName = registrationAccessCookieName(team.id);
    if (cookieName) {
      response.cookies.set(cookieName, registrationAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: `/api/registrations/${team.id}`,
        maxAge: REGISTRATION_ACCESS_COOKIE_MAX_AGE_SECONDS,
      });
    }
    return response;
  } catch (err) {
    if (err instanceof UploadError) {
      await Promise.all(storedParticipantImages.map((file) => deletePrivateFile(file.relativePath)));
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    if (storedParticipantImages.length) {
      await Promise.all(storedParticipantImages.map((file) => deletePrivateFile(file.relativePath)));
    }
    if (err instanceof Error && err.message === "TEAM_NAME_TAKEN") {
      return NextResponse.json(
        { error: "Team name already exists. Please choose a different team name.", code: "TEAM_NAME_TAKEN" },
        { status: 409 },
      );
    }
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return NextResponse.json(
        { error: "Team name already exists. Please choose a different team name.", code: "TEAM_NAME_TAKEN" },
        { status: 409 },
      );
    }
    // Surface our capacity/close errors as 403, otherwise default jsonError handling
    if (err instanceof Error && err.message === "EVENT_CONFIG_MISSING") {
      return NextResponse.json({ error: "Registration is temporarily unavailable." }, { status: 503 });
    }
    if (err instanceof Error && (err.message === "Registrations are currently closed." || err.message === "Registration is closed." || err.message === "Registration is full. All spots have been taken.")) {
      const code = err.message === "Registration is full. All spots have been taken."
        ? "REG_FULL"
        : err.message === "Registration is closed." ? "REG_CLOSED" : "REG_CLOSED_MANUAL";
      return NextResponse.json({ error: err.message, code }, { status: 403 });
    }
    return jsonError(err);
  }
}

/**
 * GET /api/registrations/check-team-name?name=...
 * Public endpoint — checks if a team name is available (for live validation in the registration form).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const name = url.searchParams.get("name") ?? "";
  const normalizedName = normalizeTeamName(name);
  if (normalizedName.length < 2) {
    return NextResponse.json({ available: false, reason: "too-short" });
  }
  try {
    const existing = await findTeamWithNormalizedName(db, normalizedName);
    return NextResponse.json(existing ? { available: false, reason: "taken" } : { available: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to verify team name availability." },
      { status: 500 },
    );
  }
}
