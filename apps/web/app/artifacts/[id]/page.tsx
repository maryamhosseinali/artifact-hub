import { notFound } from "next/navigation";
import { getArtifact, listComments } from "core";
import { ArtifactDetailView } from "@/components/ArtifactDetailView";

export default async function ArtifactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artifact = await getArtifact(id);
  if (!artifact) notFound();

  const comments = await listComments(id);

  return <ArtifactDetailView artifact={artifact} comments={comments} />;
}
