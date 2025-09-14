-- CreateTable
CREATE TABLE "public"."document_queries" (
    "id" TEXT NOT NULL,
    "userQuery" TEXT NOT NULL,
    "aiResponse" TEXT NOT NULL,
    "searchQuery" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "confidence" DOUBLE PRECISION,
    "processingTime" INTEGER,
    "totalSteps" INTEGER NOT NULL DEFAULT 1,
    "completedSteps" INTEGER NOT NULL DEFAULT 1,
    "toolsUsed" TEXT[],
    "filesProcessed" JSONB,
    "userId" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_queries_pkey" PRIMARY KEY ("id")
);
