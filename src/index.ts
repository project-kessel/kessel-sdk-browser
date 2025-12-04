export { AccessCheck } from './AccessCheckProvider';
export { useAccessCheck, useBulkAccessCheck } from './hooks';

// Type exports
export type AccessCheckResponse = boolean | undefined;
export type BulkAccessCheckResponse = string[] | undefined;
