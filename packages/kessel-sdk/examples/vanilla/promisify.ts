import { KesselInventoryServiceClient } from "@project-kessel/kessel-sdk/kessel/inventory/v1beta2/inventory_service";
import { ResourceReference } from "@project-kessel/kessel-sdk/kessel/inventory/v1beta2/resource_reference";
import { SubjectReference } from "@project-kessel/kessel-sdk/kessel/inventory/v1beta2/subject_reference";
import { CheckRequest } from "@project-kessel/kessel-sdk/kessel/inventory/v1beta2/check_request";
import { RepresentationType } from "@project-kessel/kessel-sdk/kessel/inventory/v1beta2/representation_type";
import { StreamedListObjectsRequest } from "@project-kessel/kessel-sdk/kessel/inventory/v1beta2/streamed_list_objects_request";
import { ChannelCredentials } from "@grpc/grpc-js";
import { promisify } from "util";
import "dotenv/config";

const stub = new KesselInventoryServiceClient(
  process.env.KESSEL_ENDPOINT!,
  ChannelCredentials.createInsecure(),
  {
    // Channel options
  },
);

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

const representationType: RepresentationType = {
  resourceType: "workspace",
  reporterType: "rbac",
};

const streamedListObjectsRequest: StreamedListObjectsRequest = {
  objectType: representationType,
  relation: "inventory_host_view",
  subject: subjectReference,
};

(async () => {
  const check = promisify(stub.check.bind(stub));
  try {
    const response = await check(check_request);
    console.log("Check response received successfully:");
    console.log(response);
  } catch (e) {
    console.log("gRPC error occurred during Check:");
    console.log(`Exception:`, e);
  }

  // We do not need to call promisify on `streamedListObjects` as this is already an async iterator
  const streamedResponse = stub.streamedListObjects(streamedListObjectsRequest);
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
