import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    accent: Palette["primary"];
  }
  interface PaletteOptions {
    accent?: PaletteOptions["primary"];
  }
}

declare module "@mui/material/Chip" {
  interface ChipPropsColorOverrides {
    accent: true;
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    accent: true;
  }
}

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1C1C1C", contrastText: "#FAF9F6" },
    secondary: { main: "#2F6B4F", contrastText: "#FFFFFF" },
    accent: { main: "#C6A15B", contrastText: "#1C1C1C" },
    background: { default: "#FAF9F6", paper: "#FFFFFF" },
    divider: "#E5E1DA",
    text: { primary: "#171717", secondary: "#78716C" },
    success: { main: "#16A34A" },
    error: { main: "#C2410C" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600 },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small" },
    },
    MuiSelect: {
      defaultProps: { size: "small" },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: "rgba(250, 249, 246, 0.85)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #E5E1DA",
          color: "#1C1C1C",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { border: "1px solid #E5E1DA" },
      },
    },
  },
});
