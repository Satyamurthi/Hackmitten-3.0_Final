-- AlterTable
ALTER TABLE "Team" ADD COLUMN "participantPassword" TEXT,
ADD COLUMN "acceptedProblemStatementId" TEXT;

-- CreateIndex
CREATE INDEX "Team_acceptedProblemStatementId_idx" ON "Team"("acceptedProblemStatementId");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_acceptedProblemStatementId_fkey" FOREIGN KEY ("acceptedProblemStatementId") REFERENCES "ProblemStatement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
