"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ArtifactType } from "core";
import { ArtifactViewer } from "@/components/ArtifactViewer";

export function SharedArtifactView({
  artifact,
}: {
  artifact: { title: string; description: string; type: ArtifactType; fileUrl: string };
}) {
  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
          {artifact.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          {artifact.description}
        </Typography>
      </Box>
      <ArtifactViewer type={artifact.type} fileUrl={artifact.fileUrl} title={artifact.title} />
    </Stack>
  );
}
