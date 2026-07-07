import { getFeedbackSummary } from "core";
import type { FeedbackSummaryPreset } from "core";

const VALID_PRESETS: FeedbackSummaryPreset[] = ["overview", "action-items", "sentiment"];

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const presetParam = searchParams.get("preset");
  const customPrompt = searchParams.get("customPrompt");

  const preset = presetParam && VALID_PRESETS.includes(presetParam as FeedbackSummaryPreset)
    ? (presetParam as FeedbackSummaryPreset)
    : undefined;

  try {
    const summary = await getFeedbackSummary(id, {
      preset,
      customPrompt: customPrompt?.trim() || undefined,
    });
    return Response.json({ summary });
  } catch (error) {
    console.error("Failed to summarize feedback", error);
    return Response.json({ error: "Failed to summarize feedback. Please try again." }, { status: 500 });
  }
}
