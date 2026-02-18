export { AccessCheck } from './AccessCheckProvider';
export { useSelfAccessCheck } from './hooks';
export { useAccessCheckContext } from './AccessCheckContext';

// Type exports
export type {
  ConsistencyToken,
  ConsistencyOptions,
  ReporterReference,
  SelfAccessCheckResource,
  SelfAccessCheckResourceWithRelation,
  SelfAccessCheckError,
  SelfAccessCheckResultItemWithRelation,
  SelfAccessCheckResult,
  BulkSelfAccessCheckResult,
  CheckSelfBulkParamsItem,
  CheckSelfBulkParams,
} from './types';
