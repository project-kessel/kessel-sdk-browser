import { createContext, useContext } from 'react';
import { BulkCheckConfig } from './core/api-client';

/**
 * Context value containing configuration for access checks
 * Can be extended in the future with cache, deduplication state, etc.
 */
export type AccessCheckContextValue = {
  baseUrl: string;
  apiPath: string;
  bulkCheckConfig?: BulkCheckConfig
};

/**
 * Context for sharing access check configuration throughout the component tree
 */
export const AccessCheckContext = createContext<AccessCheckContextValue | undefined>(
  undefined
);

/**
 * Hook to access the AccessCheck context
 * @throws Error if used outside of AccessCheckProvider
 */
export function useAccessCheckContext(): AccessCheckContextValue {
  const context = useContext(AccessCheckContext);

  if (context === undefined) {
    throw new Error(
      'useAccessCheckContext must be used within an AccessCheckProvider'
    );
  }

  return context;
}
