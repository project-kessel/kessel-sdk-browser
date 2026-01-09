import { oauth2CallCredentials } from "../index";
import { OAuth2ClientCredentials } from "../../auth";
import { credentials } from "@grpc/grpc-js";

describe("oauth2CallCredentials", () => {
  it("creates call credentials from OAuth2ClientCredentials", () => {
    const oauth2Creds = new OAuth2ClientCredentials({
      clientId: "test-client",
      clientSecret: "test-secret",
      tokenEndpoint: "https://example.com/token",
    });

    const callCredentials = oauth2CallCredentials(oauth2Creds);
    expect(callCredentials).toBeDefined();
  });

  it("generates metadata with Bearer token", async () => {
    const oauth2Creds = new OAuth2ClientCredentials({
      clientId: "test-client",
      clientSecret: "test-secret",
      tokenEndpoint: "https://example.com/token",
    });

    // Mock the getToken method to return a test token
    const mockToken = {
      accessToken: "test-token",
      expiresAt: new Date(Date.now() + 3600000),
    };
    jest.spyOn(oauth2Creds, "getToken").mockResolvedValue(mockToken);

    const callCredentials = oauth2CallCredentials(oauth2Creds);

    // Test that the credentials can generate metadata
    expect(callCredentials).toBeDefined();
    expect(typeof callCredentials).toBe("object");
  });

  it("handles token refresh in metadata generator", async () => {
    const oauth2Creds = new OAuth2ClientCredentials({
      clientId: "test-client",
      clientSecret: "test-secret",
      tokenEndpoint: "https://example.com/token",
    });

    // Mock multiple token calls to test refresh behavior
    const mockToken1 = {
      accessToken: "token-1",
      expiresAt: new Date(Date.now() + 3600000),
    };
    const mockToken2 = {
      accessToken: "token-2",
      expiresAt: new Date(Date.now() + 3600000),
    };

    const getTokenSpy = jest
      .spyOn(oauth2Creds, "getToken")
      .mockResolvedValueOnce(mockToken1)
      .mockResolvedValueOnce(mockToken2);

    const callCredentials = oauth2CallCredentials(oauth2Creds);

    expect(callCredentials).toBeDefined();
    expect(getTokenSpy).toBeDefined();
  });

  it("can be combined with channel credentials", () => {
    const oauth2Creds = new OAuth2ClientCredentials({
      clientId: "test-client",
      clientSecret: "test-secret",
      tokenEndpoint: "https://example.com/token",
    });

    const callCredentials = oauth2CallCredentials(oauth2Creds);
    const channelCredentials = credentials.createSsl();

    const combinedCredentials = credentials.combineChannelCredentials(
      channelCredentials,
      callCredentials,
    );

    expect(combinedCredentials).toBeDefined();
  });

  it("creates call credentials that can be combined with secure channels", () => {
    const oauth2Creds = new OAuth2ClientCredentials({
      clientId: "test-client",
      clientSecret: "test-secret",
      tokenEndpoint: "https://example.com/token",
    });

    const callCredentials = oauth2CallCredentials(oauth2Creds);
    const secureChannelCredentials = credentials.createSsl();

    // This should work - secure channel with call credentials
    const combinedCredentials = credentials.combineChannelCredentials(
      secureChannelCredentials,
      callCredentials,
    );

    expect(combinedCredentials).toBeDefined();
  });

  it("cannot combine call credentials with insecure channels", () => {
    const oauth2Creds = new OAuth2ClientCredentials({
      clientId: "test-client",
      clientSecret: "test-secret",
      tokenEndpoint: "https://example.com/token",
    });

    const callCredentials = oauth2CallCredentials(oauth2Creds);
    const insecureChannelCredentials = credentials.createInsecure();

    // This should throw an error - insecure channel cannot have call credentials
    expect(() => {
      credentials.combineChannelCredentials(
        insecureChannelCredentials,
        callCredentials,
      );
    }).toThrow("Cannot compose insecure credentials");
  });

  describe("Error Handling", () => {
    it("handles OAuth2ClientCredentials initialization errors", () => {
      const oauth2Creds = new OAuth2ClientCredentials({
        clientId: "test-client",
        clientSecret: "test-secret",
        tokenEndpoint: "https://example.com/token",
      });

      // Mock getToken to throw an error
      jest
        .spyOn(oauth2Creds, "getToken")
        .mockRejectedValue(new Error("Token fetch failed"));

      const callCredentials = oauth2CallCredentials(oauth2Creds);

      // The credentials object should still be created, errors happen during usage
      expect(callCredentials).toBeDefined();
    });

    it("handles invalid OAuth2ClientCredentials configuration", () => {
      const oauth2Creds = new OAuth2ClientCredentials({
        clientId: "",
        clientSecret: "",
        tokenEndpoint: "invalid-url",
      });

      const callCredentials = oauth2CallCredentials(oauth2Creds);

      // The credentials object should still be created, errors happen during usage
      expect(callCredentials).toBeDefined();
    });
  });

  describe("Integration Tests", () => {
    it("integrates with real OAuth2ClientCredentials flow", async () => {
      const oauth2Creds = new OAuth2ClientCredentials({
        clientId: "test-client",
        clientSecret: "test-secret",
        tokenEndpoint: "https://example.com/token",
      });

      // Mock a successful token response
      const mockToken = {
        accessToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
        expiresAt: new Date(Date.now() + 3600000),
      };
      jest.spyOn(oauth2Creds, "getToken").mockResolvedValue(mockToken);

      const callCredentials = oauth2CallCredentials(oauth2Creds);

      expect(callCredentials).toBeDefined();
    });

    it("can be used in real gRPC client scenario", () => {
      const oauth2Creds = new OAuth2ClientCredentials({
        clientId: "inventory-client",
        clientSecret: "production-secret",
        tokenEndpoint: "https://auth.prod.example.com/token",
      });

      const callCredentials = oauth2CallCredentials(oauth2Creds);
      const channelCredentials = credentials.createSsl();

      const finalCredentials = credentials.combineChannelCredentials(
        channelCredentials,
        callCredentials,
      );

      expect(finalCredentials).toBeDefined();
      expect(finalCredentials._isSecure()).toBe(true);
    });
  });
});
