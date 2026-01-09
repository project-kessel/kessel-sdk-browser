import type * as oauth from "oauth4webapi";

const EXPIRATION_WINDOW_MILLI = 300000; // 5 minutes in milliseconds
const DEFAULT_EXPIRE_IN_SECONDS = 3600; // 1 hour in seconds

interface RefreshTokenResponse {
  accessToken: string;
  expiresAt: Date;
}

export interface ClientConfigAuth {
  /**
   * The OAuth client identifier.
   */
  clientId: string;

  /**
   * The OAuth client secret.
   */
  clientSecret: string;

  /**
   * The OAuth issuer URL for discovery.
   * Should be the base URL of the OAuth provider.
   *
   * @example "https://auth.example.com"
   * @example "https://sso.server/auth/realms/my-realm"
   */
  tokenEndpoint: string;
}

export interface OIDCDiscoveryMetadata {
  tokenEndpoint: string;
}

const importOAuth4WebApi = async (): Promise<typeof oauth> => {
  return await import("oauth4webapi");
};

export const fetchOIDCDiscovery = async (
  issueUrl: string,
): Promise<OIDCDiscoveryMetadata> => {
  const oauth = await importOAuth4WebApi();
  const issuerUrlObject = new URL(issueUrl);
  const response = await oauth.discoveryRequest(issuerUrlObject);
  const authServer = await oauth.processDiscoveryResponse(
    issuerUrlObject,
    response,
  );

  if (!authServer.token_endpoint) {
    throw new Error("Token endpoint could not be discovered from issuer URL.");
  }

  return {
    tokenEndpoint: authServer.token_endpoint,
  };
};

/**
 * Handles OAuth 2.0 Client Credentials flow for authentication.
 *
 * This class manages token retrieval, caching, and automatic refresh for OAuth authentication.
 * It requires a token endpoint URL (which can be discovered using fetchOIDCDiscovery) and caches tokens until near expiration.
 *
 * @example
 * ```typescript
 * import { fetchOIDCDiscovery, OAuth2ClientCredentials } from "@project-kessel/kessel-sdk/kessel/auth";
 *
 * // First, discover the token endpoint
 * const discovery = await fetchOIDCDiscovery("https://auth.example.com");
 *
 * // Create the OAuth client with the discovered endpoint
 * const authClient = new OAuth2ClientCredentials({
 *   clientId: "my-client-id",
 *   clientSecret: "my-client-secret",
 *   tokenEndpoint: discovery.tokenEndpoint
 * });
 *
 * // Get a token (returns RefreshTokenResponse object)
 * const tokenResponse = await authClient.getToken();
 * console.log(`Token: ${tokenResponse.accessToken}, expires at: ${tokenResponse.expiresAt}`);
 * ```
 */
export class OAuth2ClientCredentials {
  private tokenCache?: RefreshTokenResponse;
  private authServer: oauth.AuthorizationServer;
  private initialized: boolean = false;
  private ClientSecretPost: typeof oauth.ClientSecretPost;
  private clientCredentialsGrantRequest: typeof oauth.clientCredentialsGrantRequest;
  private processClientCredentialsResponse: typeof oauth.processClientCredentialsResponse;

  /**
   * Creates a new OAuth2ClientCredentials instance.
   *
   * @param auth - The OAuth configuration object containing clientId, clientSecret, and tokenEndpoint
   */
  constructor(readonly auth: ClientConfigAuth) {
    this.authServer = {
      issuer: auth.tokenEndpoint,
      token_endpoint: auth.tokenEndpoint,
    };
  }

  /**
   * Ensures the OAuth client is initialized.
   * This method is called automatically by getToken() and is idempotent.
   *
   * @throws {Error} If initialization fails
   */
  async ensureIsInitialized() {
    if (!this.initialized) {
      const oauth = await importOAuth4WebApi();

      this.ClientSecretPost = oauth.ClientSecretPost;
      this.clientCredentialsGrantRequest = oauth.clientCredentialsGrantRequest;
      this.processClientCredentialsResponse =
        oauth.processClientCredentialsResponse;

      this.initialized = true;
    }
  }

  /**
   * Checks if the current cached token is valid and not near expiration.
   *
   * @returns true if the cached token is valid and not near expiration, false otherwise
   */
  isCacheValid(): boolean {
    if (
      this.tokenCache &&
      this.tokenCache.expiresAt.getTime() > Date.now() + EXPIRATION_WINDOW_MILLI
    ) {
      return true;
    }
    return false;
  }

  /**
   * Gets a valid access token, fetching a new one if necessary.
   *
   * This method will:
   * 1. Initialize the OAuth client if not already done
   * 2. Return the cached token if it's still valid (unless forceRefresh is true)
   * 3. Fetch a new token from the OAuth server if needed
   * 4. Cache the new token for future use
   *
   * @param forceRefresh - If true, bypasses cache and forces a new token request
   * @returns A promise that resolves to a RefreshTokenResponse object containing accessToken and expiresAt
   * @throws {Error} If token retrieval fails
   */
  async getToken(forceRefresh: boolean = false): Promise<RefreshTokenResponse> {
    await this.ensureIsInitialized();

    if (!forceRefresh && this.isCacheValid()) {
      return this.tokenCache;
    }

    this.tokenCache = await this.refresh();
    return this.tokenCache;
  }

  private async refresh(): Promise<Readonly<RefreshTokenResponse>> {
    const client: oauth.Client = { client_id: this.auth.clientId };
    const clientAuth = this.ClientSecretPost(this.auth.clientSecret);
    const parameters = new URLSearchParams();

    const response = await this.clientCredentialsGrantRequest(
      this.authServer,
      client,
      clientAuth,
      parameters,
    );
    const result = await this.processClientCredentialsResponse(
      this.authServer,
      client,
      response,
    );

    if (!result.access_token) {
      throw new Error("No access token received from OAuth server");
    }

    // Handle missing or invalid expires_in - default to 1 hour if not provided
    // Note: expires_in of 0 is valid and means "immediately expired"
    const expiresIn =
      typeof result.expires_in === "number" && result.expires_in >= 0
        ? result.expires_in
        : DEFAULT_EXPIRE_IN_SECONDS;

    return Object.freeze({
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      accessToken: result.access_token,
    });
  }
}

export interface AuthRequest {
  configureRequest: (request: Request) => Promise<void>;
}

export const oauth2AuthRequest = (
  credentials: OAuth2ClientCredentials,
): AuthRequest => {
  return {
    configureRequest: async (request) => {
      const token = await credentials.getToken();
      request.headers.set("authorization", `Bearer ${token.accessToken}`);
    },
  };
};
