-- DropIndex
DROP INDEX "WeddingProject_userId_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activeProjectId" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'COUPLE';

-- AlterTable
ALTER TABLE "WeddingProject" ADD COLUMN     "coupleEmail" TEXT,
ADD COLUMN     "coupleName" TEXT,
ADD COLUMN     "notes" TEXT;
