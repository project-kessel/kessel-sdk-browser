import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { useSelfAccessCheck } from './hooks';
import { AccessCheck } from './AccessCheckProvider';

// Mock fetch globally
global.fetch = jest.fn();

describe('useSelfAccessCheck', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  // Wrapper component for tests that provides context
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AccessCheck.Provider baseUrl="https://api.example.com" apiPath="/api/inventory/v1beta2">
      {children}
    </AccessCheck.Provider>
  );

  describe('single resource check', () => {
    it('should make API call and return allowed=true', async () => {
      const resource = { id: 'test-id', type: 'workspace' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ allowed: 'ALLOWED_TRUE' }),
      } as Response);

      const { result } = renderHook(
        () =>
          useSelfAccessCheck({
            relation: 'view',
            resource,
          }),
        { wrapper }
      );

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeUndefined();

      // Wait for the API call to complete
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current).toEqual({
        data: {
          allowed: true,
          resource,
        },
        loading: false,
        error: undefined,
      });

      // Verify fetch was called correctly
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/inventory/v1beta2/checkself',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            object: {
              resourceId: 'test-id',
              resourceType: 'workspace',
            },
            relation: 'view',
          }),
        })
      );
    });

    it('should return allowed=false for ALLOWED_FALSE response', async () => {
      const resource = { id: 'test-id', type: 'workspace' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ allowed: 'ALLOWED_FALSE' }),
      } as Response);

      const { result } = renderHook(
        () =>
          useSelfAccessCheck({
            relation: 'delete',
            resource,
          }),
        { wrapper }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data?.allowed).toBe(false);
    });

    it('should return allowed=false for ALLOWED_UNSPECIFIED response', async () => {
      const resource = { id: 'test-id', type: 'workspace' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ allowed: 'ALLOWED_UNSPECIFIED' }),
      } as Response);

      const { result } = renderHook(
        () =>
          useSelfAccessCheck({
            relation: 'view',
            resource,
          }),
        { wrapper }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data?.allowed).toBe(false);
    });

    it('should handle 403 error response', async () => {
      const resource = { id: 'test-id', type: 'workspace' };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          code: 403,
          message: 'Forbidden',
          details: [],
        }),
      } as Response);

      const { result } = renderHook(
        () =>
          useSelfAccessCheck({
            relation: 'admin',
            resource,
          }),
        { wrapper }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current).toEqual({
        data: undefined,
        loading: false,
        error: {
          code: 403,
          message: 'Forbidden',
          details: [],
        },
      });
    });

    it('should handle 404 error response', async () => {
      const resource = { id: 'nonexistent', type: 'workspace' };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          code: 404,
          message: 'Resource not found',
          details: [],
        }),
      } as Response);

      const { result } = renderHook(
        () =>
          useSelfAccessCheck({
            relation: 'view',
            resource,
          }),
        { wrapper }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toEqual({
        code: 404,
        message: 'Resource not found',
        details: [],
      });
    });

    it('should handle 500 error response', async () => {
      const resource = { id: 'test-id', type: 'workspace' };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as unknown as Response);

      const { result } = renderHook(
        () =>
          useSelfAccessCheck({
            relation: 'view',
            resource,
          }),
        { wrapper }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toEqual({
        code: 500,
        message: 'Internal Server Error',
        details: [],
      });
    });

    it('should accept resources with additional properties', async () => {
      const resource = {
        id: 'test-id',
        type: 'workspace',
        name: 'My Workspace',
        createdAt: '2024-01-01',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ allowed: 'ALLOWED_TRUE' }),
      } as Response);

      const { result } = renderHook(
        () =>
          useSelfAccessCheck({
            relation: 'owner',
            resource,
          }),
        { wrapper }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data).toEqual({
        allowed: true,
        resource,
      });
    });

    it('should throw error when used outside provider', () => {
      const resource = { id: 'test-id', type: 'workspace' };

      // Suppress console error for this test
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() =>
          useSelfAccessCheck({
            relation: 'view',
            resource,
          })
        );
      }).toThrow('useAccessCheckContext must be used within an AccessCheckProvider');

      consoleError.mockRestore();
    });
  });

  describe('bulk resource check - same relation', () => {
    it('should return not implemented error', () => {
      const resources = [
        { id: 'ws-1', type: 'workspace' },
        { id: 'ws-2', type: 'workspace' },
      ] as [{ id: string; type: string }, ...{ id: string; type: string }[]];

      const { result } = renderHook(
        () =>
          useSelfAccessCheck({
            relation: 'delete',
            resources,
          }),
        { wrapper }
      );

      expect(result.current).toEqual({
        data: undefined,
        loading: false,
        error: {
          code: 501,
          message: 'Bulk access checks not yet implemented',
          details: [],
        },
      });
    });

    it('should return not implemented error with options', () => {
      const resources = [
        { id: 'id-1', type: 'workspace' },
        { id: 'id-2', type: 'workspace' },
      ] as [{ id: string; type: string }, ...{ id: string; type: string }[]];

      const { result } = renderHook(
        () =>
          useSelfAccessCheck({
            relation: 'view',
            resources,
            options: {
              consistency: {
                minimizeLatency: true,
              },
            },
          }),
        { wrapper }
      );

      expect(result.current.error).toEqual({
        code: 501,
        message: 'Bulk access checks not yet implemented',
        details: [],
      });
    });
  });

  describe('bulk resource check - nested relations', () => {
    it('should return not implemented error', () => {
      const resources = [
        { id: 'ws-1', type: 'workspace', relation: 'delete' },
        { id: 'ws-2', type: 'workspace', relation: 'view' },
        { id: 'ws-3', type: 'workspace', relation: 'edit' },
      ] as [
        { id: string; type: string; relation: string },
        ...{ id: string; type: string; relation: string }[]
      ];

      const { result } = renderHook(
        () =>
          useSelfAccessCheck({
            resources,
          }),
        { wrapper }
      );

      expect(result.current).toEqual({
        data: undefined,
        loading: false,
        error: {
          code: 501,
          message: 'Bulk access checks not yet implemented',
          details: [],
        },
      });
    });

    it('should return not implemented error with options', () => {
      const resources = [
        { id: 'id-1', type: 'workspace', relation: 'delete' },
        { id: 'id-2', type: 'workspace', relation: 'view' },
      ] as [
        { id: string; type: string; relation: string },
        ...{ id: string; type: string; relation: string }[]
      ];

      const { result } = renderHook(
        () =>
          useSelfAccessCheck({
            resources,
            options: {
              consistency: {
                minimizeLatency: true,
                atLeastAsFresh: {
                  token: 'consistency-token-123',
                },
              },
            },
          }),
        { wrapper }
      );

      expect(result.current.error).toEqual({
        code: 501,
        message: 'Bulk access checks not yet implemented',
        details: [],
      });
    });
  });
});
