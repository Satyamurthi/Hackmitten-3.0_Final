import type { Prisma } from "@prisma/client";

// Only fields needed by the team-management screen; no access hashes, QR tokens,
// or private storage paths cross the API boundary.
export const ADMIN_TEAM_SELECT = {
  id: true,
  teamName: true,
  registrationId: true,
  status: true,
  college: true,
  degree: true,
  domainId: true,
  domainName: true,
  domain: { select: { id: true, name: true, degrees: true } },
  createdAt: true,
  members: {
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      college: true,
      degree: true,
      isLeader: true,
      participantId: true,
      participantImagePath: true,
      participantImageMimeType: true,
      qrToken: true,
      passVerified: true,
    },
    orderBy: [{ isLeader: "desc" }, { createdAt: "asc" }],
  },
  payment: {
    select: {
      id: true,
      status: true,
      transactionId: true,
      screenshots: {
        select: { id: true, fileName: true, mimeType: true, sizeBytes: true },
      },
    },
  },
} as const satisfies Prisma.TeamSelect;
