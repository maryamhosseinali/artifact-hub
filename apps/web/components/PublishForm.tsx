"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export function PublishForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (files && files[0]) setFileName(files[0].name);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/artifacts", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to publish artifact");
        return;
      }
      router.push(`/artifacts/${data.artifact.id}`);
    } catch {
      setError("Network error while publishing");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack component="form" onSubmit={handleSubmit} spacing={2.5}>
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          File
        </Typography>
        <Box
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (fileInputRef.current) fileInputRef.current.files = e.dataTransfer.files;
            handleFiles(e.dataTransfer.files);
          }}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 5,
            textAlign: "center",
            borderRadius: 2,
            border: "2px dashed",
            borderColor: dragActive ? "accent.main" : "divider",
            bgcolor: dragActive ? "rgba(198, 161, 91, 0.08)" : "transparent",
            cursor: "pointer",
            transition: "all 0.15s ease",
            "&:hover": { borderColor: "accent.main" },
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 28, color: "text.secondary" }} />
          <Typography variant="body2">
            {fileName ? (
              <Box component="span" sx={{ fontWeight: 600 }}>
                {fileName}
              </Box>
            ) : (
              <>
                <Box component="span" sx={{ color: "secondary.main", fontWeight: 600 }}>
                  Click to upload
                </Box>{" "}
                or drag and drop
              </>
            )}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            HTML, image, or PDF
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            name="file"
            required
            accept=".html,text/html,image/*,application/pdf"
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
        </Box>
      </Box>

      <TextField name="title" label="Title" helperText="Optional — auto-generated if omitted" fullWidth />
      <TextField name="description" label="Description" helperText="Optional — auto-generated if omitted" multiline rows={3} fullWidth />
      <TextField name="tags" label="Tags" placeholder="dashboard, chart, demo" helperText="Comma-separated, optional" fullWidth />

      {error && <Alert severity="error">{error}</Alert>}

      <Button type="submit" variant="contained" color="primary" size="large" disabled={submitting} fullWidth startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}>
        {submitting ? "Publishing…" : "Publish"}
      </Button>
    </Stack>
  );
}
