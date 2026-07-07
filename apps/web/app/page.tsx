import { listArtifacts, searchArtifacts } from "core";
import type { ArtifactType } from "core";
import { GalleryView } from "@/components/GalleryView";

const TYPES: ArtifactType[] = ["html", "image", "pdf"];

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; tag?: string; q?: string }>;
}) {
  const { type, tag, q } = await searchParams;

  const artifacts =
    q && q.trim().length > 0
      ? await searchArtifacts(q.trim())
      : await listArtifacts({
          type: type && TYPES.includes(type as ArtifactType) ? (type as ArtifactType) : undefined,
          tag: tag || undefined,
        });

  return <GalleryView artifacts={artifacts} q={q} type={type} tag={tag} />;
}
