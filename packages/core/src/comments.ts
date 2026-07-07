import { prisma } from "./db";
import { summarizeFeedback } from "./llm";
import type { CommentInput } from "./types";

export async function addComment(input: CommentInput) {
  return prisma.comment.create({
    data: {
      artifactId: input.artifactId,
      authorName: input.authorName,
      body: input.body,
    },
  });
}

export async function listComments(artifactId: string) {
  return prisma.comment.findMany({
    where: { artifactId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getFeedbackSummary(artifactId: string): Promise<string> {
  const comments = await listComments(artifactId);
  return summarizeFeedback(comments);
}
