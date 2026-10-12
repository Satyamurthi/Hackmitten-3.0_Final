-- AlterTable
ALTER TABLE "Team" ADD COLUMN "degree" TEXT,
ADD COLUMN "domainId" TEXT,
ADD COLUMN "domainName" TEXT;

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "degrees" TEXT[],
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentQrCode" (
    "id" TEXT NOT NULL,
    "label" TEXT,
    "degrees" TEXT[],
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "upiId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentQrCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Domain_name_key" ON "Domain"("name");

-- CreateIndex
CREATE INDEX "Domain_enabled_idx" ON "Domain"("enabled");

-- CreateIndex
CREATE INDEX "Domain_name_idx" ON "Domain"("name");

-- CreateIndex
CREATE INDEX "PaymentQrCode_createdAt_idx" ON "PaymentQrCode"("createdAt");

-- CreateIndex
CREATE INDEX "Team_degree_idx" ON "Team"("degree");

-- CreateIndex
CREATE INDEX "Team_domainId_idx" ON "Team"("domainId");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;
