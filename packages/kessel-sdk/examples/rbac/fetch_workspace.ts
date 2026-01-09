import {
  fetchOIDCDiscovery,
  OAuth2ClientCredentials,
  oauth2AuthRequest,
} from "../../src/kessel/auth";
import {
  fetchDefaultWorkspace,
  fetchRootWorkspace,
} from "../../src/kessel/rbac/v2";
import "dotenv/config";

(async () => {
  try {
    const discovery = await fetchOIDCDiscovery(
      process.env.AUTH_DISCOVERY_ISSUER_URL!,
    );

    const oAuth2ClientCredentials = new OAuth2ClientCredentials({
      clientId: process.env.AUTH_CLIENT_ID!,
      clientSecret: process.env.AUTH_CLIENT_SECRET!,
      tokenEndpoint: discovery.tokenEndpoint,
    });

    const defaultWorkspace = await fetchDefaultWorkspace(
      "http://localhost:8888",
      "12345",
      oauth2AuthRequest(oAuth2ClientCredentials),
    );
    console.log(
      `Found default workspace: '${defaultWorkspace.name}' with id: ${defaultWorkspace.id}`,
    );

    const rootWorkspace = await fetchRootWorkspace(
      "http://localhost:8888",
      "12345",
      oauth2AuthRequest(oAuth2ClientCredentials),
    );
    console.log(
      `Found root workspace: '${rootWorkspace.name}' with id: ${rootWorkspace.id}`,
    );
  } catch (e) {
    console.error(`Error received when fetching workspace`, e);
  }
})();
