import { db } from "@/lib/db";
import { sendHourlyRegistrationReportEmail, HourlyTeamReportItem } from "@/lib/email";

const NOTIFICATION_EMAIL = "sharathhn613@gmail.com";
const ONE_HOUR_MS = 60 * 60 * 1000;

let lastCheckedTimestamp: Date = new Date(Date.now() - ONE_HOUR_MS);
let isChecking = false;
let isStarted = false;

/**
 * Checks for teams registered in the last hour and sends an email report to sharathhn613@gmail.com
 * only if at least one new registration occurred.
 */
export async function checkAndSendHourlyRegistrations(forceWindowMinutes?: number): Promise<{
  checkedAt: string;
  since: string;
  foundCount: number;
  emailSent: boolean;
}> {
  if (isChecking) {
    return {
      checkedAt: new Date().toISOString(),
      since: lastCheckedTimestamp.toISOString(),
      foundCount: 0,
      emailSent: false,
    };
  }

  isChecking = true;
  const now = new Date();
  const since = forceWindowMinutes
    ? new Date(now.getTime() - forceWindowMinutes * 60 * 1000)
    : lastCheckedTimestamp;

  try {
    const teams = await db.team.findMany({
      where: {
        createdAt: { gte: since },
      },
      include: {
        members: {
          select: { fullName: true, email: true, phone: true, isLeader: true },
          orderBy: { isLeader: "desc" },
        },
        payment: {
          select: { status: true, transactionId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let emailSent = false;

    if (teams.length > 0) {
      const reportItems: HourlyTeamReportItem[] = teams.map((t) => {
        const leader = t.members.find((m) => m.isLeader) || t.members[0];
        return {
          teamName: t.teamName,
          college: t.college,
          leaderName: leader?.fullName || "N/A",
          leaderEmail: leader?.email || "N/A",
          leaderPhone: leader?.phone || "N/A",
          memberCount: t.members.length,
          paymentStatus: t.payment?.status || "PENDING",
          createdAt: t.createdAt.toISOString(),
        };
      });

      const res = await sendHourlyRegistrationReportEmail({
        to: NOTIFICATION_EMAIL,
        teams: reportItems,
      });

      emailSent = res.success;
      console.log(`[hourly-notifier] Sent hourly report for ${teams.length} new team(s) to ${NOTIFICATION_EMAIL}. Status: ${res.message}`);
    } else {
      console.log(`[hourly-notifier] No new registrations in window (${since.toISOString()} - ${now.toISOString()}).`);
    }

    lastCheckedTimestamp = now;

    return {
      checkedAt: now.toISOString(),
      since: since.toISOString(),
      foundCount: teams.length,
      emailSent,
    };
  } catch (error) {
    console.error("[hourly-notifier] Error during hourly registration check:", error);
    return {
      checkedAt: now.toISOString(),
      since: since.toISOString(),
      foundCount: 0,
      emailSent: false,
    };
  } finally {
    isChecking = false;
  }
}

/**
 * Starts the in-process background interval running every 1 hour (3,600,000 ms).
 */
export function startHourlyRegistrationNotifier() {
  if (isStarted) return;
  isStarted = true;

  console.log(`[hourly-notifier] Initialized hourly registration monitor for ${NOTIFICATION_EMAIL} (interval: 1 hour).`);

  const timer = setInterval(() => {
    checkAndSendHourlyRegistrations().catch((err) => {
      console.error("[hourly-notifier] Interval execution error:", err);
    });
  }, ONE_HOUR_MS);

  if (typeof timer.unref === "function") {
    timer.unref();
  }
}
