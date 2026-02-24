import type { Workspace, SelfAccessCheckError } from '../types';

const WORKSPACE_API_PATH = '/api/rbac/v2/workspaces/';

/**
 * Response shape from the RBAC workspace list API.
 * Aligned with Workspaces.WorkspaceListResponse in the OpenAPI spec:
 * https://github.com/RedHatInsights/insights-rbac/blob/master/docs/source/specs/v2/openapi.yaml
 */
type WorkspaceListResponse = {
  meta: {
    count: number;
    limit: number;
    offset: number;
  };
  links: {
    first: string | null;
    next: string | null;
    previous: string | null;
    last: string | null;
  };
  data: Workspace[];
};

/**
 * Authentication configuration for workspace requests.
 *
 * When provided, the `headers` are merged into the fetch request,
 * allowing callers to pass an Authorization header with a Bearer token.
 * When omitted, requests default to `credentials: 'include'` for
 * cookie-based JWT authentication.
 */
export type WorkspaceAuthRequest = {
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
};

/**
 * A fetch-compatible function signature.
 * Per the Kessel SDK spec, the browser/Node.js SDK supports the `fetch` API.
 */
export type HttpClient = typeof fetch;

/**
 * Internal helper to fetch a workspace by type ("root" or "default").
 *
 * Makes a GET request to: {rbacBaseEndpoint}/api/rbac/v2/workspaces/?type={workspaceType}
 *
 * @param rbacBaseEndpoint - The RBAC service endpoint URL (e.g. "https://console.redhat.com")
 * @param workspaceType - The workspace type to query for ("root" or "default")
 * @param auth - Optional authentication configuration. If not provided, uses `credentials: 'include'` for cookie-based JWT auth.
 * @param httpClient - Optional fetch-compatible function. If not provided, uses the global `fetch`.
 */
export async function fetchWorkspaceByType(
  rbacBaseEndpoint: string,
  workspaceType: 'root' | 'default',
  auth?: WorkspaceAuthRequest,
  httpClient?: HttpClient,
): Promise<Workspace> {
  const fetchFn = httpClient ?? fetch;
  const url = `${rbacBaseEndpoint.replace(/\/+$/, '')}${WORKSPACE_API_PATH}?type=${workspaceType}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...auth?.headers,
  };

  const credentials = auth?.credentials ?? 'include';

  const response = await fetchFn(url, {
    method: 'GET',
    headers,
    credentials,
  });

  if (!response.ok) {
    let errorData: SelfAccessCheckError;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        code: response.status,
        message: response.statusText || 'Request failed',
        details: [],
      };
    }
    throw errorData;
  }

  const data: WorkspaceListResponse = await response.json();

  if (!data.data || data.data.length === 0) {
    throw {
      code: 404,
      message: `No ${workspaceType} workspace found in response`,
      details: [],
    } satisfies SelfAccessCheckError;
  }

  return data.data[0];
}

/**
 * Fetches the root workspace for the current organization.
 *
 * GET {rbacBaseEndpoint}/api/rbac/v2/workspaces/?type=root
 *
 * @param rbacBaseEndpoint - The RBAC service endpoint URL (stage/prod/ephemeral)
 * @param auth - Optional authentication configuration.
 * @param httpClient - Optional fetch-compatible function. Defaults to global `fetch`.
 */
export async function fetchRootWorkspace(
  rbacBaseEndpoint: string,
  auth?: WorkspaceAuthRequest,
  httpClient?: HttpClient,
): Promise<Workspace> {
  return fetchWorkspaceByType(rbacBaseEndpoint, 'root', auth, httpClient);
}

/**
 * Fetches the default workspace for the current organization.
 *
 * GET {rbacBaseEndpoint}/api/rbac/v2/workspaces/?type=default
 *
 * @param rbacBaseEndpoint - The RBAC service endpoint URL (stage/prod/ephemeral)
 * @param auth - Optional authentication configuration.
 * @param httpClient - Optional fetch-compatible function. Defaults to global `fetch`.
 */
export async function fetchDefaultWorkspace(
  rbacBaseEndpoint: string,
  auth?: WorkspaceAuthRequest,
  httpClient?: HttpClient,
): Promise<Workspace> {
  return fetchWorkspaceByType(rbacBaseEndpoint, 'default', auth, httpClient);
}
