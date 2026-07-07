import { randomBytes } from "node:crypto";
import { prisma } from "./db";

function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function createShareLink(artifactId: string, expiresInSeconds: number) {
  const artifact = await prisma.artifact.findUnique({ where: { id: artifactId } });
  if (!artifact) throw new Error("Artifact not found");

  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
  return prisma.shareLink.create({
    data: {
      artifactId,
      token: generateToken(),
      expiresAt,
    },
  });
}

export type ShareLinkResolution =
  | { status: "ok"; artifact: NonNullable<Awaited<ReturnType<typeof prisma.artifact.findUnique>>> }
  | { status: "expired" }
  | { status: "not_found" };

export async function resolveShareLink(token: string): Promise<ShareLinkResolution> {
  const shareLink = await prisma.shareLink.findUnique({
    where: { token },
    include: { artifact: true },
  });

  if (!shareLink) return { status: "not_found" };
  if (shareLink.expiresAt.getTime() < Date.now()) return { status: "expired" };

  return { status: "ok", artifact: shareLink.artifact };
}
