import { randomUUID } from "node:crypto";
import express from "express";
import cors from "cors";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { requireBearerAuth } from "@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js";
import { mcpAuthRouter } from "@modelcontextprotocol/sdk/server/auth/router.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import {
  createArtifact,
  createShareLink,
  getFeedbackSummary,
  listArtifacts,
  searchArtifacts,
  ARTIFACT_FOLDERS,
  type ArtifactType,
  type ArtifactFolder,
} from "core";
import { ArtifactHubAuthProvider } from "./oauth.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const AUTHORIZE_SECRET = process.env.MCP_AUTHORIZE_SECRET;
const CLIENT_SECRET = process.env.MCP_CLIENT_SECRET;
const MCP_PUBLIC_URL = process.env.MCP_PUBLIC_URL;
const WEB_BASE_URL = process.env.WEB_BASE_URL ?? "http://localhost:3000";

if (!AUTHORIZE_SECRET) {
  console.error("MCP_AUTHORIZE_SECRET env var is required");
  process.exit(1);
}
if (!CLIENT_SECRET) {
  console.error("MCP_CLIENT_SECRET env var is required");
  process.exit(1);
}
if (!MCP_PUBLIC_URL) {
  console.error("MCP_PUBLIC_URL env var is required (public HTTPS URL of this deployment)");
  process.exit(1);
}

const authProvider = new ArtifactHubAuthProvider(AUTHORIZE_SECRET, CLIENT_SECRET);
const authMiddleware = requireBearerAuth({ verifier: authProvider });

function buildServer(): McpServer {
  const server = new McpServer({ name: "artifact-hub", version: "1.0.0" });

  server.registerTool(
    "publish_artifact",
    {
      title: "Publish artifact",
      description:
        "Publish a new artifact (HTML, image, or PDF) to Artifact Hub. If title, " +
        "description, or tags are omitted, they are auto-generated from the content. " +
        "The artifact is always auto-categorized into one folder " +
        `(${ARTIFACT_FOLDERS.join(", ")}) — this is never set manually.`,
      inputSchema: {
        content: z
          .string()
          .describe("Raw HTML text for type=html, or base64-encoded bytes (optionally a data: URL) for image/pdf"),
        type: z.enum(["html", "image", "pdf"]).describe("Artifact content type"),
        title: z.string().optional().describe("Title; auto-generated if omitted"),
        description: z.string().optional().describe("Description; auto-generated if omitted"),
        tags: z.array(z.string()).optional().describe("Tags; auto-generated if omitted"),
      },
    },
    async ({ content, type, title, description, tags }) => {
      const artifact = await createArtifact({
        content,
        type: type as ArtifactType,
        title,
        description,
        tags,
        sourceTool: "mcp",
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              id: artifact.id,
              title: artifact.title,
              description: artifact.description,
              tags: artifact.tags,
              folder: artifact.folder,
              type: artifact.type,
              url: `${WEB_BASE_URL}/artifacts/${artifact.id}`,
            }),
          },
        ],
      };
    },
  );

  server.registerTool(
    "list_artifacts",
    {
      title: "List artifacts",
      description: "List published artifacts, optionally filtered by type, tag, and/or folder.",
      inputSchema: {
        type: z.enum(["html", "image", "pdf"]).optional(),
        tag: z.string().optional(),
        folder: z.enum(ARTIFACT_FOLDERS as [ArtifactFolder, ...ArtifactFolder[]]).optional(),
      },
    },
    async ({ type, tag, folder }) => {
      const artifacts = await listArtifacts({ type: type as ArtifactType | undefined, tag, folder });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              artifacts.map((a) => ({
                id: a.id,
                title: a.title,
                description: a.description,
                type: a.type,
                tags: a.tags,
                folder: a.folder,
                createdAt: a.createdAt,
              })),
            ),
          },
        ],
      };
    },
  );

  server.registerTool(
    "search_artifacts",
    {
      title: "Search artifacts",
      description: "Search artifacts using a natural language query, ranked by relevance.",
      inputSchema: { query: z.string().describe("Natural language search query") },
    },
    async ({ query }) => {
      const artifacts = await searchArtifacts(query);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              artifacts.map((a) => ({
                id: a.id,
                title: a.title,
                description: a.description,
                type: a.type,
                tags: a.tags,
                folder: a.folder,
              })),
            ),
          },
        ],
      };
    },
  );

  server.registerTool(
    "share_artifact",
    {
      title: "Share artifact",
      description: "Create a time-limited public share link for an artifact.",
      inputSchema: {
        artifact_id: z.string(),
        expires_in: z.number().int().min(60).max(60 * 60 * 24 * 30).describe("Expiry in seconds (60 - 2592000)"),
      },
    },
    async ({ artifact_id, expires_in }) => {
      try {
        const shareLink = await createShareLink(artifact_id, expires_in);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                url: `${WEB_BASE_URL}/share/${shareLink.token}`,
                expiresAt: shareLink.expiresAt,
              }),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text", text: error instanceof Error ? error.message : "Failed to create share link" }],
        };
      }
    },
  );

  server.registerTool(
    "get_feedback_summary",
    {
      title: "Get feedback summary",
      description: "Summarize reviewer comments on an artifact into themes and action items.",
      inputSchema: {
        artifact_id: z.string(),
        preset: z
          .enum(["overview", "action-items", "sentiment"])
          .optional()
          .describe("Summary focus. Defaults to a general overview."),
        custom_prompt: z
          .string()
          .optional()
          .describe("Custom instructions for the summary, overrides preset if given."),
      },
    },
    async ({ artifact_id, preset, custom_prompt }) => {
      const summary = await getFeedbackSummary(artifact_id, { preset, customPrompt: custom_prompt });
      return { content: [{ type: "text", text: summary }] };
    },
  );

  return server;
}

const app = express();
app.use(
  cors({
    origin: "*",
    exposedHeaders: ["Mcp-Session-Id"],
    allowedHeaders: ["Content-Type", "Authorization", "Mcp-Session-Id"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Standard MCP OAuth endpoints (metadata discovery, dynamic client
// registration, authorize, token, revoke) — see src/oauth.ts for the
// provider backing this.
app.use(
  mcpAuthRouter({
    provider: authProvider,
    issuerUrl: new URL(MCP_PUBLIC_URL),
    scopesSupported: ["artifacts"],
  }),
);

app.post("/authorize/approve", async (req, res) => {
  try {
    await authProvider.approve(req, res);
  } catch (error) {
    console.error("Authorization approval failed:", error);
    if (!res.headersSent) {
      res.status(400).send(`Authorization failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }
});

const transports: Record<string, StreamableHTTPServerTransport> = {};

const mcpPostHandler: express.RequestHandler = async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  try {
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports[sessionId]) {
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sid) => {
          transports[sid] = transport;
        },
      });
      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid) delete transports[sid];
      };

      const server = buildServer();
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      return;
    } else {
      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Bad Request: No valid session ID provided" },
        id: null,
      });
      return;
    }

    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
};

const mcpGetHandler: express.RequestHandler = async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send("Invalid or missing session ID");
    return;
  }
  await transports[sessionId].handleRequest(req, res);
};

const mcpDeleteHandler: express.RequestHandler = async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send("Invalid or missing session ID");
    return;
  }
  await transports[sessionId].handleRequest(req, res);
};

app.post("/mcp", authMiddleware, mcpPostHandler);
app.get("/mcp", authMiddleware, mcpGetHandler);
app.delete("/mcp", authMiddleware, mcpDeleteHandler);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Artifact Hub MCP server listening on port ${PORT}`);
});
