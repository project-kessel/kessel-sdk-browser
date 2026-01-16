import React, { ReactNode, useMemo } from 'react';
import { AccessCheckContext } from './AccessCheckContext';

interface AccessCheckProviderProps {
  baseUrl: string;
  apiPath: string;
  children: ReactNode;
}

const Provider: React.FC<AccessCheckProviderProps> = ({
  baseUrl,
  apiPath,
  children,
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
  const contextValue = useMemo(
    () => ({
      baseUrl,
      apiPath,
    }),
    [baseUrl, apiPath]
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
