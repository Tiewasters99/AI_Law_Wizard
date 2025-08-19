/*
  Warnings:

  - A unique constraint covering the columns `[oneDriveId]` on the table `embedding_jobs` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."embedding_jobs" ADD COLUMN     "isOneDriveFile" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "oneDriveId" TEXT,
ADD COLUMN     "oneDriveLastModified" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "embedding_jobs_oneDriveId_key" ON "public"."embedding_jobs"("oneDriveId");
