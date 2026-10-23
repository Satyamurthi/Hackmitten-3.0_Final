import { db } from "@/lib/db";
import { composeIso } from "@/lib/timezone";
import { HACKMITTEN_EVENT } from "@/lib/event-config";

const EVENT_STATIC = {
  eventStartDate: HACKMITTEN_EVENT.startDate,
  eventStartTime: HACKMITTEN_EVENT.startTime,
  eventTimezone: HACKMITTEN_EVENT.timezone,
  eventDurationHours: HACKMITTEN_EVENT.durationHours,
};

/**
 * Event lifecycle states — derived from real configured timestamps.
 * This is the SINGLE source of truth for event state across the entire app.
 *
 * States (in chronological order):
 *   UPCOMING          — before registration opens
 *   REGISTRATION_OPEN — registration open, event not started
 *   REGISTRATION_CLOSED — reserved for compatibility; manual controls govern registration
 *   LIVE              — event is currently running
 *   ENDED             — event end time has passed
 */
export type EventState =
  | "UPCOMING"
  | "REGISTRATION_OPEN"
  | "REGISTRATION_CLOSED"
  | "LIVE"
  | "ENDED";

export interface EventStateInfo {
  state: EventState;
  /** ISO string of event start (Asia/Kolkata interpreted) */
  eventStartIso: string | null;
  /** ISO string of event end */
  eventEndIso: string | null;
  /** ISO string of registration open (is unused; registration is controlled by the admin toggle and capacity) */
  registrationOpensIso: string | null;
  /** Duration in hours */
  durationHours: number;
  /** Timezone (IANA) — always Asia/Kolkata for this event */
  timezone: string;
  /** Whether registration is currently allowed (state === REGISTRATION_OPEN) */
  registrationOpen: boolean;
  /** Optional reason message for closed registration */
  registrationMessage: string;
  /** Manual registration open/close toggle (EventConfig.registrationsOpen) */
  registrationsOpen: boolean;
  /** Maximum number of teams allowed (combined or UG/PG) */
  registrationCapacity: number;
  /** Current number of registered teams across all categories */
  currentCount: number;
  /** True when registration is open AND not full */
  registrationAvailable: boolean;

  /** Category-specific counts and capacities */
  ugPgCount: number;
  ugPgCapacity: number;
  ugPgFull: boolean;
  diplomaCount: number;
  diplomaCapacity: number;
  diplomaFull: boolean;
  isFull: boolean;
  totalCapacity: number;
}

/**
 * Compute the current event state from the EventConfig + current time.
 * Uses UTC internally; all display conversions use the configured timezone.
 *
 * This is a PURE function — given the config + a timestamp, output is deterministic.
 * Safe to call from server components / API routes / client components.
 */
