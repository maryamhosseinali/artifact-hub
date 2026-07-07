export type ArtifactType = "html" | "image" | "pdf";

export interface ArtifactInput {
  content: string;
  type: ArtifactType;
  title?: string;
  description?: string;
  tags?: string[];
  sourceTool?: string;
}

export interface ArtifactFilter {
  type?: ArtifactType;
  tag?: string;
}

export interface CommentInput {
  artifactId: string;
  authorName: string;
  body: string;
}
