"use client";

import Link from "next/link";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import CodeIcon from "@mui/icons-material/Code";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import type { ArtifactType } from "core";

const TYPE_META: Record<ArtifactType, { label: string; icon: React.ReactElement; color: "secondary" | "accent" | "default" }> = {
  html: { label: "HTML", icon: <CodeIcon sx={{ fontSize: 15 }} />, color: "secondary" },
  image: { label: "Image", icon: <ImageIcon sx={{ fontSize: 15 }} />, color: "accent" },
  pdf: { label: "PDF", icon: <PictureAsPdfIcon sx={{ fontSize: 15 }} />, color: "default" },
};

function relativeDate(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function ArtifactCard({
  id,
  title,
  description,
  type,
  tags,
  createdAt,
}: {
  id: string;
  title: string;
  description: string;
  type: ArtifactType;
  tags: string[];
  createdAt: Date;
}) {
  const meta = TYPE_META[type];
  return (
    <Card
      sx={{
        height: "100%",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
      }}
    >
      <CardActionArea component={Link} href={`/artifacts/${id}`} sx={{ height: "100%", alignItems: "flex-start" }}>
        <CardContent sx={{ width: "100%" }}>
          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", gap: 1 }}>
            <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Chip size="small" icon={meta.icon} label={meta.label} color={meta.color} variant={meta.color === "default" ? "outlined" : "filled"} />
          </Stack>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {description}
          </Typography>
          {tags.length > 0 && (
            <Box sx={{ mt: 1.5, display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {tags.slice(0, 4).map((tag) => (
                <Chip key={tag} size="small" label={tag} variant="outlined" sx={{ borderColor: "divider" }} />
              ))}
              {tags.length > 4 && <Chip size="small" label={`+${tags.length - 4}`} variant="outlined" sx={{ borderColor: "divider" }} />}
            </Box>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: "block" }}>
            {relativeDate(createdAt)}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
