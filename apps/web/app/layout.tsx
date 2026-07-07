import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ThemeRegistry } from "@/components/ThemeRegistry";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Artifact Hub",
  description: "Publish, browse, and review AI-generated artifacts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <ThemeRegistry>
          <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
            <SiteHeader />
            <Container component="main" maxWidth="lg" sx={{ flex: 1, py: 5 }}>
              {children}
            </Container>
            <Box component="footer" sx={{ borderTop: "1px solid", borderColor: "divider", py: 3 }}>
              <Typography align="center" variant="caption" color="text.secondary">
                Artifact Hub — publish, browse, and review AI-generated artifacts.
              </Typography>
            </Box>
          </Box>
        </ThemeRegistry>
      </body>
    </html>
  );
}
