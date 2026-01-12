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
    it('should return correct structure with undefined data', () => {
      const { result } = renderHook(() =>
        useSelfAccessCheck({
          relation: 'view',
          resource: { id: 'test-id', type: 'workspace' },
        })
      );

      expect(result.current).toEqual({
        data: undefined,
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
      const { result: viewResult } = renderHook(() =>
        useSelfAccessCheck({
          relation: 'view',
          resource: { id: 'id-1', type: 'workspace' },
        })
      );

      const { result: deleteResult } = renderHook(() =>
        useSelfAccessCheck({
          relation: 'delete',
          resource: { id: 'id-2', type: 'group' },
        })
      );

      expect(viewResult.current.data).toBeUndefined();
      expect(deleteResult.current.data).toBeUndefined();
    });

    it('should accept resources with additional properties', () => {
      const { result } = renderHook(() =>
        useSelfAccessCheck({
          relation: 'owner',
          resource: {
            id: 'test-id',
            type: 'workspace',
            name: 'My Workspace',
            createdAt: '2024-01-01',
          },
        })
      );

      expect(result.current.data).toBeUndefined();
    });
  });

  describe('bulk resource check - same relation', () => {
    it('should return correct structure with undefined data', () => {
      const { result } = renderHook(() =>
        useSelfAccessCheck({
          relation: 'delete',
          resources: [
            { id: 'ws-1', type: 'workspace' },
            { id: 'ws-2', type: 'workspace' },
          ],
        })
      );

      expect(result.current).toEqual({
        data: undefined,
        loading: false,
        error: undefined,
        consistencyToken: undefined,
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
      const { result } = renderHook(() =>
        useSelfAccessCheck({
          relation: 'edit',
          resources: [{ id: 'single-id', type: 'workspace' }],
        })
      );

      expect(result.current.data).toBeUndefined();
      expect(result.current.consistencyToken).toBeUndefined();
    });

    it('should accept options parameter', () => {
      const { result } = renderHook(() =>
        useSelfAccessCheck({
          relation: 'view',
          resources: [
            { id: 'id-1', type: 'workspace' },
            { id: 'id-2', type: 'workspace' },
          ],
          options: {
            consistency: {
              minimizeLatency: true,
            },
          },
        })
      );

      expect(result.current.data).toBeUndefined();
    });

    it('should accept consistency token in options', () => {
      const { result } = renderHook(() =>
        useSelfAccessCheck({
          relation: 'delete',
          resources: [{ id: 'id-1', type: 'workspace' }],
          options: {
            consistency: {
              atLeastAsFresh: {
                token: 'some-consistency-token',
              },
            },
          },
        })
      );

      expect(result.current.data).toBeUndefined();
    });
  });

  describe('bulk resource check - nested relations', () => {
    it('should return correct structure with undefined data', () => {
      const { result } = renderHook(() =>
        useSelfAccessCheck({
          resources: [
            { id: 'ws-1', type: 'workspace', relation: 'delete' },
            { id: 'ws-2', type: 'workspace', relation: 'view' },
            { id: 'ws-3', type: 'workspace', relation: 'edit' },
          ],
        })
      );

      expect(result.current).toEqual({
        data: undefined,
        loading: false,
        error: undefined,
        consistencyToken: undefined,
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
      const { result } = renderHook(() =>
        useSelfAccessCheck({
          resources: [
            { id: 'id-1', type: 'workspace', relation: 'owner' },
            { id: 'id-2', type: 'group', relation: 'view' },
            { id: 'id-3', type: 'workspace', relation: 'edit' },
          ],
        })
      );

      expect(result.current.data).toBeUndefined();
      expect(result.current.consistencyToken).toBeUndefined();
    });

    it('should accept options parameter with nested relations', () => {
      const { result } = renderHook(() =>
        useSelfAccessCheck({
          resources: [
            { id: 'id-1', type: 'workspace', relation: 'delete' },
            { id: 'id-2', type: 'workspace', relation: 'view' },
          ],
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

      expect(result.current.data).toBeUndefined();
    });
  });
});
