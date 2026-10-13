import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession, jsonError } from "@/lib/api-auth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/participant/credentials
 * Allows an authenticated participant to update their login username and/or password.
 */
export async function PATCH(req: Request) {
  try {
    const ctx = await requireSession();

    if (ctx.role !== "PARTICIPANT" && ctx.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Only registered participants can update credentials." },
        { status: 403 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const newUsername = body.username ? String(body.username).trim().toLowerCase() : undefined;
    const newPassword = body.password ? String(body.password).trim() : undefined;

    if (!newUsername && !newPassword) {
      return NextResponse.json(
        { error: "Please provide a new username or password to update." },
        { status: 400 },
      );
    }

    const currentEmail = ctx.email.toLowerCase().trim();

    // Look up participant and team
    const participant = await db.participant.findFirst({
      where: { email: currentEmail },
      include: {
        team: {
          include: {
            members: {
              orderBy: { isLeader: "desc" },
            },
          },
        },
      },
    });

    if (!participant || !participant.team) {
      return NextResponse.json(
        { error: "Team not found for participant credentials." },
        { status: 404 },
      );
    }

    const team = participant.team;
    const leader = team.members.find((m) => m.isLeader) || participant;

    let updatedUsername = leader.email;
    let updatedPassword = team.participantPassword;

    // 1. Update Username (Email)
    if (newUsername && newUsername !== currentEmail) {
      // Validate email format
      if (!newUsername.includes("@") || !newUsername.includes(".")) {
        return NextResponse.json(
          { error: "Please provide a valid email address for username." },
          { status: 400 },
        );
      }

      // Check if another user/participant already has this email
      const existingUser = await db.user.findFirst({
        where: {
          OR: [{ email: newUsername }, { username: newUsername }],
          NOT: { email: currentEmail },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "This email address is already in use by another account." },
          { status: 400 },
        );
      }

      // Update User record
      await db.user.updateMany({
        where: { email: currentEmail },
        data: {
          email: newUsername,
          username: newUsername,
        },
      });

      // Update Leader Participant record
      await db.participant.update({
        where: { id: leader.id },
        data: { email: newUsername },
      });

      updatedUsername = newUsername;
    }

    // 2. Update Password
    if (newPassword) {
      if (newPassword.length < 4) {
        return NextResponse.json(
          { error: "Password must be at least 4 characters." },
          { status: 400 },
        );
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Update User record passwordHash
      await db.user.updateMany({
        where: {
          OR: [
            { email: updatedUsername.toLowerCase() },
            { username: updatedUsername.toLowerCase() },
            { email: currentEmail },
          ],
        },
        data: { passwordHash },
      });

      // Update Team record participantPassword
      await db.team.update({
        where: { id: team.id },
        data: { participantPassword: newPassword },
      });

      updatedPassword = newPassword;
    }

    return NextResponse.json({
      success: true,
      message: "Credentials updated successfully!",
      username: updatedUsername,
      password: updatedPassword,
    });
  } catch (err) {
    return jsonError(err);
  }
}
