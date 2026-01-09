import "dotenv/config";
import { KesselInventoryServiceClient } from "@project-kessel/kessel-sdk/kessel/inventory/v1beta2/inventory_service";
import { CheckBulkRequestItem } from "@project-kessel/kessel-sdk/kessel/inventory/v1beta2/check_bulk_request";
import { ChannelCredentials } from "@grpc/grpc-js";
import {
  principalSubject,
  workspaceResource,
} from "@project-kessel/kessel-sdk/kessel/rbac/v2";
import { CheckBulkRequest } from "@project-kessel/kessel-sdk/kessel/inventory/v1beta2/check_bulk_request";

const stub = new KesselInventoryServiceClient(
  process.env.KESSEL_ENDPOINT!,
  ChannelCredentials.createInsecure(),
  {
    // Channel options
  },
);

// Item 1: Check if bob can view widgets in workspace_123
const item1: CheckBulkRequestItem = {
  object: workspaceResource("workspace_123"),
  relation: "view_widget",
  subject: principalSubject("bob", "redhat"),
};

// Item 2: Check if bob can use widgets in workspace_456
const item2: CheckBulkRequestItem = {
  object: workspaceResource("workspace_456"),
  relation: "use_widget",
  subject: principalSubject("bob", "redhat"),
};

// Item 3: Check with invalid resource type to demonstrate error handling
const item3: CheckBulkRequestItem = {
  object: {
    reporter: {
      type: "rbac",
    },
    resourceId: "invalid_resource",
    resourceType: "not_a_valid_type",
  },
  relation: "view_widget",
  subject: principalSubject("alice", "redhat"),
};

const request: CheckBulkRequest = {
  items: [item1, item2, item3],
};

stub.checkBulk(request, (error, response) => {
  if (response.pairs) {
    console.log("CheckBulk response received successfully");
    console.log(`Total pairs in response: ${response.pairs.length}`);

    response.pairs.forEach((pair, index) => {
      console.log(`-- Result ${index + 1} --`);

      const req = pair.request;
      console.log(`Request: subject=${req?.subject?.resource?.resourceId}`);
      console.log(`relation=${req?.relation}`);
      console.log(`object=${req?.object?.resourceId}`);

      if (pair.item) {
        console.log(pair.item.allowed);
      } else if (pair.error) {
        console.log(
          `Error: Code=${pair.error.code}, Message=${pair.error.message}`,
        );
      }
    });
  } else {
    console.log("gRPC error occurred during Check:");
    console.log(`Exception:`, error);
  }
});
