-- AlterTable
ALTER TABLE "public"."consultation_requests" ADD COLUMN     "viewedByAttorney" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "viewedByClient" BOOLEAN NOT NULL DEFAULT false;
