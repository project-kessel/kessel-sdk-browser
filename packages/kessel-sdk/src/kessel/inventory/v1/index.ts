import { KesselInventoryHealthServiceClient } from "./health";
import { clientBuilderForStub } from "..";

/**
 * Client builder for the Kessel Inventory Health Service (v1).
 *
 * This builder provides a fluent API for creating and configuring gRPC clients
 * for the Kessel Inventory Health Service. Health services are typically used
 * for monitoring and readiness checks.
 *
 * @example
 * ```typescript
 * import { ClientBuilder } from "@project-kessel/kessel-sdk/inventory/v1";
 *
 * const healthClient = ClientBuilder.builder()
 *   .withTarget("localhost:9000")
 *   .withInsecureCredentials()
 *   .build();
 *
 * // Use the health client
 * const response = await healthClient.check({});
 * ```
 */
export const ClientBuilder = clientBuilderForStub(
  KesselInventoryHealthServiceClient,
);
