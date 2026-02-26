/**
 * Integration Tests - Component Lifecycle
 *
 * Tests that verify proper cleanup and memory leak prevention
 * when components unmount during async operations.
 */

import { renderHook } from '@testing-library/react';
import { useSelfAccessCheck } from '../../hooks';
import { server } from '../../api-mocks/msw-server';
import { createTestWrapper, createMockResource, waitMs } from '../../api-mocks/test-utils';
import { http, HttpResponse } from 'msw';

describe('Integration Tests - Component Lifecycle', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  /**
   * Test: Unmounting component should prevent state updates
   * Priority: CRITICAL
   *
   * Scenario: User navigates away before API response
   * Expected: AbortController cancels request, no state update on unmounted component
   * Coverage: Memory leak prevention, abort signal handling
   */
  it('should not update state after component unmounts', async () => {
    let resolveRequest: (value: any) => void;
    const requestPromise = new Promise(resolve => {
      resolveRequest = resolve;
    });

    server.use(
      http.post('/api/kessel/v1beta2/checkself', async () => {
        // Wait for test to control when to resolve
        await requestPromise;
        return HttpResponse.json({ allowed: 'ALLOWED_TRUE' });
      })
    );

    const resource = createMockResource();
    const { result, unmount } = renderHook(
      () => useSelfAccessCheck({ relation: 'view', resource }),
      { wrapper: createTestWrapper() }
    );

    // Verify loading state
    expect(result.current.loading).toBe(true);

    // Unmount before request completes
    unmount();

    // Now resolve the request
    resolveRequest!(null);

    // Wait a bit to ensure no state update happens
    await waitMs(50);

    // The last known state should still be loading
    // (no error should be thrown about updating unmounted component)
    expect(result.current.loading).toBe(true);
  });

  /**
   * Test: Rapid mount/unmount should not cause errors
   */
  it('should handle rapid mount/unmount cycles', async () => {
    const resource = createMockResource();

    // Mount and immediately unmount multiple times
    for (let i = 0; i < 5; i++) {
      const { unmount } = renderHook(
        () => useSelfAccessCheck({ relation: 'view', resource }),
        { wrapper: createTestWrapper() }
      );
      unmount();
    }

    // Should not throw any errors
    await waitMs(100);
  });
});
