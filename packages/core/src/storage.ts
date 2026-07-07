import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import type { ArtifactType } from "./types";

const EXTENSION: Record<ArtifactType, string> = {
  html: "html",
  image: "bin", // overwritten once we know the real mime type
  pdf: "pdf",
};

const DEFAULT_MIME: Record<ArtifactType, string> = {
  html: "text/html",
  image: "image/png",
  pdf: "application/pdf",
};

function decodeContent(content: string, type: ArtifactType): { buffer: Buffer; mimeType: string } {
  if (type === "html") {
    return { buffer: Buffer.from(content, "utf-8"), mimeType: "text/html" };
  }

  const dataUrlMatch = content.match(/^data:([^;]+);base64,([\s\S]*)$/);
  const base64 = dataUrlMatch ? dataUrlMatch[2] : content;
  const mimeType = dataUrlMatch ? dataUrlMatch[1] : DEFAULT_MIME[type];
  return { buffer: Buffer.from(base64, "base64"), mimeType };
}

export async function uploadArtifactContent(
  content: string,
  type: ArtifactType,
): Promise<{ url: string; buffer: Buffer; mimeType: string }> {
  const { buffer, mimeType } = decodeContent(content, type);
  const extension = mimeType.split("/")[1] ?? EXTENSION[type];
  const pathname = `artifacts/${randomUUID()}.${extension}`;

  const blob = await put(pathname, buffer, {
    access: "public",
    contentType: mimeType,
  });

  return { url: blob.url, buffer, mimeType };
}
