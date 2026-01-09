import { ClientBuilder } from "@project-kessel/kessel-sdk/kessel/inventory/v1beta2";
import { principalSubject, listWorkspaces } from "../../src/kessel/rbac/v2";
import "dotenv/config";

(async () => {
  try {
    const client = new ClientBuilder(process.env.KESSEL_ENDPOINT!)
      .insecure()
      .buildAsync();

    console.log("Listing workspaces\n");
    for await (const response of listWorkspaces(
      client,
      principalSubject("alice", "redhat"),
      "view_document",
    )) {
      console.log(`Workspace: ${response.object?.resourceId}`);
    }
  } catch (e) {
    console.error(`Error received when listing workspaces`, e);
  }
})();
