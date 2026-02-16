import { createContext, useContext } from 'react';
import type { ApiConfig } from './core/api-client';

/**
 * Context for sharing access check configuration throughout the component tree
 */
export const AccessCheckContext = createContext<ApiConfig | undefined>(
  undefined
);

/**
 * Hook to access the AccessCheck context
 * @throws Error if used outside of AccessCheckProvider
 */
export function useAccessCheckContext(): ApiConfig {
  const context = useContext(AccessCheckContext);

  if (context === undefined) {
    throw new Error(
      'useAccessCheckContext must be used within an AccessCheckProvider'
    );
  }

  return context;
}
