import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";
import QRCode from "qrcode";
import { PDFDocument } from "pdf-lib";
import { readPrivateFile } from "./upload";

/**
 * Top margin in pixels reserved for lanyard hole tag punch / badge clip slot.
 * 80px (~12mm at standard print scale) provides safe clearance above the logos.
 */
export const CARD_TOP_MARGIN = 80;

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

export function formatCollegeName(col: string | null | undefined): string {
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

async function resolveTemplatePath(filename: string): Promise<string> {
  const candidates = [
    path.resolve(process.cwd(), "assets", filename),
    path.resolve(process.cwd(), "backend", "assets", filename),
    path.join(__dirname, "../../assets", filename),
    path.join(__dirname, "../../../assets", filename),
  ];

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // continue
    }
  }

  throw new Error(`Template asset "${filename}" not found in project assets.`);
}

export async function findParticipantPhotoBuffer(participant: {
  id: string;
  fullName: string;
  participantId?: string | null;
  participantImagePath?: string | null;
}): Promise<Buffer | null> {
  // 1. Check database upload via upload.ts (readPrivateFile)
  if (participant.participantImagePath?.startsWith("private://")) {
    const res = await readPrivateFile(participant.participantImagePath);
    if (res?.data) return res.data;
  }

  // 2. Check storage/public
  if (participant.participantImagePath?.startsWith("/api/uploads/")) {
    const fn = participant.participantImagePath.slice("/api/uploads/".length);
    const pubCandidate = path.resolve(process.cwd(), "storage", "public", fn);
    try {
      return await fs.readFile(pubCandidate);
    } catch {
      // not in storage/public
    }
  }

  // 3. Check custom storage/photos directory by id or name
  const exts = [".jpg", ".jpeg", ".png", ".webp"];
  const ids = [
    participant.participantId,
    participant.id,
    participant.fullName.toLowerCase().replace(/\s+/g, "_"),
    participant.fullName.replace(/\s+/g, ""),
  ].filter(Boolean) as string[];

  const searchDirs = [
    path.resolve(process.cwd(), "storage", "photos"),
    path.resolve(process.cwd(), "storage", "private"),
    path.resolve(process.cwd(), "backend", "storage", "photos"),
    path.resolve(process.cwd(), "backend", "storage", "private"),
    path.resolve("E:/hackmitten/Hackmitten-3.0_Final/backend/storage/private"),
    path.resolve("E:/hackmitten/Hackmitten-3.0_Final/storage/private"),
    path.resolve("E:/var/lib/hackmitten/private"),
  ];

  for (const dir of searchDirs) {
    for (const id of ids) {
      for (const ext of exts) {
        try {
          const candidate = path.join(dir, `${id}${ext}`);
          return await fs.readFile(candidate);
        } catch {
          // not found
        }
      }
    }
  }

  return null;
}

export interface GeneratedParticipantCard {
  participantId: string;
  fullName: string;
  teamName: string;
  teamRegistrationId: string;
  idNumber: string;
  hasPhoto: boolean;
  missingFields: string[];
  frontBuffer: Buffer;
  backBuffer: Buffer;
  frontDataUrl: string;
  backDataUrl: string;
}

