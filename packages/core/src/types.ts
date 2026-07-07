export type ArtifactType = "html" | "image" | "pdf";

export type ArtifactFolder =
  | "Engineering"
  | "Design"
  | "Product"
  | "Marketing"
  | "Documentation"
  | "Business"
  | "Other";

export const ARTIFACT_FOLDERS: ArtifactFolder[] = [
  "Engineering",
  "Design",
  "Product",
  "Marketing",
  "Documentation",
  "Business",
  "Other",
];

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
  folder?: ArtifactFolder;
}

export interface CommentInput {
  artifactId: string;
  authorName: string;
  body: string;
}
