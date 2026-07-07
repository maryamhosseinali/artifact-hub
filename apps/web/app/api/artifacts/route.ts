import { createArtifact, listArtifacts, searchArtifacts } from "core";
import type { ArtifactType } from "core";

const VALID_TYPES: ArtifactType[] = ["html", "image", "pdf"];
const MAX_FILE_BYTES = 20 * 1024 * 1024;

function artifactTypeFromMime(mime: string): ArtifactType | null {
  if (mime === "text/html") return "html";
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("image/")) return "image";
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const tag = searchParams.get("tag");
  const q = searchParams.get("q");

  if (type && !VALID_TYPES.includes(type as ArtifactType)) {
    return Response.json({ error: "Invalid type filter" }, { status: 400 });
  }

  if (q && q.trim().length > 0) {
    const results = await searchArtifacts(q.trim());
    return Response.json({ artifacts: results });
  }

  const artifacts = await listArtifacts({
    type: (type as ArtifactType) || undefined,
    tag: tag || undefined,
  });
  return Response.json({ artifacts });
}

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "Missing file" }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return Response.json({ error: "File too large (max 20MB)" }, { status: 400 });
  }

  const type = artifactTypeFromMime(file.type);
  if (!type) {
    return Response.json(
      { error: "Unsupported file type. Use HTML, an image, or a PDF." },
      { status: 400 },
    );
  }

  const content =
    type === "html"
      ? await file.text()
      : `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString("base64")}`;

  const title = form.get("title");
  const description = form.get("description");
  const tagsRaw = form.get("tags");
  const tags =
    typeof tagsRaw === "string" && tagsRaw.trim().length > 0
      ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
      : undefined;

  try {
    const artifact = await createArtifact({
      content,
      type,
      title: typeof title === "string" && title.trim() ? title.trim() : undefined,
      description: typeof description === "string" && description.trim() ? description.trim() : undefined,
      tags,
      sourceTool: "web",
    });

    return Response.json({ artifact }, { status: 201 });
  } catch (error) {
    console.error("Failed to create artifact", error);
    return Response.json({ error: "Failed to publish artifact. Please try again." }, { status: 500 });
  }
}
