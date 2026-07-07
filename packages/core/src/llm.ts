import Anthropic from "@anthropic-ai/sdk";
import type { ArtifactType } from "./types";

const MODEL = "claude-opus-4-8";

let client: Anthropic | undefined;
function anthropic(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}

const METADATA_SCHEMA = {
  type: "object" as const,
  properties: {
    title: { type: "string" as const },
    description: { type: "string" as const },
    tags: { type: "array" as const, items: { type: "string" as const } },
  },
  required: ["title", "description", "tags"],
  additionalProperties: false,
};

interface GenerateMetadataInput {
  type: ArtifactType;
  content: string; // raw text for html
  buffer: Buffer; // decoded bytes for image/pdf
  mimeType: string;
}

export interface GeneratedMetadata {
  title: string;
  description: string;
  tags: string[];
}

export async function generateArtifactMetadata(
  input: GenerateMetadataInput,
): Promise<GeneratedMetadata> {
  const instruction =
    "Look at this artifact and produce a concise, specific title (max 8 words), " +
    "a one-sentence description, and 3-6 lowercase kebab-case tags describing its " +
    "content, purpose, and type.";

  const contentBlock: Anthropic.Messages.ContentBlockParam =
    input.type === "html"
      ? { type: "text", text: `HTML artifact source:\n\n${input.content.slice(0, 8000)}` }
      : input.type === "image"
        ? {
            type: "image",
            source: {
              type: "base64",
              media_type: input.mimeType as "image/png" | "image/jpeg" | "image/gif" | "image/webp",
              data: input.buffer.toString("base64"),
            },
          }
        : {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: input.buffer.toString("base64"),
            },
          };

  const response = await anthropic().messages.create({
    model: MODEL,
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: METADATA_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content: [contentBlock, { type: "text", text: instruction }],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("LLM did not return metadata");
  }
  return JSON.parse(textBlock.text) as GeneratedMetadata;
}

export interface FeedbackComment {
  authorName: string;
  body: string;
  createdAt: Date;
}

export type FeedbackSummaryPreset = "overview" | "action-items" | "sentiment";

const PRESET_INSTRUCTIONS: Record<FeedbackSummaryPreset, string> = {
  overview:
    "Summarize the following reviewer comments on a shared artifact into: " +
    "(1) recurring themes, (2) concrete action items, (3) any conflicting opinions.",
  "action-items":
    "Read the following reviewer comments on a shared artifact and extract only the concrete, " +
    "actionable changes reviewers are requesting. Return a prioritized bullet list — skip praise, " +
    "chit-chat, and anything that isn't an actionable request.",
  sentiment:
    "Read the following reviewer comments on a shared artifact and assess overall sentiment: " +
    "the balance of praise vs. criticism, tone, and any notably strong reactions (positive or negative).",
};

export interface SummarizeFeedbackOptions {
  preset?: FeedbackSummaryPreset;
  customPrompt?: string;
}

export async function summarizeFeedback(
  comments: FeedbackComment[],
  options: SummarizeFeedbackOptions = {},
): Promise<string> {
  if (comments.length === 0) {
    return "No feedback yet.";
  }

  const transcript = comments
    .map((c) => `- ${c.authorName} (${c.createdAt.toISOString()}): ${c.body}`)
    .join("\n");

  const instruction =
    options.customPrompt?.trim() || PRESET_INSTRUCTIONS[options.preset ?? "overview"];

  const response = await anthropic().messages.create({
    model: MODEL,
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium" },
    messages: [
      {
        role: "user",
        content:
          `${instruction} Keep it under 200 words, use markdown headers.\n\n` + transcript,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text : "";
}

const SEARCH_SCHEMA = {
  type: "object" as const,
  properties: {
    ids: { type: "array" as const, items: { type: "string" as const } },
  },
  required: ["ids"],
  additionalProperties: false,
};

export interface SearchCandidate {
  id: string;
  title: string;
  description: string;
  tags: string[];
  type: ArtifactType;
}

export async function rerankArtifactsForSearch(
  query: string,
  candidates: SearchCandidate[],
): Promise<string[]> {
  if (candidates.length === 0) return [];

  const response = await anthropic().messages.create({
    model: MODEL,
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: SEARCH_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content:
          `User search query: "${query}"\n\n` +
          `Candidate artifacts (JSON):\n${JSON.stringify(candidates)}\n\n` +
          "Return the ids of artifacts relevant to the query, ordered from most to least relevant. " +
          "Omit ids that are not relevant at all.",
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return [];
  const parsed = JSON.parse(textBlock.text) as { ids: string[] };
  return parsed.ids;
}
