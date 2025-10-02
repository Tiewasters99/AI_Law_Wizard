-- AlterTable
ALTER TABLE "public"."customer_profiles" ADD COLUMN     "industry" TEXT,
ADD COLUMN     "needs" TEXT;

-- AlterTable
ALTER TABLE "public"."lawyer_profiles" ADD COLUMN     "firmName" TEXT,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "profileComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profileData" JSONB;
