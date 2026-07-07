"use client";

import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";

export function SiteHeader() {
  return (
    <AppBar position="sticky">
      <Container maxWidth="lg" disableGutters sx={{ px: 3 }}>
        <Toolbar disableGutters sx={{ py: 0.5, justifyContent: "space-between" }}>
          <Box component={Link} href="/" sx={{ display: "flex", alignItems: "center", gap: 1, textDecoration: "none" }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
                color: "primary.contrastText",
                bgcolor: "primary.main",
                background: "linear-gradient(135deg, #1C1C1C 0%, #3a3a3a 100%)",
              }}
            >
              A
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary", letterSpacing: "-0.01em" }}>
              Artifact Hub
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button component={Link} href="/" color="inherit" sx={{ color: "text.secondary" }}>
              Gallery
            </Button>
            <Button component={Link} href="/publish" variant="contained" color="primary">
              Publish
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
