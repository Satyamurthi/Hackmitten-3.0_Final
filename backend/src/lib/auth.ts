import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { LOGIN_ROLE_MAP } from "@/lib/operational-users";

type UserLike = {
  id: string;
  username: string;
  email: string;
  role: import("@prisma/client").Role;
  passwordHash: string;
};

export function normalizeLoginIdentifier(identifier: string): string {
  return identifier.trim();
}

export async function findUserByLoginIdentifier(identifier: string, database = db) {
  const normalizedIdentifier = normalizeLoginIdentifier(identifier);
  if (!normalizedIdentifier) return null;

  return database.user.findFirst({
    where: {
      OR: [
        { email: normalizedIdentifier.toLowerCase() },
        { username: { equals: normalizedIdentifier, mode: "insensitive" } },
      ],
    },
  });
}

export function roleMatchesSelectedRole(
  selectedRole: string | null | undefined,
  userRole: import("@prisma/client").Role | string,
): boolean {
  const normalizedSelection = String(selectedRole ?? "").trim().toUpperCase();
  const normalizedUserRole = String(userRole ?? "").trim().toUpperCase();
  return LOGIN_ROLE_MAP[normalizedSelection as keyof typeof LOGIN_ROLE_MAP] === normalizedUserRole;
}

export async function verifyPasswordAndRole({
  identifier,
  password,
  selectedRole,
  user,
}: {
  identifier: string | null | undefined;
  password: string | null | undefined;
  selectedRole: string | null | undefined;
  user: UserLike | null;
}): Promise<boolean> {
  if (!identifier || !password || !user) return false;

  const passwordOk = await bcrypt.compare(password, user.passwordHash);
  if (!passwordOk) return false;

  return roleMatchesSelectedRole(selectedRole, user.role);
}

/**
 * Generates a simple, human-friendly password:
 * Starting 4 letters of leader's name + 4 random digits (e.g., "jasi4829")
 */
export function generateSimpleParticipantPassword(leaderName?: string | null): string {
  const cleanName = (leaderName || "hack")
    .replace(/[^a-zA-Z]/g, "")
    .toLowerCase();
  const prefix = (cleanName.slice(0, 4) || "team").padEnd(4, "x");
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randomDigits}`;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 }, // 7 days
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password || !credentials?.role) return null;

        const id = normalizeLoginIdentifier(String(credentials.identifier));
        const selectedRole = String(credentials.role);

        // ─── Participant Authentication (Leader Email/Username + Simple Password / Team ID) ───
        if (selectedRole.trim().toUpperCase() === "PARTICIPANT") {
          const email = id.toLowerCase();
          const rawPassword = String(credentials.password).trim();

          // 1. Look up User record by email or username (allows updated username/email)
          const user = await db.user.findFirst({
            where: {
              OR: [
                { email: email },
                { username: { equals: email, mode: "insensitive" } },
              ],
              role: "PARTICIPANT",
            },
          });

          // 2. Look up Leader Participant record
          let leader = await db.participant.findFirst({
            where: {
              OR: [
                { email: user?.email || email },
                { email: email },
                { team: { loginUsername: { equals: id, mode: "insensitive" } } },
              ],
              isLeader: true,
            },
            include: {
              team: true,
            },
            orderBy: { createdAt: "desc" },
          });

          if (!leader) {
            const teamWithUser = await db.team.findFirst({
              where: {
                OR: [
                  { loginUsername: { equals: id, mode: "insensitive" } },
                  { registrationId: { equals: id, mode: "insensitive" } },
                ],
              },
              include: {
                members: { orderBy: { isLeader: "desc" } },
              },
            });
            if (teamWithUser && teamWithUser.members.length > 0) {
              leader = {
                ...teamWithUser.members[0],
                team: teamWithUser,
              } as any;
            }
          }

          if (!leader || !leader.team) {
            console.warn("[auth] participant login: leader not found for identifier:", id);
            return null;
          }

          const team = leader.team;

          // 3. Password Verification:
          // Check bcrypt user passwordHash (if set), team.participantPassword, or team.id / registrationId
          let isMatch = false;
          if (user?.passwordHash) {
            isMatch = await bcrypt.compare(rawPassword, user.passwordHash);
          }
          if (!isMatch && team.participantPassword) {
            isMatch = rawPassword.toLowerCase() === team.participantPassword.toLowerCase();
          }
          if (!isMatch) {
            isMatch =
              rawPassword.toLowerCase() === team.id.toLowerCase() ||
              (Boolean(team.registrationId) && rawPassword.toLowerCase() === team.registrationId!.toLowerCase());
          }

          if (!isMatch) {
            console.warn("[auth] participant login: invalid password for team:", team.teamName);
            return null;
          }

          const passwordHash = user?.passwordHash || (await bcrypt.hash(rawPassword, 10));
          const syncedUser = await db.user.upsert({
            where: { email: leader.email.toLowerCase() },
            update: {
              role: "PARTICIPANT",
              passwordHash,
              name: leader.fullName,
            },
            create: {
              email: leader.email.toLowerCase(),
              username: leader.email.toLowerCase(),
              name: leader.fullName,
              role: "PARTICIPANT",
              passwordHash,
            },
          });

          return {
            id: syncedUser.id,
            email: syncedUser.email,
            name: leader.fullName || syncedUser.name || "Team Leader",
            role: syncedUser.role,
            sessionVersion: syncedUser.updatedAt.getTime(),
            teamId: team.id,
            degree: team.degree,
          };
        }

        const user = await findUserByLoginIdentifier(id);

        if (!user) return null;

        const passwordAndRoleValid = await verifyPasswordAndRole({
          identifier: id,
          password: String(credentials.password),
          selectedRole,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            passwordHash: user.passwordHash,
          },
        });

        if (!passwordAndRoleValid) {
          console.warn("[auth] login rejected: invalid password or mismatched role");
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.username,
          role: user.role,
          sessionVersion: user.updatedAt.getTime(),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.sessionVersion = user.sessionVersion;
        token.teamId = (user as any).teamId;
        token.degree = (user as any).degree;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.sessionVersion = token.sessionVersion;
        session.user.teamId = token.teamId;
        session.user.degree = token.degree;
      }
      return session;
    },
  },
  // Required at runtime — NextAuth throws in production if NEXTAUTH_SECRET is
  // missing. No dev fallback is provided here.
  secret: process.env.NEXTAUTH_SECRET,
};

// Type augmentation so role, teamId, and degree are visible on session.user
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: import("@prisma/client").Role;
      sessionVersion: number;
      teamId?: string | null;
      degree?: string | null;
    };
  }
  interface User {
    role: import("@prisma/client").Role;
    sessionVersion: number;
    teamId?: string | null;
    degree?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: import("@prisma/client").Role;
    sessionVersion: number;
    teamId?: string | null;
    degree?: string | null;
  }
}
