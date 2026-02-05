import type { SelfAccessCheckResource, SelfAccessCheckResourceWithRelation } from '../types';

export type BulkCheckConfig = {
  bulkRequestLimit?: number;
}

// API Configuration
export type ApiConfig = {
  baseUrl: string;
  apiPath: string;
  bulkCheckConfig?: BulkCheckConfig
};

// API Request/Response Types
export type ReporterReference = {
  type: string;
  instanceId?: string;
};

export type CheckSelfRequest = {
  object: {
    resourceId: string;
    resourceType: string;
    reporter: ReporterReference;
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
    reporter: ReporterReference;
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
      reporter: params.resource.reporter,
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

async function makeRequest<T = unknown>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
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

  try {
    return response.json() as Promise<T>;
    
  } catch {
    try {
      return response.text() as unknown as T;
    } catch (error) {
      throw new Error('Failed to parse response' + (error instanceof Error ? `: ${error.message}` : '.'));
    }
  }
}

async function fetchSelfBulk(url: string, body: CheckSelfBulkRequest): Promise<CheckSelfBulkResponse> {
  return makeRequest<CheckSelfBulkResponse>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include JWT cookies
    body: JSON.stringify(body),
  });
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

  if(params.items.length === 0){
    return fetchSelfBulk(url, { items: [], consistency: params.consistency });
  }

  const bulkLimit = config.bulkCheckConfig?.bulkRequestLimit && config.bulkCheckConfig?.bulkRequestLimit > 0 ? config.bulkCheckConfig.bulkRequestLimit : Number.MAX_SAFE_INTEGER;

  const payloads: CheckSelfBulkRequest[] = [];
  for(let i = 0; i < params.items.length; i += bulkLimit){
    const chunks = params.items.slice(i, i + bulkLimit);
    const payload: CheckSelfBulkRequest = {
      items: chunks.map(item => ({
        object: {
          resourceId: item.resource.id,
          resourceType: item.resource.type,
          reporter: item.resource.reporter,
        },
        relation: item.relation,
      })),
      consistency: params.consistency,
    };
    payloads.push(payload);
  }

  const promises = payloads.map(payload => fetchSelfBulk(url, payload));
  const results = await Promise.all(promises);

  const response: CheckSelfBulkResponse= {
    pairs: results.flatMap(r => r.pairs),
    consistencyToken: results[results.length -1]?.consistencyToken,  
  }

  return response;
}