export async function generateParticipantCard(
  participant: {
    id: string;
    fullName: string;
    college?: string | null;
    degree?: string | null;
    participantId?: string | null;
    qrToken?: string | null;
    participantImagePath?: string | null;
  },
  team: {
    teamName: string;
    registrationId?: string | null;
  }
): Promise<GeneratedParticipantCard> {
  const frontTemplatePath = await resolveTemplatePath("front.png");
  const backTemplatePath = await resolveTemplatePath("back.png");

  const frontMeta = await sharp(frontTemplatePath).metadata();
  const W = frontMeta.width || 591;
  const H = frontMeta.height || 1004;

  const missingFields: string[] = [];
  if (!participant.fullName?.trim()) missingFields.push("Full Name");
  if (!team.teamName?.trim()) missingFields.push("Team Name");

  // 1. Photo handling
  const rawPhotoBuffer = await findParticipantPhotoBuffer(participant);
  const hasPhoto = Boolean(rawPhotoBuffer);
  if (!hasPhoto) {
    missingFields.push("Participant Photo");
  }

  const photoW = 268;
  const photoH = 266;
  const photoTop = 300;
  const photoLeft = Math.round((W - photoW) / 2);
  const roundedCornersSvg = `<svg><rect x="0" y="0" width="${photoW}" height="${photoH}" rx="16" ry="16" /></svg>`;

  let photoBuffer: Buffer;
  if (rawPhotoBuffer) {
    photoBuffer = await sharp(rawPhotoBuffer)
      .resize(photoW, photoH, { fit: "cover", position: "centre" })
      .composite([{ input: Buffer.from(roundedCornersSvg), blend: "dest-in" }])
      .png()
      .toBuffer();
  } else {
    photoBuffer = await sharp(Buffer.from(createDefaultAvatarSvg(photoW, photoH)))
      .png()
      .toBuffer();
  }

  // 2. Front Card Text
  const name = (participant.fullName || "PARTICIPANT").toUpperCase();
  const college = formatCollegeName(participant.college);
  const teamName = (team.teamName || "TEAM").toUpperCase();
  const idNumber = participant.participantId || team.registrationId || `HM3-${participant.id.slice(0, 6)}`;

  let nameFontSize = 22;
  if (name.length > 25) nameFontSize = 17;
  else if (name.length > 18) nameFontSize = 19;

  let collegeFontSize = 12;
  if (college.length > 38) collegeFontSize = 10.5;

  let teamFontSize = 16;
  if (teamName.length > 18) teamFontSize = 13;

  const frontOverlaySvg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <!-- Seamless background for Name and College -->
    <rect x="30" y="600" width="${W - 60}" height="92" fill="#FFFFFF" />

    <!-- Participant Name -->
    <text x="${W / 2}" y="634" 
          font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
          font-size="${nameFontSize}" 
          font-weight="800" 
          fill="#0C111D" 
          text-anchor="middle" 
          letter-spacing="0.5">${escapeXml(name)}</text>

    <!-- College Name -->
    <text x="${W / 2}" y="668" 
          font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
          font-size="${collegeFontSize}" 
          font-weight="600" 
          fill="#475467" 
          text-anchor="middle">${escapeXml(college)}</text>

    <!-- Blank out Team Name box compartment -->
    <rect x="25" y="764" width="352" height="80" rx="8" fill="#FFFFFF" />
    <!-- Blank out Team ID box compartment -->
    <rect x="386" y="764" width="168" height="80" rx="8" fill="#FFFFFF" />

    <!-- Team Name Label and Value -->
    <text x="201" y="792" 
          font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" 
          font-size="10" 
          font-weight="700" 
          fill="#98A2B3" 
          text-anchor="middle" 
          letter-spacing="1">TEAM NAME</text>
    <text x="201" y="822" 
          font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" 
          font-size="${teamFontSize}" 
          font-weight="800" 
          fill="#0C111D" 
          text-anchor="middle">${escapeXml(teamName)}</text>

    <!-- Team ID Label and Value -->
    <text x="470" y="792" 
          font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" 
          font-size="10" 
          font-weight="700" 
          fill="#98A2B3" 
          text-anchor="middle" 
          letter-spacing="1">TEAM ID</text>
    <text x="470" y="822" 
          font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" 
          font-size="14" 
          font-weight="800" 
          fill="#B52A32" 
          text-anchor="middle">${escapeXml(idNumber)}</text>
  </svg>`;

  const rawFrontBuffer = await sharp(frontTemplatePath)
    .composite([
      { input: photoBuffer, top: photoTop, left: photoLeft },
      { input: Buffer.from(frontOverlaySvg), top: 0, left: 0 },
    ])
    .png()
    .toBuffer();

  const frontBuffer = await sharp(rawFrontBuffer)
    .extend({
      top: CARD_TOP_MARGIN,
      bottom: 0,
      left: 0,
      right: 0,
      background: "#FFFFFF",
    })
    .png()
    .toBuffer();

  // 3. Back Card (QR Code integrated with existing food check-in qrToken)
  const qrToken = participant.qrToken || `HM3-${participant.id}`;
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

  const backScaled = await sharp(backTemplatePath)
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

  const rawBackBuffer = await sharp(backScaled)
    .composite([
      { input: Buffer.from(backOverlaySvg), top: 0, left: 0 },
      { input: qrBuffer, top: backQrTop, left: backQrLeft },
    ])
    .png()
    .toBuffer();

  const backBuffer = await sharp(rawBackBuffer)
    .extend({
      top: CARD_TOP_MARGIN,
      bottom: 0,
      left: 0,
      right: 0,
      background: "#FFFFFF",
    })
    .png()
    .toBuffer();

  return {
    participantId: participant.id,
    fullName: participant.fullName,
    teamName: team.teamName,
    teamRegistrationId: team.registrationId || "",
    idNumber,
    hasPhoto,
    missingFields,
    frontBuffer,
    backBuffer,
    frontDataUrl: `data:image/png;base64,${frontBuffer.toString("base64")}`,
    backDataUrl: `data:image/png;base64,${backBuffer.toString("base64")}`,
  };
}

/**
 * Builds a print-ready duplex PDF containing cards for team members.
 * Page 1: Member 1 Front
 * Page 2: Member 1 Back
 * Page 3: Member 2 Front
 * Page 4: Member 2 Back
 * ...
 * Dimensions are set to standard card badge format (e.g., 252 x 465 points with top margin)
 * so that when printed double-sided, front and back align with 100% precision!
 */
export async function buildTeamIdCardsPdf(cards: GeneratedParticipantCard[]): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();

  // Standard badge width: 252 pt (3.5 inches), height scaled to total template ratio with top margin
  const pageWidth = 252;
  const pageHeight = Math.round(pageWidth * ((1004 + CARD_TOP_MARGIN) / 591));

  for (const card of cards) {
    const frontImg = await pdfDoc.embedPng(card.frontBuffer);
    const backImg = await pdfDoc.embedPng(card.backBuffer);

    // Front page
    const pageFront = pdfDoc.addPage([pageWidth, pageHeight]);
    pageFront.drawImage(frontImg, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    });

    // Back page (exact matching coordinates for duplex print)
    const pageBack = pdfDoc.addPage([pageWidth, pageHeight]);
    pageBack.drawImage(backImg, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Single participant PDF (Page 1 Front, Page 2 Back)
 */
export async function buildSingleParticipantPdf(card: GeneratedParticipantCard): Promise<Buffer> {
  return buildTeamIdCardsPdf([card]);
}
