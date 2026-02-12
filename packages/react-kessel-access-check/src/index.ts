export { AccessCheck } from './AccessCheckProvider';
export { useSelfAccessCheck } from './hooks';
export { useAccessCheckContext } from './AccessCheckContext';

// Workspace helpers — fetch root/default workspace IDs from RBAC
export { fetchRootWorkspace, fetchDefaultWorkspace } from './core/workspace-client';
export type { WorkspaceAuthRequest, HttpClient } from './core/workspace-client';

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
  Workspace,
  WorkspaceType,
} from './types';

export type { AccessCheckContextValue } from './AccessCheckContext';
