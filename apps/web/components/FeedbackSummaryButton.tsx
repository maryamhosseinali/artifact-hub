"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { Markdown } from "@/components/Markdown";

const PRESETS = [
  { value: "overview", label: "Overview" },
  { value: "action-items", label: "Action items only" },
  { value: "sentiment", label: "Sentiment & tone" },
  { value: "custom", label: "Custom prompt…" },
] as const;

export function FeedbackSummaryButton({ artifactId }: { artifactId: string }) {
  const [preset, setPreset] = useState<(typeof PRESETS)[number]["value"]>("overview");
  const [customPrompt, setCustomPrompt] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (preset === "custom") {
        params.set("customPrompt", customPrompt.trim());
      } else {
        params.set("preset", preset);
      }
      const res = await fetch(`/api/artifacts/${artifactId}/feedback-summary?${params.toString()}`);
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

  const customPromptEmpty = preset === "custom" && customPrompt.trim().length === 0;

  return (
    <Box>
      <Stack spacing={1}>
        <Select value={preset} onChange={(e) => setPreset(e.target.value as (typeof PRESETS)[number]["value"])} fullWidth>
          {PRESETS.map((p) => (
            <MenuItem key={p.value} value={p.value}>
              {p.label}
            </MenuItem>
          ))}
        </Select>
        {preset === "custom" && (
          <TextField
            placeholder="e.g. focus only on complaints about the color scheme"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            multiline
            rows={2}
            fullWidth
          />
        )}
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleClick}
          disabled={loading || customPromptEmpty}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <AutoAwesomeIcon sx={{ color: "accent.main" }} />}
          sx={{ alignSelf: "flex-start" }}
        >
          {loading ? "Summarizing…" : "Summarize feedback"}
        </Button>
      </Stack>
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
          <Markdown text={summary} />
        </Paper>
      )}
    </Box>
  );
}
