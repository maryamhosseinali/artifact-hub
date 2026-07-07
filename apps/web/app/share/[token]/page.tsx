import { notFound } from "next/navigation";
import Alert from "@mui/material/Alert";
import { resolveShareLink } from "core";
import { SharedArtifactView } from "@/components/SharedArtifactView";

export default async function SharedArtifactPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const resolution = await resolveShareLink(token);

  if (resolution.status === "not_found") notFound();

  if (resolution.status === "expired") {
    return <Alert severity="warning">This share link has expired.</Alert>;
  }

  const { artifact } = resolution;

  return <SharedArtifactView artifact={artifact} />;
}
