/* eslint-disable */
import {
  ChannelCredentials,
  Client,
  ClientReadableStream,
  ClientWritableStream,
  handleClientStreamingCall,
  handleServerStreamingCall,
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
import { ObjectReference, ObjectType, SubjectReference } from "../authz/common";
import { NotificationsIntegration } from "./notifications_integration";
import { ReporterData } from "./reporter_data";

export const protobufPackage = "kessel.inventory.v1beta1.resources";

export interface CreateNotificationsIntegrationRequest {
  /** The NotificationsIntegration to create in Kessel Asset Inventory */
  integration?: NotificationsIntegration | undefined;
}

export interface CreateNotificationsIntegrationResponse {}

export interface UpdateNotificationsIntegrationRequest {
  /**
   * The resource to be updated will be defined by
   * \"<reporter_data.reporter_type>:<reporter_instaance_id>:<reporter_data.local_resource_id>\"
   * from the request body.
   */
  integration?: NotificationsIntegration | undefined;
}

export interface UpdateNotificationsIntegrationsRequest {
  /**
   * The resource to be updated will be defined by
   * \"<reporter_data.reporter_type>:<reporter_instaance_id>:<reporter_data.local_resource_id>\"
   * from the request body.
   */
  integration?: NotificationsIntegration | undefined;
}

export interface UpdateNotificationsIntegrationResponse {}

export interface UpdateNotificationsIntegrationsResponse {
  upsertsCompleted?: number | undefined;
}

export interface DeleteNotificationsIntegrationRequest {
  /**
   * The resource to be deleted will be defined by
   * \"<reporter_data.reporter_type>:<reporter_instaance_id>:<reporter_data.local_resource_id>\"
   * from the request body.
   */
  reporterData?: ReporterData | undefined;
}

export interface DeleteNotificationsIntegrationResponse {}

/**
 * resource type and parent relationship
 * permission (unless some variation of 'this is the permission used for visibility' can be baked into the schema- this is different from the permission parameter in CheckForView because only checks for actual visibility likely matter here)
 * parent resource type and id
 */
export interface ListNotificationsIntegrationsRequest {
  resourceType?: ObjectType | undefined;
  relation?: string | undefined;
  subject?: SubjectReference | undefined;
  parent?: ObjectReference | undefined;
}

export interface ListNotificationsIntegrationsResponse {
  integrations?: NotificationsIntegration | undefined;
}

function createBaseCreateNotificationsIntegrationRequest(): CreateNotificationsIntegrationRequest {
  return { integration: undefined };
}

export const CreateNotificationsIntegrationRequest = {
  encode(
    message: CreateNotificationsIntegrationRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.integration !== undefined) {
      NotificationsIntegration.encode(
        message.integration,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): CreateNotificationsIntegrationRequest {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateNotificationsIntegrationRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.integration = NotificationsIntegration.decode(
            reader,
            reader.uint32(),
          );
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CreateNotificationsIntegrationRequest {
    return {
      integration: isSet(object.integration)
        ? NotificationsIntegration.fromJSON(object.integration)
        : undefined,
    };
  },

  toJSON(message: CreateNotificationsIntegrationRequest): unknown {
    const obj: any = {};
    if (message.integration !== undefined) {
      obj.integration = NotificationsIntegration.toJSON(message.integration);
    }
    return obj;
  },

  create<
    I extends Exact<DeepPartial<CreateNotificationsIntegrationRequest>, I>,
  >(base?: I): CreateNotificationsIntegrationRequest {
    return CreateNotificationsIntegrationRequest.fromPartial(
      base ?? ({} as any),
    );
  },
  fromPartial<
    I extends Exact<DeepPartial<CreateNotificationsIntegrationRequest>, I>,
  >(object: I): CreateNotificationsIntegrationRequest {
    const message = createBaseCreateNotificationsIntegrationRequest();
    message.integration =
      object.integration !== undefined && object.integration !== null
        ? NotificationsIntegration.fromPartial(object.integration)
        : undefined;
    return message;
  },
};

function createBaseCreateNotificationsIntegrationResponse(): CreateNotificationsIntegrationResponse {
  return {};
}

export const CreateNotificationsIntegrationResponse = {
  encode(
    _: CreateNotificationsIntegrationResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): CreateNotificationsIntegrationResponse {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateNotificationsIntegrationResponse();
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

  fromJSON(_: any): CreateNotificationsIntegrationResponse {
    return {};
  },

  toJSON(_: CreateNotificationsIntegrationResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<
    I extends Exact<DeepPartial<CreateNotificationsIntegrationResponse>, I>,
  >(base?: I): CreateNotificationsIntegrationResponse {
    return CreateNotificationsIntegrationResponse.fromPartial(
      base ?? ({} as any),
    );
  },
  fromPartial<
    I extends Exact<DeepPartial<CreateNotificationsIntegrationResponse>, I>,
  >(_: I): CreateNotificationsIntegrationResponse {
    const message = createBaseCreateNotificationsIntegrationResponse();
    return message;
  },
};

function createBaseUpdateNotificationsIntegrationRequest(): UpdateNotificationsIntegrationRequest {
  return { integration: undefined };
}

export const UpdateNotificationsIntegrationRequest = {
  encode(
    message: UpdateNotificationsIntegrationRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.integration !== undefined) {
      NotificationsIntegration.encode(
        message.integration,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): UpdateNotificationsIntegrationRequest {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateNotificationsIntegrationRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.integration = NotificationsIntegration.decode(
            reader,
            reader.uint32(),
          );
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UpdateNotificationsIntegrationRequest {
    return {
      integration: isSet(object.integration)
        ? NotificationsIntegration.fromJSON(object.integration)
        : undefined,
    };
  },

  toJSON(message: UpdateNotificationsIntegrationRequest): unknown {
    const obj: any = {};
    if (message.integration !== undefined) {
      obj.integration = NotificationsIntegration.toJSON(message.integration);
    }
    return obj;
  },

  create<
    I extends Exact<DeepPartial<UpdateNotificationsIntegrationRequest>, I>,
  >(base?: I): UpdateNotificationsIntegrationRequest {
    return UpdateNotificationsIntegrationRequest.fromPartial(
      base ?? ({} as any),
    );
  },
  fromPartial<
    I extends Exact<DeepPartial<UpdateNotificationsIntegrationRequest>, I>,
  >(object: I): UpdateNotificationsIntegrationRequest {
    const message = createBaseUpdateNotificationsIntegrationRequest();
    message.integration =
      object.integration !== undefined && object.integration !== null
        ? NotificationsIntegration.fromPartial(object.integration)
        : undefined;
    return message;
  },
};

function createBaseUpdateNotificationsIntegrationsRequest(): UpdateNotificationsIntegrationsRequest {
  return { integration: undefined };
}

export const UpdateNotificationsIntegrationsRequest = {
  encode(
    message: UpdateNotificationsIntegrationsRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.integration !== undefined) {
      NotificationsIntegration.encode(
        message.integration,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): UpdateNotificationsIntegrationsRequest {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateNotificationsIntegrationsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.integration = NotificationsIntegration.decode(
            reader,
            reader.uint32(),
          );
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UpdateNotificationsIntegrationsRequest {
    return {
      integration: isSet(object.integration)
        ? NotificationsIntegration.fromJSON(object.integration)
        : undefined,
    };
  },

  toJSON(message: UpdateNotificationsIntegrationsRequest): unknown {
    const obj: any = {};
    if (message.integration !== undefined) {
      obj.integration = NotificationsIntegration.toJSON(message.integration);
    }
    return obj;
  },

  create<
    I extends Exact<DeepPartial<UpdateNotificationsIntegrationsRequest>, I>,
  >(base?: I): UpdateNotificationsIntegrationsRequest {
    return UpdateNotificationsIntegrationsRequest.fromPartial(
      base ?? ({} as any),
    );
  },
  fromPartial<
    I extends Exact<DeepPartial<UpdateNotificationsIntegrationsRequest>, I>,
  >(object: I): UpdateNotificationsIntegrationsRequest {
    const message = createBaseUpdateNotificationsIntegrationsRequest();
    message.integration =
      object.integration !== undefined && object.integration !== null
        ? NotificationsIntegration.fromPartial(object.integration)
        : undefined;
    return message;
  },
};

function createBaseUpdateNotificationsIntegrationResponse(): UpdateNotificationsIntegrationResponse {
  return {};
}

export const UpdateNotificationsIntegrationResponse = {
  encode(
    _: UpdateNotificationsIntegrationResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): UpdateNotificationsIntegrationResponse {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateNotificationsIntegrationResponse();
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

  fromJSON(_: any): UpdateNotificationsIntegrationResponse {
    return {};
  },

  toJSON(_: UpdateNotificationsIntegrationResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<
    I extends Exact<DeepPartial<UpdateNotificationsIntegrationResponse>, I>,
  >(base?: I): UpdateNotificationsIntegrationResponse {
    return UpdateNotificationsIntegrationResponse.fromPartial(
      base ?? ({} as any),
    );
  },
  fromPartial<
    I extends Exact<DeepPartial<UpdateNotificationsIntegrationResponse>, I>,
  >(_: I): UpdateNotificationsIntegrationResponse {
    const message = createBaseUpdateNotificationsIntegrationResponse();
    return message;
  },
};

function createBaseUpdateNotificationsIntegrationsResponse(): UpdateNotificationsIntegrationsResponse {
  return { upsertsCompleted: 0 };
}

export const UpdateNotificationsIntegrationsResponse = {
  encode(
    message: UpdateNotificationsIntegrationsResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (
      message.upsertsCompleted !== undefined &&
      message.upsertsCompleted !== 0
    ) {
      writer.uint32(8).int32(message.upsertsCompleted);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): UpdateNotificationsIntegrationsResponse {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateNotificationsIntegrationsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.upsertsCompleted = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UpdateNotificationsIntegrationsResponse {
    return {
      upsertsCompleted: isSet(object.upsertsCompleted)
        ? globalThis.Number(object.upsertsCompleted)
        : 0,
    };
  },

  toJSON(message: UpdateNotificationsIntegrationsResponse): unknown {
    const obj: any = {};
    if (
      message.upsertsCompleted !== undefined &&
      message.upsertsCompleted !== 0
    ) {
      obj.upsertsCompleted = Math.round(message.upsertsCompleted);
    }
    return obj;
  },

  create<
    I extends Exact<DeepPartial<UpdateNotificationsIntegrationsResponse>, I>,
  >(base?: I): UpdateNotificationsIntegrationsResponse {
    return UpdateNotificationsIntegrationsResponse.fromPartial(
      base ?? ({} as any),
    );
  },
  fromPartial<
    I extends Exact<DeepPartial<UpdateNotificationsIntegrationsResponse>, I>,
  >(object: I): UpdateNotificationsIntegrationsResponse {
    const message = createBaseUpdateNotificationsIntegrationsResponse();
    message.upsertsCompleted = object.upsertsCompleted ?? 0;
    return message;
  },
};

function createBaseDeleteNotificationsIntegrationRequest(): DeleteNotificationsIntegrationRequest {
  return { reporterData: undefined };
}

export const DeleteNotificationsIntegrationRequest = {
  encode(
    message: DeleteNotificationsIntegrationRequest,
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
  ): DeleteNotificationsIntegrationRequest {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeleteNotificationsIntegrationRequest();
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

  fromJSON(object: any): DeleteNotificationsIntegrationRequest {
    return {
      reporterData: isSet(object.reporter_data)
        ? ReporterData.fromJSON(object.reporter_data)
        : undefined,
    };
  },

  toJSON(message: DeleteNotificationsIntegrationRequest): unknown {
    const obj: any = {};
    if (message.reporterData !== undefined) {
      obj.reporter_data = ReporterData.toJSON(message.reporterData);
    }
    return obj;
  },

  create<
    I extends Exact<DeepPartial<DeleteNotificationsIntegrationRequest>, I>,
  >(base?: I): DeleteNotificationsIntegrationRequest {
    return DeleteNotificationsIntegrationRequest.fromPartial(
      base ?? ({} as any),
    );
  },
  fromPartial<
    I extends Exact<DeepPartial<DeleteNotificationsIntegrationRequest>, I>,
  >(object: I): DeleteNotificationsIntegrationRequest {
    const message = createBaseDeleteNotificationsIntegrationRequest();
    message.reporterData =
      object.reporterData !== undefined && object.reporterData !== null
        ? ReporterData.fromPartial(object.reporterData)
        : undefined;
    return message;
  },
};

function createBaseDeleteNotificationsIntegrationResponse(): DeleteNotificationsIntegrationResponse {
  return {};
}

export const DeleteNotificationsIntegrationResponse = {
  encode(
    _: DeleteNotificationsIntegrationResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): DeleteNotificationsIntegrationResponse {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeleteNotificationsIntegrationResponse();
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

  fromJSON(_: any): DeleteNotificationsIntegrationResponse {
    return {};
  },

  toJSON(_: DeleteNotificationsIntegrationResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<
    I extends Exact<DeepPartial<DeleteNotificationsIntegrationResponse>, I>,
  >(base?: I): DeleteNotificationsIntegrationResponse {
    return DeleteNotificationsIntegrationResponse.fromPartial(
      base ?? ({} as any),
    );
  },
  fromPartial<
    I extends Exact<DeepPartial<DeleteNotificationsIntegrationResponse>, I>,
  >(_: I): DeleteNotificationsIntegrationResponse {
    const message = createBaseDeleteNotificationsIntegrationResponse();
    return message;
  },
};

function createBaseListNotificationsIntegrationsRequest(): ListNotificationsIntegrationsRequest {
  return {
    resourceType: undefined,
    relation: "",
    subject: undefined,
    parent: undefined,
  };
}

export const ListNotificationsIntegrationsRequest = {
  encode(
    message: ListNotificationsIntegrationsRequest,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.resourceType !== undefined) {
      ObjectType.encode(
        message.resourceType,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    if (message.relation !== undefined && message.relation !== "") {
      writer.uint32(18).string(message.relation);
    }
    if (message.subject !== undefined) {
      SubjectReference.encode(
        message.subject,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.parent !== undefined) {
      ObjectReference.encode(message.parent, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ListNotificationsIntegrationsRequest {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListNotificationsIntegrationsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.resourceType = ObjectType.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.relation = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.subject = SubjectReference.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.parent = ObjectReference.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListNotificationsIntegrationsRequest {
    return {
      resourceType: isSet(object.resourceType)
        ? ObjectType.fromJSON(object.resourceType)
        : undefined,
      relation: isSet(object.relation)
        ? globalThis.String(object.relation)
        : "",
      subject: isSet(object.subject)
        ? SubjectReference.fromJSON(object.subject)
        : undefined,
      parent: isSet(object.parent)
        ? ObjectReference.fromJSON(object.parent)
        : undefined,
    };
  },

  toJSON(message: ListNotificationsIntegrationsRequest): unknown {
    const obj: any = {};
    if (message.resourceType !== undefined) {
      obj.resourceType = ObjectType.toJSON(message.resourceType);
    }
    if (message.relation !== undefined && message.relation !== "") {
      obj.relation = message.relation;
    }
    if (message.subject !== undefined) {
      obj.subject = SubjectReference.toJSON(message.subject);
    }
    if (message.parent !== undefined) {
      obj.parent = ObjectReference.toJSON(message.parent);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<ListNotificationsIntegrationsRequest>, I>>(
    base?: I,
  ): ListNotificationsIntegrationsRequest {
    return ListNotificationsIntegrationsRequest.fromPartial(
      base ?? ({} as any),
    );
  },
  fromPartial<
    I extends Exact<DeepPartial<ListNotificationsIntegrationsRequest>, I>,
  >(object: I): ListNotificationsIntegrationsRequest {
    const message = createBaseListNotificationsIntegrationsRequest();
    message.resourceType =
      object.resourceType !== undefined && object.resourceType !== null
        ? ObjectType.fromPartial(object.resourceType)
        : undefined;
    message.relation = object.relation ?? "";
    message.subject =
      object.subject !== undefined && object.subject !== null
        ? SubjectReference.fromPartial(object.subject)
        : undefined;
    message.parent =
      object.parent !== undefined && object.parent !== null
        ? ObjectReference.fromPartial(object.parent)
        : undefined;
    return message;
  },
};

function createBaseListNotificationsIntegrationsResponse(): ListNotificationsIntegrationsResponse {
  return { integrations: undefined };
}

export const ListNotificationsIntegrationsResponse = {
  encode(
    message: ListNotificationsIntegrationsResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.integrations !== undefined) {
      NotificationsIntegration.encode(
        message.integrations,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ListNotificationsIntegrationsResponse {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListNotificationsIntegrationsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.integrations = NotificationsIntegration.decode(
            reader,
            reader.uint32(),
          );
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListNotificationsIntegrationsResponse {
    return {
      integrations: isSet(object.integrations)
        ? NotificationsIntegration.fromJSON(object.integrations)
        : undefined,
    };
  },

  toJSON(message: ListNotificationsIntegrationsResponse): unknown {
    const obj: any = {};
    if (message.integrations !== undefined) {
      obj.integrations = NotificationsIntegration.toJSON(message.integrations);
    }
    return obj;
  },

  create<
    I extends Exact<DeepPartial<ListNotificationsIntegrationsResponse>, I>,
  >(base?: I): ListNotificationsIntegrationsResponse {
    return ListNotificationsIntegrationsResponse.fromPartial(
      base ?? ({} as any),
    );
  },
  fromPartial<
    I extends Exact<DeepPartial<ListNotificationsIntegrationsResponse>, I>,
  >(object: I): ListNotificationsIntegrationsResponse {
    const message = createBaseListNotificationsIntegrationsResponse();
    message.integrations =
      object.integrations !== undefined && object.integrations !== null
        ? NotificationsIntegration.fromPartial(object.integrations)
        : undefined;
    return message;
  },
};

export type KesselNotificationsIntegrationServiceDefinition =
  typeof KesselNotificationsIntegrationServiceDefinition;
export const KesselNotificationsIntegrationServiceDefinition = {
  name: "KesselNotificationsIntegrationService",
  fullName:
    "kessel.inventory.v1beta1.resources.KesselNotificationsIntegrationService",
  methods: {
    createNotificationsIntegration: {
      name: "CreateNotificationsIntegration",
      requestType: CreateNotificationsIntegrationRequest,
      requestStream: false,
      responseType: CreateNotificationsIntegrationResponse,
      responseStream: false,
      options: {
        _unknownFields: {
          578365826: [
            Buffer.from([
              64, 58, 1, 42, 34, 59, 47, 97, 112, 105, 47, 105, 110, 118, 101,
              110, 116, 111, 114, 121, 47, 118, 49, 98, 101, 116, 97, 49, 47,
              114, 101, 115, 111, 117, 114, 99, 101, 115, 47, 110, 111, 116,
              105, 102, 105, 99, 97, 116, 105, 111, 110, 115, 45, 105, 110, 116,
              101, 103, 114, 97, 116, 105, 111, 110, 115,
            ]),
          ],
        },
      },
    },
    updateNotificationsIntegration: {
      name: "UpdateNotificationsIntegration",
      requestType: UpdateNotificationsIntegrationRequest,
      requestStream: false,
      responseType: UpdateNotificationsIntegrationResponse,
      responseStream: false,
      options: {
        _unknownFields: {
          578365826: [
            Buffer.from([
              64, 58, 1, 42, 26, 59, 47, 97, 112, 105, 47, 105, 110, 118, 101,
              110, 116, 111, 114, 121, 47, 118, 49, 98, 101, 116, 97, 49, 47,
              114, 101, 115, 111, 117, 114, 99, 101, 115, 47, 110, 111, 116,
              105, 102, 105, 99, 97, 116, 105, 111, 110, 115, 45, 105, 110, 116,
              101, 103, 114, 97, 116, 105, 111, 110, 115,
            ]),
          ],
        },
      },
    },
    /** deprecated Temporary streaming update endpoint */
    updateNotificationsIntegrations: {
      name: "UpdateNotificationsIntegrations",
      requestType: UpdateNotificationsIntegrationsRequest,
      requestStream: true,
      responseType: UpdateNotificationsIntegrationsResponse,
      responseStream: false,
      options: {},
    },
    deleteNotificationsIntegration: {
      name: "DeleteNotificationsIntegration",
      requestType: DeleteNotificationsIntegrationRequest,
      requestStream: false,
      responseType: DeleteNotificationsIntegrationResponse,
      responseStream: false,
      options: {
        _unknownFields: {
          578365826: [
            Buffer.from([
              64, 58, 1, 42, 42, 59, 47, 97, 112, 105, 47, 105, 110, 118, 101,
              110, 116, 111, 114, 121, 47, 118, 49, 98, 101, 116, 97, 49, 47,
              114, 101, 115, 111, 117, 114, 99, 101, 115, 47, 110, 111, 116,
              105, 102, 105, 99, 97, 116, 105, 111, 110, 115, 45, 105, 110, 116,
              101, 103, 114, 97, 116, 105, 111, 110, 115,
            ]),
          ],
        },
      },
    },
    listNotificationsIntegrations: {
      name: "ListNotificationsIntegrations",
      requestType: ListNotificationsIntegrationsRequest,
      requestStream: false,
      responseType: ListNotificationsIntegrationsResponse,
      responseStream: true,
      options: {
        _unknownFields: {
          578365826: [
            Buffer.from([
              61, 18, 59, 47, 97, 112, 105, 47, 105, 110, 118, 101, 110, 116,
              111, 114, 121, 47, 118, 49, 98, 101, 116, 97, 49, 47, 114, 101,
              115, 111, 117, 114, 99, 101, 115, 47, 110, 111, 116, 105, 102,
              105, 99, 97, 116, 105, 111, 110, 115, 45, 105, 110, 116, 101, 103,
              114, 97, 116, 105, 111, 110, 115,
            ]),
          ],
        },
      },
    },
  },
} as const;

export type KesselNotificationsIntegrationServiceService =
  typeof KesselNotificationsIntegrationServiceService;
export const KesselNotificationsIntegrationServiceService = {
  createNotificationsIntegration: {
    path: "/kessel.inventory.v1beta1.resources.KesselNotificationsIntegrationService/CreateNotificationsIntegration",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: CreateNotificationsIntegrationRequest) =>
      Buffer.from(CreateNotificationsIntegrationRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) =>
      CreateNotificationsIntegrationRequest.decode(value),
    responseSerialize: (value: CreateNotificationsIntegrationResponse) =>
      Buffer.from(
        CreateNotificationsIntegrationResponse.encode(value).finish(),
      ),
    responseDeserialize: (value: Buffer) =>
      CreateNotificationsIntegrationResponse.decode(value),
  },
  updateNotificationsIntegration: {
    path: "/kessel.inventory.v1beta1.resources.KesselNotificationsIntegrationService/UpdateNotificationsIntegration",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: UpdateNotificationsIntegrationRequest) =>
      Buffer.from(UpdateNotificationsIntegrationRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) =>
      UpdateNotificationsIntegrationRequest.decode(value),
    responseSerialize: (value: UpdateNotificationsIntegrationResponse) =>
      Buffer.from(
        UpdateNotificationsIntegrationResponse.encode(value).finish(),
      ),
    responseDeserialize: (value: Buffer) =>
      UpdateNotificationsIntegrationResponse.decode(value),
  },
  /** deprecated Temporary streaming update endpoint */
  updateNotificationsIntegrations: {
    path: "/kessel.inventory.v1beta1.resources.KesselNotificationsIntegrationService/UpdateNotificationsIntegrations",
    requestStream: true,
    responseStream: false,
    requestSerialize: (value: UpdateNotificationsIntegrationsRequest) =>
      Buffer.from(
        UpdateNotificationsIntegrationsRequest.encode(value).finish(),
      ),
    requestDeserialize: (value: Buffer) =>
      UpdateNotificationsIntegrationsRequest.decode(value),
    responseSerialize: (value: UpdateNotificationsIntegrationsResponse) =>
      Buffer.from(
        UpdateNotificationsIntegrationsResponse.encode(value).finish(),
      ),
    responseDeserialize: (value: Buffer) =>
      UpdateNotificationsIntegrationsResponse.decode(value),
  },
  deleteNotificationsIntegration: {
    path: "/kessel.inventory.v1beta1.resources.KesselNotificationsIntegrationService/DeleteNotificationsIntegration",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: DeleteNotificationsIntegrationRequest) =>
      Buffer.from(DeleteNotificationsIntegrationRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) =>
      DeleteNotificationsIntegrationRequest.decode(value),
    responseSerialize: (value: DeleteNotificationsIntegrationResponse) =>
      Buffer.from(
        DeleteNotificationsIntegrationResponse.encode(value).finish(),
      ),
    responseDeserialize: (value: Buffer) =>
      DeleteNotificationsIntegrationResponse.decode(value),
  },
  listNotificationsIntegrations: {
    path: "/kessel.inventory.v1beta1.resources.KesselNotificationsIntegrationService/ListNotificationsIntegrations",
    requestStream: false,
    responseStream: true,
    requestSerialize: (value: ListNotificationsIntegrationsRequest) =>
      Buffer.from(ListNotificationsIntegrationsRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) =>
      ListNotificationsIntegrationsRequest.decode(value),
    responseSerialize: (value: ListNotificationsIntegrationsResponse) =>
      Buffer.from(ListNotificationsIntegrationsResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) =>
      ListNotificationsIntegrationsResponse.decode(value),
  },
} as const;

export interface KesselNotificationsIntegrationServiceServer
  extends UntypedServiceImplementation {
  createNotificationsIntegration: handleUnaryCall<
    CreateNotificationsIntegrationRequest,
    CreateNotificationsIntegrationResponse
  >;
  updateNotificationsIntegration: handleUnaryCall<
    UpdateNotificationsIntegrationRequest,
    UpdateNotificationsIntegrationResponse
  >;
  /** deprecated Temporary streaming update endpoint */
  updateNotificationsIntegrations: handleClientStreamingCall<
    UpdateNotificationsIntegrationsRequest,
    UpdateNotificationsIntegrationsResponse
  >;
  deleteNotificationsIntegration: handleUnaryCall<
    DeleteNotificationsIntegrationRequest,
    DeleteNotificationsIntegrationResponse
  >;
  listNotificationsIntegrations: handleServerStreamingCall<
    ListNotificationsIntegrationsRequest,
    ListNotificationsIntegrationsResponse
  >;
}

export interface KesselNotificationsIntegrationServiceClient extends Client {
  createNotificationsIntegration(
    request: CreateNotificationsIntegrationRequest,
    callback: (
      error: ServiceError | null,
      response: CreateNotificationsIntegrationResponse,
    ) => void,
  ): ClientUnaryCall;
  createNotificationsIntegration(
    request: CreateNotificationsIntegrationRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: CreateNotificationsIntegrationResponse,
    ) => void,
  ): ClientUnaryCall;
  createNotificationsIntegration(
    request: CreateNotificationsIntegrationRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: CreateNotificationsIntegrationResponse,
    ) => void,
  ): ClientUnaryCall;
  updateNotificationsIntegration(
    request: UpdateNotificationsIntegrationRequest,
    callback: (
      error: ServiceError | null,
      response: UpdateNotificationsIntegrationResponse,
    ) => void,
  ): ClientUnaryCall;
  updateNotificationsIntegration(
    request: UpdateNotificationsIntegrationRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: UpdateNotificationsIntegrationResponse,
    ) => void,
  ): ClientUnaryCall;
  updateNotificationsIntegration(
    request: UpdateNotificationsIntegrationRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: UpdateNotificationsIntegrationResponse,
    ) => void,
  ): ClientUnaryCall;
  /** deprecated Temporary streaming update endpoint */
  updateNotificationsIntegrations(
    callback: (
      error: ServiceError | null,
      response: UpdateNotificationsIntegrationsResponse,
    ) => void,
  ): ClientWritableStream<UpdateNotificationsIntegrationsRequest>;
  updateNotificationsIntegrations(
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: UpdateNotificationsIntegrationsResponse,
    ) => void,
  ): ClientWritableStream<UpdateNotificationsIntegrationsRequest>;
  updateNotificationsIntegrations(
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: UpdateNotificationsIntegrationsResponse,
    ) => void,
  ): ClientWritableStream<UpdateNotificationsIntegrationsRequest>;
  updateNotificationsIntegrations(
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: UpdateNotificationsIntegrationsResponse,
    ) => void,
  ): ClientWritableStream<UpdateNotificationsIntegrationsRequest>;
  deleteNotificationsIntegration(
    request: DeleteNotificationsIntegrationRequest,
    callback: (
      error: ServiceError | null,
      response: DeleteNotificationsIntegrationResponse,
    ) => void,
  ): ClientUnaryCall;
  deleteNotificationsIntegration(
    request: DeleteNotificationsIntegrationRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: DeleteNotificationsIntegrationResponse,
    ) => void,
  ): ClientUnaryCall;
  deleteNotificationsIntegration(
    request: DeleteNotificationsIntegrationRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: DeleteNotificationsIntegrationResponse,
    ) => void,
  ): ClientUnaryCall;
  listNotificationsIntegrations(
    request: ListNotificationsIntegrationsRequest,
    options?: Partial<CallOptions>,
  ): ClientReadableStream<ListNotificationsIntegrationsResponse>;
  listNotificationsIntegrations(
    request: ListNotificationsIntegrationsRequest,
    metadata?: Metadata,
    options?: Partial<CallOptions>,
  ): ClientReadableStream<ListNotificationsIntegrationsResponse>;
}

export const KesselNotificationsIntegrationServiceClient =
  makeGenericClientConstructor(
    KesselNotificationsIntegrationServiceService,
    "kessel.inventory.v1beta1.resources.KesselNotificationsIntegrationService",
  ) as unknown as {
    new (
      address: string,
      credentials: ChannelCredentials,
      options?: Partial<ClientOptions>,
    ): KesselNotificationsIntegrationServiceClient;
    service: typeof KesselNotificationsIntegrationServiceService;
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
