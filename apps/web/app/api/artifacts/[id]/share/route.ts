import { createShareLink } from "core";

const MIN_EXPIRY_SECONDS = 60;
const MAX_EXPIRY_SECONDS = 60 * 60 * 24 * 30; // 30 days

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const expiresIn = Number(body.expiresInSeconds ?? 60 * 60 * 24 * 7);
  if (!Number.isFinite(expiresIn) || expiresIn < MIN_EXPIRY_SECONDS || expiresIn > MAX_EXPIRY_SECONDS) {
    return Response.json(
      { error: `expiresInSeconds must be between ${MIN_EXPIRY_SECONDS} and ${MAX_EXPIRY_SECONDS}` },
      { status: 400 },
    );
  }

  try {
    const shareLink = await createShareLink(id, expiresIn);
    return Response.json({ shareLink }, { status: 201 });
  } catch {
    return Response.json({ error: "Artifact not found" }, { status: 404 });
  }
}
