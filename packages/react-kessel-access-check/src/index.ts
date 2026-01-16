export { AccessCheck } from './AccessCheckProvider';
export { useSelfAccessCheck } from './hooks';
export { useAccessCheckContext } from './AccessCheckContext';

// Type exports
export type {
  NotEmptyArray,
  SelfAccessCheckResource,
  SelfAccessCheckResourceWithRelation,
  SelfAccessCheckError,
  SelfAccessCheckParams,
  BulkSelfAccessCheckCommonParams,
  BulkSelfAccessCheckParams,
  BulkSelfAccessCheckNestedRelationsParams,
  SelfAccessCheckResultItem,
  SelfAccessCheckResultItemWithRelation,
  SelfAccessCheckResultCommon,
  SelfAccessCheckResult,
  BulkSelfAccessCheckResult,
} from './types';

export type { AccessCheckContextValue } from './AccessCheckContext';
