import type {
  SelfAccessCheckResource,
  SelfAccessCheckResultItem,
  SelfAccessCheckResultItemWithRelation,
  SelfAccessCheckError,
} from '../types';
import type { CheckSelfResponse, AllowedEnum, ApiErrorResponse, CheckSelfBulkResponse, CheckSelfBulkResponsePair } from './api-client';

/**
 * Maps the API's allowed enum to a boolean value
 */
export function mapAllowedEnum(allowed: AllowedEnum): boolean {
  switch (allowed) {
    case 'ALLOWED_TRUE':
      return true;
    case 'ALLOWED_FALSE':
    case 'ALLOWED_UNSPECIFIED':
      return false;
    default:
      return false;
  }
}

/**
 * Transforms a single access check API response to the hook's expected format
 */
export function transformSingleResponse(
  response: CheckSelfResponse,
  resource: SelfAccessCheckResource
): SelfAccessCheckResultItem {
  return {
    allowed: mapAllowedEnum(response.allowed),
    resource,
  };
}

/**
 * Transforms an API error response to the hook's error format
 */
export function transformError(error: ApiErrorResponse): SelfAccessCheckError {
  return {
    code: error.code,
    message: error.message,
    details: error.details || [],
  };
}

/**
 * Transforms a bulk response to the hook's expected format.
 * Maps each response pair back to the original resource with relation.
 */
export function transformBulkResponse(
  response: CheckSelfBulkResponse,
  originalResources: Array<{ resource: SelfAccessCheckResource; relation: string }>
): SelfAccessCheckResultItemWithRelation[] {
  return response.pairs.map((pair: CheckSelfBulkResponsePair, index: number) => {
    // Find the original resource to preserve additional properties
    const original = originalResources[index];
    
    const result: SelfAccessCheckResultItemWithRelation = {
      allowed: pair.item ? mapAllowedEnum(pair.item.allowed) : false,
      resource: original.resource,
      relation: original.relation,
    };

    // Include per-item error if present
    if (pair.error) {
      result.error = transformError(pair.error);
    }

    return result;
  });
}
