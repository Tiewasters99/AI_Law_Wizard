-- AlterTable
ALTER TABLE "public"."token_transactions" ADD COLUMN     "feature" TEXT;

-- CreateIndex
CREATE INDEX "token_transactions_feature_idx" ON "public"."token_transactions"("feature");

-- CreateIndex
CREATE INDEX "token_transactions_userId_feature_idx" ON "public"."token_transactions"("userId", "feature");
