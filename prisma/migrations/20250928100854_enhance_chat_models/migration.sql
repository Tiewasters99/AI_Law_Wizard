-- AlterTable
ALTER TABLE "public"."chat_messages" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "modelUsed" TEXT,
ADD COLUMN     "tokenCount" INTEGER;

-- AlterTable
ALTER TABLE "public"."chat_sessions" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."chat_sessions" ADD CONSTRAINT "chat_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
