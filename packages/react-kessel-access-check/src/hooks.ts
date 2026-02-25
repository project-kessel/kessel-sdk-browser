import { useState, useEffect, useMemo } from 'react';
import { useAccessCheckContext } from './AccessCheckContext';
import { checkSelf, checkSelfBulk, ApiConfig } from './core/api-client';
import { transformSingleResponse, transformBulkResponse } from './core/transformers';
import type {
  SelfAccessCheckParams,
  BulkSelfAccessCheckParams,
  BulkSelfAccessCheckNestedRelationsParams,
  CheckSelfBulkParamsItem,
  ConsistencyToken,
  SelfAccessCheckResult,
  BulkSelfAccessCheckResult,
  SelfAccessCheckResultItemWithRelation,
  SelfAccessCheckResource,
  SelfAccessCheckError,
} from './types';

/**
 * Common state shape for access check hooks
 */
type AccessCheckState<TData> = {
  data: TData | undefined;
  loading: boolean;
  error: SelfAccessCheckError | undefined;
};

/**
 * Creates the initial state for an access check
 */
function createInitialState<TData>(): AccessCheckState<TData> {
  return {
    data: undefined,
    loading: true,
    error: undefined,
  };
}

/**
 * Handles errors from API calls in a consistent way
 */
function handleApiError(err: unknown): SelfAccessCheckError {
  const error = err as { code: number; message: string; details?: unknown[] };
  return {
    code: error.code,
    message: error.message,
    details: error.details || [],
  };
}

/**
 * Extended state for single checks including consistency token
 */
type SingleAccessCheckState = AccessCheckState<SelfAccessCheckResult['data']> & {
  consistencyToken: ConsistencyToken | undefined;
};

/**
 * Internal hook for single resource access checks.
 * Only performs the check when enabled is true.
 */
