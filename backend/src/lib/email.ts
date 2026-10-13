/** SMTP mail transport and Hackmitten registration templates. */
import nodemailer from "nodemailer";

interface EmailPayload { to: string; subject: string; html: string; text: string }
export interface EmailResult { success: boolean; message: string; provider: "smtp" | "configuration" }

function escapeHtml(value: string): string {
  return value.replace(/[&<>\'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" })[character] ?? character);
}

export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM?.trim();
  if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !user || !password || !from) {
    return { success: false, message: "SMTP configuration is incomplete", provider: "configuration" };
  }
  try {
    const transport = nodemailer.createTransport({ host, port, secure: port === 465, requireTLS: port !== 465,
      auth: { user, pass: password }, connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 20_000 });
    await transport.sendMail({ 
      from, 
      to: payload.to, 
      replyTo: from,
      subject: payload.subject, 
      html: payload.html, 
      text: payload.text 
    });
    return { success: true, message: "Email accepted by SMTP server", provider: "smtp" };
  } catch (error) {
    console.error("[email] SMTP delivery failed", { errorName: error instanceof Error ? error.name : "UnknownError" });
    return { success: false, message: "SMTP delivery failed", provider: "smtp" };
  }
}

export function registrationAcknowledgementEmailHtml(opts: {
  leaderName: string;
  teamName: string;
  contactEmail?: string | null;
  username?: string | null;
  password?: string | null;
}): string {
  const leaderName = escapeHtml(opts.leaderName);
  const teamName = escapeHtml(opts.teamName);
  const contactEmail = opts.contactEmail ? escapeHtml(opts.contactEmail) : null;
  const username = opts.username ? escapeHtml(opts.username) : null;
  const password = opts.password ? escapeHtml(opts.password) : null;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#030303;font-family:'Inter',Arial,sans-serif;color:#F2F2F2;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#030303;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#080808;border:1px solid rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:40px 40px 20px;text-align:center;">
              <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B52A32;">HACKMITTEN 3.0</div>
              <h1 style="font-size:32px;font-weight:700;color:#F2F2F2;margin:16px 0 8px;">REGISTRATION RECEIVED</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;color:#A8A8A8;font-size:14px;line-height:1.7;">
              <p style="margin:0 0 20px;color:#F2F2F2;">Hello ${leaderName},</p>
              <p style="margin:0 0 20px;">Your team registration for Hackmitten 3.0 has been successfully received.</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#151515;border-radius:8px;margin-bottom:20px;">
                <tr><td style="padding:16px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;color:#A8A8A8;">TEAM</td><td style="padding:16px 20px;font-size:16px;color:#F2F2F2;font-weight:600;text-align:right;">${teamName}</td></tr>
                <tr><td style="padding:16px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;color:#A8A8A8;border-top:1px solid rgba(255,255,255,0.05);">REGISTRATION STATUS</td><td style="padding:16px 20px;font-family:'JetBrains Mono',monospace;font-size:16px;color:#B52A32;font-weight:600;text-align:right;border-top:1px solid rgba(255,255,255,0.05);">RECEIVED</td></tr>
              </table>

              ${
                username && password
                  ? `
              <!-- Credentials Card -->
              <div style="background:#151515;border:1px solid rgba(216,58,67,0.3);border-radius:10px;padding:20px;margin:24px 0;">
                <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#D83A43;font-weight:700;">
                  YOUR PARTICIPANT PORTAL LOGIN CREDENTIALS
                </div>
                <p style="font-size:12px;color:#A8A8A8;margin:6px 0 14px;">
                  Use these credentials to log in to your participant dashboard to track payment review, select problem statements, and access passes.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0D0D;border-radius:6px;border:1px solid rgba(255,255,255,0.06);">
                  <tr>
                    <td style="padding:10px 14px;color:#888888;font-size:12px;width:120px;">Username (Email):</td>
                    <td style="padding:10px 14px;color:#FFFFFF;font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600;">${username}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 14px;border-top:1px solid rgba(255,255,255,0.06);color:#888888;font-size:12px;">Login Password:</td>
                    <td style="padding:10px 14px;border-top:1px solid rgba(255,255,255,0.06);color:#D83A43;font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:700;">${password}</td>
                  </tr>
                </table>
                <div style="margin-top:16px;text-align:center;">
                  <a href="https://hackmitten-3-0.mitt.edu.in/login?role=PARTICIPANT" style="display:inline-block;background:#B52A32;color:#FFFFFF;font-size:12px;font-weight:600;padding:10px 24px;border-radius:20px;text-decoration:none;">
                    Sign In to Participant Dashboard →
                  </a>
                </div>
              </div>
              `
                  : ""
              }

              <p style="margin:0 0 12px;">Your registration is awaiting admin review. Your registration and payment details will be reviewed by the Hackmitten coordinators.</p>
              <p style="margin:0 0 8px;color:#F2F2F2;font-weight:600;">Please note:</p>
              <ul style="margin:0 0 20px;padding-left:20px;">
                <li>This email confirms that your registration has been received.</li>
                <li>It does NOT mean that your payment has been verified.</li>
                <li>It does NOT mean that your team has been approved.</li>
                <li>The coordinators will contact you regarding the next step after verification.</li>
              </ul>
              <p style="margin:0;">Keep this email for your records.</p>
              ${contactEmail ? `<p style="margin:20px 0 0;">Official contact: <a href="mailto:${contactEmail}" style="color:#F2F2F2;">${contactEmail}</a></p>` : ""}
            </td>
          </tr>
        </table>
        <p style="font-size:11px;color:#A8A8A8;margin:24px 0 0;opacity:0.6;">© 2026 Hackmitten · Black is the universe · White is information · Red is energy</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function registrationAcknowledgementEmailText(opts: {
  leaderName: string;
  teamName: string;
  contactEmail?: string | null;
  username?: string | null;
  password?: string | null;
}): string {
  return `HACKMITTEN 3.0

REGISTRATION RECEIVED

Hello ${opts.leaderName},

Your team registration for Hackmitten 3.0 has been successfully received.

Team: ${opts.teamName}
Registration status: RECEIVED
${
  opts.username && opts.password
    ? `
PARTICIPANT PORTAL LOGIN CREDENTIALS:
- Username: ${opts.username}
- Password: ${opts.password}
- Login URL: https://hackmitten-3-0.mitt.edu.in/login?role=PARTICIPANT
`
    : ""
}
Your registration is awaiting admin review. Your registration and payment details will be reviewed by the Hackmitten coordinators.

Please note:
- This email confirms that your registration has been received.
- It does NOT mean that your payment has been verified.
- It does NOT mean that your team has been approved.
- The coordinators will contact you regarding the next step after verification.

Keep this email for your records.${opts.contactEmail ? `

Official contact: ${opts.contactEmail}` : ""}`.trim();
}

export async function sendRegistrationAcknowledgementEmail(opts: {
  to: string;
  leaderName: string;
  teamName: string;
  contactEmail?: string | null;
  username?: string | null;
  password?: string | null;
}): Promise<EmailResult> {
  return sendEmail({
    to: opts.to,
    subject: "Hackmitten 3.0 — Registration Received",
    html: registrationAcknowledgementEmailHtml(opts),
    text: registrationAcknowledgementEmailText(opts),
  });
}

/**
 * Generate the approval email HTML for a participant.
 */
export function approvalEmailHtml(opts: {
  participantName: string;
  teamName: string;
  registrationId: string;
  participantId: string;
  passUrl: string;
  whatsappGroupUrl: string;
}): string {
  const participantName = escapeHtml(opts.participantName);
  const teamName = escapeHtml(opts.teamName);
  const registrationId = escapeHtml(opts.registrationId);
  const participantId = escapeHtml(opts.participantId);
  const passUrl = escapeHtml(opts.passUrl);
  const whatsappGroupUrl = escapeHtml(opts.whatsappGroupUrl);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#030303;font-family:'Inter',Arial,sans-serif;color:#F2F2F2;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#030303;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#080808;border:1px solid rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:40px 40px 20px;text-align:center;">
              <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B52A32;">HACKMITTEN 3.0</div>
              <h1 style="font-size:32px;font-weight:700;color:#F2F2F2;margin:16px 0 8px;">TEAM APPROVED.</h1>
              <p style="font-size:14px;color:#A8A8A8;margin:0;">Your team has been successfully approved. You are officially accepted for the hackathon.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#151515;border-radius:8px;">
                <tr><td style="padding:16px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;color:#A8A8A8;">TEAM</td><td style="padding:16px 20px;font-size:16px;color:#F2F2F2;font-weight:600;text-align:right;">${teamName}</td></tr>
                <tr><td style="padding:16px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;color:#A8A8A8;border-top:1px solid rgba(255,255,255,0.05);">REGISTRATION ID</td><td style="padding:16px 20px;font-family:'JetBrains Mono',monospace;font-size:16px;color:#B52A32;font-weight:600;text-align:right;border-top:1px solid rgba(255,255,255,0.05);">${registrationId}</td></tr>
                <tr><td style="padding:16px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;color:#A8A8A8;border-top:1px solid rgba(255,255,255,0.05);">TEAM LEADER</td><td style="padding:16px 20px;font-size:16px;color:#F2F2F2;font-weight:600;text-align:right;border-top:1px solid rgba(255,255,255,0.05);">${participantName}</td></tr>
                <tr><td style="padding:16px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;color:#A8A8A8;border-top:1px solid rgba(255,255,255,0.05);">PARTICIPANT ID</td><td style="padding:16px 20px;font-family:'JetBrains Mono',monospace;font-size:16px;color:#B52A32;font-weight:600;text-align:right;border-top:1px solid rgba(255,255,255,0.05);">${participantId}</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 40px;text-align:center;">
              <p>For further instructions, the team leader must join the official WhatsApp group:</p>
              <a href="${whatsappGroupUrl}" style="display:inline-block;background:#B52A32;color:#F2F2F2;text-decoration:none;padding:14px 36px;border-radius:999px;font-size:14px;font-weight:600;letter-spacing:1px;">JOIN HACKMITTEN WHATSAPP GROUP</a>
              <p><a href="${whatsappGroupUrl}">${whatsappGroupUrl}</a></p>
              <p>Venue: MAHARAJA INSTITUTE OF TECHNOLOGY THANDAVAPURA</p>
              <p style="font-size:12px;color:#A8A8A8;margin:16px 0 0;">Please join the official team group and keep your registration details available for the event.</p>
              <a href="${passUrl}" style="display:inline-block;color:#F2F2F2;text-decoration:underline;margin-top:16px;font-size:13px;">VIEW YOUR DIGITAL PASS</a>
              <p style="font-size:12px;color:#A8A8A8;margin:16px 0 0;">Present the QR code on your pass at the food check-in counter.</p>
            </td>
          </tr>
        </table>
        <p style="font-size:11px;color:#A8A8A8;margin:24px 0 0;opacity:0.6;">© 2026 Hackmitten · Black is the universe · White is information · Red is energy</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function rejectionEmailHtml(teamName: string): string {
  return `<html><body><h1>Hackmitten 3.0</h1><p>Your team registration was rejected.</p><p>Team: ${escapeHtml(teamName)}</p></body></html>`;
}

export function rejectionEmailText(teamName: string): string {
  return `Hackmitten 3.0\n\nYour team registration was rejected.\n\nTeam: ${teamName}`;
}

export function approvalEmailText(opts: {
  participantName: string;
  teamName: string;
  registrationId: string;
  participantId: string;
  passUrl: string;
  whatsappGroupUrl: string;
}): string {
  return `HACKMITTEN 3.0 — TEAM APPROVED.

Your team has been successfully approved.
You are officially accepted for the Hackmitten 3.0 hackathon.

Team: ${opts.teamName}
Registration ID: ${opts.registrationId}
Team leader: ${opts.participantName}
Participant ID: ${opts.participantId}

Join the official Hackmitten 3.0 WhatsApp group: ${opts.whatsappGroupUrl}

Venue: MAHARAJA INSTITUTE OF TECHNOLOGY THANDAVAPURA

View your digital pass: ${opts.passUrl}

Present the QR code on your pass at the food check-in counter.

© 2026 Hackmitten`.trim();
}
export function paymentVerifiedEmailHtml(opts: { leaderName: string; teamName: string; contactEmail?: string | null; }): string {
  const leaderName = escapeHtml(opts.leaderName);
  const teamName = escapeHtml(opts.teamName);
  const contactEmail = opts.contactEmail ? escapeHtml(opts.contactEmail) : null;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#030303;font-family:'Inter',Arial,sans-serif;color:#F2F2F2;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#030303;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#080808;border:1px solid rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:40px;border-bottom:1px solid rgba(255,255,255,0.05);text-align:center;">
              <h1 style="margin:0;font-size:24px;color:#ffffff;font-weight:700;letter-spacing:-0.5px;">HACKMITTEN <span style="color:#B52A32;">3.0</span></h1>
              <p style="margin:8px 0 0;font-size:12px;color:#A8A8A8;letter-spacing:4px;text-transform:uppercase;">Payment Verified</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 24px;font-size:16px;line-height:24px;color:#F2F2F2;">Incoming transmission for <strong>${leaderName}</strong>,</p>
              <p style="margin:0 0 24px;font-size:16px;line-height:24px;color:#A8A8A8;">
                Your payment for team <strong>${teamName}</strong> has been successfully verified by our administrators.
              </p>
              <div style="background:rgba(216,58,67,0.1);border:1px solid rgba(216,58,67,0.2);border-radius:8px;padding:24px;margin:32px 0;">
                <h3 style="margin:0 0 12px;font-size:14px;color:#D83A43;text-transform:uppercase;letter-spacing:1px;">STATUS UPDATE</h3>
                <p style="margin:0;font-size:15px;line-height:22px;color:#F2F2F2;">
                  Your team will now be reviewed for final approval. You will receive another email once your registration is completely approved.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;background:#050505;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
              <p style="margin:0;font-size:12px;color:#666666;">
                Need help? Contact command at <a href="mailto:${contactEmail || 'hello@hackmitten.com'}" style="color:#B52A32;text-decoration:none;">${contactEmail || 'hello@hackmitten.com'}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
export function paymentVerifiedEmailText(opts: { leaderName: string; teamName: string; contactEmail?: string | null; }): string {
  return `Hackmitten 3.0 - Payment Verified

Incoming transmission for ${opts.leaderName},

Your payment for team ${opts.teamName} has been successfully verified.
Your team will now be reviewed for final approval.`;
}
export async function sendPaymentVerifiedEmail(opts: { leaderName: string; teamName: string; contactEmail?: string | null; to: string }): Promise<EmailResult> {
  return sendEmail({
    to: opts.to,
    subject: "Hackmitten 3.0 — Payment Verified",
    html: paymentVerifiedEmailHtml(opts),
    text: paymentVerifiedEmailText(opts),
  });
}

// ─── PARTICIPANT UPDATE EMAIL ───────────────────────────────────────────────

export interface ParticipantUpdateChange {
  field: string;
  from: string;
  to: string;
}

export function participantUpdateEmailHtml(opts: {
  participantName: string;
  teamName: string;
  changes: ParticipantUpdateChange[];
  contactEmail?: string | null;
}): string {
  const participantName = escapeHtml(opts.participantName);
  const teamName = escapeHtml(opts.teamName);
  const contactEmail = opts.contactEmail ? escapeHtml(opts.contactEmail) : null;
  const rows = opts.changes
    .map(
      (c) => `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06);font-family:'JetBrains Mono',monospace;font-size:12px;color:#A8A8A8;">${escapeHtml(c.field)}</td>
          <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06);font-size:13px;color:#888888;text-decoration:line-through;">${escapeHtml(c.from || "—")}</td>
          <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06);font-size:13px;color:#4ade80;font-weight:600;">${escapeHtml(c.to || "—")}</td>
        </tr>
      `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#030303;font-family:'Inter',Arial,sans-serif;color:#F2F2F2;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#030303;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#080808;border:1px solid rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:40px 40px 20px;text-align:center;">
              <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B52A32;">HACKMITTEN 3.0</div>
              <h1 style="font-size:26px;font-weight:700;color:#F2F2F2;margin:16px 0 8px;">REGISTRATION DETAILS UPDATED</h1>
              <p style="font-size:12px;color:#A8A8A8;margin:0;">Team: ${teamName}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;color:#A8A8A8;font-size:14px;line-height:1.7;">
              <p style="margin:0 0 16px;color:#F2F2F2;">Hello ${participantName},</p>
              <p style="margin:0 0 20px;">An event administrator has updated your registration details for Hackmitten 3.0. Here is a summary of the changes made to your profile:</p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#121212;border:1px solid rgba(255,255,255,0.08);border-radius:8px;margin-bottom:24px;border-collapse:collapse;">
                <thead>
                  <tr style="background:#181818;">
                    <th align="left" style="padding:10px 16px;font-family:'JetBrains Mono',monospace;font-size:10px;color:#A8A8A8;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid rgba(255,255,255,0.1);">Field</th>
                    <th align="left" style="padding:10px 16px;font-family:'JetBrains Mono',monospace;font-size:10px;color:#A8A8A8;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid rgba(255,255,255,0.1);">Previous Value</th>
                    <th align="left" style="padding:10px 16px;font-family:'JetBrains Mono',monospace;font-size:10px;color:#A8A8A8;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid rgba(255,255,255,0.1);">Updated Value</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>

              <p style="margin:0 0 12px;color:#F2F2F2;font-size:13px;">If you have any questions or did not authorize these updates, please contact the Hackmitten organizing team immediately.</p>
              ${contactEmail ? `<p style="margin:16px 0 0;font-size:12px;">Contact: <a href="mailto:${contactEmail}" style="color:#D83A43;">${contactEmail}</a></p>` : ""}
            </td>
          </tr>
        </table>
        <p style="font-size:11px;color:#A8A8A8;margin:24px 0 0;opacity:0.6;">© 2026 Hackmitten · Black is the universe · White is information · Red is energy</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function participantUpdateEmailText(opts: {
  participantName: string;
  teamName: string;
  changes: ParticipantUpdateChange[];
  contactEmail?: string | null;
}): string {
  const diffs = opts.changes
    .map((c) => `- ${c.field}: "${c.from || "—"}" -> "${c.to || "—"}"`)
    .join("\n");

  return `HACKMITTEN 3.0 — REGISTRATION DETAILS UPDATED

Hello ${opts.participantName},

An event administrator has updated your registration details for Hackmitten 3.0 (Team: ${opts.teamName}).
Here is what was updated:

${diffs}

If you have any questions or did not authorize these updates, please contact the organizing team.
${opts.contactEmail ? `Contact: ${opts.contactEmail}` : ""}
`.trim();
}

export async function sendParticipantUpdateEmail(opts: {
  to: string;
  participantName: string;
  teamName: string;
  changes: ParticipantUpdateChange[];
}): Promise<EmailResult> {
  const contactEmail = process.env.SMTP_FROM || null;
  return sendEmail({
    to: opts.to,
    subject: `[Hackmitten 3.0] Registration Details Updated — Team ${opts.teamName}`,
    html: participantUpdateEmailHtml({
      participantName: opts.participantName,
      teamName: opts.teamName,
      changes: opts.changes,
      contactEmail,
    }),
    text: participantUpdateEmailText({
      participantName: opts.participantName,
      teamName: opts.teamName,
      changes: opts.changes,
      contactEmail,
    }),
  });
}

// ─── HOURLY REGISTRATION SUMMARY EMAIL ──────────────────────────────────────

export interface HourlyTeamReportItem {
  teamName: string;
  college: string | null;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  memberCount: number;
  paymentStatus: string;
  createdAt: string;
}

export function hourlyRegistrationReportEmailHtml(opts: {
  teams: HourlyTeamReportItem[];
  windowMinutes?: number;
}): string {
  const count = opts.teams.length;
  const rows = opts.teams
    .map(
      (t) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.06);font-size:13px;color:#FFFFFF;font-weight:600;">${escapeHtml(t.teamName)}</td>
          <td style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.06);font-size:12px;color:#A8A8A8;">${escapeHtml(t.college || "—")}</td>
          <td style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.06);font-size:12px;color:#F2F2F2;">
            ${escapeHtml(t.leaderName)}<br>
            <span style="font-size:11px;color:#888888;">${escapeHtml(t.leaderEmail)} · ${escapeHtml(t.leaderPhone)}</span>
          </td>
          <td style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.06);font-size:12px;color:#A8A8A8;text-align:center;">${t.memberCount}</td>
          <td style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.06);font-family:'JetBrains Mono',monospace;font-size:11px;color:${
            t.paymentStatus === "VERIFIED" ? "#4ade80" : "#facc15"
          };">${escapeHtml(t.paymentStatus)}</td>
        </tr>
      `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#030303;font-family:'Inter',Arial,sans-serif;color:#F2F2F2;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#030303;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="700" cellpadding="0" cellspacing="0" style="background:#080808;border:1px solid rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 16px;text-align:center;">
              <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B52A32;">HACKMITTEN 3.0 · AUTOMATED ALERT</div>
              <h1 style="font-size:24px;font-weight:700;color:#F2F2F2;margin:12px 0 6px;">Hourly Registration Report</h1>
              <p style="font-size:13px;color:#A8A8A8;margin:0;">
                <strong style="color:#D83A43;">${count}</strong> new team registration${count > 1 ? "s" : ""} received in the last hour.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#121212;border:1px solid rgba(255,255,255,0.08);border-radius:8px;border-collapse:collapse;">
                <thead>
                  <tr style="background:#181818;">
                    <th align="left" style="padding:10px 14px;font-family:'JetBrains Mono',monospace;font-size:10px;color:#A8A8A8;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid rgba(255,255,255,0.1);">Team</th>
                    <th align="left" style="padding:10px 14px;font-family:'JetBrains Mono',monospace;font-size:10px;color:#A8A8A8;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid rgba(255,255,255,0.1);">College</th>
                    <th align="left" style="padding:10px 14px;font-family:'JetBrains Mono',monospace;font-size:10px;color:#A8A8A8;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid rgba(255,255,255,0.1);">Leader</th>
                    <th align="center" style="padding:10px 14px;font-family:'JetBrains Mono',monospace;font-size:10px;color:#A8A8A8;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid rgba(255,255,255,0.1);">Members</th>
                    <th align="left" style="padding:10px 14px;font-family:'JetBrains Mono',monospace;font-size:10px;color:#A8A8A8;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid rgba(255,255,255,0.1);">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>

              <div style="margin-top:24px;text-align:center;">
                <p style="font-size:12px;color:#888888;margin:0 0 12px;">Review teams and verify payments on the Mission Control dashboard:</p>
                <a href="https://hackmitten-3-0.mitt.edu.in/admin/registrations" style="display:inline-block;background:#B52A32;color:#FFFFFF;text-decoration:none;font-size:12px;font-weight:600;padding:10px 24px;border-radius:20px;">
                  Open Admin Registrations →
                </a>
              </div>
            </td>
          </tr>
        </table>
        <p style="font-size:11px;color:#A8A8A8;margin:24px 0 0;opacity:0.6;">© 2026 Hackmitten · Automated Operations Monitor</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendHourlyRegistrationReportEmail(opts: {
  to: string;
  teams: HourlyTeamReportItem[];
}): Promise<EmailResult> {
  const count = opts.teams.length;
  const textSummary = opts.teams
    .map(
      (t) =>
        `- ${t.teamName} (${t.college || "N/A"}) | Leader: ${t.leaderName} (${t.leaderEmail}, ${t.leaderPhone}) | Members: ${t.memberCount} | Payment: ${t.paymentStatus}`
    )
    .join("\n");

  return sendEmail({
    to: opts.to,
    subject: `[Hackmitten 3.0] Hourly Registration Alert: ${count} New Team${count > 1 ? "s" : ""} Registered`,
    html: hourlyRegistrationReportEmailHtml({ teams: opts.teams }),
    text: `HACKMITTEN 3.0 HOURLY REGISTRATION REPORT\n\n${count} new team(s) registered in the last hour:\n\n${textSummary}\n\nDashboard: https://hackmitten-3-0.mitt.edu.in/admin/registrations`,
  });
}

