-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT IF EXISTS "Comment_userId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN IF EXISTS "userId";

-- CreateEnum
DO $$ BEGIN
 CREATE TYPE "CommentStatus" AS ENUM('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "status" "CommentStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing comments to APPROVED if they were approved
UPDATE "Comment" SET "status" = 'APPROVED' WHERE "approved" = true;
UPDATE "Comment" SET "status" = 'REJECTED' WHERE "approved" = false AND EXISTS (SELECT 1 FROM "Comment" c2 WHERE c2.id = "Comment".id);

-- DropColumn
ALTER TABLE "Comment" DROP COLUMN IF EXISTS "approved";

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Comment_status_idx" ON "Comment"("status");
CREATE INDEX IF NOT EXISTS "Comment_createdAt_idx" ON "Comment"("createdAt");

-- DropTable
DROP TABLE IF EXISTS "User";


