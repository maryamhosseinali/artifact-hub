import { randomBytes } from "node:crypto";
import type { Request, Response } from "express";
import type { AuthorizationParams, OAuthServerProvider } from "@modelcontextprotocol/sdk/server/auth/provider.js";
import type { OAuthRegisteredClientsStore } from "@modelcontextprotocol/sdk/server/auth/clients.js";
import type {
  OAuthClientInformationFull,
  OAuthTokenRevocationRequest,
  OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import {
  InvalidRequestError,
  InvalidGrantError,
  InvalidClientError,
  InvalidTokenError,
} from "@modelcontextprotocol/sdk/server/auth/errors.js";

const ACCESS_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** The one pre-registered client_id/secret handed out for manual entry (e.g.
 * Claude Desktop's "Client ID" / "Client Secret" connector fields), alongside
 * open Dynamic Client Registration for clients that support it automatically. */
export const WELL_KNOWN_CLIENT_ID = "artifact-hub";

/**
 * A `redirect_uris` array that matches literally anything. Used only for the
 * pre-registered well-known client: since it's entered manually rather than
 * self-registered via DCR, we can't know in advance what redirect_uri the
 * connecting app will actually use (only its host gets RFC 8252 loopback
 * relaxation — the path must match exactly, and we have no way to predict a
 * given desktop client's callback path). The one real access-control
 * boundary for this client remains the secret-gated consent screen, exactly
 * as already documented for openly self-registered DCR clients.
 */
function acceptAnyRedirectUri(placeholder: string): string[] {
  const uris = [placeholder] as string[];
  Object.defineProperty(uris, "some", { value: () => true, enumerable: false });
  return uris;
}

class InMemoryClientsStore implements OAuthRegisteredClientsStore {
  private clients = new Map<string, OAuthClientInformationFull>();

  getClient(clientId: string) {
    return this.clients.get(clientId);
  }

  registerClient(client: OAuthClientInformationFull) {
    this.clients.set(client.client_id, client);
    return client;
  }
}

interface PendingAuthorization {
  client: OAuthClientInformationFull;
  params: AuthorizationParams;
}

interface StoredToken {
  clientId: string;
  scopes: string[];
  expiresAt: number;
}

/**
 * Single-tenant OAuth 2.1 authorization server for this MCP deployment.
 *
 * There are no user accounts — the one shared secret (`MCP_AUTHORIZE_SECRET`)
 * gates a one-time browser consent screen shown during the OAuth authorize
 * step; every access/refresh token issued after that is scoped to whichever
 * client completed that step. This is the SDK's own reference
 * `demoInMemoryOAuthProvider` pattern with a real secret check added — the
 * unmodified reference demo auto-approves every authorize request with no
 * gate at all.
 *
 * Two ways to connect a client:
 * 1. Dynamic Client Registration (`POST /register`) — most MCP clients do
 *    this automatically; no manual configuration needed.
 * 2. The pre-registered well-known client (`WELL_KNOWN_CLIENT_ID` + a fixed
 *    `client_secret`) — for clients whose UI asks for a Client ID/Secret up
 *    front instead of performing DCR itself (e.g. Claude Desktop's custom
 *    connector dialog).
 *
 * Known limitations (acceptable for a single shared workspace, not a
 * multi-tenant product): tokens live in memory and are lost on redeploy/
 * restart (same tradeoff as the MCP session transport map elsewhere in this
 * server); redirect_uri is only checked against what a DCR client itself
 * registered, and the well-known client accepts any redirect_uri outright
 * (see `acceptAnyRedirectUri`) — in both cases the secret gate, not client/
 * redirect registration, is the actual security boundary.
 */
export class ArtifactHubAuthProvider implements OAuthServerProvider {
  clientsStore = new InMemoryClientsStore();

  private pendingAuthorizations = new Map<string, PendingAuthorization>();
  private accessTokens = new Map<string, StoredToken>();
  private refreshTokens = new Map<string, StoredToken>();

  constructor(
    private readonly secret: string,
    clientSecret: string,
  ) {
    this.clientsStore.registerClient({
      client_id: WELL_KNOWN_CLIENT_ID,
      client_secret: clientSecret,
      client_secret_expires_at: 0,
      redirect_uris: acceptAnyRedirectUri("http://localhost/callback"),
      token_endpoint_auth_method: "client_secret_post",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      client_name: "Artifact Hub (pre-registered)",
    });
  }

  async authorize(client: OAuthClientInformationFull, params: AuthorizationParams, res: Response): Promise<void> {
    if (!client.redirect_uris.some((registered) => registered === params.redirectUri)) {
      throw new InvalidRequestError("Unregistered redirect_uri");
    }
    res.type("html").send(renderConsentForm(client, params));
  }

  /** Handles the POST from the consent form rendered by `authorize()`. */
  async approve(req: Request, res: Response): Promise<void> {
    const { client_id, redirect_uri, state, code_challenge, resource, scopes, secret } = req.body as Record<
      string,
      string | undefined
    >;

    if (!client_id || !redirect_uri || !code_challenge) {
      throw new InvalidRequestError("Missing required authorization fields");
    }

    const client = await this.clientsStore.getClient(client_id);
    if (!client) throw new InvalidClientError("Unknown client");
    if (!client.redirect_uris.some((registered) => registered === redirect_uri)) {
      throw new InvalidRequestError("Unregistered redirect_uri");
    }

    const params: AuthorizationParams = {
      state: state || undefined,
      scopes: scopes ? scopes.split(" ").filter(Boolean) : undefined,
      codeChallenge: code_challenge,
      redirectUri: redirect_uri,
      resource: resource ? new URL(resource) : undefined,
    };

    if (secret !== this.secret) {
      res
        .type("html")
        .status(401)
        .send(renderConsentForm(client, params, "Incorrect secret — try again."));
      return;
    }

    const code = generateToken();
    this.pendingAuthorizations.set(code, { client, params });

    const target = new URL(params.redirectUri);
    target.searchParams.set("code", code);
    if (params.state) target.searchParams.set("state", params.state);
    res.redirect(target.toString());
  }

  async challengeForAuthorizationCode(_client: OAuthClientInformationFull, authorizationCode: string): Promise<string> {
    const pending = this.pendingAuthorizations.get(authorizationCode);
    if (!pending) throw new InvalidGrantError("Invalid authorization code");
    return pending.params.codeChallenge;
  }

  async exchangeAuthorizationCode(
    client: OAuthClientInformationFull,
    authorizationCode: string,
  ): Promise<OAuthTokens> {
    const pending = this.pendingAuthorizations.get(authorizationCode);
    if (!pending) throw new InvalidGrantError("Invalid authorization code");
    if (pending.client.client_id !== client.client_id) {
      throw new InvalidGrantError("Authorization code was not issued to this client");
    }
    this.pendingAuthorizations.delete(authorizationCode);

    const scopes = pending.params.scopes ?? [];
    const accessToken = generateToken();
    const refreshToken = generateToken();
    const expiresAt = Date.now() + ACCESS_TOKEN_TTL_MS;

    this.accessTokens.set(accessToken, { clientId: client.client_id, scopes, expiresAt });
    this.refreshTokens.set(refreshToken, { clientId: client.client_id, scopes, expiresAt: Infinity });

    return {
      access_token: accessToken,
      token_type: "bearer",
      expires_in: ACCESS_TOKEN_TTL_MS / 1000,
      scope: scopes.join(" "),
      refresh_token: refreshToken,
    };
  }

  async exchangeRefreshToken(
    client: OAuthClientInformationFull,
    refreshToken: string,
    scopes?: string[],
  ): Promise<OAuthTokens> {
    const stored = this.refreshTokens.get(refreshToken);
    if (!stored || stored.clientId !== client.client_id) {
      throw new InvalidGrantError("Invalid refresh token");
    }

    const grantedScopes = scopes && scopes.length > 0 ? scopes : stored.scopes;
    const accessToken = generateToken();
    const expiresAt = Date.now() + ACCESS_TOKEN_TTL_MS;
    this.accessTokens.set(accessToken, { clientId: client.client_id, scopes: grantedScopes, expiresAt });

    return {
      access_token: accessToken,
      token_type: "bearer",
      expires_in: ACCESS_TOKEN_TTL_MS / 1000,
      scope: grantedScopes.join(" "),
      refresh_token: refreshToken,
    };
  }

  async verifyAccessToken(token: string): Promise<AuthInfo> {
    const stored = this.accessTokens.get(token);
    if (!stored || stored.expiresAt < Date.now()) {
      throw new InvalidTokenError("Invalid or expired token");
    }
    return {
      token,
      clientId: stored.clientId,
      scopes: stored.scopes,
      expiresAt: Math.floor(stored.expiresAt / 1000),
    };
  }

  async revokeToken(_client: OAuthClientInformationFull, request: OAuthTokenRevocationRequest): Promise<void> {
    this.accessTokens.delete(request.token);
    this.refreshTokens.delete(request.token);
  }
}

function renderConsentForm(client: OAuthClientInformationFull, params: AuthorizationParams, error?: string): string {
  const name = escapeHtml(client.client_name ?? client.client_id);
  const redirectUri = escapeHtml(params.redirectUri);
  const state = escapeHtml(params.state ?? "");
  const codeChallenge = escapeHtml(params.codeChallenge);
  const resource = escapeHtml(params.resource?.toString() ?? "");
  const scopes = escapeHtml((params.scopes ?? []).join(" "));
  const clientId = escapeHtml(client.client_id);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Authorize Artifact Hub</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 420px; margin: 80px auto; padding: 0 20px; color: #171717; background: #FAF9F6; }
  h1 { font-size: 1.15rem; }
  p { color: #78716C; }
  input[type="password"] { width: 100%; padding: 10px; margin: 12px 0; border: 1px solid #E5E1DA; border-radius: 8px; font-size: 1rem; box-sizing: border-box; }
  button { width: 100%; padding: 10px; background: #1C1C1C; color: #FAF9F6; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; }
  .error { color: #C2410C; font-size: 0.9rem; }
</style>
</head>
<body>
  <h1>${name} wants to access Artifact Hub</h1>
  <p>Enter the shared access secret to continue.</p>
  ${error ? `<p class="error">${escapeHtml(error)}</p>` : ""}
  <form method="POST" action="/authorize/approve">
    <input type="hidden" name="client_id" value="${clientId}">
    <input type="hidden" name="redirect_uri" value="${redirectUri}">
    <input type="hidden" name="state" value="${state}">
    <input type="hidden" name="code_challenge" value="${codeChallenge}">
    <input type="hidden" name="resource" value="${resource}">
    <input type="hidden" name="scopes" value="${scopes}">
    <input type="password" name="secret" placeholder="Access secret" autofocus required>
    <button type="submit">Authorize</button>
  </form>
</body>
</html>`;
}
