import { renderHook } from '@testing-library/react';
import { useAccessCheck, useBulkAccessCheck } from './hooks';

describe('useAccessCheck', () => {
  // Mock console.log to verify it's called
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should return undefined initially', () => {
    const { result } = renderHook(() => useAccessCheck('inventory_group_view'));
    expect(result.current).toBeUndefined();
  });

  it('should log the check name to console', () => {
    renderHook(() => useAccessCheck('inventory_group_view'));
    expect(consoleLogSpy).toHaveBeenCalledWith('useAccessCheck called with:', 'inventory_group_view');
  });

  it('should accept different check names', () => {
    const { result: result1 } = renderHook(() => useAccessCheck('workspaces_delete'));
    const { result: result2 } = renderHook(() => useAccessCheck('inventory_group_update'));

    expect(result1.current).toBeUndefined();
    expect(result2.current).toBeUndefined();
    expect(consoleLogSpy).toHaveBeenCalledWith('useAccessCheck called with:', 'workspaces_delete');
    expect(consoleLogSpy).toHaveBeenCalledWith('useAccessCheck called with:', 'inventory_group_update');
  });

  it('should re-log when check name changes', () => {
    const { rerender } = renderHook(
      ({ checkName }) => useAccessCheck(checkName),
      { initialProps: { checkName: 'initial_check' } }
    );

    expect(consoleLogSpy).toHaveBeenCalledWith('useAccessCheck called with:', 'initial_check');

    // Clear previous calls
    consoleLogSpy.mockClear();

    // Rerender with new check name
    rerender({ checkName: 'new_check' });
    expect(consoleLogSpy).toHaveBeenCalledWith('useAccessCheck called with:', 'new_check');
  });
});

describe('useBulkAccessCheck', () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should return undefined initially', () => {
    const { result } = renderHook(() =>
      useBulkAccessCheck('workspaces_delete', ['ws-1', 'ws-2'])
    );
    expect(result.current).toBeUndefined();
  });

  it('should log the check name and resource IDs to console', () => {
    const resourceIds = ['ws-1', 'ws-2', 'ws-3'];
    renderHook(() => useBulkAccessCheck('workspaces_delete', resourceIds));

    expect(consoleLogSpy).toHaveBeenCalledWith(
      'useBulkAccessCheck called with:',
      'workspaces_delete',
      resourceIds
    );
  });

  it('should accept empty resource IDs array', () => {
    const { result } = renderHook(() =>
      useBulkAccessCheck('workspaces_delete', [])
    );

    expect(result.current).toBeUndefined();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'useBulkAccessCheck called with:',
      'workspaces_delete',
      []
    );
  });

  it('should handle different check names and resource arrays', () => {
    const resourceIds1 = ['id-1', 'id-2'];
    const resourceIds2 = ['id-3', 'id-4', 'id-5'];

    const { result: result1 } = renderHook(() =>
      useBulkAccessCheck('inventory_group_view', resourceIds1)
    );
    const { result: result2 } = renderHook(() =>
      useBulkAccessCheck('workspaces_update', resourceIds2)
    );

    expect(result1.current).toBeUndefined();
    expect(result2.current).toBeUndefined();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'useBulkAccessCheck called with:',
      'inventory_group_view',
      resourceIds1
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'useBulkAccessCheck called with:',
      'workspaces_update',
      resourceIds2
    );
  });

  it('should re-log when check name or resource IDs change', () => {
    const { rerender } = renderHook(
      ({ checkName, resourceIds }) => useBulkAccessCheck(checkName, resourceIds),
      {
        initialProps: {
          checkName: 'initial_check',
          resourceIds: ['id-1', 'id-2']
        }
      }
    );

    expect(consoleLogSpy).toHaveBeenCalledWith(
      'useBulkAccessCheck called with:',
      'initial_check',
      ['id-1', 'id-2']
    );

    // Clear previous calls
    consoleLogSpy.mockClear();

    // Rerender with new check name
    rerender({
      checkName: 'new_check',
      resourceIds: ['id-3', 'id-4', 'id-5']
    });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      'useBulkAccessCheck called with:',
      'new_check',
      ['id-3', 'id-4', 'id-5']
    );
  });
});
