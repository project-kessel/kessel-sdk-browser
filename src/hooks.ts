import { useEffect } from 'react';

export const useAccessCheck = (checkName: string): boolean | undefined => {
  useEffect(() => {
    console.log('useAccessCheck called with:', checkName);
  }, [checkName]);

  return undefined;
};

export const useBulkAccessCheck = (
  checkName: string,
  resourceIDs: string[]
): string[] | undefined => {
  useEffect(() => {
    console.log('useBulkAccessCheck called with:', checkName, resourceIDs);
  }, [checkName, resourceIDs]);

  return undefined;
};
