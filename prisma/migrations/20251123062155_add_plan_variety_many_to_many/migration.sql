/*
  Warnings:

  - You are about to drop the column `cropVarietyId` on the `StandardPlan` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "StandardPlan" DROP CONSTRAINT "StandardPlan_cropVarietyId_fkey";

-- DropIndex
DROP INDEX "StandardPlan_cropVarietyId_idx";

-- AlterTable
ALTER TABLE "StandardPlan" DROP COLUMN "cropVarietyId";

-- CreateTable
CREATE TABLE "PlanVariety" (
    "id" TEXT NOT NULL,
    "standardPlanId" TEXT NOT NULL,
    "cropVarietyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanVariety_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlanVariety_standardPlanId_idx" ON "PlanVariety"("standardPlanId");

-- CreateIndex
CREATE INDEX "PlanVariety_cropVarietyId_idx" ON "PlanVariety"("cropVarietyId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanVariety_standardPlanId_cropVarietyId_key" ON "PlanVariety"("standardPlanId", "cropVarietyId");

-- AddForeignKey
ALTER TABLE "PlanVariety" ADD CONSTRAINT "PlanVariety_standardPlanId_fkey" FOREIGN KEY ("standardPlanId") REFERENCES "StandardPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanVariety" ADD CONSTRAINT "PlanVariety_cropVarietyId_fkey" FOREIGN KEY ("cropVarietyId") REFERENCES "CropVariety"("id") ON DELETE CASCADE ON UPDATE CASCADE;
