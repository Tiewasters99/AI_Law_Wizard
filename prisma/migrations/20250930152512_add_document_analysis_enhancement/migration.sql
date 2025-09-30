-- CreateEnum
CREATE TYPE "public"."ChatMode" AS ENUM ('QA', 'ACTION');

-- AlterTable
ALTER TABLE "public"."document_queries" ADD COLUMN     "chatSessionId" TEXT,
ADD COLUMN     "conversationContext" JSONB,
ADD COLUMN     "documentSessionId" TEXT,
ADD COLUMN     "followUpQuestion" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentQueryId" TEXT;

-- CreateTable
CREATE TABLE "public"."document_analysis_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "mode" "public"."ChatMode" NOT NULL DEFAULT 'QA',
    "title" TEXT,
    "context" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_analysis_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_analysis_messages" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "public"."MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "tokenCount" INTEGER,
    "modelUsed" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_analysis_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."file_contexts" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "chunksUsed" JSONB,
    "relevanceScore" DOUBLE PRECISION,
    "lastAccessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_contexts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."document_queries" ADD CONSTRAINT "document_queries_chatSessionId_fkey" FOREIGN KEY ("chatSessionId") REFERENCES "public"."chat_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_queries" ADD CONSTRAINT "document_queries_documentSessionId_fkey" FOREIGN KEY ("documentSessionId") REFERENCES "public"."document_analysis_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_queries" ADD CONSTRAINT "document_queries_parentQueryId_fkey" FOREIGN KEY ("parentQueryId") REFERENCES "public"."document_queries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_analysis_sessions" ADD CONSTRAINT "document_analysis_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_analysis_messages" ADD CONSTRAINT "document_analysis_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."document_analysis_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."file_contexts" ADD CONSTRAINT "file_contexts_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."document_analysis_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
