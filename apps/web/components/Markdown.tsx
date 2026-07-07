import ReactMarkdown from "react-markdown";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export function Markdown({ text }: { text: string }) {
  return (
    <Box sx={{ "& > *:first-of-type": { mt: 0 }, "& > *:last-child": { mb: 0 } }}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1.5, mb: 0.5 }}>
              {children}
            </Typography>
          ),
          h2: ({ children }) => (
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1.5, mb: 0.5 }}>
              {children}
            </Typography>
          ),
          h3: ({ children }) => (
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1.25, mb: 0.5 }}>
              {children}
            </Typography>
          ),
          p: ({ children }) => (
            <Typography variant="body2" sx={{ mb: 1 }}>
              {children}
            </Typography>
          ),
          ul: ({ children }) => (
            <Box component="ul" sx={{ pl: 2.5, mb: 1, mt: 0 }}>
              {children}
            </Box>
          ),
          ol: ({ children }) => (
            <Box component="ol" sx={{ pl: 2.5, mb: 1, mt: 0 }}>
              {children}
            </Box>
          ),
          li: ({ children }) => (
            <Typography component="li" variant="body2" sx={{ mb: 0.25 }}>
              {children}
            </Typography>
          ),
          strong: ({ children }) => <Box component="strong" sx={{ fontWeight: 700 }}>{children}</Box>,
          em: ({ children }) => <Box component="em">{children}</Box>,
          code: ({ children }) => (
            <Box
              component="code"
              sx={{
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: "0.85em",
                bgcolor: "background.default",
                px: 0.5,
                borderRadius: 0.5,
              }}
            >
              {children}
            </Box>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </Box>
  );
}
