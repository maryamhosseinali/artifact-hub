import { prisma } from "./db";
import { uploadArtifactContent } from "./storage";
import { generateArtifactMetadata, rerankArtifactsForSearch } from "./llm";
import type { ArtifactFilter, ArtifactInput } from "./types";

export async function createArtifact(input: ArtifactInput) {
  const { url, buffer, mimeType } = await uploadArtifactContent(input.content, input.type);

  // Folder is always AI-assigned (no manual organization), so metadata generation
  // always runs even when title/description/tags are supplied by the caller.
  const generated = await generateArtifactMetadata({
    type: input.type,
    content: input.content,
    buffer,
    mimeType,
  });

  const title = input.title || generated.title;
  const description = input.description || generated.description;
  const tags = input.tags && input.tags.length > 0 ? input.tags : generated.tags;

  return prisma.artifact.create({
    data: {
      title,
      description,
      type: input.type,
      fileUrl: url,
      tags,
      folder: generated.folder,
      sourceTool: input.sourceTool,
    },
  });
}

export async function listArtifacts(filter: ArtifactFilter = {}) {
  return prisma.artifact.findMany({
    where: {
      type: filter.type,
      tags: filter.tag ? { has: filter.tag } : undefined,
      folder: filter.folder,
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
