import type {
  SelfAccessCheckResource,
  SelfAccessCheckResultItem,
  SelfAccessCheckResultItemWithRelation,
} from '../types';
import type { CheckSelfResponse, AllowedEnum, CheckSelfBulkResponse, CheckSelfBulkResponsePair } from './api-client';

/**
 * Maps the API's allowed enum to a boolean value
 */
function mapAllowedEnum(allowed: AllowedEnum): boolean {
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
      result.error = pair.error;
    }

    return result;
  });
}
