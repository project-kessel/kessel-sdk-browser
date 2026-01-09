import { KesselInventoryServiceClient } from "@project-kessel/kessel-sdk/kessel/inventory/v1beta2/inventory_service";
import { ResourceReference } from "@project-kessel/kessel-sdk/kessel/inventory/v1beta2/resource_reference";
import { SubjectReference } from "@project-kessel/kessel-sdk/kessel/inventory/v1beta2/subject_reference";
import { CheckRequest } from "@project-kessel/kessel-sdk/kessel/inventory/v1beta2/check_request";
import {
  fetchOIDCDiscovery,
  OAuth2ClientCredentials,
} from "@project-kessel/kessel-sdk/kessel/auth";
import type { OIDCDiscoveryMetadata } from "@project-kessel/kessel-sdk/kessel/auth";
import { oauth2CallCredentials } from "@project-kessel/kessel-sdk/kessel/grpc";
import "dotenv/config";
import { ChannelCredentials, credentials } from "@grpc/grpc-js";

const subjectReference: SubjectReference = {
  resource: {
    reporter: {
      type: "rbac",
    },
    resourceId: "foobar",
    resourceType: "principal",
  },
};

const resource: ResourceReference = {
  reporter: {
    type: "rbac",
  },
  resourceId: "1234",
  resourceType: "workspace",
};

const check_request: CheckRequest = {
  object: resource,
  relation: "inventory_host_view",
  subject: subjectReference,
};

fetchOIDCDiscovery(process.env.AUTH_DISCOVERY_ISSUER_URL!)
  .then((discovery: OIDCDiscoveryMetadata) => {
    return new OAuth2ClientCredentials({
      clientId: process.env.AUTH_CLIENT_ID!,
      clientSecret: process.env.AUTH_CLIENT_SECRET!,
      tokenEndpoint: discovery.tokenEndpoint,
    });
  })
  .then((auth: OAuth2ClientCredentials) => {
    const stub = new KesselInventoryServiceClient(
      process.env.KESSEL_ENDPOINT!,
      credentials.combineChannelCredentials(
        ChannelCredentials.createSsl(), // Auth only works with secure credentials
        oauth2CallCredentials(auth),
      ),
    );

    stub.check(check_request, (error, response) => {
      if (!error) {
        console.log("Check response received successfully:");
        console.log(response);
      } else {
        console.log("gRPC error occurred during Check:");
        console.log(`Exception:`, error);
      }
    });
  });
