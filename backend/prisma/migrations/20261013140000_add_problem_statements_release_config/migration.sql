-- AlterTable
ALTER TABLE "EventConfig" ADD COLUMN IF NOT EXISTS "problemStatementsReleaseTime" TEXT;
ALTER TABLE "EventConfig" ADD COLUMN IF NOT EXISTS "problemStatementsReleased" BOOLEAN NOT NULL DEFAULT false;
