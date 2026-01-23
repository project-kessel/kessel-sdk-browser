import type { SelfAccessCheckResource, SelfAccessCheckResourceWithRelation } from '../types';

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
  consistencyToken?: {
    token: string;
  };
};

export type ApiErrorResponse = {
  code: number;
  message: string;
  details?: unknown[];
};

// Bulk API Request/Response Types
export type CheckSelfBulkRequestItem = {
  object: {
    resourceId: string;
    resourceType: string;
  };
  relation: string;
};

export type CheckSelfBulkRequest = {
  items: CheckSelfBulkRequestItem[];
  consistency?: {
    minimizeLatency?: boolean;
    atLeastAsFresh?: {
      token: string;
    };
  };
};

export type CheckSelfBulkResponseItem = {
  allowed: AllowedEnum;
};

export type CheckSelfBulkResponsePair = {
  request: CheckSelfBulkRequestItem;
  item: CheckSelfBulkResponseItem;
  error?: ApiErrorResponse;
};

export type CheckSelfBulkResponse = {
  pairs: CheckSelfBulkResponsePair[];
  consistencyToken?: {
    token: string;
  };
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

export async function checkSelfBulk(
  config: ApiConfig,
  params: {
    items: Array<{
      resource: SelfAccessCheckResource | SelfAccessCheckResourceWithRelation;
      relation: string;
    }>;
    consistency?: {
      minimizeLatency?: boolean;
      atLeastAsFresh?: {
        token: string;
      };
    };
  }
): Promise<CheckSelfBulkResponse> {
  const url = `${config.baseUrl}${config.apiPath}/checkselfbulk`;

  const requestBody: CheckSelfBulkRequest = {
    items: params.items.map(item => ({
      object: {
        resourceId: item.resource.id,
        resourceType: item.resource.type,
      },
      relation: item.relation,
    })),
    consistency: params.consistency,
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

  const data: CheckSelfBulkResponse = await response.json();
  return data;
}
