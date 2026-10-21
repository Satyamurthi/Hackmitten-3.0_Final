import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const teamCount = await db.team.count();
  const participantCount = await db.participant.count();
  console.log(`Teams in DB: ${teamCount}, Participants in DB: ${participantCount}`);

  const sample = await db.team.findFirst({
    where: { members: { some: {} } },
    include: { members: true },
  });

  if (sample) {
    console.log("Sample Team:", {
      teamName: sample.teamName,
      registrationId: sample.registrationId,
      status: sample.status,
      members: sample.members.map(m => ({
        fullName: m.fullName,
        college: m.college,
        participantId: m.participantId,
        qrToken: m.qrToken,
        participantImagePath: m.participantImagePath,
      }))
    });
  }
}

main().finally(() => db.$disconnect());