export interface TeamMemberAlertItem {
  fullName: string;
  email: string;
  phone: string;
  degree?: string | null;
  college?: string | null;
  isLeader?: boolean;
}

export interface NewTeamAlertPayload {
  teamName: string;
  college: string | null;
  degree: string | null;
  domainName: string | null;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  memberCount: number;
  members?: TeamMemberAlertItem[];
  teamId: string;
  password?: string | null;
  totalTeams: number;
  registeredCount: number;
}

export function newTeamRegistrationAdminAlertHtml(data: NewTeamAlertPayload): string {
  const teamName = escapeHtml(data.teamName);
  const college = escapeHtml(data.college || "N/A");
  const degree = escapeHtml(data.degree || "UG");
  const domainName = escapeHtml(data.domainName || "Not Assigned");
  const leaderName = escapeHtml(data.leaderName);
  const leaderEmail = escapeHtml(data.leaderEmail);
  const leaderPhone = escapeHtml(data.leaderPhone);
  const teamId = escapeHtml(data.teamId);
  const teamPassword = escapeHtml(data.password || "N/A");

  const membersRows = (data.members || []).map((m, idx) => {
    const isLeader = m.isLeader || idx === 0;
    return `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
        <td style="padding:10px 12px;font-family:'JetBrains Mono',monospace;color:#888888;font-size:11px;">${idx + 1}</td>
        <td style="padding:10px 12px;color:#FFFFFF;font-weight:${isLeader ? "700" : "500"};font-size:12px;">
          ${escapeHtml(m.fullName)}
        </td>
        <td style="padding:10px 12px;color:#A8A8A8;font-size:12px;">${escapeHtml(m.email)}</td>
        <td style="padding:10px 12px;font-family:'JetBrains Mono',monospace;color:#A8A8A8;font-size:12px;">${escapeHtml(m.phone)}</td>
        <td style="padding:10px 12px;font-size:11px;">
          ${isLeader
            ? `<span style="background:rgba(216,58,67,0.15);color:#D83A43;border:1px solid rgba(216,58,67,0.3);padding:2px 8px;border-radius:4px;font-weight:600;">Leader</span>`
            : `<span style="background:rgba(255,255,255,0.05);color:#888888;padding:2px 8px;border-radius:4px;">Member</span>`
          }
        </td>
      </tr>
    `;
  }).join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#030303;font-family:'Inter',Arial,sans-serif;color:#F2F2F2;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#030303;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="640" cellpadding="0" cellspacing="0" style="background:#080808;border:1px solid rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 20px;text-align:center;">
              <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B52A32;">HACKMITTEN 3.0 · REAL-TIME REGISTRATION ALERT</div>
              <h1 style="font-size:24px;font-weight:700;color:#F2F2F2;margin:12px 0 6px;">New Team Registered!</h1>
              <p style="font-size:14px;color:#A8A8A8;margin:0;">
                Team <strong style="color:#FFFFFF;">${teamName}</strong> has just submitted their registration.
              </p>
            </td>
          </tr>

          <!-- Summary Metric Badges -->
          <tr>
            <td style="padding:0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33%" style="padding:4px;">
                    <div style="background:#121212;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px;text-align:center;">
                      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;color:#A8A8A8;">Total Teams</div>
                      <div style="font-size:22px;font-weight:700;color:#FFFFFF;margin-top:4px;">${data.totalTeams}</div>
                    </div>
                  </td>
                  <td width="33%" style="padding:4px;">
                    <div style="background:#121212;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px;text-align:center;">
                      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;color:#A8A8A8;">Registered Count</div>
                      <div style="font-size:22px;font-weight:700;color:#D83A43;margin-top:4px;">${data.registeredCount}</div>
                    </div>
                  </td>
                  <td width="33%" style="padding:4px;">
                    <div style="background:#121212;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px;text-align:center;">
                      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;color:#A8A8A8;">Category</div>
                      <div style="font-size:16px;font-weight:700;color:#FFFFFF;margin-top:6px;">${degree}</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Details Table -->
          <tr>
            <td style="padding:0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#121212;border:1px solid rgba(255,255,255,0.08);border-radius:8px;">
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);color:#888888;font-size:12px;width:140px;">Team Name</td>
                  <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);color:#FFFFFF;font-weight:600;font-size:13px;">${teamName}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);color:#888888;font-size:12px;">Category & Domain</td>
                  <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);color:#FFFFFF;font-size:13px;">
                    <strong>${degree}</strong> · Domain: <span style="color:#D83A43;font-weight:600;">${domainName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);color:#888888;font-size:12px;">College / Inst.</td>
                  <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);color:#FFFFFF;font-size:13px;">${college}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);color:#888888;font-size:12px;">Team Leader</td>
                  <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);color:#FFFFFF;font-size:13px;">
                    <strong>${leaderName}</strong> (<a href="mailto:${leaderEmail}" style="color:#D83A43;text-decoration:none;">${leaderEmail}</a> · <a href="tel:${leaderPhone}" style="color:#FFFFFF;text-decoration:none;">${leaderPhone}</a>)
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);color:#888888;font-size:12px;">Total Members</td>
                  <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);color:#FFFFFF;font-size:13px;">${data.memberCount} members</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);color:#888888;font-size:12px;">Team Password</td>
                  <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);font-family:'JetBrains Mono',monospace;color:#D83A43;font-size:13px;font-weight:700;">${teamPassword}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;color:#888888;font-size:12px;">Team ID</td>
                  <td style="padding:12px 16px;font-family:'JetBrains Mono',monospace;color:#AAAAAA;font-size:11px;">${teamId}</td>
                </tr>
              </table>
            </td>
          </tr>

          ${
            membersRows
              ? `
          <!-- Member Roster Table -->
          <tr>
            <td style="padding:0 32px 32px;">
              <div style="font-family:'JetBrains Mono',monospace;font-size:11px;text-transform:uppercase;color:#A8A8A8;margin-bottom:8px;letter-spacing:1px;">Team Members Roster</div>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#121212;border:1px solid rgba(255,255,255,0.08);border-radius:8px;overflow:hidden;">
                <tr style="background:#181818;border-bottom:1px solid rgba(255,255,255,0.08);">
                  <th style="padding:10px 12px;text-align:left;font-size:11px;color:#A8A8A8;font-weight:600;">#</th>
                  <th style="padding:10px 12px;text-align:left;font-size:11px;color:#A8A8A8;font-weight:600;">Name</th>
                  <th style="padding:10px 12px;text-align:left;font-size:11px;color:#A8A8A8;font-weight:600;">Email</th>
                  <th style="padding:10px 12px;text-align:left;font-size:11px;color:#A8A8A8;font-weight:600;">Phone</th>
                  <th style="padding:10px 12px;text-align:left;font-size:11px;color:#A8A8A8;font-weight:600;">Role</th>
                </tr>
                ${membersRows}
              </table>
            </td>
          </tr>
          `
              : ""
          }

          <tr>
            <td style="padding:0 32px 32px;text-align:center;">
              <a href="https://hackmitten-3-0.mitt.edu.in/admin/registrations" style="display:inline-block;background:#B52A32;color:#FFFFFF;text-decoration:none;font-size:12px;font-weight:600;padding:12px 28px;border-radius:24px;">
                View Team in Admin Dashboard →
              </a>
            </td>
          </tr>
        </table>
        <p style="font-size:11px;color:#A8A8A8;margin:24px 0 0;opacity:0.6;">© 2026 Hackmitten · Automated Operations Monitor</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendNewTeamAdminAlertEmail(data: NewTeamAlertPayload): Promise<EmailResult> {
  const recipients = new Set<string>();
  // Primary designated recipient specified by user
  recipients.add("sharathhn613@gmail.com");

  if (process.env.ADMIN_NOTIFICATION_EMAIL?.trim()) {
    process.env.ADMIN_NOTIFICATION_EMAIL.split(",").forEach((e) => {
      const trimmed = e.trim();
      if (trimmed && trimmed.includes("@")) recipients.add(trimmed);
    });
  }
  if (process.env.ADMIN_EMAIL?.trim() && process.env.ADMIN_EMAIL.includes("@")) {
    recipients.add(process.env.ADMIN_EMAIL.trim());
  }

  const toList = Array.from(recipients).join(", ");
  const membersText = (data.members || [])
    .map(
      (m, idx) =>
        `  ${idx + 1}. ${m.fullName}${m.isLeader ? " [LEADER]" : ""} | ${m.email} | ${m.phone} | ${m.degree || data.degree || "UG"}`
    )
    .join("\n");

  return sendEmail({
    to: toList,
    subject: `🚨 [HACKMITTEN 3.0] New Team Registered: ${data.teamName} (${data.degree || "UG"} · ${data.domainName || "Track"}) | Total: ${data.totalTeams}`,
    html: newTeamRegistrationAdminAlertHtml(data),
    text: `HACKMITTEN 3.0 NEW TEAM REGISTRATION ALERT\n\nTeam: ${data.teamName}\nCategory: ${data.degree || "UG"}\nDomain Track: ${data.domainName || "N/A"}\nCollege: ${data.college || "N/A"}\nTeam ID: ${data.teamId}\n\nSUMMARY STATS:\nTotal Registered Teams: ${data.totalTeams}\nActive/Registered Count: ${data.registeredCount}\n\nTEAM MEMBERS (${data.memberCount}):\n${membersText || `  Leader: ${data.leaderName} (${data.leaderEmail}, ${data.leaderPhone})`}\n\nAdmin Dashboard: https://hackmitten-3-0.mitt.edu.in/admin/registrations`,
  });
}

