import { renderHook } from '@testing-library/react';
import { useSelfAccessCheck } from './hooks';

describe('useSelfAccessCheck', () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('single resource check', () => {
    it('should return correct structure with hardcoded data', () => {
      const resource = { id: 'test-id', type: 'workspace' };
      const { result } = renderHook(() =>
        useSelfAccessCheck({
          relation: 'view',
          resource,
        })
      );

      expect(result.current).toEqual({
        data: {
          allowed: true,
          resource,
        },
        loading: false,
        error: undefined,
      });
    });

    it('should log the params to console', () => {
      const params = {
        relation: 'edit',
        resource: { id: 'ws-123', type: 'workspace' },
      };

      renderHook(() => useSelfAccessCheck(params));

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'useSelfAccessCheck called with:',
        params
      );
    });

    it('should accept different relations', () => {
      const viewResource = { id: 'id-1', type: 'workspace' };
      const deleteResource = { id: 'id-2', type: 'group' };

      const { result: viewResult } = renderHook(() =>
        useSelfAccessCheck({
          relation: 'view',
          resource: viewResource,
        })
      );

      const { result: deleteResult } = renderHook(() =>
        useSelfAccessCheck({
          relation: 'delete',
          resource: deleteResource,
        })
      );

      expect(viewResult.current.data).toEqual({
        allowed: true,
        resource: viewResource,
      });
      expect(deleteResult.current.data).toEqual({
        allowed: true,
        resource: deleteResource,
      });
    });

    it('should accept resources with additional properties', () => {
      const resource = {
        id: 'test-id',
        type: 'workspace',
        name: 'My Workspace',
        createdAt: '2024-01-01',
      };

      const { result } = renderHook(() =>
        useSelfAccessCheck({
          relation: 'owner',
          resource,
        })
      );

      expect(result.current.data).toEqual({
        allowed: true,
        resource,
      });
    });
  });

  describe('bulk resource check - same relation', () => {
    it('should return correct structure with hardcoded data', () => {
      const resources = [
        { id: 'ws-1', type: 'workspace' },
        { id: 'ws-2', type: 'workspace' },
      ] as [{ id: string; type: string }, ...{ id: string; type: string }[]];

      const { result } = renderHook(() =>
        useSelfAccessCheck({
          relation: 'delete',
          resources,
        })
      );

      expect(result.current).toEqual({
        data: [
          {
            allowed: true,
            resource: resources[0],
            relation: 'delete',
          },
          {
            allowed: false,
            resource: resources[1],
            relation: 'delete',
          },
        ],
        loading: false,
        error: undefined,
        consistencyToken: {
          token: 'dummy-consistency-token-12345',
        },
      });
    });

    it('should log the params to console', () => {
      const params = {
        relation: 'view',
        resources: [
          { id: 'id-1', type: 'workspace' },
          { id: 'id-2', type: 'workspace' },
        ] as [{ id: string; type: string }, ...{ id: string; type: string }[]],
      };

      renderHook(() => useSelfAccessCheck(params));

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'useSelfAccessCheck called with:',
        params
      );
    });

    it('should accept single item array', () => {
      const resources = [{ id: 'single-id', type: 'workspace' }] as [{ id: string; type: string }];

      const { result } = renderHook(() =>
        useSelfAccessCheck({
          relation: 'edit',
          resources,
        })
      );

      expect(result.current.data).toEqual([
        {
          allowed: true,
          resource: resources[0],
          relation: 'edit',
        },
      ]);
      expect(result.current.consistencyToken).toEqual({
        token: 'dummy-consistency-token-12345',
      });
    });

    it('should accept options parameter', () => {
      const resources = [
        { id: 'id-1', type: 'workspace' },
        { id: 'id-2', type: 'workspace' },
      ] as [{ id: string; type: string }, ...{ id: string; type: string }[]];

      const { result } = renderHook(() =>
        useSelfAccessCheck({
          relation: 'view',
          resources,
          options: {
            consistency: {
              minimizeLatency: true,
            },
          },
        })
      );

      expect(result.current.data).toEqual([
        {
          allowed: true,
          resource: resources[0],
          relation: 'view',
        },
        {
          allowed: false,
          resource: resources[1],
          relation: 'view',
        },
      ]);
    });

    it('should accept consistency token in options', () => {
      const resources = [{ id: 'id-1', type: 'workspace' }] as [{ id: string; type: string }];

      const { result } = renderHook(() =>
        useSelfAccessCheck({
          relation: 'delete',
          resources,
          options: {
            consistency: {
              atLeastAsFresh: {
                token: 'some-consistency-token',
              },
            },
          },
        })
      );

      expect(result.current.data).toEqual([
        {
          allowed: true,
          resource: resources[0],
          relation: 'delete',
        },
      ]);
    });
  });

  describe('bulk resource check - nested relations', () => {
    it('should return correct structure with hardcoded data', () => {
      const resources = [
        { id: 'ws-1', type: 'workspace', relation: 'delete' },
        { id: 'ws-2', type: 'workspace', relation: 'view' },
        { id: 'ws-3', type: 'workspace', relation: 'edit' },
      ] as [{ id: string; type: string; relation: string }, ...{ id: string; type: string; relation: string }[]];

      const { result } = renderHook(() =>
        useSelfAccessCheck({
          resources,
        })
      );

      expect(result.current).toEqual({
        data: [
          {
            allowed: true,
            resource: resources[0],
            relation: 'delete',
          },
          {
            allowed: false,
            resource: resources[1],
            relation: 'view',
          },
          {
            allowed: true,
            resource: resources[2],
            relation: 'edit',
          },
        ],
        loading: false,
        error: undefined,
        consistencyToken: {
          token: 'dummy-consistency-token-12345',
        },
      });
    });

    it('should log the params to console', () => {
      const params = {
        resources: [
          { id: 'id-1', type: 'workspace', relation: 'delete' },
          { id: 'id-2', type: 'workspace', relation: 'view' },
        ] as [{ id: string; type: string; relation: string }, ...{ id: string; type: string; relation: string }[]],
      };

      renderHook(() => useSelfAccessCheck(params));

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'useSelfAccessCheck called with:',
        params
      );
    });

    it('should accept different relation per resource', () => {
      const resources = [
        { id: 'id-1', type: 'workspace', relation: 'owner' },
        { id: 'id-2', type: 'group', relation: 'view' },
        { id: 'id-3', type: 'workspace', relation: 'edit' },
      ] as [{ id: string; type: string; relation: string }, ...{ id: string; type: string; relation: string }[]];

      const { result } = renderHook(() =>
        useSelfAccessCheck({
          resources,
        })
      );

      expect(result.current.data).toEqual([
        {
          allowed: true,
          resource: resources[0],
          relation: 'owner',
        },
        {
          allowed: false,
          resource: resources[1],
          relation: 'view',
        },
        {
          allowed: true,
          resource: resources[2],
          relation: 'edit',
        },
      ]);
      expect(result.current.consistencyToken).toEqual({
        token: 'dummy-consistency-token-12345',
      });
    });

    it('should accept options parameter with nested relations', () => {
      const resources = [
        { id: 'id-1', type: 'workspace', relation: 'delete' },
        { id: 'id-2', type: 'workspace', relation: 'view' },
      ] as [{ id: string; type: string; relation: string }, ...{ id: string; type: string; relation: string }[]];

      const { result } = renderHook(() =>
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
        })
      );

      expect(result.current.data).toEqual([
        {
          allowed: true,
          resource: resources[0],
          relation: 'delete',
        },
        {
          allowed: false,
          resource: resources[1],
          relation: 'view',
        },
      ]);
    });
  });

  describe('bulk resource check - error scenarios', () => {
    it('should include error in the fourth item', () => {
      const resources = [
        { id: 'ws-1', type: 'workspace' },
        { id: 'ws-2', type: 'workspace' },
        { id: 'ws-3', type: 'workspace' },
        { id: 'ws-4', type: 'workspace' },
      ] as [{ id: string; type: string }, ...{ id: string; type: string }[]];

      const { result } = renderHook(() =>
        useSelfAccessCheck({
          relation: 'view',
          resources,
        })
      );

      expect(result.current.data).toEqual([
        {
          allowed: true,
          resource: resources[0],
          relation: 'view',
        },
        {
          allowed: false,
          resource: resources[1],
          relation: 'view',
        },
        {
          allowed: true,
          resource: resources[2],
          relation: 'view',
        },
        {
          allowed: false,
          resource: resources[3],
          relation: 'view',
          error: {
            code: 404,
            message: 'Resource not found',
            details: [],
          },
        },
      ]);
    });
  });
});
