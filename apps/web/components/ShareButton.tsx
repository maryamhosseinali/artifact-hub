"use client";

import { useState } from "react";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CircularProgress from "@mui/material/CircularProgress";

const EXPIRY_OPTIONS = [
  { label: "1 hour", seconds: 60 * 60 },
  { label: "1 day", seconds: 60 * 60 * 24 },
  { label: "7 days", seconds: 60 * 60 * 24 * 7 },
  { label: "30 days", seconds: 60 * 60 * 24 * 30 },
];

export function ShareButton({ artifactId }: { artifactId: string }) {
  const [expiresInSeconds, setExpiresInSeconds] = useState(EXPIRY_OPTIONS[2].seconds);
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/artifacts/${artifactId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expiresInSeconds }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create share link");
        return;
      }
      setLink(`${window.location.origin}/share/${data.shareLink.token}`);
    } catch {
      setError("Network error while creating share link");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
  }

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1}>
        <Select value={expiresInSeconds} onChange={(e) => setExpiresInSeconds(Number(e.target.value))}>
          {EXPIRY_OPTIONS.map((opt) => (
            <MenuItem key={opt.seconds} value={opt.seconds}>
              Expires in {opt.label}
            </MenuItem>
          ))}
        </Select>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleClick}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : undefined}
        >
          {loading ? "Creating…" : "Create share link"}
        </Button>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      {link && (
        <TextField
          fullWidth
          value={link}
          slotProps={{
            input: {
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleCopy} aria-label="Copy link">
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          onFocus={(e) => e.currentTarget.select()}
        />
      )}
      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setCopied(false)}>
          Link copied
        </Alert>
      </Snackbar>
    </Stack>
  );
}
