import React, { ReactNode } from 'react';

interface AccessCheckProviderProps {
  baseUrl?: string;
  apiPath?: string;
  children: ReactNode;
}

const Provider: React.FC<AccessCheckProviderProps> = ({ children }) => {
  return <>{children}</>;
};

export const AccessCheck = {
  Provider
};
