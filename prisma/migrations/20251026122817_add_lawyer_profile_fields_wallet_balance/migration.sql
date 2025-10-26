/*
  Warnings:

  - You are about to drop the column `tokens` on the `wallets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."blogs" ADD COLUMN     "category" TEXT,
ADD COLUMN     "readTime" INTEGER,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."lawyer_profiles" ADD COLUMN     "availability" TEXT,
ADD COLUMN     "barNumber" TEXT,
ADD COLUMN     "casesHandled" INTEGER,
ADD COLUMN     "hourlyRate" DOUBLE PRECISION,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "practiceAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "rating" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."wallets" DROP COLUMN "tokens",
ADD COLUMN     "balance" INTEGER NOT NULL DEFAULT 0;
