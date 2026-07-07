"use client";

import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ArtifactType } from "core";

export function ArtifactViewer({ type, fileUrl, title }: { type: ArtifactType; fileUrl: string; title: string }) {
  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", px: 1.5, py: 1, bgcolor: "background.default", borderBottom: "1px solid", borderColor: "divider" }}>
        <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: "divider" }} />
        <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: "divider" }} />
        <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: "divider" }} />
        <Typography variant="caption" color="text.secondary" noWrap sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Stack>
      {type === "html" && (
        // Rendered in a sandboxed iframe with no allow-same-origin, and served from
        // Vercel Blob's own origin (not this app's) — arbitrary/LLM-generated HTML
        // can run script but cannot read this app's cookies or call its API as the viewer.
        <Box component="iframe" src={fileUrl} title={title} sandbox="allow-scripts" sx={{ width: "100%", height: "65vh", border: 0, bgcolor: "#fff" }} />
      )}
      {type === "image" && (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", maxHeight: "65vh", bgcolor: "background.default", p: 2 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fileUrl} alt={title} style={{ maxHeight: "60vh", width: "auto", maxWidth: "100%", objectFit: "contain", borderRadius: 4 }} />
        </Box>
      )}
      {type === "pdf" && <Box component="iframe" src={fileUrl} title={title} sx={{ width: "100%", height: "65vh", border: 0, bgcolor: "#fff" }} />}
    </Paper>
  );
}