function useSingleAccessCheck(
  config: ApiConfig,
  resource: SelfAccessCheckResource | null,
  relation: string | null,
  options: SelfAccessCheckParams['options'] | undefined,
  enabled: boolean
): SelfAccessCheckResult {
  const [state, setState] = useState<SingleAccessCheckState>({
    ...createInitialState<SelfAccessCheckResult['data']>(),
    consistencyToken: undefined,
  });

  const consistencyKey = useConsistencyKey(options ?? null);

  useEffect(() => {
    // Skip if not enabled or missing required params
    // Prevents unnecessary API calls
    if (!enabled || !resource || !relation) {
      return;
    }

    const abortController = new AbortController();
    let isMounted = true;

    const performCheck = async () => {
      setState({ data: undefined, loading: true, error: undefined, consistencyToken: undefined });

      try {
        const response = await checkSelf(config, { resource, relation, options });

        if (isMounted) {
          const transformedData = transformSingleResponse(response, resource);
          setState({
            data: transformedData,
            loading: false,
            error: undefined,
            consistencyToken: response.consistencyToken,
          });
        }
      } catch (err) {
        if (isMounted) {
          setState({ data: undefined, loading: false, error: handleApiError(err), consistencyToken: undefined });
        }
      }
    };

    performCheck();

    return () => {
      isMounted = false;
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, enabled, resource?.id, resource?.type, resource?.reporter, relation, consistencyKey]);

  return state;
}

/**
 * Extended state for bulk checks including consistency token
 */
type BulkAccessCheckState = AccessCheckState<SelfAccessCheckResultItemWithRelation[]> & {
  consistencyToken: { token: string } | undefined;
};

/**
 * Builds the items array for bulk API request from resources
 */
function buildBulkCheckItems(
  resources: readonly SelfAccessCheckResource[],
  sharedRelation: string | null
): CheckSelfBulkParamsItem[] {
  return resources.map(resource => {
    // For nested relations, use the relation from the resource
    // For same relation, use the shared relation param
    const relation: string = 
      'relation' in resource && typeof (resource as Record<string, unknown>).relation === 'string'
        ? ((resource as Record<string, unknown>).relation as string)
        : sharedRelation!;

    return { resource, relation };
  });
}

/**
 * Creates a stable key for bulk resources to use as a dependency
 */
function useBulkResourcesKey(
  resources: readonly SelfAccessCheckResource[] | null
): string | null {
  return useMemo(() => {
    if (!resources) return null;
    return JSON.stringify(resources.map(r => ({
      id: r.id,
      type: r.type,
      reporter: r.reporter,
      relation: 'relation' in r ? r.relation : undefined,
    })));
  }, [resources]);
}

/**
 * Creates a stable key for consistency options
 */
function useConsistencyKey(
  options: BulkSelfAccessCheckParams['options'] | null
): string | null {
  const consistency = options?.consistency;
  return useMemo(() => {
    if (!consistency) return null;
    return JSON.stringify(consistency);
  }, [consistency]);
}

/**
 * Internal hook for bulk resource access checks.
 * Only performs the check when enabled is true.
 */
function useBulkAccessCheck(
  config: ApiConfig,
  resources: readonly SelfAccessCheckResource[] | null,
  sharedRelation: string | null,
  options: BulkSelfAccessCheckParams['options'] | undefined,
  enabled: boolean
): BulkSelfAccessCheckResult {
  const [state, setState] = useState<BulkAccessCheckState>({
    ...createInitialState<SelfAccessCheckResultItemWithRelation[]>(),
    consistencyToken: undefined,
  });

  // Create stable dependency keys
  const resourcesKey = useBulkResourcesKey(resources);
  const consistencyKey = useConsistencyKey(options ?? null);

  useEffect(() => {
    // Skip if not enabled
    if (!enabled) {
      return;
    }

    // Handle empty resources array - complete immediately with empty result
    if (!resources || resources.length === 0) {
      setState({
        data: [],
        loading: false,
        error: undefined,
        consistencyToken: undefined,
      });
      return;
    }

    const abortController = new AbortController();
    let isMounted = true;

    const performBulkCheck = async () => {
      setState({
        data: undefined,
        loading: true,
        error: undefined,
        consistencyToken: undefined,
      });

      try {
        const items = buildBulkCheckItems(resources, sharedRelation);

        const response = await checkSelfBulk(config, {
          items,
          consistency: options?.consistency,
        });

        if (isMounted) {
          const transformedData = transformBulkResponse(response, items);
          setState({
            data: transformedData,
            loading: false,
            error: undefined,
            consistencyToken: response.consistencyToken,
          });
        }
      } catch (err) {
        if (isMounted) {
          setState({
            data: undefined,
            loading: false,
            error: handleApiError(err),
            consistencyToken: undefined,
          });
        }
      }
    };

    performBulkCheck();

    return () => {
      isMounted = false;
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, enabled, resourcesKey, sharedRelation, consistencyKey]);

  return state;
}

// ============================================================================
// Public API - Unified Hook with Overloads
// ============================================================================

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

// Main implementation
export function useSelfAccessCheck(
  params:
    | SelfAccessCheckParams
    | BulkSelfAccessCheckParams
    | BulkSelfAccessCheckNestedRelationsParams
): SelfAccessCheckResult | BulkSelfAccessCheckResult {
  const config = useAccessCheckContext();

  // Determine check type based on params shape
  const isSingleCheck = 'resource' in params;

  // Extract params for each check type
  const singleParams = isSingleCheck ? (params as SelfAccessCheckParams) : null;
  const bulkParams = !isSingleCheck
    ? (params as BulkSelfAccessCheckParams | BulkSelfAccessCheckNestedRelationsParams)
    : null;
  const sharedRelation = bulkParams && 'relation' in bulkParams
    ? (bulkParams as BulkSelfAccessCheckParams).relation
    : null;

  // Call both hooks unconditionally (Rules of Hooks) but only one will be enabled
  const singleResult = useSingleAccessCheck(
    config,
    singleParams?.resource ?? null,
    singleParams?.relation ?? null,
    singleParams?.options,
    isSingleCheck
  );

  const bulkResult = useBulkAccessCheck(
    config,
    bulkParams?.resources ?? null,
    sharedRelation,
    bulkParams?.options,
    !isSingleCheck
  );

  // Return the appropriate result based on check type
  return isSingleCheck ? singleResult : bulkResult;
}
