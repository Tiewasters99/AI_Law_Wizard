-- AlterTable
ALTER TABLE "public"."embedding_jobs" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."embedding_jobs" ADD CONSTRAINT "embedding_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
