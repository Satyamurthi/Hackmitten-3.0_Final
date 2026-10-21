/**
 * Hackmitten 3.0 — Canva Bulk Create Exporter
 *
 * Exports participant details to CSV and saves high-res QR code images
 * for direct use with Canva's "Bulk Create" app.
 *
 * Usage:
 *   bun run scripts/export_canva_csv.ts
 */

import QRCode from "qrcode";
import fs from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function escapeCsv(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function formatCollege(col: string | null | undefined): string {
  if (!col) return "Maharaja Institute of Technology Thandavapura";
  const trimmed = col.trim();
  if (trimmed.toLowerCase() === "mitt") {
    return "Maharaja Institute of Technology Thandavapura";
  }
  if (trimmed === trimmed.toLowerCase()) {
    return trimmed.replace(/\b\w/g, (l) => l.toUpperCase());
  }
  return trimmed;
}

async function main() {
  console.log("→ Exporting participant data for Canva Bulk Create...\n");

  const outDir = path.resolve("./output/canva");
  const qrDir = path.join(outDir, "qrcodes");
  await fs.mkdir(qrDir, { recursive: true });

  const participants = await db.participant.findMany({
    where: {
      team: { status: "APPROVED" },
    },
    include: { team: true },
    orderBy: [{ team: { registrationId: "asc" } }, { createdAt: "asc" }],
  });

  const csvRows: string[] = [
    "FullName,College,TeamName,TeamId,ParticipantId,QRCodeFileName",
  ];

  for (const p of participants) {
    const pid = p.participantId || `HM3-${p.id.slice(0, 6)}`;
    const teamRegId = p.team.registrationId || "TEAM";
    const qrToken = p.qrToken || `HM3-${p.id}`;
    const qrFileName = `${teamRegId}_${pid}_qr.png`;
    const qrFilePath = path.join(qrDir, qrFileName);

    await QRCode.toFile(qrFilePath, qrToken, {
      width: 400,
      margin: 1,
      errorCorrectionLevel: "H",
    });

    csvRows.push([
      escapeCsv(p.fullName.toUpperCase()),
      escapeCsv(formatCollege(p.college)),
      escapeCsv(p.team.teamName.toUpperCase()),
      escapeCsv(pid),
      escapeCsv(pid),
      escapeCsv(qrFileName),
    ].join(","));
  }

  const csvPath = path.join(outDir, "canva_bulk_create.csv");
  await fs.writeFile(csvPath, csvRows.join("\n"), "utf8");

  console.log("========================================================");
  console.log(`✅ Canva export complete for ${participants.length} participants!`);
  console.log(`📄 CSV file:       ${csvPath}`);
  console.log(`🖼️ QR codes folder: ${qrDir}`);
  console.log("========================================================\n");
}

main().finally(() => db.$disconnect());
