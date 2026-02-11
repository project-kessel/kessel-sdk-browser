import React, { ReactNode, useMemo } from 'react';
import { AccessCheckContext } from './AccessCheckContext';
import { ApiConfig, BulkCheckConfig } from './core/api-client';

interface AccessCheckProviderProps {
  baseUrl: string;
  apiPath: string;
  children: ReactNode;
  bulkCheckConfig?: BulkCheckConfig;
}

const Provider: React.FC<AccessCheckProviderProps> = ({
  baseUrl,
  apiPath,
  children,
  bulkCheckConfig,
}) => {
  // Validate props
  if (process.env.NODE_ENV !== 'production') {
    if (!baseUrl || typeof baseUrl !== 'string') {
      console.warn(
        'AccessCheckProvider: baseUrl is required and must be a non-empty string'
      );
    }
    if (!apiPath || typeof apiPath !== 'string') {
      console.warn(
        'AccessCheckProvider: apiPath is required and must be a non-empty string'
      );
    }
  }

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<ApiConfig>(
    () => ({
      baseUrl,
      apiPath,
      bulkCheckConfig: bulkCheckConfig
    }),
    [baseUrl, apiPath, bulkCheckConfig]
  );

  return (
    <AccessCheckContext.Provider value={contextValue}>
      {children}
    </AccessCheckContext.Provider>
  );
};

Provider.displayName = 'AccessCheckProvider';

export const AccessCheck = {
  Provider,
};
