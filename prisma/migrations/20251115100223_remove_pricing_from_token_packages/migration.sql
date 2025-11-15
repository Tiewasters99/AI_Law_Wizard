/*
  Warnings:

  - You are about to drop the column `priceInCents` on the `token_packages` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."AdminAction" ADD VALUE 'FEATURE_PRICING_CREATED';
ALTER TYPE "public"."AdminAction" ADD VALUE 'FEATURE_PRICING_UPDATED';
ALTER TYPE "public"."AdminAction" ADD VALUE 'FEATURE_PRICING_DELETED';

-- AlterTable
ALTER TABLE "public"."token_packages" DROP COLUMN "priceInCents";

-- CreateTable
CREATE TABLE "public"."feature_pricing" (
    "id" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "tokens" INTEGER NOT NULL,
    "role" "public"."Role",
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "feature_pricing_feature_idx" ON "public"."feature_pricing"("feature");

-- CreateIndex
CREATE INDEX "feature_pricing_role_idx" ON "public"."feature_pricing"("role");

-- CreateIndex
CREATE UNIQUE INDEX "feature_pricing_feature_role_key" ON "public"."feature_pricing"("feature", "role");
