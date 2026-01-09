import { KesselInventoryServiceClient } from "@project-kessel/kessel-sdk/kessel/inventory/v1beta2/inventory_service";

import { SubjectReference } from "@project-kessel/kessel-sdk/kessel/inventory/v1beta2/subject_reference";
import { RepresentationType } from "@project-kessel/kessel-sdk/kessel/inventory/v1beta2/representation_type";
import { StreamedListObjectsRequest } from "@project-kessel/kessel-sdk/kessel/inventory/v1beta2/streamed_list_objects_request";
import { ChannelCredentials } from "@grpc/grpc-js";
import "dotenv/config";

const stub = new KesselInventoryServiceClient(
  process.env.KESSEL_ENDPOINT!,
  ChannelCredentials.createInsecure(),
  {
    // Channel options
  },
);

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

try {
  const streamedResponse = stub.streamedListObjects(request);
  console.log("Received streamed response:");
  streamedResponse.forEach((response) => {
    console.log(response);
  });
} catch (e) {
  console.log("gRPC error occurred during streamed response:");
  console.log(`Exception:`, e);
}
