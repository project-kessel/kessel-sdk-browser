import {
  OAuth2ClientCredentials,
  fetchOIDCDiscovery,
  oauth2AuthRequest,
} from "../index";

// Mock oauth4webapi module
const mockOAuth = {
  discoveryRequest: jest.fn(),
  processDiscoveryResponse: jest.fn(),
  ClientSecretPost: jest.fn(),
  clientCredentialsGrantRequest: jest.fn(),
  processClientCredentialsResponse: jest.fn(),
};

// Mock the oauth4webapi module
jest.mock("oauth4webapi", () => mockOAuth);

describe("fetchOIDCDiscovery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("successfully discovers token endpoint", async () => {
    const mockResponse = {};
    const mockAuthServer = {
      token_endpoint: "https://example.com/token",
    };

    mockOAuth.discoveryRequest.mockResolvedValue(mockResponse);
    mockOAuth.processDiscoveryResponse.mockResolvedValue(mockAuthServer);

    const result = await fetchOIDCDiscovery("https://example.com/auth");

    expect(result.tokenEndpoint).toBe("https://example.com/token");
    expect(mockOAuth.discoveryRequest).toHaveBeenCalledWith(
      new URL("https://example.com/auth"),
    );
    expect(mockOAuth.processDiscoveryResponse).toHaveBeenCalledWith(
      new URL("https://example.com/auth"),
      mockResponse,
    );
  });

  it("throws error when token endpoint is missing", async () => {
    const mockResponse = {};
    const mockAuthServer = {}; // No token_endpoint

    mockOAuth.discoveryRequest.mockResolvedValue(mockResponse);
    mockOAuth.processDiscoveryResponse.mockResolvedValue(mockAuthServer);

    await expect(
      fetchOIDCDiscovery("https://example.com/auth"),
    ).rejects.toThrow(
      "Token endpoint could not be discovered from issuer URL.",
    );
  });

  it("handles discovery request failures", async () => {
    const networkError = new Error("Network error");
    mockOAuth.discoveryRequest.mockRejectedValue(networkError);

    await expect(
      fetchOIDCDiscovery("https://example.com/auth"),
    ).rejects.toThrow("Network error");
  });

  it("handles malformed discovery response", async () => {
    const malformedResponse: any = null;
    mockOAuth.discoveryRequest.mockResolvedValue(malformedResponse);
    mockOAuth.processDiscoveryResponse.mockRejectedValue(
      new Error("Malformed response"),
    );

    await expect(
      fetchOIDCDiscovery("https://example.com/auth"),
    ).rejects.toThrow("Malformed response");
  });

  it("handles invalid issuer URL", async () => {
    await expect(fetchOIDCDiscovery("not-a-valid-url")).rejects.toThrow();
  });
});

