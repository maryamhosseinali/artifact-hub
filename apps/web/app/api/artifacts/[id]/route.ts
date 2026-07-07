import { getArtifact } from "core";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artifact = await getArtifact(id);
  if (!artifact) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ artifact });
}
