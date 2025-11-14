-- CreateEnum
CREATE TYPE "public"."AdminAction" AS ENUM ('LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'USER_PASSWORD_RESET', 'FEATURE_TOGGLED', 'FEATURE_CREATED', 'PRICING_UPDATED', 'PACKAGE_CREATED', 'PACKAGE_UPDATED', 'PACKAGE_DELETED', 'TOKEN_ADJUSTMENT', 'ROLE_PRICING_CREATED', 'ROLE_PRICING_UPDATED');

-- CreateEnum
CREATE TYPE "public"."FeatureCategory" AS ENUM ('DOCUMENT_PROCESSING', 'LEGAL_RESEARCH', 'DOCKET_GENIE', 'INTEGRATIONS', 'COMMUNICATION', 'ANALYTICS', 'CLIENT_MANAGEMENT', 'RESOURCES');

-- CreateTable
CREATE TABLE "public"."admins" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_activity_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" "public"."AdminAction" NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."features" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "route" TEXT NOT NULL,
    "category" "public"."FeatureCategory" NOT NULL,
    "isGlobal" BOOLEAN NOT NULL DEFAULT true,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."feature_roles" (
    "id" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "feature_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."role_pricing" (
    "id" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "packageId" TEXT NOT NULL,
    "priceInCents" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "public"."admins"("email");

-- CreateIndex
CREATE INDEX "admin_activity_logs_adminId_idx" ON "public"."admin_activity_logs"("adminId");

-- CreateIndex
CREATE INDEX "admin_activity_logs_createdAt_idx" ON "public"."admin_activity_logs"("createdAt");

-- CreateIndex
CREATE INDEX "admin_activity_logs_action_idx" ON "public"."admin_activity_logs"("action");

-- CreateIndex
CREATE UNIQUE INDEX "features_name_key" ON "public"."features"("name");

-- CreateIndex
CREATE UNIQUE INDEX "feature_roles_featureId_role_key" ON "public"."feature_roles"("featureId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "role_pricing_role_packageId_key" ON "public"."role_pricing"("role", "packageId");

-- AddForeignKey
ALTER TABLE "public"."admin_activity_logs" ADD CONSTRAINT "admin_activity_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."feature_roles" ADD CONSTRAINT "feature_roles_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "public"."features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_pricing" ADD CONSTRAINT "role_pricing_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "public"."token_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
