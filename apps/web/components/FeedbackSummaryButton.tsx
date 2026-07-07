"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export function FeedbackSummaryButton({ artifactId }: { artifactId: string }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/artifacts/${artifactId}/feedback-summary`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to summarize feedback");
        return;
      }
      setSummary(data.summary);
    } catch {
      setError("Network error while summarizing feedback");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleClick}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <AutoAwesomeIcon sx={{ color: "accent.main" }} />}
      >
        {loading ? "Summarizing…" : "Summarize feedback"}
      </Button>
      {error && (
        <Alert severity="error" sx={{ mt: 1.5 }}>
          {error}
        </Alert>
      )}
      {summary && (
        <Paper
          variant="outlined"
          sx={{ mt: 1.5, p: 1.5, borderLeft: "3px solid", borderLeftColor: "accent.main" }}
        >
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mb: 0.5 }}>
            <AutoAwesomeIcon sx={{ fontSize: 14, color: "accent.main" }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              AI-generated summary
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
            {summary}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
