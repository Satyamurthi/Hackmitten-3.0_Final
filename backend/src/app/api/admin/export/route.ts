import { db } from "@/lib/db";
import { requireSession, jsonError } from "@/lib/api-auth";
import { can, PermissionError } from "@/lib/permissions";
import { csvDocument } from "@/lib/csv";
import { ADMIN_EXPORT_TEAM_SELECT, adminExportRows } from "@/lib/admin-export";
import { NextRequest } from "next/server";
import type { Prisma, PaymentStatus, RegistrationStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireSession();
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || "all").toLowerCase();

    const hasExportPermission = can(ctx.role, "export:data");
    const hasFoodPermission = can(ctx.role, "food:view");

    if (!hasExportPermission && !(type === "food" && hasFoodPermission)) {
      throw new PermissionError("Forbidden: missing export permission");
    }

    // Common filter parameters
    const q = searchParams.get("q")?.trim() || "";
    const status = searchParams.get("status") || searchParams.get("teamStatus") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const college = searchParams.get("college")?.trim() || "";
    const mealId = searchParams.get("mealId")?.trim() || "";
    const from = searchParams.get("from")?.trim() || "";
    const to = searchParams.get("to")?.trim() || "";

    let csvText = "";
    let filename = "hackmitten-export";

    // ─────────────────────────────────────────────────────────────────────────────
    // 1. DEDICATED PAYMENT DETAILS EXPORT (WITH TEAM ID)
    // ─────────────────────────────────────────────────────────────────────────────
    if (type === "payments" || type === "payment") {
      const where: Prisma.TeamWhereInput = {};

      if (paymentStatus && paymentStatus !== "ALL") {
        where.payment = { status: paymentStatus as PaymentStatus };
      }
      if (status && status !== "ALL") {
        where.status = status as RegistrationStatus;
      }
      if (college && college !== "ALL") {
        where.college = { contains: college, mode: "insensitive" };
      }
      if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt.gte = new Date(from);
        if (to) {
          const toDate = new Date(to);
          toDate.setHours(23, 59, 59, 999);
          where.createdAt.lte = toDate;
        }
      }
      if (q) {
        where.OR = [
          { id: { contains: q, mode: "insensitive" } },
          { teamName: { contains: q, mode: "insensitive" } },
          { registrationId: { contains: q, mode: "insensitive" } },
          { college: { contains: q, mode: "insensitive" } },
          { payment: { transactionId: { contains: q, mode: "insensitive" } } },
          { members: { some: { fullName: { contains: q, mode: "insensitive" } } } },
          { members: { some: { email: { contains: q, mode: "insensitive" } } } },
          { members: { some: { phone: { contains: q, mode: "insensitive" } } } },
        ];
      }

      const teams = await db.team.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        include: {
          payment: {
            include: {
              verifiedBy: { select: { name: true, email: true } },
              _count: { select: { screenshots: true } },
            },
          },
          members: {
            orderBy: [{ isLeader: "desc" }, { createdAt: "asc" }],
          },
        },
      });

      const rows: string[][] = [
        [
          "Team ID",
          "Registration ID",
          "Team Name",
          "College",
          "Leader Name",
          "Leader Email",
          "Leader Phone",
          "Member Count",
          "Payment ID",
          "Transaction ID",
          "Payment Status",
          "Team Status",
          "Screenshots Uploaded",
          "Verified By",
          "Verified At",
          "Registration Date",
        ],
      ];

      for (const t of teams) {
        const leader = t.members.find((m) => m.isLeader) || t.members[0];
        rows.push([
          t.id,
          t.registrationId ?? "",
          t.teamName,
          t.college ?? leader?.college ?? "",
          leader?.fullName ?? "",
          leader?.email ?? "",
          leader?.phone ?? "",
          String(t.members.length),
          t.payment?.id ?? "",
          t.payment?.transactionId ?? "",
          t.payment?.status ?? "NO_PAYMENT",
          t.status,
          String(t.payment?._count?.screenshots ?? 0),
          t.payment?.verifiedBy?.name || t.payment?.verifiedBy?.email || "",
          t.payment?.verifiedAt ? t.payment.verifiedAt.toISOString() : "",
          t.createdAt.toISOString(),
        ]);
      }

      csvText = csvDocument(rows);
      filename = `payments${paymentStatus && paymentStatus !== "ALL" ? `-${paymentStatus.toLowerCase()}` : ""}`;

    // ─────────────────────────────────────────────────────────────────────────────
    // 2. FOOD CHECK-INS EXPORT (WITH MEAL & SEARCH FILTERS)
    // ─────────────────────────────────────────────────────────────────────────────
    } else if (type === "food") {
      const foodWhere: Prisma.FoodCheckInWhereInput = {};

      if (mealId && mealId !== "ALL") {
        foodWhere.mealId = mealId;
      }
      if (from || to) {
        foodWhere.createdAt = {};
        if (from) foodWhere.createdAt.gte = new Date(from);
        if (to) {
          const toDate = new Date(to);
          toDate.setHours(23, 59, 59, 999);
          foodWhere.createdAt.lte = toDate;
        }
      }
      if (q) {
        foodWhere.OR = [
          { participant: { fullName: { contains: q, mode: "insensitive" } } },
          { participant: { email: { contains: q, mode: "insensitive" } } },
          { participant: { phone: { contains: q, mode: "insensitive" } } },
          { participant: { participantId: { contains: q, mode: "insensitive" } } },
          { participant: { team: { teamName: { contains: q, mode: "insensitive" } } } },
          { participant: { team: { id: { contains: q, mode: "insensitive" } } } },
          { participant: { college: { contains: q, mode: "insensitive" } } },
        ];
      }

      const checkins = await db.foodCheckIn.findMany({
        where: foodWhere,
        orderBy: { createdAt: "desc" },
        include: {
          meal: { select: { id: true, label: true, type: true, date: true } },
          participant: {
            select: {
              id: true,
              participantId: true,
              fullName: true,
              email: true,
              phone: true,
              college: true,
              isLeader: true,
              team: { select: { id: true, teamName: true, registrationId: true } },
            },
          },
          checkedInBy: { select: { name: true, email: true } },
        },
      });

      const rows: string[][] = [
        [
          "CheckIn ID",
          "Meal ID",
          "Meal Name",
          "Meal Type",
          "Meal Date",
          "Participant ID",
          "Participant Name",
          "Participant Email",
          "Participant Phone",
          "Team ID",
          "Team Name",
          "College",
          "Role",
          "Scanned By",
          "Checked In At",
        ],
      ];

      for (const c of checkins) {
        rows.push([
          c.id,
          c.meal.id,
          c.meal.label,
          c.meal.type,
          c.meal.date ?? "",
          c.participant.participantId ?? "",
          c.participant.fullName,
          c.participant.email,
          c.participant.phone,
          c.participant.team.id,
          c.participant.team.teamName,
          c.participant.college,
          c.participant.isLeader ? "Team Leader" : "Member",
          c.checkedInBy?.name || c.checkedInBy?.email || c.checkedInById,
          c.createdAt.toISOString(),
        ]);
      }

      csvText = csvDocument(rows);
      filename = `food-checkins${mealId && mealId !== "ALL" ? `-meal` : ""}`;

    // ─────────────────────────────────────────────────────────────────────────────
    // 3. PARTICIPANTS EXPORT
    // ─────────────────────────────────────────────────────────────────────────────
    } else if (type === "participants") {
      const partWhere: Prisma.ParticipantWhereInput = {};
      if (college && college !== "ALL") {
        partWhere.college = { contains: college, mode: "insensitive" };
      }
      if (status && status !== "ALL") {
        partWhere.team = { status: status as RegistrationStatus };
      }
      if (q) {
        partWhere.OR = [
          { fullName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
          { participantId: { contains: q, mode: "insensitive" } },
          { team: { teamName: { contains: q, mode: "insensitive" } } },
          { team: { id: { contains: q, mode: "insensitive" } } },
        ];
      }

      const participants = await db.participant.findMany({
        where: partWhere,
        orderBy: [{ teamId: "asc" }, { isLeader: "desc" }, { createdAt: "asc" }],
        include: { team: { select: { id: true, teamName: true, status: true, registrationId: true } } },
      });

      const rows: string[][] = [
        [
          "Participant ID",
          "Team ID",
          "Registration ID",
          "Team Name",
          "Full Name",
          "Email",
          "Phone",
          "College",
          "Degree",
          "Is Leader",
          "Pass Verified",
          "Team Status",
          "Registered At",
        ],
      ];

      for (const p of participants) {
        rows.push([
          p.participantId ?? p.id,
          p.team.id,
          p.team.registrationId ?? "",
          p.team.teamName,
          p.fullName,
          p.email,
          p.phone,
          p.college,
          p.degree || "",
          String(p.isLeader),
          String(p.passVerified),
          p.team.status,
          p.createdAt.toISOString(),
        ]);
      }

      csvText = csvDocument(rows);
      filename = "participants";

    // ─────────────────────────────────────────────────────────────────────────────
    // 4. MASTER TEAM & REGISTRATIONS EXPORT (WITH FILTERS)
    // ─────────────────────────────────────────────────────────────────────────────
    } else {
      const where: Prisma.TeamWhereInput = {};

      if (paymentStatus && paymentStatus !== "ALL") {
        where.payment = { status: paymentStatus as PaymentStatus };
      }
      if (status && status !== "ALL") {
        where.status = status as RegistrationStatus;
      }
      if (college && college !== "ALL") {
        where.college = { contains: college, mode: "insensitive" };
      }
      if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt.gte = new Date(from);
        if (to) {
          const toDate = new Date(to);
          toDate.setHours(23, 59, 59, 999);
          where.createdAt.lte = toDate;
        }
      }
      if (q) {
        where.OR = [
          { id: { contains: q, mode: "insensitive" } },
          { teamName: { contains: q, mode: "insensitive" } },
          { registrationId: { contains: q, mode: "insensitive" } },
          { college: { contains: q, mode: "insensitive" } },
          { payment: { transactionId: { contains: q, mode: "insensitive" } } },
          { members: { some: { fullName: { contains: q, mode: "insensitive" } } } },
          { members: { some: { email: { contains: q, mode: "insensitive" } } } },
          { members: { some: { phone: { contains: q, mode: "insensitive" } } } },
        ];
      }

      const teams = await db.team.findMany({
        where,
        select: ADMIN_EXPORT_TEAM_SELECT,
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      });

      csvText = csvDocument(adminExportRows(teams));
      filename = "registrations";
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    return new Response(csvText, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": `attachment; filename="hackmitten-${filename}-${timestamp}.csv"`,
      },
    });
  } catch (err) {
    return jsonError(err);
  }
}
