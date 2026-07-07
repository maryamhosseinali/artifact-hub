import { prisma } from "./db";
import { uploadArtifactContent } from "./storage";
import { generateArtifactMetadata, rerankArtifactsForSearch } from "./llm";
import type { ArtifactFilter, ArtifactInput } from "./types";

export async function createArtifact(input: ArtifactInput) {
  const { url, buffer, mimeType } = await uploadArtifactContent(input.content, input.type);

  let title = input.title;
  let description = input.description;
  let tags = input.tags;

  if (!title || !description || !tags || tags.length === 0) {
    const generated = await generateArtifactMetadata({
      type: input.type,
      content: input.content,
      buffer,
      mimeType,
    });
    title ??= generated.title;
    description ??= generated.description;
    tags = tags && tags.length > 0 ? tags : generated.tags;
  }

  return prisma.artifact.create({
    data: {
      title,
      description,
      type: input.type,
      fileUrl: url,
      tags,
      sourceTool: input.sourceTool,
    },
  });
}

export async function listArtifacts(filter: ArtifactFilter = {}) {
  return prisma.artifact.findMany({
    where: {
      type: filter.type,
      tags: filter.tag ? { has: filter.tag } : undefined,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getArtifact(id: string) {
  return prisma.artifact.findUnique({ where: { id } });
}

export async function searchArtifacts(query: string) {
  const candidates = await prisma.artifact.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const ids = await rerankArtifactsForSearch(
    query,
    candidates.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      tags: a.tags,
      type: a.type,
    })),
  );

  const byId = new Map(candidates.map((a) => [a.id, a]));
  return ids.map((id) => byId.get(id)).filter((a): a is NonNullable<typeof a> => Boolean(a));
}
