import { useEffect } from 'react';
import type {
  SelfAccessCheckParams,
  BulkSelfAccessCheckParams,
  BulkSelfAccessCheckNestedRelationsParams,
  SelfAccessCheckResult,
  BulkSelfAccessCheckResult,
  SelfAccessCheckResultItemWithRelation,
} from './types';

// Function overload signatures
export function useSelfAccessCheck(
  params: SelfAccessCheckParams
): SelfAccessCheckResult;
export function useSelfAccessCheck(
  params: BulkSelfAccessCheckParams
): BulkSelfAccessCheckResult;
export function useSelfAccessCheck(
  params: BulkSelfAccessCheckNestedRelationsParams
): BulkSelfAccessCheckResult;

// Implementation
export function useSelfAccessCheck(
  params:
    | SelfAccessCheckParams
    | BulkSelfAccessCheckParams
    | BulkSelfAccessCheckNestedRelationsParams
):
  | SelfAccessCheckResult
  | BulkSelfAccessCheckResult {
  useEffect(() => {
    console.log('useSelfAccessCheck called with:', params);
  }, [params]);

  // Determine if this is a single or bulk check based on params
  if ('resource' in params) {
    // Single resource check - return hardcoded dummy data
    const result: SelfAccessCheckResult = {
      data: {
        allowed: true,
        resource: params.resource,
      },
      loading: false,
      error: undefined,
    };
    return result;
  } else {
    // Bulk resource check - return hardcoded dummy data with various scenarios
    const bulkResult: BulkSelfAccessCheckResult = {
      data: params.resources.map((resource, index) => {
        // Determine relation - either from the resource itself or from params
        const relation: string = 'relation' in resource
          ? (resource.relation as string)
          : (params as BulkSelfAccessCheckParams).relation;

        // Create different scenarios for demonstration
        // First item: allowed
        // Second item: not allowed
        // Third item: allowed
        // Fourth+ items: not allowed with occasional error
        const isAllowed = index === 0 || index === 2;
        const hasError = index === 3;

        const item: SelfAccessCheckResultItemWithRelation = {
          allowed: isAllowed,
          resource: resource,
          relation: relation,
        };

        // Add error to the fourth item as an example
        if (hasError) {
          item.error = {
            code: 404,
            message: 'Resource not found',
            details: [],
          };
        }

        return item;
      }),
      loading: false,
      error: undefined,
      consistencyToken: {
        token: 'dummy-consistency-token-12345',
      },
    };
    return bulkResult;
  }
}
