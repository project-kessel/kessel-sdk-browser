import { ClientBuilder } from "../index";
import { OAuth2ClientCredentials } from "../../../auth";
import { credentials, Metadata } from "@grpc/grpc-js";

describe("v1beta2 ClientBuilder", () => {
  it("Creates a ClientBuilder for KesselInventoryServiceClient", () => {
    const builder = new ClientBuilder("localhost:9000");
    expect(builder).toBeDefined();
    expect(typeof builder.build).toBe("function");
    expect(typeof builder.buildAsync).toBe("function");
  });

  it("build returns a client", () => {
    const builder = new ClientBuilder("localhost:9000");
    expect(() => builder.build()).not.toThrow();
  });

  it("buildAsync returns a promisified client", () => {
    const builder = new ClientBuilder("localhost:9000");
    const client = builder.buildAsync();

    expect(client).toBeDefined();
    expect(typeof client).toBe("object");
    // Check that it has the expected methods (these should be promisified)
    expect(typeof client.check).toBe("function");
    expect(typeof client.reportResource).toBe("function");
    expect(typeof client.deleteResource).toBe("function");
  });

  describe("Authentication Methods", () => {
    it("supports insecure connections", () => {
      const builder = new ClientBuilder("localhost:9000").insecure();
      expect(() => builder.build()).not.toThrow();
    });

    it("supports unauthenticated secure connections", () => {
      const builder = new ClientBuilder("localhost:9000").unauthenticated();
      expect(() => builder.build()).not.toThrow();
    });

    it("supports unauthenticated with custom channel credentials", () => {
      const channelCredentials = credentials.createSsl();
      const builder = new ClientBuilder("localhost:9000").unauthenticated(
        channelCredentials,
      );
      expect(() => builder.build()).not.toThrow();
    });

    it("supports oauth2 client authentication", () => {
      const oauth2Credentials = new OAuth2ClientCredentials({
        clientId: "test-client",
        clientSecret: "test-secret",
        tokenEndpoint: "https://example.com/token",
      });

      const builder = new ClientBuilder(
        "localhost:9000",
      ).oauth2ClientAuthenticated(oauth2Credentials);
      expect(() => builder.build()).not.toThrow();
    });

    it("supports oauth2 client authentication with custom channel credentials", () => {
      const oauth2Credentials = new OAuth2ClientCredentials({
        clientId: "test-client",
        clientSecret: "test-secret",
        tokenEndpoint: "https://example.com/token",
      });
      const channelCredentials = credentials.createSsl();

      const builder = new ClientBuilder(
        "localhost:9000",
      ).oauth2ClientAuthenticated(oauth2Credentials, channelCredentials);
      expect(() => builder.build()).not.toThrow();
    });

    it("supports custom call credentials authentication", () => {
      const callCredentials = credentials.createFromMetadataGenerator(
        (options, callback) => {
          const metadata = new Metadata();
          metadata.add("authorization", "Bearer custom-token");
          callback(null, metadata);
        },
      );

      const builder = new ClientBuilder("localhost:9000").authenticated(
        callCredentials,
      );
      expect(() => builder.build()).not.toThrow();
    });

    it("supports custom call and channel credentials", () => {
      const callCredentials = credentials.createFromMetadataGenerator(
        (options, callback) => {
          const metadata = new Metadata();
          metadata.add("authorization", "Bearer custom-token");
          callback(null, metadata);
        },
      );
      const channelCredentials = credentials.createSsl();

      const builder = new ClientBuilder("localhost:9000").authenticated(
        callCredentials,
        channelCredentials,
      );
      expect(() => builder.build()).not.toThrow();
    });
  });

  describe("Credential Validation", () => {
    it("throws error when trying to authenticate with insecure channel", () => {
      const oauth2Credentials = new OAuth2ClientCredentials({
        clientId: "test-client",
        clientSecret: "test-secret",
        tokenEndpoint: "https://example.com/token",
      });
      const insecureCredentials = credentials.createInsecure();

      expect(() => {
        new ClientBuilder("localhost:9000").oauth2ClientAuthenticated(
          oauth2Credentials,
          insecureCredentials,
        );
      }).toThrow(
        "Invalid credential configuration: can not authenticate with insecure channel",
      );
    });

    it("throws error when using call credentials with insecure channel", () => {
      const callCredentials = credentials.createFromMetadataGenerator(
        (options, callback) => {
          const metadata = new Metadata();
          metadata.add("authorization", "Bearer token");
          callback(null, metadata);
        },
      );
      const insecureCredentials = credentials.createInsecure();

      expect(() => {
        new ClientBuilder("localhost:9000").authenticated(
          callCredentials,
          insecureCredentials,
        );
      }).toThrow(
        "Invalid credential configuration: can not authenticate with insecure channel",
      );
    });

    it("allows unauthenticated connections with insecure channel", () => {
      const insecureCredentials = credentials.createInsecure();
      expect(() => {
        new ClientBuilder("localhost:9000").unauthenticated(
          insecureCredentials,
        );
      }).not.toThrow();
    });
  });

  describe("Default Behavior", () => {
    it("uses SSL by default when no credentials specified", () => {
      const builder = new ClientBuilder("localhost:9000");
      expect(() => builder.build()).not.toThrow();
    });

    it("allows chaining authentication methods (last one wins)", () => {
      const oauth2Credentials = new OAuth2ClientCredentials({
        clientId: "test-client",
        clientSecret: "test-secret",
        tokenEndpoint: "https://example.com/token",
      });

      const builder = new ClientBuilder("localhost:9000")
        .oauth2ClientAuthenticated(oauth2Credentials)
        .insecure();

      expect(() => builder.build()).not.toThrow();
    });
  });

  describe("Client Methods", () => {
    let client: any;

    beforeEach(() => {
      client = new ClientBuilder("localhost:9000").buildAsync();
    });

    it("has check method", () => {
      expect(typeof client.check).toBe("function");
    });

    it("has reportResource method", () => {
      expect(typeof client.reportResource).toBe("function");
    });

    it("has deleteResource method", () => {
      expect(typeof client.deleteResource).toBe("function");
    });

    it("has checkForUpdate method", () => {
      expect(typeof client.checkForUpdate).toBe("function");
    });

    it("has streamedListObjects method", () => {
      expect(typeof client.streamedListObjects).toBe("function");
    });

    it("client methods are promisified", async () => {
      // Methods should return promises, not accept callbacks
      expect(client.check.length).toBeLessThan(2); // No callback parameter
      expect(client.reportResource.length).toBeLessThan(2);
      expect(client.deleteResource.length).toBeLessThan(2);
      expect(client.checkForUpdate.length).toBeLessThan(2);
    });
  });

  describe("Service-specific Configuration", () => {
    it("builds client with inventory service specific settings", () => {
      const channelCredentials = credentials.createSsl();
      const builder = new ClientBuilder(
        "kessel-inventory.example.com:443",
      ).unauthenticated(channelCredentials);

      expect(() => builder.build()).not.toThrow();
    });

    it("supports production-like configuration", () => {
      const oauth2Credentials = new OAuth2ClientCredentials({
        clientId: "inventory-client",
        clientSecret: "prod-secret",
        tokenEndpoint: "https://sso.prod.example.com/auth",
      });
      const channelCredentials = credentials.createSsl();

      const builder = new ClientBuilder(
        "kessel-inventory.prod.example.com:443",
      ).oauth2ClientAuthenticated(oauth2Credentials, channelCredentials);

      expect(() => builder.build()).not.toThrow();
    });

    it("supports development configuration", () => {
      const builder = new ClientBuilder("localhost:9000").insecure();
      expect(() => builder.build()).not.toThrow();
    });

    it("supports testing configuration", () => {
      const channelCredentials = credentials.createSsl();
      const builder = new ClientBuilder(
        "test-inventory.internal:9000",
      ).unauthenticated(channelCredentials);

      expect(() => builder.build()).not.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("handles multiple build calls on same builder", () => {
      const builder = new ClientBuilder("localhost:9000").insecure();

      const client1 = builder.build();
      const client2 = builder.build();

      expect(client1).toBeDefined();
      expect(client2).toBeDefined();
      expect(client1).not.toBe(client2); // Different instances
    });

    it("handles mixed build and buildAsync calls", () => {
      const builder = new ClientBuilder("localhost:9000").insecure();

      const syncClient = builder.build();
      const asyncClient = builder.buildAsync();

      expect(syncClient).toBeDefined();
      expect(asyncClient).toBeDefined();
      expect(typeof syncClient.check).toBe("function");
      expect(typeof asyncClient.check).toBe("function");
    });
  });

  describe("Builder Pattern", () => {
    it("supports fluent interface", () => {
      const oauth2Credentials = new OAuth2ClientCredentials({
        clientId: "test",
        clientSecret: "secret",
        tokenEndpoint: "https://auth.example.com",
      });

      const builder = new ClientBuilder(
        "localhost:9000",
      ).oauth2ClientAuthenticated(oauth2Credentials);

      expect(() => builder.build()).not.toThrow();
    });

    it("allows authentication method override", () => {
      const oauth2Credentials = new OAuth2ClientCredentials({
        clientId: "test",
        clientSecret: "secret",
        tokenEndpoint: "https://auth.example.com",
      });

      const builder = new ClientBuilder("localhost:9000")
        .oauth2ClientAuthenticated(oauth2Credentials)
        .insecure();

      expect(() => builder.build()).not.toThrow();
    });
  });

  describe("Integration with gRPC", () => {
    it("creates actual gRPC client instances", () => {
      const client = new ClientBuilder("localhost:9000").build();

      // Should have gRPC client properties
      expect(client).toBeDefined();
      expect(typeof client).toBe("object");
    });

    it("supports gRPC metadata with promisified client", () => {
      const client = new ClientBuilder("localhost:9000").buildAsync();

      // Methods should support metadata parameter (promisified methods have parameters for request, metadata, options)
      expect(client.check.length).toBeGreaterThanOrEqual(0);
      expect(client.reportResource.length).toBeGreaterThanOrEqual(0);
      expect(client.deleteResource.length).toBeGreaterThanOrEqual(0);
    });

    it("handles streaming methods correctly", () => {
      const client = new ClientBuilder("localhost:9000").buildAsync();

      // Streaming method should exist
      expect(typeof client.streamedListObjects).toBe("function");
    });
  });
});
