import { KesselInventoryServiceClient } from "./inventory_service";
import { clientBuilderForStub } from "..";

/**
 * Client builder for the Kessel Inventory Service (v1beta2).
 *
 * This builder provides a fluent API for creating and configuring gRPC clients
 * for the Kessel Inventory Service. It supports all standard configuration options
 * including credentials, authentication, keep-alive settings, and channel options.
 *
 * @example
 * ```typescript
 * import { ClientBuilder } from "@project-kessel/kessel-sdk/inventory/v1beta2";
 *
 * const client = ClientBuilder.builder()
 *   .withTarget("localhost:9000")
 *   .withInsecureCredentials()
 *   .build();
 *
 * // Use the client
 * const response = await client.check({
 *   subject: { id: "user123", type: "user" },
 *   resource: { id: "doc456", type: "document" },
 *   action: "read"
 * });
 * ```
 */
export const ClientBuilder = clientBuilderForStub(KesselInventoryServiceClient);
