/* eslint-disable */
import {
  ChannelCredentials,
  Client,
  makeGenericClientConstructor,
  Metadata,
} from "@grpc/grpc-js";
import type {
  CallOptions,
  ClientOptions,
  ClientUnaryCall,
  handleUnaryCall,
  ServiceError,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";
import _m0 from "protobufjs/minimal";
import { ReporterData } from "./reporter_data";
import { RhelHost } from "./rhel_host";

export const protobufPackage = "kessel.inventory.v1beta1.resources";

export interface CreateRhelHostRequest {
  /** The Rhel Host to create in Kessel Asset Inventory */
  rhelHost?: RhelHost | undefined;
}

export interface CreateRhelHostResponse {}

export interface UpdateRhelHostRequest {
  /**
   * The resource to be updated will be defined by
   * \"<reporter_data.reporter_type>:<reporter_instaance_id>:<reporter_data.local_resource_id>\"
   * from the request body.
   */
  rhelHost?: RhelHost | undefined;
}

export interface UpdateRhelHostResponse {}

export interface DeleteRhelHostRequest {
  /**
   * The resource to be updated will be defined by
   * \"<reporter_data.reporter_type>:<reporter_instaance_id>:<reporter_data.local_resource_id>\"
   * from the request body.
   */
  reporterData?: ReporterData | undefined;
}

export interface DeleteRhelHostResponse {}

function createBaseCreateRhelHostRequest(): CreateRhelHostRequest {
  return { rhelHost: undefined };
}

export const CreateRhelHostRequest = {
  encode(
    message: CreateRhelHostRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.rhelHost !== undefined) {
      RhelHost.encode(message.rhelHost, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): CreateRhelHostRequest {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateRhelHostRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.rhelHost = RhelHost.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CreateRhelHostRequest {
    return {
      rhelHost: isSet(object.rhel_host)
        ? RhelHost.fromJSON(object.rhel_host)
        : undefined,
    };
  },

  toJSON(message: CreateRhelHostRequest): unknown {
    const obj: any = {};
    if (message.rhelHost !== undefined) {
      obj.rhel_host = RhelHost.toJSON(message.rhelHost);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<CreateRhelHostRequest>, I>>(
    base?: I,
  ): CreateRhelHostRequest {
    return CreateRhelHostRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<CreateRhelHostRequest>, I>>(
    object: I,
  ): CreateRhelHostRequest {
    const message = createBaseCreateRhelHostRequest();
    message.rhelHost =
      object.rhelHost !== undefined && object.rhelHost !== null
        ? RhelHost.fromPartial(object.rhelHost)
        : undefined;
    return message;
  },
};

function createBaseCreateRhelHostResponse(): CreateRhelHostResponse {
  return {};
}

export const CreateRhelHostResponse = {
  encode(
    _: CreateRhelHostResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): CreateRhelHostResponse {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateRhelHostResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): CreateRhelHostResponse {
    return {};
  },

  toJSON(_: CreateRhelHostResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<CreateRhelHostResponse>, I>>(
    base?: I,
  ): CreateRhelHostResponse {
    return CreateRhelHostResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<CreateRhelHostResponse>, I>>(
    _: I,
  ): CreateRhelHostResponse {
    const message = createBaseCreateRhelHostResponse();
    return message;
  },
};

function createBaseUpdateRhelHostRequest(): UpdateRhelHostRequest {
  return { rhelHost: undefined };
}

export const UpdateRhelHostRequest = {
  encode(
    message: UpdateRhelHostRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.rhelHost !== undefined) {
      RhelHost.encode(message.rhelHost, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): UpdateRhelHostRequest {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateRhelHostRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.rhelHost = RhelHost.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UpdateRhelHostRequest {
    return {
      rhelHost: isSet(object.rhel_host)
        ? RhelHost.fromJSON(object.rhel_host)
        : undefined,
    };
  },

  toJSON(message: UpdateRhelHostRequest): unknown {
    const obj: any = {};
    if (message.rhelHost !== undefined) {
      obj.rhel_host = RhelHost.toJSON(message.rhelHost);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<UpdateRhelHostRequest>, I>>(
    base?: I,
  ): UpdateRhelHostRequest {
    return UpdateRhelHostRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<UpdateRhelHostRequest>, I>>(
    object: I,
  ): UpdateRhelHostRequest {
    const message = createBaseUpdateRhelHostRequest();
    message.rhelHost =
      object.rhelHost !== undefined && object.rhelHost !== null
        ? RhelHost.fromPartial(object.rhelHost)
        : undefined;
    return message;
  },
};

function createBaseUpdateRhelHostResponse(): UpdateRhelHostResponse {
  return {};
}

export const UpdateRhelHostResponse = {
  encode(
    _: UpdateRhelHostResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): UpdateRhelHostResponse {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateRhelHostResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): UpdateRhelHostResponse {
    return {};
  },

  toJSON(_: UpdateRhelHostResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<UpdateRhelHostResponse>, I>>(
    base?: I,
  ): UpdateRhelHostResponse {
    return UpdateRhelHostResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<UpdateRhelHostResponse>, I>>(
    _: I,
  ): UpdateRhelHostResponse {
    const message = createBaseUpdateRhelHostResponse();
    return message;
  },
};

function createBaseDeleteRhelHostRequest(): DeleteRhelHostRequest {
  return { reporterData: undefined };
}

export const DeleteRhelHostRequest = {
  encode(
    message: DeleteRhelHostRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.reporterData !== undefined) {
      ReporterData.encode(
        message.reporterData,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): DeleteRhelHostRequest {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeleteRhelHostRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.reporterData = ReporterData.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): DeleteRhelHostRequest {
    return {
      reporterData: isSet(object.reporter_data)
        ? ReporterData.fromJSON(object.reporter_data)
        : undefined,
    };
  },

  toJSON(message: DeleteRhelHostRequest): unknown {
    const obj: any = {};
    if (message.reporterData !== undefined) {
      obj.reporter_data = ReporterData.toJSON(message.reporterData);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<DeleteRhelHostRequest>, I>>(
    base?: I,
  ): DeleteRhelHostRequest {
    return DeleteRhelHostRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<DeleteRhelHostRequest>, I>>(
    object: I,
  ): DeleteRhelHostRequest {
    const message = createBaseDeleteRhelHostRequest();
    message.reporterData =
      object.reporterData !== undefined && object.reporterData !== null
        ? ReporterData.fromPartial(object.reporterData)
        : undefined;
    return message;
  },
};

function createBaseDeleteRhelHostResponse(): DeleteRhelHostResponse {
  return {};
}

export const DeleteRhelHostResponse = {
  encode(
    _: DeleteRhelHostResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): DeleteRhelHostResponse {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeleteRhelHostResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): DeleteRhelHostResponse {
    return {};
  },

  toJSON(_: DeleteRhelHostResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<DeleteRhelHostResponse>, I>>(
    base?: I,
  ): DeleteRhelHostResponse {
    return DeleteRhelHostResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<DeleteRhelHostResponse>, I>>(
    _: I,
  ): DeleteRhelHostResponse {
    const message = createBaseDeleteRhelHostResponse();
    return message;
  },
};

export type KesselRhelHostServiceDefinition =
  typeof KesselRhelHostServiceDefinition;
export const KesselRhelHostServiceDefinition = {
  name: "KesselRhelHostService",
  fullName: "kessel.inventory.v1beta1.resources.KesselRhelHostService",
  methods: {
    createRhelHost: {
      name: "CreateRhelHost",
      requestType: CreateRhelHostRequest,
      requestStream: false,
      responseType: CreateRhelHostResponse,
      responseStream: false,
      options: {
        _unknownFields: {
          578365826: [
            Buffer.from([
              48, 58, 1, 42, 34, 43, 47, 97, 112, 105, 47, 105, 110, 118, 101,
              110, 116, 111, 114, 121, 47, 118, 49, 98, 101, 116, 97, 49, 47,
              114, 101, 115, 111, 117, 114, 99, 101, 115, 47, 114, 104, 101,
              108, 45, 104, 111, 115, 116, 115,
            ]),
          ],
        },
      },
    },
    updateRhelHost: {
      name: "UpdateRhelHost",
      requestType: UpdateRhelHostRequest,
      requestStream: false,
      responseType: UpdateRhelHostResponse,
      responseStream: false,
      options: {
        _unknownFields: {
          578365826: [
            Buffer.from([
              48, 58, 1, 42, 26, 43, 47, 97, 112, 105, 47, 105, 110, 118, 101,
              110, 116, 111, 114, 121, 47, 118, 49, 98, 101, 116, 97, 49, 47,
              114, 101, 115, 111, 117, 114, 99, 101, 115, 47, 114, 104, 101,
              108, 45, 104, 111, 115, 116, 115,
            ]),
          ],
        },
      },
    },
    deleteRhelHost: {
      name: "DeleteRhelHost",
      requestType: DeleteRhelHostRequest,
      requestStream: false,
      responseType: DeleteRhelHostResponse,
      responseStream: false,
      options: {
        _unknownFields: {
          578365826: [
            Buffer.from([
              48, 58, 1, 42, 42, 43, 47, 97, 112, 105, 47, 105, 110, 118, 101,
              110, 116, 111, 114, 121, 47, 118, 49, 98, 101, 116, 97, 49, 47,
              114, 101, 115, 111, 117, 114, 99, 101, 115, 47, 114, 104, 101,
              108, 45, 104, 111, 115, 116, 115,
            ]),
          ],
        },
      },
    },
  },
} as const;

export type KesselRhelHostServiceService = typeof KesselRhelHostServiceService;
export const KesselRhelHostServiceService = {
  createRhelHost: {
    path: "/kessel.inventory.v1beta1.resources.KesselRhelHostService/CreateRhelHost",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: CreateRhelHostRequest) =>
      Buffer.from(CreateRhelHostRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => CreateRhelHostRequest.decode(value),
    responseSerialize: (value: CreateRhelHostResponse) =>
      Buffer.from(CreateRhelHostResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) =>
      CreateRhelHostResponse.decode(value),
  },
  updateRhelHost: {
    path: "/kessel.inventory.v1beta1.resources.KesselRhelHostService/UpdateRhelHost",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: UpdateRhelHostRequest) =>
      Buffer.from(UpdateRhelHostRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => UpdateRhelHostRequest.decode(value),
    responseSerialize: (value: UpdateRhelHostResponse) =>
      Buffer.from(UpdateRhelHostResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) =>
      UpdateRhelHostResponse.decode(value),
  },
  deleteRhelHost: {
    path: "/kessel.inventory.v1beta1.resources.KesselRhelHostService/DeleteRhelHost",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: DeleteRhelHostRequest) =>
      Buffer.from(DeleteRhelHostRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => DeleteRhelHostRequest.decode(value),
    responseSerialize: (value: DeleteRhelHostResponse) =>
      Buffer.from(DeleteRhelHostResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) =>
      DeleteRhelHostResponse.decode(value),
  },
} as const;

export interface KesselRhelHostServiceServer
  extends UntypedServiceImplementation {
  createRhelHost: handleUnaryCall<
    CreateRhelHostRequest,
    CreateRhelHostResponse
  >;
  updateRhelHost: handleUnaryCall<
    UpdateRhelHostRequest,
    UpdateRhelHostResponse
  >;
  deleteRhelHost: handleUnaryCall<
    DeleteRhelHostRequest,
    DeleteRhelHostResponse
  >;
}

export interface KesselRhelHostServiceClient extends Client {
  createRhelHost(
    request: CreateRhelHostRequest,
    callback: (
      error: ServiceError | null,
      response: CreateRhelHostResponse,
    ) => void,
  ): ClientUnaryCall;
  createRhelHost(
    request: CreateRhelHostRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: CreateRhelHostResponse,
    ) => void,
  ): ClientUnaryCall;
  createRhelHost(
    request: CreateRhelHostRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: CreateRhelHostResponse,
    ) => void,
  ): ClientUnaryCall;
  updateRhelHost(
    request: UpdateRhelHostRequest,
    callback: (
      error: ServiceError | null,
      response: UpdateRhelHostResponse,
    ) => void,
  ): ClientUnaryCall;
  updateRhelHost(
    request: UpdateRhelHostRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: UpdateRhelHostResponse,
    ) => void,
  ): ClientUnaryCall;
  updateRhelHost(
    request: UpdateRhelHostRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: UpdateRhelHostResponse,
    ) => void,
  ): ClientUnaryCall;
  deleteRhelHost(
    request: DeleteRhelHostRequest,
    callback: (
      error: ServiceError | null,
      response: DeleteRhelHostResponse,
    ) => void,
  ): ClientUnaryCall;
  deleteRhelHost(
    request: DeleteRhelHostRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: DeleteRhelHostResponse,
    ) => void,
  ): ClientUnaryCall;
  deleteRhelHost(
    request: DeleteRhelHostRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: DeleteRhelHostResponse,
    ) => void,
  ): ClientUnaryCall;
}

export const KesselRhelHostServiceClient = makeGenericClientConstructor(
  KesselRhelHostServiceService,
  "kessel.inventory.v1beta1.resources.KesselRhelHostService",
) as unknown as {
  new (
    address: string,
    credentials: ChannelCredentials,
    options?: Partial<ClientOptions>,
  ): KesselRhelHostServiceClient;
  service: typeof KesselRhelHostServiceService;
  serviceName: string;
};

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends globalThis.Array<infer U>
    ? globalThis.Array<DeepPartial<U>>
    : T extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepPartial<U>>
      : T extends {}
        ? { [K in keyof T]?: DeepPartial<T[K]> }
        : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & {
      [K in Exclude<keyof I, KeysOfUnion<P>>]: never;
    };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
