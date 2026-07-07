import { getFeedbackSummary } from "core";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const summary = await getFeedbackSummary(id);
  return Response.json({ summary });
}
