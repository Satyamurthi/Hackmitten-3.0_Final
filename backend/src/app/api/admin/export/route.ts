import { db } from "@/lib/db";
import { requirePermission, jsonError } from "@/lib/api-auth";
import { csvDocument } from "@/lib/csv";
import { ADMIN_EXPORT_TEAM_SELECT, adminExportRows } from "@/lib/admin-export";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("export:data");
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all";

    let csvText = "";
    let filename = "hackmitten-export";

    if (type === "participants") {
      const participants = await db.participant.findMany({
        orderBy: [{ teamId: "asc" }, { isLeader: "desc" }, { createdAt: "asc" }],
        include: { team: { select: { teamName: true, status: true } } }
      });
      const rows = [
        ["id", "fullName", "email", "phone", "college", "degree", "isLeader", "passVerified", "teamName", "teamStatus", "createdAt"]
      ];
      for (const p of participants) {
        rows.push([
          p.id, p.fullName, p.email, p.phone, p.college, p.degree || "", String(p.isLeader), String(p.passVerified),
          p.team.teamName, p.team.status, p.createdAt.toISOString()
        ]);
      }
      csvText = csvDocument(rows);
      filename = "participants";
    } else if (type === "food") {
      const checkins = await db.foodCheckIn.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          meal: { select: { name: true, type: true } },
          participant: { select: { fullName: true, email: true, team: { select: { teamName: true } } } }
        }
      });
      const rows = [
        ["id", "mealName", "mealType", "participantName", "participantEmail", "teamName", "scannedBy", "timestamp"]
      ];
      for (const c of checkins) {
        rows.push([
          c.id, c.meal.name, c.meal.type, c.participant.fullName, c.participant.email, c.participant.team.teamName,
          c.checkedInById, c.createdAt.toISOString()
        ]);
      }
      csvText = csvDocument(rows);
      filename = "food-checkins";
    } else {
      // Default: Master export
      const teams = await db.team.findMany({
        select: ADMIN_EXPORT_TEAM_SELECT,
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      });
      csvText = csvDocument(adminExportRows(teams));
      filename = "registrations";
    }

    return new Response(csvText, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": `attachment; filename="hackmitten-${filename}-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    return jsonError(err);
  }
}
