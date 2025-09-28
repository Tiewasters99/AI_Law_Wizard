-- AlterTable
ALTER TABLE "public"."embedding_chunks" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "summary" TEXT;
