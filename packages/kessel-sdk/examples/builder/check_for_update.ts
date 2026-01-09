import { ResourceReference } from "@project-kessel/kessel-sdk/kessel/inventory/v1beta2/resource_reference";
import { SubjectReference } from "@project-kessel/kessel-sdk/kessel/inventory/v1beta2/subject_reference";
import { CheckForUpdateRequest } from "@project-kessel/kessel-sdk/kessel/inventory/v1beta2/check_for_update_request";
import { ClientBuilder } from "@project-kessel/kessel-sdk/kessel/inventory/v1beta2";
import "dotenv/config";

const client = new ClientBuilder(process.env.KESSEL_ENDPOINT!)
  .insecure()
  .buildAsync(); // Or .build if using the callback client

const subject: SubjectReference = {
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

const checkForUpdateRequest: CheckForUpdateRequest = {
  object: resource,
  relation: "inventory_host_view",
  subject: subject,
};

(async () => {
  try {
    const response = await client.checkForUpdate(checkForUpdateRequest);
    console.log("CheckForUpdate response received successfully:");
    console.log(response);
  } catch (error) {
    console.log("gRPC error occurred during CheckForUpdate:");
    console.log(`Exception:`, error);
  }
})();
