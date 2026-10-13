-- CreateTable
CREATE TABLE "ProblemStatement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "degrees" TEXT[],
    "domainId" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProblemStatement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProblemStatement_isPublished_idx" ON "ProblemStatement"("isPublished");

-- CreateIndex
CREATE INDEX "ProblemStatement_domainId_idx" ON "ProblemStatement"("domainId");

-- CreateIndex
CREATE INDEX "ProblemStatement_createdAt_idx" ON "ProblemStatement"("createdAt");

-- AddForeignKey
ALTER TABLE "ProblemStatement" ADD CONSTRAINT "ProblemStatement_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;
