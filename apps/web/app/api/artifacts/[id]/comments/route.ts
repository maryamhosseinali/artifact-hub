import { addComment, listComments } from "core";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const comments = await listComments(id);
  return Response.json({ comments });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const authorName = typeof body.authorName === "string" ? body.authorName.trim() : "";
  const commentBody = typeof body.body === "string" ? body.body.trim() : "";

  if (!authorName || !commentBody) {
    return Response.json({ error: "authorName and body are required" }, { status: 400 });
  }

  const comment = await addComment({ artifactId: id, authorName, body: commentBody });
  return Response.json({ comment }, { status: 201 });
}
