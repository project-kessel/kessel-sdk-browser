import {
  fetchDefaultWorkspace,
  fetchRootWorkspace,
  workspaceType,
  roleType,
  principalResource,
  roleResource,
  workspaceResource,
  principalSubject,
  subject,
  listWorkspaces,
} from "../v2";
import { AuthRequest } from "../../auth";
import { StreamedListObjectsRequest } from "../../inventory/v1beta2/streamed_list_objects_request";
import { StreamedListObjectsResponse } from "../../inventory/v1beta2/streamed_list_objects_response";

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("RBAC workspace fetching", () => {
  const baseEndpoint = "https://api.example.com";
  const orgId = "test-org-123";

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe("fetchDefaultWorkspace", () => {
    it("fetches default workspace successfully", async () => {
      const mockWorkspace = {
        id: "workspace-123",
        name: "Default Workspace",
        type: "default",
        description: "Organization default workspace",
      };

      const mockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          data: [mockWorkspace],
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await fetchDefaultWorkspace(baseEndpoint, orgId);

      expect(result).toEqual(mockWorkspace);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      const capturedRequest = mockFetch.mock.calls[0][0];
      expect(capturedRequest.url).toBe(
        `${baseEndpoint}/api/rbac/v2/workspaces/?type=default`,
      );
      expect(capturedRequest.method).toBe("GET");
      expect(capturedRequest.headers.get("x-rh-rbac-org-id")).toBe(orgId);
    });

    it("uses authentication when provided", async () => {
      const mockWorkspace = {
        id: "workspace-456",
        name: "Default Workspace",
        type: "default",
        description: "Organization default workspace",
      };

      const mockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          data: [mockWorkspace],
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const mockAuth: AuthRequest = {
        configureRequest: jest.fn().mockImplementation(async (request) => {
          request.headers.set("authorization", "Bearer test-token");
        }),
      };

      const result = await fetchDefaultWorkspace(baseEndpoint, orgId, mockAuth);

      expect(result).toEqual(mockWorkspace);
      expect(mockAuth.configureRequest).toHaveBeenCalled();

      const capturedRequest = mockFetch.mock.calls[0][0];
      expect(capturedRequest.headers.get("authorization")).toBe(
        "Bearer test-token",
      );
    });

    it("handles trailing slash in endpoint", async () => {
      const mockWorkspace = {
        id: "workspace-789",
        name: "Default Workspace",
        type: "default",
        description: "Organization default workspace",
      };

      const mockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          data: [mockWorkspace],
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const endpointWithSlash = "https://api.example.com/";
      const result = await fetchDefaultWorkspace(endpointWithSlash, orgId);

      expect(result).toEqual(mockWorkspace);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      const capturedRequest = mockFetch.mock.calls[0][0];
      expect(capturedRequest.url).toBe(
        `${baseEndpoint}/api/rbac/v2/workspaces/?type=default`,
      );
    });

    it("throws error on non-200 status", async () => {
      const mockResponse = {
        status: 404,
        json: jest.fn(),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await expect(fetchDefaultWorkspace(baseEndpoint, orgId)).rejects.toThrow(
        "Error while fetching the workspace of type default. Call returned status code 404",
      );
    });

    it("throws error when no workspaces found", async () => {
      const mockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          data: [],
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await expect(fetchDefaultWorkspace(baseEndpoint, orgId)).rejects.toThrow(
        "unexpected number of default workspaces: 0",
      );
    });

    it("throws error when multiple workspaces found", async () => {
      const mockWorkspaces = [
        {
          id: "workspace-1",
          name: "Default Workspace 1",
          type: "default",
          description: "First default workspace",
        },
        {
          id: "workspace-2",
          name: "Default Workspace 2",
          type: "default",
          description: "Second default workspace",
        },
      ];

      const mockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          data: mockWorkspaces,
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await expect(fetchDefaultWorkspace(baseEndpoint, orgId)).rejects.toThrow(
        "unexpected number of default workspaces: 2",
      );
    });

    it("handles network errors", async () => {
      const networkError = new Error("Network connection failed");
      mockFetch.mockRejectedValue(networkError);

      await expect(fetchDefaultWorkspace(baseEndpoint, orgId)).rejects.toThrow(
        "Network connection failed",
      );
    });

    it("handles malformed response body", async () => {
      const mockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          data: null,
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await expect(fetchDefaultWorkspace(baseEndpoint, orgId)).rejects.toThrow(
        "unexpected number of default workspaces: undefined",
      );
    });
  });

  describe("fetchRootWorkspace", () => {
    it("fetches root workspace successfully", async () => {
      const mockWorkspace = {
        id: "root-workspace-123",
        name: "Root Workspace",
        type: "root",
        description: "Organization root workspace",
      };

      const mockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          data: [mockWorkspace],
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await fetchRootWorkspace(baseEndpoint, orgId);

      expect(result).toEqual(mockWorkspace);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      const capturedRequest = mockFetch.mock.calls[0][0];
      expect(capturedRequest.url).toBe(
        `${baseEndpoint}/api/rbac/v2/workspaces/?type=root`,
      );
      expect(capturedRequest.method).toBe("GET");
      expect(capturedRequest.headers.get("x-rh-rbac-org-id")).toBe(orgId);
    });

    it("uses authentication when provided", async () => {
      const mockWorkspace = {
        id: "root-workspace-456",
        name: "Root Workspace",
        type: "root",
        description: "Organization root workspace",
      };

      const mockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          data: [mockWorkspace],
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const mockAuth: AuthRequest = {
        configureRequest: jest.fn().mockImplementation(async (request) => {
          request.headers.set("authorization", "Bearer root-token");
        }),
      };

      const result = await fetchRootWorkspace(baseEndpoint, orgId, mockAuth);

      expect(result).toEqual(mockWorkspace);
      expect(mockAuth.configureRequest).toHaveBeenCalled();

      const capturedRequest = mockFetch.mock.calls[0][0];
      expect(capturedRequest.headers.get("authorization")).toBe(
        "Bearer root-token",
      );
    });

    it("throws error on server error", async () => {
      const mockResponse = {
        status: 500,
        json: jest.fn(),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await expect(fetchRootWorkspace(baseEndpoint, orgId)).rejects.toThrow(
        "Error while fetching the workspace of type root. Call returned status code 500",
      );
    });

    it("throws error when no root workspaces found", async () => {
      const mockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          data: [],
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await expect(fetchRootWorkspace(baseEndpoint, orgId)).rejects.toThrow(
        "unexpected number of root workspaces: 0",
      );
    });

    it("throws error when multiple root workspaces found", async () => {
      const mockWorkspaces = [
        {
          id: "root-workspace-1",
          name: "Root Workspace 1",
          type: "root",
          description: "First root workspace",
        },
        {
          id: "root-workspace-2",
          name: "Root Workspace 2",
          type: "root",
          description: "Second root workspace",
        },
      ];

      const mockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          data: mockWorkspaces,
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await expect(fetchRootWorkspace(baseEndpoint, orgId)).rejects.toThrow(
        "unexpected number of root workspaces: 2",
      );
    });
  });

  describe("integration tests", () => {
    it("works with oauth2AuthRequest", async () => {
      const mockWorkspace = {
        id: "integration-workspace",
        name: "Integration Workspace",
        type: "default",
        description: "Integration test workspace",
      };

      const mockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          data: [mockWorkspace],
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      // Mock an AuthRequest that simulates oauth2AuthRequest behavior
      const mockAuth: AuthRequest = {
        configureRequest: jest.fn().mockImplementation(async (request) => {
          // Simulate OAuth token retrieval and setting
          request.headers.set(
            "authorization",
            "Bearer oauth-integration-token",
          );
        }),
      };

      const result = await fetchDefaultWorkspace(baseEndpoint, orgId, mockAuth);

      expect(result).toEqual(mockWorkspace);
      expect(mockAuth.configureRequest).toHaveBeenCalled();

      const capturedRequest = mockFetch.mock.calls[0][0];
      expect(capturedRequest.headers.get("authorization")).toBe(
        "Bearer oauth-integration-token",
      );
      expect(capturedRequest.headers.get("x-rh-rbac-org-id")).toBe(orgId);
    });

    it("handles auth configuration errors", async () => {
      const authError = new Error("Authentication failed");
      const mockAuth: AuthRequest = {
        configureRequest: jest.fn().mockRejectedValue(authError),
      };

      await expect(
        fetchDefaultWorkspace(baseEndpoint, orgId, mockAuth),
      ).rejects.toThrow("Authentication failed");

      expect(mockAuth.configureRequest).toHaveBeenCalled();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});

describe("RBAC utility functions", () => {
  describe("workspaceType", () => {
    it("returns correct RepresentationType for workspace", () => {
      const result = workspaceType();

      expect(result).toEqual({
        resourceType: "workspace",
        reporterType: "rbac",
      });
    });
  });

  describe("roleType", () => {
    it("returns correct RepresentationType for role", () => {
      const result = roleType();

      expect(result).toEqual({
        resourceType: "role",
        reporterType: "rbac",
      });
    });
  });

  describe("principalResource", () => {
    it("creates ResourceReference for principal with id and domain", () => {
      const result = principalResource("user123", "redhat");

      expect(result).toEqual({
        resourceType: "principal",
        resourceId: "redhat/user123",
        reporter: {
          type: "rbac",
        },
      });
    });
  });

  describe("roleResource", () => {
    it("creates ResourceReference for role", () => {
      const result = roleResource("admin");

      expect(result).toEqual({
        resourceType: "role",
        resourceId: "admin",
        reporter: {
          type: "rbac",
        },
      });
    });
  });

  describe("workspaceResource", () => {
    it("creates ResourceReference for workspace", () => {
      const result = workspaceResource("project-abc");

      expect(result).toEqual({
        resourceType: "workspace",
        resourceId: "project-abc",
        reporter: {
          type: "rbac",
        },
      });
    });
  });

  describe("principalSubject", () => {
    it("creates SubjectReference for principal", () => {
      const result = principalSubject("john", "example");

      expect(result).toEqual({
        resource: {
          resourceType: "principal",
          resourceId: "example/john",
          reporter: {
            type: "rbac",
          },
        },
      });
    });
  });

  describe("subject", () => {
    it("creates SubjectReference from ResourceReference without relation", () => {
      const resource = principalResource("user789", "redhat");
      const result = subject(resource);

      expect(result).toEqual({
        resource: resource,
        relation: undefined,
      });
    });

    it("creates SubjectReference from ResourceReference with relation", () => {
      const resource = principalResource("user101", "domain");
      const result = subject(resource, "member");

      expect(result).toEqual({
        resource: resource,
        relation: "member",
      });
    });

    it("handles manually constructed ResourceReference", () => {
      const customResource = {
        resourceType: "group",
        resourceId: "our-team",
        reporter: { type: "rbac" },
      };

      const result = subject(customResource, "owner");

      expect(result.resource?.resourceType).toBe("group");
      expect(result.resource?.resourceId).toBe("our-team");
      expect(result.relation).toBe("owner");
    });
  });
});

describe("listWorkspaces", () => {
  const testSubject = principalSubject("test-user", "test-domain");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockInventoryClient = (
    responseGenerator?: (
      request: StreamedListObjectsRequest,
    ) => AsyncGenerator<StreamedListObjectsResponse>,
  ) => {
    const mock = {
      streamedListObjects: jest.fn(),
      requests: [] as StreamedListObjectsRequest[],
    };

    mock.streamedListObjects.mockImplementation(
      (request: StreamedListObjectsRequest) => {
        mock.requests.push(request);
        if (responseGenerator) {
          return responseGenerator(request);
        }
        return (async function* () {})();
      },
    );

    return mock;
  };

  describe("request building", () => {
    it("builds request with correct parameters", async () => {
      const client = createMockInventoryClient(async function* () {
        yield {
          object: workspaceResource("workspace-1"),
          pagination: { continuationToken: "" },
        };
      });

      const results: StreamedListObjectsResponse[] = [];
      for await (const response of listWorkspaces(
        client,
        testSubject,
        "member",
      )) {
        results.push(response);
      }

      expect(client.streamedListObjects).toHaveBeenCalledTimes(1);
      const capturedRequest = client.requests[0];

      expect(capturedRequest.relation).toBe("member");
      expect(capturedRequest.subject).toBe(testSubject);
      expect(capturedRequest.pagination?.continuationToken).toBeUndefined();
      expect(capturedRequest.pagination?.limit).toBe(1000);
    });

    it("uses initial continuation token", async () => {
      const initialToken = "resume-from-here";
      const client = createMockInventoryClient(async function* () {
        yield {
          object: workspaceResource("workspace-1"),
          pagination: { continuationToken: "" },
        };
      });

      const results: StreamedListObjectsResponse[] = [];
      for await (const response of listWorkspaces(
        client,
        testSubject,
        "member",
        initialToken,
      )) {
        results.push(response);
      }

      expect(client.streamedListObjects).toHaveBeenCalledTimes(1);
      const capturedRequest = client.requests[0];

      // Verify the token was used in the first request
      expect(capturedRequest.pagination?.continuationToken).toBe(initialToken);
    });
  });

  describe("pagination", () => {
    it("handles pagination across multiple pages", async () => {
      let count = 0;
      const client = createMockInventoryClient(async function* () {
        count++;
        if (count === 1) {
          yield {
            object: workspaceResource("workspace-1"),
            pagination: { continuationToken: "next-page-token" },
          };
        } else if (count === 2) {
          yield {
            object: workspaceResource("workspace-2"),
            pagination: { continuationToken: "" },
          };
        }
      });

      const results: StreamedListObjectsResponse[] = [];
      for await (const response of listWorkspaces(
        client,
        testSubject,
        "viewer",
      )) {
        results.push(response);
      }

      expect(results).toHaveLength(2);
      expect(results[0].object?.resourceId).toBe("workspace-1");
      expect(results[1].object?.resourceId).toBe("workspace-2");

      expect(client.streamedListObjects).toHaveBeenCalledTimes(2);
      const requests = client.requests;

      expect(requests).toHaveLength(2);
      // First request sent with no token
      expect(requests[0].pagination?.continuationToken).toBeUndefined();
      // Second request uses token from first response
      expect(requests[1].pagination?.continuationToken).toBe("next-page-token");
    });

    it("stops when no token", async () => {
      const client = createMockInventoryClient(async function* () {
        yield {
          object: workspaceResource("workspace-1"),
          pagination: { continuationToken: "" },
        };
      });

      const results: StreamedListObjectsResponse[] = [];
      for await (const response of listWorkspaces(
        client,
        testSubject,
        "admin",
      )) {
        results.push(response);
      }

      expect(client.streamedListObjects).toHaveBeenCalledTimes(1);
    });

    it("stops when stream is empty", async () => {
      const client = createMockInventoryClient(async function* () {
        // Empty - no yields
      });

      const results: StreamedListObjectsResponse[] = [];
      for await (const response of listWorkspaces(
        client,
        testSubject,
        "member",
      )) {
        results.push(response);
      }

      expect(results).toHaveLength(0);
      expect(client.streamedListObjects).toHaveBeenCalledTimes(1);
    });
  });

  describe("workspace data", () => {
    it("returns actual workspace data", async () => {
      const client = createMockInventoryClient(async function* () {
        yield {
          object: workspaceResource("workspace-1"),
          pagination: { continuationToken: "aaa" },
        };
        yield {
          object: workspaceResource("workspace-2"),
          pagination: { continuationToken: "bbb" },
        };
        yield {
          object: workspaceResource("workspace-3"),
          pagination: { continuationToken: "" },
        };
      });

      const workspaceIds: string[] = [];
      for await (const response of listWorkspaces(
        client,
        testSubject,
        "member",
      )) {
        expect(response.object).toBeDefined();
        expect(response.object?.resourceType).toBe("workspace");
        expect(response.object?.reporter?.type).toBe("rbac");
        if (response.object?.resourceId) {
          workspaceIds.push(response.object.resourceId);
        }
      }

      expect(workspaceIds).toHaveLength(3);
      expect(workspaceIds[0]).toBe("workspace-1");
      expect(workspaceIds[1]).toBe("workspace-2");
      expect(workspaceIds[2]).toBe("workspace-3");
    });

    it("returns workspaces across multiple pages", async () => {
      let count = 0;
      const client = createMockInventoryClient(async function* () {
        count++;
        if (count === 1) {
          yield {
            object: workspaceResource("prod-workspace-1"),
            pagination: { continuationToken: "page2-token" },
          };
          yield {
            object: workspaceResource("prod-workspace-2"),
            pagination: { continuationToken: "page2-token" },
          };
        } else if (count === 2) {
          yield {
            object: workspaceResource("dev-workspace-1"),
            pagination: { continuationToken: "" },
          };
        }
      });

      const allResponses: StreamedListObjectsResponse[] = [];
      for await (const response of listWorkspaces(
        client,
        testSubject,
        "viewer",
      )) {
        allResponses.push(response);
      }

      expect(allResponses).toHaveLength(3);
      expect(allResponses[0].object?.resourceId).toBe("prod-workspace-1");
      expect(allResponses[1].object?.resourceId).toBe("prod-workspace-2");
      expect(allResponses[2].object?.resourceId).toBe("dev-workspace-1");

      expect(client.streamedListObjects).toHaveBeenCalledTimes(2);
      const requests = client.requests;

      expect(requests[0].pagination?.continuationToken).toBeUndefined();
      expect(requests[1].pagination?.continuationToken).toBe("page2-token");
    });

    it("handles empty workspace list", async () => {
      const client = createMockInventoryClient(async function* () {});

      const workspaces: StreamedListObjectsResponse[] = [];
      for await (const response of listWorkspaces(
        client,
        testSubject,
        "member",
      )) {
        workspaces.push(response);
      }

      expect(workspaces).toHaveLength(0);
      expect(client.streamedListObjects).toHaveBeenCalledTimes(1);
    });
  });

  describe("error handling", () => {
    it("handles gRPC stream errors", async () => {
      const client = createMockInventoryClient(async function* () {
        yield {
          object: workspaceResource("workspace-1"),
          pagination: { continuationToken: "token" },
        };
        throw new Error("gRPC stream failed");
      });

      await expect(async () => {
        for await (const _response of listWorkspaces(
          client,
          testSubject,
          "member",
        )) {
          // intentionally empty to showcase error
        }
      }).rejects.toThrow("gRPC stream failed");

      expect(client.streamedListObjects).toHaveBeenCalledTimes(1);
    });
  });
});
