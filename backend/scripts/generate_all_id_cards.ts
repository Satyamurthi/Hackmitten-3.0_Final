/**
 * Hackmitten 3.0 — Bulk ID Card Generator
 *
 * Generates Front & Back ID cards for all participants using
 * assets/front.png (624x1072) and assets/back.png (590x1004 scaled to match).
 *
 * Automatically looks for participant photos in:
 *   1. backend/storage/private/<participantImagePath>
 *   2. backend/storage/public/<participantImagePath>
 *   3. backend/storage/photos/<participantId>.(jpg|png|webp)
 *   4. backend/storage/photos/<safeFullName>.(jpg|png|webp)
 *   5. Fallback: Clean vector avatar silhouette
 */

import sharp from "sharp";
import QRCode from "qrcode";
import fs from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
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

function createDefaultAvatarSvg(width: number, height: number): string {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F2F4F7" />
        <stop offset="100%" stop-color="#E2E7ED" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" rx="18" fill="url(#avatarGrad)" />
    <circle cx="${width / 2}" cy="${height * 0.4}" r="${width * 0.22}" fill="#98A2B3" />
    <path d="M ${width * 0.16} ${height * 0.90} C ${width * 0.16} ${height * 0.65}, ${width * 0.84} ${height * 0.65}, ${width * 0.84} ${height * 0.90} Z" fill="#98A2B3" />
  </svg>`;
}

async function findParticipantPhoto(participant: {
  id: string;
  fullName: string;
  participantId?: string | null;
  participantImagePath?: string | null;
}): Promise<string | null> {
  const possiblePaths: string[] = [];

  // 1. Database path
  if (participant.participantImagePath) {
    if (participant.participantImagePath.startsWith("private://")) {
      const fn = participant.participantImagePath.slice("private://".length);
      possiblePaths.push(path.resolve("./storage/private", fn));
    } else if (participant.participantImagePath.startsWith("/api/uploads/")) {
      const fn = participant.participantImagePath.slice("/api/uploads/".length);
      possiblePaths.push(path.resolve("./storage/public", fn));
    }
  }

  // 2. Custom photos folder checks
  const exts = [".jpg", ".jpeg", ".png", ".webp"];
  const ids = [
    participant.participantId,
    participant.id,
    participant.fullName.toLowerCase().replace(/\s+/g, "_"),
    participant.fullName.replace(/\s+/g, ""),
  ].filter(Boolean) as string[];

  for (const id of ids) {
    for (const ext of exts) {
      possiblePaths.push(path.resolve("./storage/photos", `${id}${ext}`));
      possiblePaths.push(path.resolve("./storage/private", `${id}${ext}`));
    }
  }

  for (const p of possiblePaths) {
    try {
      await fs.access(p);
      return p;
    } catch {
      // not found, try next
    }
  }

  return null;
}

async function main() {
  console.log("→ Starting Hackmitten 3.0 ID Card Generation...\n");

  const outDir = path.resolve("./output/id-cards");
  const frontDir = path.join(outDir, "front");
  const backDir = path.join(outDir, "back");
  const combinedDir = path.join(outDir, "combined");

  await fs.mkdir(frontDir, { recursive: true });
  await fs.mkdir(backDir, { recursive: true });
  await fs.mkdir(combinedDir, { recursive: true });
  await fs.mkdir(path.resolve("./storage/photos"), { recursive: true });

  // Get front.png metadata
  const frontMeta = await sharp("assets/front.png").metadata();
  const W = frontMeta.width || 624;
  const H = frontMeta.height || 1072;
  console.log(`Using front template: ${W} x ${H}`);

  const participants = await db.participant.findMany({
    where: {
      team: { status: "APPROVED" },
    },
    include: { team: true },
    orderBy: [{ team: { registrationId: "asc" } }, { createdAt: "asc" }],
  });

  console.log(`Found ${participants.length} approved participants.\n`);

  // Photo frame coordinates on 624x1072 template
  const photoW = 286;
  const photoH = 286;
  const photoTop = 320;
  const photoLeft = Math.round((W - photoW) / 2); // 169
  const roundedCornersSvg = `<svg><rect x="0" y="0" width="${photoW}" height="${photoH}" rx="18" ry="18" /></svg>`;

  let count = 0;
  let photosFoundCount = 0;

  for (const p of participants) {
    count++;
    const safeName = p.fullName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const pid = p.participantId || `HM3-${p.id.slice(0, 6)}`;
    const teamRegId = p.team.registrationId || "TEAM";
    const fileBase = `${teamRegId}_${pid}_${safeName}`;

    // 1. Process Photo
    let photoBuffer: Buffer;
    const localPhotoPath = await findParticipantPhoto(p);

    if (localPhotoPath) {
      photosFoundCount++;
      photoBuffer = await sharp(localPhotoPath)
        .resize(photoW, photoH, { fit: "cover", position: "centre" })
        .composite([{ input: Buffer.from(roundedCornersSvg), blend: "dest-in" }])
        .png()
        .toBuffer();
    } else {
      photoBuffer = await sharp(Buffer.from(createDefaultAvatarSvg(photoW, photoH)))
        .png()
        .toBuffer();
    }

    // 2. Build Front Card
    const name = p.fullName.toUpperCase();
    const college = formatCollege(p.college);
    const teamName = p.team.teamName.toUpperCase();
    const teamId = pid;

    let nameFontSize = 26;
    if (name.length > 25) nameFontSize = 20;
    else if (name.length > 18) nameFontSize = 23;

    let collegeFontSize = 14;
    if (college.length > 38) collegeFontSize = 11;

    let teamFontSize = 17;
    if (teamName.length > 18) teamFontSize = 14;

    const frontOverlaySvg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <!-- Blank out "YOUR NAME" area -->
      <rect x="35" y="626" width="${W - 70}" height="58" fill="#FFFFFF" />
      <!-- Blank out College area -->
      <rect x="35" y="684" width="${W - 70}" height="52" fill="#FFFFFF" />

      <!-- Participant Name -->
      <text x="${W / 2}" y="668" 
            font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" 
            font-size="${nameFontSize}" 
            font-weight="800" 
            fill="#0C111D" 
            text-anchor="middle" 
            letter-spacing="0.5">${escapeXml(name)}</text>

      <!-- College Name -->
      <text x="${W / 2}" y="710" 
            font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" 
            font-size="${collegeFontSize}" 
            font-weight="600" 
            fill="#475467" 
            text-anchor="middle">${escapeXml(college)}</text>

      <!-- Blank out Team Name box compartment -->
      <rect x="42" y="828" width="356" height="74" rx="8" fill="#FFFFFF" />
      <!-- Blank out Team ID box compartment -->
      <rect x="408" y="828" width="174" height="74" rx="8" fill="#FFFFFF" />

      <!-- Team Name Label and Value -->
      <text x="220" y="856" 
            font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" 
            font-size="11" 
            font-weight="700" 
            fill="#98A2B3" 
            text-anchor="middle" 
            letter-spacing="1">TEAM NAME</text>
      <text x="220" y="884" 
            font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" 
            font-size="${teamFontSize}" 
            font-weight="800" 
            fill="#0C111D" 
            text-anchor="middle">${escapeXml(teamName)}</text>

      <!-- Team ID Label and Value -->
      <text x="495" y="856" 
            font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" 
            font-size="11" 
            font-weight="700" 
            fill="#98A2B3" 
            text-anchor="middle" 
            letter-spacing="1">ID NUMBER</text>
      <text x="495" y="884" 
            font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" 
            font-size="14" 
            font-weight="800" 
            fill="#B52A32" 
            text-anchor="middle">${escapeXml(teamId)}</text>
    </svg>`;

    const frontCardBuffer = await sharp("assets/front.png")
      .composite([
        { input: photoBuffer, top: photoTop, left: photoLeft },
        { input: Buffer.from(frontOverlaySvg), top: 0, left: 0 },
      ])
      .png()
      .toBuffer();

    const frontPath = path.join(frontDir, `${fileBase}_front.png`);
    await sharp(frontCardBuffer).toFile(frontPath);

    // 3. Build Back Card (scale back.png to match height H = 1072, width = 624)
    const qrToken = p.qrToken || `HM3-${p.id}`;
    const qrSize = Math.round(176 * (H / 1004));
    const qrBuffer = await QRCode.toBuffer(qrToken, {
      width: qrSize,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H",
    });

    const backScaled = await sharp("assets/back.png")
      .resize(W, H, { fit: "fill" })
      .toBuffer();

    const backPlateTop = Math.round(390 * (H / 1004));
    const backPlateLeft = Math.round(200 * (W / 590));
    const backPlateW = Math.round(190 * (W / 590));
    const backPlateH = Math.round(186 * (H / 1004));

    const backQrTop = Math.round(395 * (H / 1004));
    const backQrLeft = Math.round(207 * (W / 590));

    const backOverlaySvg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${backPlateLeft}" y="${backPlateTop}" width="${backPlateW}" height="${backPlateH}" rx="8" fill="#FFFFFF" />
    </svg>`;

    const backCardBuffer = await sharp(backScaled)
      .composite([
        { input: Buffer.from(backOverlaySvg), top: 0, left: 0 },
        { input: qrBuffer, top: backQrTop, left: backQrLeft },
      ])
      .png()
      .toBuffer();

    const backPath = path.join(backDir, `${fileBase}_back.png`);
    await sharp(backCardBuffer).toFile(backPath);

    // 4. Combined Side-by-Side (Width: W*2 + 40, Height: H + 40)
    const combinedW = W * 2 + 40;
    const combinedH = H + 40;
    const combinedBgSvg = `<svg width="${combinedW}" height="${combinedH}"><rect width="${combinedW}" height="${combinedH}" fill="#F4F5F7" /></svg>`;

    const combinedPath = path.join(combinedDir, `${fileBase}_pair.png`);
    await sharp(Buffer.from(combinedBgSvg))
      .composite([
        { input: frontCardBuffer, top: 20, left: 10 },
        { input: backCardBuffer, top: 20, left: W + 30 },
      ])
      .png()
      .toFile(combinedPath);

    const photoStatus = localPhotoPath ? "📷 Photo" : "👤 Avatar";
    console.log(`[${count}/${participants.length}] ✓ ${p.fullName} (${p.team.teamName}) [${photoStatus}]`);
  }

  console.log("\n========================================================");
  console.log(`✅ Finished generating cards for all ${count} participants!`);
  console.log(`📸 Photos attached: ${photosFoundCount} / ${count}`);
  console.log(`📁 Files saved to:`);
  console.log(`   - Front cards:  ${frontDir}`);
  console.log(`   - Back cards:   ${backDir}`);
  console.log(`   - Side-by-side: ${combinedDir}`);
  console.log("========================================================\n");
}

main().finally(() => db.$disconnect());
