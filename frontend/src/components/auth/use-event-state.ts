"use client";

import { useQuery } from "@tanstack/react-query";

export type EventState =
  | "UPCOMING"
  | "REGISTRATION_OPEN"
  | "REGISTRATION_CLOSED"
  | "LIVE"
  | "ENDED";

export interface EventStateInfo {
  state: EventState;
  eventStartIso: string | null;
  eventEndIso: string | null;
  registrationOpensIso: string | null;
  durationHours: number;
  timezone: string;
  registrationOpen: boolean;
  registrationMessage: string;
  registrationsOpen: boolean;
  registrationCapacity: number;
  currentCount: number;
  registrationAvailable: boolean;
}

const DEFAULT_EVENT_INFO: EventStateInfo = {
  state: "REGISTRATION_OPEN",
  eventStartIso: "2026-10-29T05:30:00.000Z",
  eventEndIso: "2026-10-30T05:30:00.000Z",
  registrationOpensIso: null,
  durationHours: 24,
  timezone: "Asia/Kolkata",
  registrationOpen: true,
  registrationMessage: "",
  registrationsOpen: true,
  registrationCapacity: 50,
  currentCount: 1,
  registrationAvailable: true,
};

/**
 * React hook that fetches the current event state from /api/event-state.
 * Use this in any client component that needs to know whether registration is open,
 * the event is live, etc. Single source of truth — same logic as the server.
 */
export function useEventState() {
  return useQuery<EventStateInfo>({
    queryKey: ["event-state-info"],
    queryFn: async () => {
      const apiOrigin = process.env.NEXT_PUBLIC_BACKEND_API_ORIGIN ?? "https://hackmitten-3-0-api.mitt.edu.in";
      try {
        const res = await fetch(`${apiOrigin}/api/event-state`);
        if (!res.ok) return DEFAULT_EVENT_INFO;
        return await res.json();
      } catch {
        return DEFAULT_EVENT_INFO;
      }
    },
    placeholderData: DEFAULT_EVENT_INFO,
    staleTime: 60_000, // refresh every minute
    refetchInterval: 60_000,
  });
}
