import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const AVATAR_COLORS = ["#2F6B4F", "#C6A15B", "#1C1C1C", "#78716C"];

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function CommentList({
  comments,
}: {
  comments: { id: string; authorName: string; body: string; createdAt: Date }[];
}) {
  if (comments.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No comments yet.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {comments.map((c) => (
        <Paper key={c.id} variant="outlined" sx={{ p: 1.5, display: "flex", gap: 1.5 }}>
          <Avatar sx={{ bgcolor: colorFor(c.authorName), width: 32, height: 32, fontSize: 14 }}>
            {c.authorName.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" sx={{ alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {c.authorName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {c.createdAt.toLocaleString()}
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
              {c.body}
            </Typography>
          </Box>
        </Paper>
      ))}
    </Stack>
  );
}
