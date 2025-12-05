// Utility type to ensure array has at least one element
export type NotEmptyArray<T> = [T, ...T[]];

// Resource types
export type SelfAccessCheckResource = {
  id: string;
  type: string;
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

export type BulkSelfAccessCheckCommonParams = {
  options?: {
    consistency?: {
      minimizeLatency?: boolean;
      atLeastAsFresh?: {
        token: string;
      };
    };
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

// Result types
export type SelfAccessCheckResultItem = {
  allowed: boolean;
  resource: SelfAccessCheckResource;
};

export type SelfAccessCheckResultItemWithRelation = SelfAccessCheckResultItem & {
  relation: string;
  error?: SelfAccessCheckError;
};

export type SelfAccessCheckResultCommon = {
  loading: boolean;
  error?: SelfAccessCheckError;
};

export type SelfAccessCheckResult = SelfAccessCheckResultCommon & {
  data?: SelfAccessCheckResultItem;
};

export type BulkSelfAccessCheckResult = SelfAccessCheckResultCommon & {
  data?: SelfAccessCheckResultItemWithRelation[];
  consistencyToken?: {
    token: string;
  };
};
