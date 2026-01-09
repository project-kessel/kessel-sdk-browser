import { SubjectReference } from "@project-kessel/kessel-sdk/kessel/inventory/v1beta2/subject_reference";
import { RepresentationType } from "@project-kessel/kessel-sdk/kessel/inventory/v1beta2/representation_type";
import { StreamedListObjectsRequest } from "@project-kessel/kessel-sdk/kessel/inventory/v1beta2/streamed_list_objects_request";
import { ClientBuilder } from "@project-kessel/kessel-sdk/kessel/inventory/v1beta2";
import "dotenv/config";

const client = new ClientBuilder(process.env.KESSEL_ENDPOINT!)
  .insecure()
  .buildAsync(); // Or .build if using the callback client

const representationType: RepresentationType = {
  resourceType: "workspace",
  reporterType: "rbac",
};

const subjectReference: SubjectReference = {
  resource: {
    reporter: {
      type: "rbac",
    },
    resourceId: "foobar",
    resourceType: "principal",
  },
};

const request: StreamedListObjectsRequest = {
  objectType: representationType,
  relation: "inventory_host_view",
  subject: subjectReference,
};

(async () => {
  const streamedResponse = client.streamedListObjects(request);
  console.log("Received streamed response:");
  try {
    for await (const response of streamedResponse) {
      console.log(response);
    }
  } catch (e) {
    console.log("gRPC error occurred during Check:");
    console.log(`Exception:`, e);
  }
})();
