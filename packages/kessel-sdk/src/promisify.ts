import { promisify } from "util";
import { Client, ClientUnaryCall, ServiceError } from "@grpc/grpc-js";
import { ServiceDefinition } from "@grpc/grpc-js/src/make-client";

interface CallbackClientMethod<
  TRequest = unknown,
  TResponse = unknown,
  TMetadata = unknown,
  TOptions = unknown,
> {
  (
    request: TRequest,
    callback: (error: ServiceError | null, response: TResponse) => void,
  ): ClientUnaryCall;
  (
    request: TRequest,
    metadata: TMetadata,
    callback: (error: ServiceError | null, response: TResponse) => void,
  ): ClientUnaryCall;
  (
    request: TRequest,
    metadata: TMetadata,
    options: TOptions,
    callback: (error: ServiceError | null, response: TResponse) => void,
  ): ClientUnaryCall;
}

interface PromisifiedClientMethod<
  TRequest = unknown,
  TResponse = unknown,
  TMetadata = unknown,
  TOptions = unknown,
> {
  (request: TRequest): Promise<TResponse>;
  (request: TRequest, metadata: TMetadata): Promise<TResponse>;
  (
    request: TRequest,
    metadata: TMetadata,
    options: TOptions,
  ): Promise<TResponse>;
}

/**
 * Type that represents a promisified version of a gRPC client.
 * Transforms callback-based methods into promise-based methods while preserving other properties.
 *
 * @template T - The original client type, defaults to Client
 */
export type PromisifiedClient<T = Client> = {
  [K in keyof T]: T[K] extends CallbackClientMethod<
    infer TRequest,
    infer TResponse,
    infer TMetadata,
    infer TOptions
  >
    ? PromisifiedClientMethod<TRequest, TResponse, TMetadata, TOptions>
    : T[K];
};

/**
 * Converts a callback-based gRPC client to a Promise-based client.
 *
 * @template T - The client type to promisify
 * @param client - The gRPC client instance to promisify
 * @param serviceDefinition - Optional service definition. If not provided, will attempt to extract from client constructor
 * @returns A promisified version of the client where all unary methods return Promises instead of using callbacks
 * @throws {Error} When the client doesn't have a ServiceDefinition and one wasn't provided
 *
 * @example
 * ```typescript
 * import { KesselInventoryServiceClient } from "kessel-sdk/kessel/inventory/v1beta2/inventory_service";
 * import { credentials } from "@grpc/grpc-js";
 *
 * const client = new KesselInventoryServiceClient("localhost:9000", credentials.createInsecure());
 * const promisifiedClient = promisifyClient(client);
 *
 * // Now you can use async/await
 * const response = await promisifiedClient.check(request);
 * ```
 */
export const promisifyClient = <T extends Client>(
  client: T,
  serviceDefinition?: ServiceDefinition,
): PromisifiedClient<T> => {
  serviceDefinition =
    serviceDefinition ??
    ("service" in client.constructor
      ? (client.constructor.service as ServiceDefinition)
      : undefined);

  if (!serviceDefinition) {
    throw new Error(
      "Client does not have a ServiceDefinition and one was not provided",
    );
  }

  const promisifiedMethods: Partial<
    Record<keyof T, PromisifiedClientMethod<unknown, unknown, unknown, unknown>>
  > = {};

  const handler: ProxyHandler<T> = {
    get(target, prop, receiver) {
      if (typeof prop === "string" && prop in serviceDefinition) {
        const propT = prop as keyof T;
        // Streamed response are already async iterators
        if (!serviceDefinition[prop].responseStream) {
          if (!promisifiedMethods[propT]) {
            promisifiedMethods[propT] = promisify(
              (target[propT] as CallbackClientMethod).bind(target),
            ) as PromisifiedClientMethod;
          }

          return promisifiedMethods[propT];
        }
      }

      return Reflect.get(target, prop, receiver);
    },
  };

  return new Proxy(client, handler) as PromisifiedClient<T>;
};
