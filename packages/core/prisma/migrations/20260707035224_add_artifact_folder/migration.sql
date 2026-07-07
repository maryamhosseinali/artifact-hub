-- CreateEnum
CREATE TYPE "ArtifactFolder" AS ENUM ('Engineering', 'Design', 'Product', 'Marketing', 'Documentation', 'Business', 'Other');

-- AlterTable
ALTER TABLE "Artifact" ADD COLUMN     "folder" "ArtifactFolder" NOT NULL DEFAULT 'Other';

-- CreateIndex
CREATE INDEX "Artifact_folder_idx" ON "Artifact"("folder");
