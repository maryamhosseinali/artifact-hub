"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlined";
import type { ArtifactType } from "core";
import { ArtifactCard } from "@/components/ArtifactCard";

const TYPES: ArtifactType[] = ["html", "image", "pdf"];
const TYPE_LABEL: Record<ArtifactType, string> = { html: "HTML", image: "Image", pdf: "PDF" };

type ArtifactSummary = {
  id: string;
  title: string;
  description: string;
  type: ArtifactType;
  tags: string[];
  createdAt: Date;
};

export function GalleryView({
  artifacts,
  q,
  type,
  tag,
}: {
  artifacts: ArtifactSummary[];
  q?: string;
  type?: string;
  tag?: string;
}) {
  const hasFilters = Boolean(q || type || tag);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
          Gallery
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {artifacts.length} artifact{artifacts.length === 1 ? "" : "s"} published so far.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 1.5, mb: 4 }}>
        <Stack
          component="form"
          method="get"
          direction="row"
          sx={{ flexWrap: "wrap", gap: 1.5, alignItems: "center" }}
        >
          <TextField
            name="q"
            defaultValue={q}
            placeholder="Search artifacts…"
            sx={{ flex: 1, minWidth: 220 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <ToggleButtonGroup
            value={type ?? ""}
            exclusive
            size="small"
            onChange={() => {}}
            sx={{ bgcolor: "background.paper" }}
          >
            <ToggleButton value="" component={Link} href="/">
              All
            </ToggleButton>
            {TYPES.map((t) => (
              <ToggleButton key={t} value={t} component={Link} href={`/?type=${t}`}>
                {TYPE_LABEL[t]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <TextField name="tag" defaultValue={tag} placeholder="Filter by tag" sx={{ width: 160 }} />
          <Button type="submit" variant="contained" color="primary">
            Apply
          </Button>
          {hasFilters && (
            <Button component={Link} href="/" color="inherit" sx={{ color: "text.secondary" }}>
              Clear
            </Button>
          )}
        </Stack>
      </Paper>

      {artifacts.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, px: 4, py: 8, textAlign: "center" }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: "rgba(198, 161, 91, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SearchIcon sx={{ fontSize: 24, color: "accent.main" }} />
          </Box>
          <Typography sx={{ fontWeight: 600, mt: 1 }}>No artifacts found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
            {hasFilters ? "Try adjusting your search or filters." : "Publish your first artifact to get started."}
          </Typography>
          {!hasFilters && (
            <Button component={Link} href="/publish" variant="contained" color="primary" startIcon={<AddCircleOutlineIcon />} sx={{ mt: 1 }}>
              Publish an artifact
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {artifacts.map((a) => (
            <Grid key={a.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <ArtifactCard id={a.id} title={a.title} description={a.description} type={a.type} tags={a.tags} createdAt={a.createdAt} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
