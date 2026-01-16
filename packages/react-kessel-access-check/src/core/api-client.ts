import type { SelfAccessCheckResource } from '../types';

// API Configuration
export type ApiConfig = {
  baseUrl: string;
  apiPath: string;
};

// API Request/Response Types
export type CheckSelfRequest = {
  object: {
    resourceId: string;
    resourceType: string;
  };
  relation: string;
};

export type AllowedEnum = 'ALLOWED_TRUE' | 'ALLOWED_FALSE' | 'ALLOWED_UNSPECIFIED';

export type CheckSelfResponse = {
  allowed: AllowedEnum;
};

export type ApiErrorResponse = {
  code: number;
  message: string;
  details?: unknown[];
};

/**
 * Makes a single access check API call to /checkself endpoint
 */
export async function checkSelf(
  config: ApiConfig,
  params: {
    resource: SelfAccessCheckResource;
    relation: string;
  }
): Promise<CheckSelfResponse> {
  const url = `${config.baseUrl}${config.apiPath}/checkself`;

  const requestBody: CheckSelfRequest = {
    object: {
      resourceId: params.resource.id,
      resourceType: params.resource.type,
    },
    relation: params.relation,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include JWT cookies
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    // Try to parse error response
    let errorData: ApiErrorResponse;
    try {
      errorData = await response.json();
    } catch {
      // If JSON parsing fails, create a generic error
      errorData = {
        code: response.status,
        message: response.statusText || 'Request failed',
        details: [],
      };
    }

    throw errorData;
  }

  const data: CheckSelfResponse = await response.json();
  return data;
}

/**
 * Placeholder for bulk access check implementation
 * @throws Error indicating the feature is not yet implemented
 */
export async function checkSelfBulk(): Promise<never> {
  throw new Error('Bulk access checks not yet implemented');
}
