import { AuthRequest } from "../auth";
import { ResourceReference } from "../inventory/v1beta2/resource_reference";
import { SubjectReference } from "../inventory/v1beta2/subject_reference";
import { RepresentationType } from "../inventory/v1beta2/representation_type";
import { ReporterReference } from "../inventory/v1beta2/reporter_reference";
import { StreamedListObjectsRequest } from "../inventory/v1beta2/streamed_list_objects_request";
import { StreamedListObjectsResponse } from "../inventory/v1beta2/streamed_list_objects_response";

const WORKSPACE_ENDPOINT = "/api/rbac/v2/workspaces/";

export interface Workspace {
  id: string;
  name: string;
  type: string;
  description: string;
}

const fetchWorkspace = async (
  rbacBaseEndpoint: string,
  orgId: string,
  workspaceType: string,
  auth?: AuthRequest,
): Promise<Workspace> => {
  if (rbacBaseEndpoint.endsWith("/")) {
    rbacBaseEndpoint = rbacBaseEndpoint.slice(0, -1);
  }

  const url = new URL(rbacBaseEndpoint + WORKSPACE_ENDPOINT);
  url.searchParams.set("type", workspaceType);

  const request = new Request(url, {
    method: "GET",
    headers: {
      "x-rh-rbac-org-id": orgId,
    },
  });

  if (auth) {
    await auth.configureRequest(request);
  }

  const response = await fetch(request);

  if (response.status !== 200) {
    throw new Error(
      `Error while fetching the workspace of type ${workspaceType}. Call returned status code ${response.status}`,
    );
  }

  const body = await response.json();

  if (body?.data?.length !== 1) {
    throw new Error(
      `unexpected number of ${workspaceType} workspaces: ${body?.data?.length}`,
    );
  }

  return body.data[0];
};

export const fetchDefaultWorkspace = async (
  rbacBaseEndpoint: string,
  orgId: string,
  auth?: AuthRequest,
) => {
  return fetchWorkspace(rbacBaseEndpoint, orgId, "default", auth);
};

export const fetchRootWorkspace = async (
  rbacBaseEndpoint: string,
  orgId: string,
  auth?: AuthRequest,
) => {
  return fetchWorkspace(rbacBaseEndpoint, orgId, "root", auth);
};

export const workspaceType = (): RepresentationType => {
  return {
    resourceType: "workspace",
    reporterType: "rbac",
  };
};

export const roleType = (): RepresentationType => {
  return {
    resourceType: "role",
    reporterType: "rbac",
  };
};

export const principalResource = (
  id: string,
  domain: string,
): ResourceReference => {
  const reporter: ReporterReference = {
    type: "rbac",
  };

  return {
    resourceType: "principal",
    resourceId: `${domain}/${id}`,
    reporter: reporter,
  };
};

export const roleResource = (resourceId: string): ResourceReference => {
  const reporter: ReporterReference = {
    type: "rbac",
  };

  return {
    resourceType: "role",
    resourceId,
    reporter,
  };
};

export const workspaceResource = (resourceId: string): ResourceReference => {
  const reporter: ReporterReference = {
    type: "rbac",
  };

  return {
    resourceType: "workspace",
    resourceId,
    reporter,
  };
};

export const principalSubject = (
  id: string,
  domain: string,
): SubjectReference => {
  return {
    resource: principalResource(id, domain),
  };
};

export const subject = (
  resourceRef: ResourceReference,
  relation?: string,
): SubjectReference => {
  return {
    resource: resourceRef,
    relation,
  };
};

const DEFAULT_PAGE_LIMIT = 1000;

export async function* listWorkspaces(
  inventory: {
    streamedListObjects: (
      request: StreamedListObjectsRequest,
    ) => AsyncIterable<StreamedListObjectsResponse>;
  },
  subject: SubjectReference,
  relation: string,
  continuationToken?: string,
): AsyncGenerator<StreamedListObjectsResponse> {
  while (true) {
    const request: StreamedListObjectsRequest = {
      objectType: workspaceType(),
      relation,
      subject,
      pagination: {
        limit: DEFAULT_PAGE_LIMIT,
        continuationToken: continuationToken,
      },
    };

    const stream = inventory.streamedListObjects(request);

    let hasResponses = false;
    for await (const response of stream) {
      hasResponses = true;
      yield response;

      if (response.pagination?.continuationToken !== undefined) {
        continuationToken = response.pagination.continuationToken;
      }
    }

    // If we got no responses or the token is empty, we're done
    if (!hasResponses || !continuationToken || continuationToken === "") {
      break;
    }
  }
}
