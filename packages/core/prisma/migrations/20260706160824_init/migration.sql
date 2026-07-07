-- CreateEnum
CREATE TYPE "ArtifactType" AS ENUM ('html', 'image', 'pdf');

-- CreateTable
CREATE TABLE "Artifact" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ArtifactType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "tags" TEXT[],
    "sourceTool" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Artifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "artifactId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareLink" (
    "id" TEXT NOT NULL,
    "artifactId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Artifact_type_idx" ON "Artifact"("type");

-- CreateIndex
CREATE INDEX "Artifact_tags_idx" ON "Artifact"("tags");

-- CreateIndex
CREATE INDEX "Artifact_createdAt_idx" ON "Artifact"("createdAt");

-- CreateIndex
CREATE INDEX "Comment_artifactId_idx" ON "Comment"("artifactId");

-- CreateIndex
CREATE UNIQUE INDEX "ShareLink_token_key" ON "ShareLink"("token");

-- CreateIndex
CREATE INDEX "ShareLink_token_idx" ON "ShareLink"("token");

-- CreateIndex
CREATE INDEX "ShareLink_artifactId_idx" ON "ShareLink"("artifactId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
