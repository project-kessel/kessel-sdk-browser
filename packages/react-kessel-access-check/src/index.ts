export { AccessCheck } from './AccessCheckProvider';
export { useSelfAccessCheck } from './hooks';
export { useAccessCheckContext } from './AccessCheckContext';

// Workspace helpers — fetch root/default workspace IDs from RBAC
export { fetchRootWorkspace, fetchDefaultWorkspace } from './core/workspace-client';
export type { WorkspaceAuthRequest, HttpClient } from './core/workspace-client';

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
  Workspace,
  WorkspaceType,
} from './types';