export function computeEventState(cfg: {
  eventStartDate?: string | null;
  eventStartTime?: string | null;
  eventEndDate?: string | null;
  eventEndTime?: string | null;
  eventTimezone?: string | null;
  eventDurationHours?: number | null;
  registrationOpens?: string | null;
  registrationsOpen?: boolean | null;
  registrationCapacity?: number | null;
  registrationEnabled?: boolean | null;
  registrationLimit?: number | null;
  diplomaRegistrationLimit?: number | null;
  currentCount?: number | null;
  ugPgCount?: number | null;
  diplomaCount?: number | null;
}, now: Date = new Date()): EventStateInfo {
  const timezone = cfg.eventTimezone || "Asia/Kolkata";
  const durationHours = cfg.eventDurationHours || 24;

  const eventStartIso = composeIso(
    cfg.eventStartDate,
    cfg.eventStartTime,
    timezone,
  );
  // Auto-calculate eventEndIso from Start + Duration (single source of truth — no separate End Date/Time)
  const eventEndIso = eventStartIso
    ? new Date(new Date(eventStartIso).getTime() + durationHours * 3600000).toISOString()
    : null;
  const registrationOpensIso = cfg.registrationOpens || null;

  let state: EventState = "UPCOMING";
  let registrationMessage = "";

  const nowMs = now.getTime();
  const startMs = eventStartIso ? new Date(eventStartIso).getTime() : NaN;
  const endMs = eventEndIso ? new Date(eventEndIso).getTime() : NaN;
  const opensMs = registrationOpensIso ? new Date(registrationOpensIso).getTime() : NaN;

  if (!isNaN(endMs) && nowMs >= endMs) {
    state = "ENDED";
  } else if (!isNaN(startMs) && nowMs >= startMs) {
    state = "LIVE";
  } else if (!isNaN(opensMs) && nowMs < opensMs) {
    state = "UPCOMING";
    registrationMessage = "Registration opens soon.";
  } else {
    state = "REGISTRATION_OPEN";
  }

  const registrationsOpen = cfg.registrationEnabled ?? cfg.registrationsOpen ?? true;
  
  const ugPgCapacity = cfg.registrationLimit !== undefined && cfg.registrationLimit !== null
    ? cfg.registrationLimit
    : (cfg.registrationCapacity ?? 0);
  const diplomaCapacity = cfg.diplomaRegistrationLimit ?? 0;

  const ugPgCount = cfg.ugPgCount ?? 0;
  const diplomaCount = cfg.diplomaCount ?? 0;
  const currentCount = cfg.currentCount ?? (ugPgCount + diplomaCount);

  const ugPgFull = ugPgCapacity > 0 && ugPgCount >= ugPgCapacity;
  const diplomaFull = diplomaCapacity > 0 && diplomaCount >= diplomaCapacity;

  // The event is completely full only if all active/configured categories have reached their limit
  let isFull = false;
  if (ugPgCapacity > 0 && diplomaCapacity > 0) {
    isFull = ugPgFull && diplomaFull;
  } else if (ugPgCapacity > 0) {
    isFull = ugPgFull;
  } else if (diplomaCapacity > 0) {
    isFull = diplomaFull;
  }

  const totalCapacity = (ugPgCapacity > 0 ? ugPgCapacity : 0) + (diplomaCapacity > 0 ? diplomaCapacity : 0);
  const registrationCapacity = totalCapacity > 0 ? totalCapacity : ugPgCapacity;

  // Registration is "available" when state is REGISTRATION_OPEN AND the manual
  // toggle is on AND at least one category has available capacity.
  const registrationAvailable =
    state === "REGISTRATION_OPEN" && registrationsOpen && !isFull;

  return {
    state,
    eventStartIso,
    eventEndIso,
    registrationOpensIso,
    durationHours,
    timezone,
    registrationOpen: state === "REGISTRATION_OPEN",
    registrationMessage,
    registrationsOpen,
    registrationCapacity,
    currentCount,
    registrationAvailable,
    ugPgCount,
    ugPgCapacity,
    ugPgFull,
    diplomaCount,
    diplomaCapacity,
    diplomaFull,
    isFull,
    totalCapacity,
  };
}

/**
 * Fetch the current EventStateInfo from the database.
 * Use this in server components / API routes.
 */
export async function getEventState(
  database: Pick<typeof db, "eventConfig" | "team"> = db,
): Promise<EventStateInfo> {
  const cfg = await database.eventConfig.findUnique({ 
    where: { id: "singleton" }, 
    select: { 
      registrationEnabled: true, 
      registrationLimit: true, 
      diplomaRegistrationLimit: true,
      eventStartDate: true, 
      eventStartTime: true 
    } 
  });
  if (!cfg) {
    return {
      state: "UPCOMING",
      eventStartIso: null,
      eventEndIso: null,
      registrationOpensIso: null,
      durationHours: 24,
      timezone: "Asia/Kolkata",
      registrationOpen: false,
      registrationMessage: "Event not configured.",
      registrationsOpen: false,
      registrationCapacity: 0,
      currentCount: 0,
      registrationAvailable: false,
      ugPgCount: 0,
      ugPgCapacity: 0,
      ugPgFull: false,
      diplomaCount: 0,
      diplomaCapacity: 0,
      diplomaFull: false,
      isFull: false,
      totalCapacity: 0,
    };
  }

  const [diplomaCount, ugPgCount] = await Promise.all([
    database.team.count({ where: { degree: "Diploma" } }),
    database.team.count({
      where: {
        OR: [
          { degree: { not: "Diploma" } },
          { degree: null },
        ],
      },
    }),
  ]);
  const currentCount = diplomaCount + ugPgCount;

  return computeEventState({
    ...EVENT_STATIC,
    ...cfg,
    eventStartDate: cfg.eventStartDate || EVENT_STATIC.eventStartDate,
    eventStartTime: cfg.eventStartTime || EVENT_STATIC.eventStartTime,
    currentCount,
    ugPgCount,
    diplomaCount,
  });
}

/**
 * Format a duration (ms) as HH:MM:SS for live phase countdowns.
 */
export function formatDuration(ms: number): { hours: number; minutes: number; seconds: number } {
  const clamped = Math.max(0, ms);
  return {
    hours: Math.floor(clamped / 3600000),
    minutes: Math.floor((clamped % 3600000) / 60000),
    seconds: Math.floor((clamped % 60000) / 1000),
  };
}

/**
 * Format an ISO string in the configured timezone for display.
 * Returns a human-readable date/time string.
 */
export function formatInTimezone(iso: string | null, timezone: string = "Asia/Kolkata"): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      timeZone: timezone,
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return new Date(iso).toLocaleString();
  }
}