export function credentialsUpdateEmailHtml(opts: {
  leaderName: string;
  teamName: string;
  username: string;
  password?: string | null;
  registrationId?: string | null;
}): string {
  const leaderName = escapeHtml(opts.leaderName);
  const teamName = escapeHtml(opts.teamName);
  const username = escapeHtml(opts.username);
  const password = opts.password ? escapeHtml(opts.password) : null;
  const registrationId = opts.registrationId ? escapeHtml(opts.registrationId) : null;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#030303;font-family:'Inter',Arial,sans-serif;color:#F2F2F2;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#030303;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#080808;border:1px solid rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:40px 40px 20px;text-align:center;">
              <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B52A32;">HACKMITTEN 3.0</div>
              <h1 style="font-size:28px;font-weight:700;color:#F2F2F2;margin:16px 0 8px;">LOGIN CREDENTIALS UPDATED</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;color:#A8A8A8;font-size:14px;line-height:1.7;">
              <p style="margin:0 0 20px;color:#F2F2F2;">Hello ${leaderName},</p>
              <p style="margin:0 0 20px;">Your team login credentials for Hackmitten 3.0 have been updated by the event administrator.</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#151515;border-radius:8px;margin-bottom:20px;">
                <tr><td style="padding:16px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;color:#A8A8A8;">TEAM</td><td style="padding:16px 20px;font-size:16px;color:#F2F2F2;font-weight:600;text-align:right;">${teamName}</td></tr>
                ${registrationId ? `<tr><td style="padding:16px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;color:#A8A8A8;border-top:1px solid rgba(255,255,255,0.05);">REGISTRATION ID</td><td style="padding:16px 20px;font-family:'JetBrains Mono',monospace;font-size:14px;color:#FFFFFF;font-weight:600;text-align:right;border-top:1px solid rgba(255,255,255,0.05);">${registrationId}</td></tr>` : ""}
              </table>

              <!-- Credentials Card -->
              <div style="background:#151515;border:1px solid rgba(216,58,67,0.3);border-radius:10px;padding:20px;margin:24px 0;">
                <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#D83A43;font-weight:700;">
                  YOUR NEW PARTICIPANT LOGIN CREDENTIALS
                </div>
                <p style="font-size:12px;color:#A8A8A8;margin:6px 0 14px;">
                  Please use these updated details to log in to your participant dashboard.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0D0D;border-radius:6px;border:1px solid rgba(255,255,255,0.06);">
                  <tr>
                    <td style="padding:10px 14px;color:#888888;font-size:12px;width:130px;">Username (Email):</td>
                    <td style="padding:10px 14px;color:#FFFFFF;font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600;">${username}</td>
                  </tr>
                  ${password ? `<tr>
                    <td style="padding:10px 14px;border-top:1px solid rgba(255,255,255,0.06);color:#888888;font-size:12px;">Login Password:</td>
                    <td style="padding:10px 14px;border-top:1px solid rgba(255,255,255,0.06);color:#D83A43;font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:700;">${password}</td>
                  </tr>` : ""}
                </table>
                <div style="margin-top:16px;text-align:center;">
                  <a href="https://hackmitten-3-0.mitt.edu.in/login?role=PARTICIPANT" style="display:inline-block;background:#B52A32;color:#FFFFFF;font-size:12px;font-weight:600;padding:10px 24px;border-radius:20px;text-decoration:none;">
                    Sign In to Participant Dashboard
                  </a>
                </div>
              </div>

              <p style="margin:20px 0 0;font-size:12px;color:#888888;">
                If you did not request this update or need assistance, please contact the hackathon coordinators immediately.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;font-family:'JetBrains Mono',monospace;font-size:10px;color:#666666;letter-spacing:1px;">
              HACKMITTEN 3.0 · MAHARAJA INSTITUTE OF TECHNOLOGY THANDAVAPURA
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendCredentialsEmailToTeam(opts: {
  teamName: string;
  leaderName: string;
  username: string;
  password?: string | null;
  recipientEmails: string[];
  registrationId?: string | null;
}): Promise<EmailResult[]> {
  const uniqueEmails = Array.from(
    new Set(
      opts.recipientEmails
        .map((e) => e?.trim().toLowerCase())
        .filter((e) => e && e.includes("@"))
    )
  );

  const results: EmailResult[] = [];
  for (const to of uniqueEmails) {
    const res = await sendEmail({
      to,
      subject: `🔑 [HACKMITTEN 3.0] Updated Login Credentials — Team ${opts.teamName}`,
      html: credentialsUpdateEmailHtml({
        leaderName: opts.leaderName,
        teamName: opts.teamName,
        username: opts.username,
        password: opts.password,
        registrationId: opts.registrationId,
      }),
      text: `HACKMITTEN 3.0 LOGIN CREDENTIALS UPDATED\n\nTeam: ${opts.teamName}\nUsername: ${opts.username}\nPassword: ${opts.password || "Unchanged"}\n\nSign in to participant portal: https://hackmitten-3-0.mitt.edu.in/login?role=PARTICIPANT`,
    });
    results.push(res);
  }
  return results;
}


