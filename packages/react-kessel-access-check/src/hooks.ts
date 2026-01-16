import { useState, useEffect } from 'react';
import { useAccessCheckContext } from './AccessCheckContext';
import { checkSelf } from './core/api-client';
import { transformSingleResponse, transformError } from './core/transformers';
import type {
  SelfAccessCheckParams,
  BulkSelfAccessCheckParams,
  BulkSelfAccessCheckNestedRelationsParams,
  SelfAccessCheckResult,
  BulkSelfAccessCheckResult,
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
): SelfAccessCheckResult | BulkSelfAccessCheckResult {
  const config = useAccessCheckContext();

  // Determine if this is a single or bulk check based on params
  const isSingleCheck = 'resource' in params;

  // Always call hooks unconditionally (Rules of Hooks)
  const [data, setData] = useState<SelfAccessCheckResult['data']>(undefined);
  const [loading, setLoading] = useState<boolean>(!isSingleCheck ? false : true);
  const [error, setError] = useState<SelfAccessCheckResult['error']>(
    !isSingleCheck
      ? {
          code: 501,
          message: 'Bulk access checks not yet implemented',
          details: [],
        }
      : undefined
  );

  // Extract single check params for dependency tracking
  const singleCheckResource = isSingleCheck
    ? (params as SelfAccessCheckParams).resource
    : null;
  const singleCheckRelation = isSingleCheck
    ? (params as SelfAccessCheckParams).relation
    : null;

  useEffect(() => {
    // Only perform API call for single resource checks
    if (!isSingleCheck || !singleCheckResource || !singleCheckRelation) {
      return;
    }

    const abortController = new AbortController();
    let isMounted = true;

    const performCheck = async () => {
      setLoading(true);
      setError(undefined);
      setData(undefined);

      try {
        const response = await checkSelf(config, {
          resource: singleCheckResource,
          relation: singleCheckRelation,
        });

        if (isMounted) {
          const transformedData = transformSingleResponse(
            response,
            singleCheckResource
          );
          setData(transformedData);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          const transformedError = transformError(
            err as { code: number; message: string; details?: unknown[] }
          );
          setError(transformedError);
          setLoading(false);
        }
      }
    };

    performCheck();

    return () => {
      isMounted = false;
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, isSingleCheck, singleCheckResource?.id, singleCheckResource?.type, singleCheckRelation]);

  // Return appropriate result type based on check type
  if (isSingleCheck) {
    const result: SelfAccessCheckResult = {
      data,
      loading,
      error,
    };
    return result;
  } else {
    // TODO: Implement bulk access check using checkSelfBulk API
    const bulkResult: BulkSelfAccessCheckResult = {
      data: undefined,
      loading,
      error,
    };
    return bulkResult;
  }
}