describe("OAuth2ClientCredentials", () => {
  const mockAuth = {
    clientId: "test-client-id",
    clientSecret: "test-client-secret",
    tokenEndpoint: "https://example.com/token",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe("ensureIsInitialized", () => {
    it("initializes OAuth components correctly", async () => {
      const tokenRetriever = new OAuth2ClientCredentials(mockAuth);
      await tokenRetriever.ensureIsInitialized();

      // Should not call discovery methods since we're using tokenEndpoint directly
      expect(mockOAuth.discoveryRequest).not.toHaveBeenCalled();
      expect(mockOAuth.processDiscoveryResponse).not.toHaveBeenCalled();
    });

    it("only initializes once", async () => {
      const tokenRetriever = new OAuth2ClientCredentials(mockAuth);

      // Call twice
      await tokenRetriever.ensureIsInitialized();
      await tokenRetriever.ensureIsInitialized();

      // Should not call discovery methods
      expect(mockOAuth.discoveryRequest).not.toHaveBeenCalled();
    });
  });

  describe("isCacheValid", () => {
    it("returns falsy when no cache exists", () => {
      const tokenRetriever = new OAuth2ClientCredentials(mockAuth);
      expect(tokenRetriever.isCacheValid()).toBeFalsy();
    });

    it("returns true when cache is still valid", () => {
      const tokenRetriever = new OAuth2ClientCredentials(mockAuth);

      // Set up a mock cache by accessing the private property
      const futureTime = new Date(Date.now() + 600000); // 10 minutes in the future
      (tokenRetriever as any).tokenCache = {
        accessToken: "test-token",
        expiresAt: futureTime,
      };

      expect(tokenRetriever.isCacheValid()).toBe(true);
    });

    it("returns falsy when cache is expired", () => {
      const tokenRetriever = new OAuth2ClientCredentials(mockAuth);

      // Set up a mock cache that's expired
      const pastTime = new Date(Date.now() - 1000); // 1 second ago
      (tokenRetriever as any).tokenCache = {
        accessToken: "test-token",
        expiresAt: pastTime,
      };

      expect(tokenRetriever.isCacheValid()).toBeFalsy();
    });
  });

  describe("getToken", () => {
    it("returns cached token when valid", async () => {
      const tokenRetriever = new OAuth2ClientCredentials(mockAuth);

      // Set up a valid cached token
      const futureTime = new Date(Date.now() + 600000);
      (tokenRetriever as any).tokenCache = {
        accessToken: "cached-token",
        expiresAt: futureTime,
      };

      const token = (await tokenRetriever.getToken()).accessToken;
      expect(token).toBe("cached-token");

      // Should not call OAuth methods
      expect(mockOAuth.clientCredentialsGrantRequest).not.toHaveBeenCalled();
    });

    it("fetches new token when cache is invalid", async () => {
      const mockTokenResponse = {};
      const mockTokenResult = {
        access_token: "new-token",
        expires_in: 3600,
      };

      mockOAuth.ClientSecretPost.mockReturnValue("mock-client-auth");
      mockOAuth.clientCredentialsGrantRequest.mockResolvedValue(
        mockTokenResponse,
      );
      mockOAuth.processClientCredentialsResponse.mockResolvedValue(
        mockTokenResult,
      );

      const tokenRetriever = new OAuth2ClientCredentials(mockAuth);

      const token = (await tokenRetriever.getToken()).accessToken;
      expect(token).toBe("new-token");

      // Should have called OAuth methods
      expect(mockOAuth.clientCredentialsGrantRequest).toHaveBeenCalled();
      expect(mockOAuth.processClientCredentialsResponse).toHaveBeenCalled();
    });

    it("caches the new token correctly", async () => {
      const mockTokenResponse = {};
      const mockTokenResult = {
        access_token: "new-token",
        expires_in: 3600,
      };

      mockOAuth.ClientSecretPost.mockReturnValue("mock-client-auth");
      mockOAuth.clientCredentialsGrantRequest.mockResolvedValue(
        mockTokenResponse,
      );
      mockOAuth.processClientCredentialsResponse.mockResolvedValue(
        mockTokenResult,
      );

      const tokenRetriever = new OAuth2ClientCredentials(mockAuth);

      const beforeTime = Date.now();
      await tokenRetriever.getToken();
      const afterTime = Date.now();

      const cache = (tokenRetriever as any).tokenCache;
      expect(cache.accessToken).toBe("new-token");
      expect(cache.expiresAt.getTime()).toBeGreaterThanOrEqual(
        beforeTime + 3600000,
      ); // Should be about 1 hour from now
      expect(cache.expiresAt.getTime()).toBeLessThanOrEqual(
        afterTime + 3600000 + 1000,
      ); // Allow some margin
    });
  });

  describe("constructor", () => {
    it("stores auth configuration", () => {
      const tokenRetriever = new OAuth2ClientCredentials(mockAuth);
      expect(tokenRetriever.auth).toBe(mockAuth);
    });

    it("accepts different auth configurations", () => {
      const customAuth = {
        clientId: "custom-client",
        clientSecret: "custom-secret",
        tokenEndpoint: "https://custom.auth.server.com/token",
      };

      const tokenRetriever = new OAuth2ClientCredentials(customAuth);
      expect(tokenRetriever.auth).toBe(customAuth);
      expect(tokenRetriever.auth.clientId).toBe("custom-client");
      expect(tokenRetriever.auth.tokenEndpoint).toBe(
        "https://custom.auth.server.com/token",
      );
    });
  });

  describe("Error Handling", () => {
    it("handles token request failures", async () => {
      const tokenError = new Error("Token request failed");

      mockOAuth.ClientSecretPost.mockReturnValue("mock-client-auth");
      mockOAuth.clientCredentialsGrantRequest.mockRejectedValue(tokenError);

      const tokenRetriever = new OAuth2ClientCredentials(mockAuth);

      await expect(tokenRetriever.getToken()).rejects.toThrow(
        "Token request failed",
      );
    });

    it("handles invalid token response", async () => {
      const mockTokenResponse = {};
      const invalidTokenError = new Error("Invalid token format");

      mockOAuth.ClientSecretPost.mockReturnValue("mock-client-auth");
      mockOAuth.clientCredentialsGrantRequest.mockResolvedValue(
        mockTokenResponse,
      );
      mockOAuth.processClientCredentialsResponse.mockRejectedValue(
        invalidTokenError,
      );

      const tokenRetriever = new OAuth2ClientCredentials(mockAuth);

      await expect(tokenRetriever.getToken()).rejects.toThrow(
        "Invalid token format",
      );
    });
  });

  describe("Cache Management", () => {
    it("respects expiration window", () => {
      const tokenRetriever = new OAuth2ClientCredentials(mockAuth);

      // Set up a cache that expires just within the expiration window
      const almostExpiredTime = new Date(Date.now() + 200000); // 200 seconds (less than 300 second window)
      (tokenRetriever as any).tokenCache = {
        accessToken: "almost-expired-token",
        expiresAt: almostExpiredTime,
      };

      expect(tokenRetriever.isCacheValid()).toBeFalsy();
    });

    it("handles cache with exact expiration time", () => {
      const tokenRetriever = new OAuth2ClientCredentials(mockAuth);

      // Set up a cache that expires at exactly the expiration window
      const exactExpirationTime = new Date(Date.now() + 300000); // Exactly 300 seconds (5 minutes)
      (tokenRetriever as any).tokenCache = {
        accessToken: "exact-expiration-token",
        expiresAt: exactExpirationTime,
      };

      expect(tokenRetriever.isCacheValid()).toBeFalsy();
    });

    it("handles cache with far future expiration", () => {
      const tokenRetriever = new OAuth2ClientCredentials(mockAuth);

      // Set up a cache that expires far in the future
      const farFutureTime = new Date(Date.now() + 3600000); // 1 hour
      (tokenRetriever as any).tokenCache = {
        accessToken: "far-future-token",
        expiresAt: farFutureTime,
      };

      expect(tokenRetriever.isCacheValid()).toBe(true);
    });

    it("handles cache with past expiration", () => {
      const tokenRetriever = new OAuth2ClientCredentials(mockAuth);

      // Set up a cache that expired in the past
      const pastTime = new Date(Date.now() - 3600000); // 1 hour ago
      (tokenRetriever as any).tokenCache = {
        accessToken: "expired-token",
        expiresAt: pastTime,
      };

      expect(tokenRetriever.isCacheValid()).toBeFalsy();
    });
  });

  describe("Token Lifecycle", () => {
    it("fetches token when not initialized", async () => {
      const mockTokenResponse = {};
      const mockTokenResult = {
        access_token: "fresh-token",
        expires_in: 3600,
      };

      mockOAuth.ClientSecretPost = jest
        .fn()
        .mockReturnValue("mock-client-auth");
      mockOAuth.clientCredentialsGrantRequest.mockResolvedValue(
        mockTokenResponse,
      );
      mockOAuth.processClientCredentialsResponse.mockResolvedValue(
        mockTokenResult,
      );

      const tokenRetriever = new OAuth2ClientCredentials(mockAuth);

      // Don't call ensureIsInitialized manually
      const token = (await tokenRetriever.getToken()).accessToken;
      expect(token).toBe("fresh-token");
    });

    it("handles token with zero expiration", async () => {
      const mockTokenResponse = {};
      const mockTokenResult = {
        access_token: "zero-expiry-token",
        expires_in: 0,
      };

      mockOAuth.ClientSecretPost.mockReturnValue("mock-client-auth");
      mockOAuth.clientCredentialsGrantRequest.mockResolvedValue(
        mockTokenResponse,
      );
      mockOAuth.processClientCredentialsResponse.mockResolvedValue(
        mockTokenResult,
      );

      const tokenRetriever = new OAuth2ClientCredentials(mockAuth);

      const token = (await tokenRetriever.getToken()).accessToken;
      expect(token).toBe("zero-expiry-token");

      // Token should be cached but immediately invalid
      expect(tokenRetriever.isCacheValid()).toBeFalsy();
    });

    it("handles token with very long expiration", async () => {
      const mockTokenResponse = {};
      const mockTokenResult = {
        access_token: "long-lived-token",
        expires_in: 86400, // 24 hours
      };

      mockOAuth.ClientSecretPost.mockReturnValue("mock-client-auth");
      mockOAuth.clientCredentialsGrantRequest.mockResolvedValue(
        mockTokenResponse,
      );
      mockOAuth.processClientCredentialsResponse.mockResolvedValue(
        mockTokenResult,
      );

      const tokenRetriever = new OAuth2ClientCredentials(mockAuth);

      const token = (await tokenRetriever.getToken()).accessToken;
      expect(token).toBe("long-lived-token");

      // Token should be cached and valid
      expect(tokenRetriever.isCacheValid()).toBe(true);
    });

    it("handles concurrent token requests", async () => {
      const mockTokenResponse = {};
      const mockTokenResult = {
        access_token: "concurrent-token",
        expires_in: 3600,
      };

      mockOAuth.ClientSecretPost.mockReturnValue("mock-client-auth");
      mockOAuth.clientCredentialsGrantRequest.mockResolvedValue(
        mockTokenResponse,
      );
      mockOAuth.processClientCredentialsResponse.mockResolvedValue(
        mockTokenResult,
      );

      const tokenRetriever = new OAuth2ClientCredentials(mockAuth);

      // Make multiple concurrent requests
      const promises = Array.from({ length: 5 }, () =>
        tokenRetriever.getToken(),
      );
      const tokens = await Promise.all(promises);

      // All should return the same token
      expect(tokens).toHaveLength(5);
      tokens.forEach((token) =>
        expect(token.accessToken).toBe("concurrent-token"),
      );
    });
  });

  describe("Configuration Edge Cases", () => {
    it("handles empty client ID", () => {
      const authWithEmptyClientId = {
        clientId: "",
        clientSecret: "test-secret",
        tokenEndpoint: "https://example.com/token",
      };

      const tokenRetriever = new OAuth2ClientCredentials(authWithEmptyClientId);
      expect(tokenRetriever.auth.clientId).toBe("");
    });

    it("handles empty client secret", () => {
      const authWithEmptySecret = {
        clientId: "test-client",
        clientSecret: "",
        tokenEndpoint: "https://example.com/token",
      };

      const tokenRetriever = new OAuth2ClientCredentials(authWithEmptySecret);
      expect(tokenRetriever.auth.clientSecret).toBe("");
    });

    it("handles token endpoint with trailing slash", () => {
      const authWithTrailingSlash = {
        clientId: "test-client",
        clientSecret: "test-secret",
        tokenEndpoint: "https://example.com/token/",
      };

      const tokenRetriever = new OAuth2ClientCredentials(authWithTrailingSlash);
      expect(tokenRetriever.auth.tokenEndpoint).toBe(
        "https://example.com/token/",
      );
    });

    it("handles token endpoint with query parameters", () => {
      const authWithQueryParams = {
        clientId: "test-client",
        clientSecret: "test-secret",
        tokenEndpoint: "https://example.com/token?param=value",
      };

      const tokenRetriever = new OAuth2ClientCredentials(authWithQueryParams);
      expect(tokenRetriever.auth.tokenEndpoint).toBe(
        "https://example.com/token?param=value",
      );
    });

    it("handles auth config with special characters", () => {
      const authWithSpecialChars = {
        clientId: "test-client!@#$%^&*()",
        clientSecret: "test-secret-with-special-chars!@#$%^&*()",
        tokenEndpoint: "https://example.com/token",
      };

      const tokenRetriever = new OAuth2ClientCredentials(authWithSpecialChars);
      expect(tokenRetriever.auth.clientId).toBe("test-client!@#$%^&*()");
      expect(tokenRetriever.auth.clientSecret).toBe(
        "test-secret-with-special-chars!@#$%^&*()",
      );
    });
  });
});

describe("oauth2AuthRequest", () => {
  const mockAuth = {
    clientId: "test-client-id",
    clientSecret: "test-client-secret",
    tokenEndpoint: "https://example.com/token",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("creates an AuthRequest that configures request with Bearer token", async () => {
    const mockTokenResponse = {};
    const mockTokenResult = {
      access_token: "test-access-token",
      expires_in: 3600,
    };

    mockOAuth.ClientSecretPost.mockReturnValue("mock-client-auth");
    mockOAuth.clientCredentialsGrantRequest.mockResolvedValue(
      mockTokenResponse,
    );
    mockOAuth.processClientCredentialsResponse.mockResolvedValue(
      mockTokenResult,
    );

    const credentials = new OAuth2ClientCredentials(mockAuth);
    const authRequest = oauth2AuthRequest(credentials);

    const mockRequest = new Request("https://api.example.com/test");
    await authRequest.configureRequest(mockRequest);

    expect(mockRequest.headers.get("authorization")).toBe(
      "Bearer test-access-token",
    );
  });

  it("uses cached token when available", async () => {
    const credentials = new OAuth2ClientCredentials(mockAuth);

    // Set up a valid cached token
    const futureTime = new Date(Date.now() + 600000);
    (credentials as any).tokenCache = {
      accessToken: "cached-token",
      expiresAt: futureTime,
    };

    const authRequest = oauth2AuthRequest(credentials);
    const mockRequest = new Request("https://api.example.com/test");
    await authRequest.configureRequest(mockRequest);

    expect(mockRequest.headers.get("authorization")).toBe(
      "Bearer cached-token",
    );

    // Should not have called OAuth methods since using cache
    expect(mockOAuth.clientCredentialsGrantRequest).not.toHaveBeenCalled();
  });

  it("fetches new token when cache is expired", async () => {
    const mockTokenResponse = {};
    const mockTokenResult = {
      access_token: "fresh-token",
      expires_in: 3600,
    };

    mockOAuth.ClientSecretPost.mockReturnValue("mock-client-auth");
    mockOAuth.clientCredentialsGrantRequest.mockResolvedValue(
      mockTokenResponse,
    );
    mockOAuth.processClientCredentialsResponse.mockResolvedValue(
      mockTokenResult,
    );

    const credentials = new OAuth2ClientCredentials(mockAuth);

    // Set up an expired cache
    const pastTime = new Date(Date.now() - 1000);
    (credentials as any).tokenCache = {
      accessToken: "expired-token",
      expiresAt: pastTime,
    };

    const authRequest = oauth2AuthRequest(credentials);
    const mockRequest = new Request("https://api.example.com/test");
    await authRequest.configureRequest(mockRequest);

    expect(mockRequest.headers.get("authorization")).toBe("Bearer fresh-token");

    // Should have called OAuth methods to get new token
    expect(mockOAuth.clientCredentialsGrantRequest).toHaveBeenCalled();
    expect(mockOAuth.processClientCredentialsResponse).toHaveBeenCalled();
  });

  it("configures multiple requests with the same token", async () => {
    const credentials = new OAuth2ClientCredentials(mockAuth);

    // Set up a valid cached token
    const futureTime = new Date(Date.now() + 600000);
    (credentials as any).tokenCache = {
      accessToken: "shared-token",
      expiresAt: futureTime,
    };

    const authRequest = oauth2AuthRequest(credentials);

    const request1 = new Request("https://api.example.com/test1");
    const request2 = new Request("https://api.example.com/test2");

    await authRequest.configureRequest(request1);
    await authRequest.configureRequest(request2);

    expect(request1.headers.get("authorization")).toBe("Bearer shared-token");
    expect(request2.headers.get("authorization")).toBe("Bearer shared-token");
  });

  it("handles token retrieval errors gracefully", async () => {
    const tokenError = new Error("Failed to get token");

    mockOAuth.ClientSecretPost.mockReturnValue("mock-client-auth");
    mockOAuth.clientCredentialsGrantRequest.mockRejectedValue(tokenError);

    const credentials = new OAuth2ClientCredentials(mockAuth);
    const authRequest = oauth2AuthRequest(credentials);
    const mockRequest = new Request("https://api.example.com/test");

    await expect(authRequest.configureRequest(mockRequest)).rejects.toThrow(
      "Failed to get token",
    );
  });

  it("overwrites existing authorization header", async () => {
    const credentials = new OAuth2ClientCredentials(mockAuth);

    // Set up a valid cached token
    const futureTime = new Date(Date.now() + 600000);
    (credentials as any).tokenCache = {
      accessToken: "new-token",
      expiresAt: futureTime,
    };

    const authRequest = oauth2AuthRequest(credentials);
    const mockRequest = new Request("https://api.example.com/test", {
      headers: {
        authorization: "Bearer old-token",
      },
    });

    await authRequest.configureRequest(mockRequest);

    expect(mockRequest.headers.get("authorization")).toBe("Bearer new-token");
  });

  it("preserves other headers while setting authorization", async () => {
    const credentials = new OAuth2ClientCredentials(mockAuth);

    // Set up a valid cached token
    const futureTime = new Date(Date.now() + 600000);
    (credentials as any).tokenCache = {
      accessToken: "auth-token",
      expiresAt: futureTime,
    };

    const authRequest = oauth2AuthRequest(credentials);
    const mockRequest = new Request("https://api.example.com/test", {
      headers: {
        "content-type": "application/json",
        "user-agent": "test-agent",
      },
    });

    await authRequest.configureRequest(mockRequest);

    expect(mockRequest.headers.get("authorization")).toBe("Bearer auth-token");
    expect(mockRequest.headers.get("content-type")).toBe("application/json");
    expect(mockRequest.headers.get("user-agent")).toBe("test-agent");
  });
});
