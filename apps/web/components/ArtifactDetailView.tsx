"use client";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import ShareIcon from "@mui/icons-material/Share";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";
import type { ArtifactType } from "core";
import { ArtifactViewer } from "@/components/ArtifactViewer";
import { CommentForm } from "@/components/CommentForm";
import { CommentList } from "@/components/CommentList";
import { ShareButton } from "@/components/ShareButton";
import { FeedbackSummaryButton } from "@/components/FeedbackSummaryButton";

export function ArtifactDetailView({
  artifact,
  comments,
}: {
  artifact: {
    id: string;
    title: string;
    description: string;
    type: ArtifactType;
    fileUrl: string;
    tags: string[];
  };
  comments: { id: string; authorName: string; body: string; createdAt: Date }[];
}) {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
              {artifact.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              {artifact.description}
            </Typography>
            {artifact.tags.length > 0 && (
              <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.75, mt: 1.5 }}>
                {artifact.tags.map((tag) => (
                  <Chip key={tag} size="small" label={tag} variant="outlined" sx={{ borderColor: "divider" }} />
                ))}
              </Stack>
            )}
          </Box>

          <ArtifactViewer type={artifact.type} fileUrl={artifact.fileUrl} title={artifact.title} />

          <Box>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mb: 1.5 }}>
              <ChatBubbleOutlineIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="subtitle2">Comments ({comments.length})</Typography>
            </Stack>
            <Box sx={{ mb: 2 }}>
              <CommentForm artifactId={artifact.id} />
            </Box>
            <CommentList comments={comments} />
          </Box>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mb: 1.5 }}>
              <ShareIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="subtitle2">Share</Typography>
            </Stack>
            <ShareButton artifactId={artifact.id} />
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mb: 1.5 }}>
              <AutoAwesomeIcon sx={{ fontSize: 18, color: "accent.main" }} />
              <Typography variant="subtitle2">Feedback summary</Typography>
            </Stack>
            <FeedbackSummaryButton artifactId={artifact.id} />
          </Paper>
        </Stack>
      </Grid>
    </Grid>
  );
}
