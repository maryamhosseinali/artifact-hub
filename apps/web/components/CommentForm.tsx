"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

export function CommentForm({ artifactId }: { artifactId: string }) {
  const router = useRouter();
  const [authorName, setAuthorName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/artifacts/${artifactId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to post comment");
        return;
      }
      setBody("");
      router.refresh();
    } catch {
      setError("Network error while posting comment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack component="form" onSubmit={handleSubmit} spacing={1.5}>
      <TextField
        placeholder="Your name"
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        required
      />
      <TextField
        placeholder="Add a comment…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        multiline
        rows={2}
      />
      {error && <Alert severity="error">{error}</Alert>}
      <Button
        type="submit"
        variant="contained"
        color="secondary"
        disabled={submitting}
        sx={{ alignSelf: "flex-start" }}
        startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : undefined}
      >
        {submitting ? "Posting…" : "Post comment"}
      </Button>
    </Stack>
  );
}
