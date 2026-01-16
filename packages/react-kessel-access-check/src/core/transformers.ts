import type {
  SelfAccessCheckResource,
  SelfAccessCheckResultItem,
  SelfAccessCheckError,
} from '../types';
import type { CheckSelfResponse, AllowedEnum, ApiErrorResponse } from './api-client';

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
 * Placeholder for bulk response transformation
 * Will handle chunking, deduplication, consistency tokens, and per-item errors
 * @throws Error indicating the feature is not yet implemented
 */
export function transformBulkResponse(): never {
  throw new Error('Bulk response transformation not yet implemented');
}
