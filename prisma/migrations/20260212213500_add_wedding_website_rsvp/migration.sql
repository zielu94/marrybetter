-- AlterTable
ALTER TABLE "WeddingProject" ADD COLUMN "slug" TEXT;
ALTER TABLE "WeddingProject" ADD COLUMN "isPublicWebsite" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "WeddingProject" ADD COLUMN "websiteHeroImage" TEXT;
ALTER TABLE "WeddingProject" ADD COLUMN "websiteStory" TEXT;
ALTER TABLE "WeddingProject" ADD COLUMN "websiteAccommodation" TEXT;

-- AlterTable
ALTER TABLE "Guest" ADD COLUMN "invitationToken" TEXT;
ALTER TABLE "Guest" ADD COLUMN "tokenCreatedAt" TIMESTAMP(3);
ALTER TABLE "Guest" ADD COLUMN "rsvpRespondedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "WeddingProject_slug_key" ON "WeddingProject"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Guest_invitationToken_key" ON "Guest"("invitationToken");
