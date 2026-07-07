import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { PublishForm } from "@/components/PublishForm";

export default function PublishPage() {
  return (
    <Box sx={{ maxWidth: 560, mx: "auto" }}>
      <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
        Publish an artifact
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
        Upload an HTML page, image, or PDF. Claude will auto-generate a title, description, and tags if you leave them
        blank.
      </Typography>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <PublishForm />
      </Paper>
    </Box>
  );
}
