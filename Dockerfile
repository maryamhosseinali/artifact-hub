# Builds the MCP server for deployment on Railway. Build context is the monorepo
# root (not apps/mcp-server) so it can access the shared `core` workspace package.
FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/mcp-server/package.json apps/mcp-server/package.json
COPY packages/core/package.json packages/core/package.json

RUN npm install --workspaces --include-workspace-root

COPY packages/core packages/core
COPY apps/mcp-server apps/mcp-server

RUN npm run db:generate -w core

WORKDIR /app/apps/mcp-server

ENV NODE_ENV=production
EXPOSE 3001

CMD ["npx", "tsx", "src/server.ts"]
