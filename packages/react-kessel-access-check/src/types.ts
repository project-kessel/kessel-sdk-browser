// Utility type to ensure array has at least one element
type NotEmptyArray<T> = [T, ...T[]];

// Consistency token type
export type ConsistencyToken = {
  token: string;
};

// Consistency options type
export type ConsistencyOptions = {
  minimizeLatency?: boolean;
  atLeastAsFresh?: ConsistencyToken;
};

// Reporter reference type
export type ReporterReference = {
  type: string;
  instanceId?: string;
};

// Resource types
export type SelfAccessCheckResource = {
  id: string;
  type: string;
  reporter: ReporterReference;
  [key: string]: unknown;
};

export type SelfAccessCheckResourceWithRelation = SelfAccessCheckResource & {
  relation: string;
};

// Error type
export type SelfAccessCheckError = {
  code: number;
  message: string;
  details: unknown[];
};

// Parameter types for hook overloads
export type SelfAccessCheckParams = {
  relation: string;
  resource: SelfAccessCheckResource;
};

type BulkSelfAccessCheckCommonParams = {
  options?: {
    consistency?: ConsistencyOptions;
  };
};

export type BulkSelfAccessCheckParams = BulkSelfAccessCheckCommonParams & {
  relation: string;
  resources: NotEmptyArray<SelfAccessCheckResource>;
};

export type BulkSelfAccessCheckNestedRelationsParams =
  BulkSelfAccessCheckCommonParams & {
    relation?: never;
    resources: NotEmptyArray<SelfAccessCheckResourceWithRelation>;
  };

// API client bulk params types
export type CheckSelfBulkParamsItem = {
  resource: SelfAccessCheckResource | SelfAccessCheckResourceWithRelation;
  relation: string;
};

export type CheckSelfBulkParams = {
  items: Array<CheckSelfBulkParamsItem>;
  consistency?: ConsistencyOptions;
};

// Result types
export type SelfAccessCheckResultItem = {
  allowed: boolean;
  resource: SelfAccessCheckResource;
};

export type SelfAccessCheckResultItemWithRelation = SelfAccessCheckResultItem & {
  relation: string;
  error?: SelfAccessCheckError;
};

type SelfAccessCheckResultCommon = {
  loading: boolean;
  error?: SelfAccessCheckError;
};

export type SelfAccessCheckResult = SelfAccessCheckResultCommon & {
  data?: SelfAccessCheckResultItem;
};

export type BulkSelfAccessCheckResult = SelfAccessCheckResultCommon & {
  data?: SelfAccessCheckResultItemWithRelation[];
  consistencyToken?: ConsistencyToken;
};

// Workspace types
// Aligned with RBAC v2 OpenAPI spec: Workspaces.Workspace schema
// https://github.com/RedHatInsights/insights-rbac/blob/master/docs/source/specs/v2/openapi.yaml
export type WorkspaceType = 'root' | 'default' | 'standard' | 'ungrouped-hosts';

export type Workspace = {
  id: string;
  type: WorkspaceType;
  name: string;
  created: string;
  modified: string;
  parent_id?: string;
  description?: string;
};
