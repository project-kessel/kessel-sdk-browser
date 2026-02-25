/**
 * Integration Tests - Empty Array Handling
 *
 * Tests that verify empty resources arrays are handled correctly
 * without making unnecessary API calls.
 */

import { renderHook } from '@testing-library/react';
import { useSelfAccessCheck } from '../../hooks';
import { server } from '../../api-mocks/msw-server';
import { createTestWrapper, waitMs } from '../../api-mocks/test-utils';
import { http, HttpResponse } from 'msw';

describe('Integration Tests - Empty Array Handling', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  // Helper: Creates MSW handler for tracking empty bulk array calls
  const createEmptyBulkHandler = (apiCallCountRef: { current: number }) =>
    http.post('/api/kessel/v1beta2/checkselfbulk', async () => {
      apiCallCountRef.current++;
      return HttpResponse.json({
        pairs: [],
        consistencyToken: { token: 'should-not-be-called' }
      });
    });

  /**
   * Test: Empty resources array should not make API call
   * Priority: CRITICAL
   *
   * Scenario: Developer passes empty array to bulk check
   * Expected: No API call made, hook returns early with loading=false
   * Coverage: Prevents unnecessary API calls and potential errors
   */
  it('should handle empty resources array without API call', async () => {
    const apiCallCount = { current: 0 };
    server.use(createEmptyBulkHandler(apiCallCount));

    const { result } = renderHook(
      () => useSelfAccessCheck({
        relation: 'view',
        resources: [] as any // Empty array
      }),
      { wrapper: createTestWrapper() }
    );

    await waitMs(100);

    expect(apiCallCount.current).toBe(0);
    expect(result.current.loading).toBe(false);
  });

  /**
   * Test: Empty resources array in nested relations mode
   */
  it('should handle empty resources array in nested relations mode', async () => {
    const apiCallCount = { current: 0 };
    server.use(createEmptyBulkHandler(apiCallCount));

    const { result } = renderHook(
      () => useSelfAccessCheck({
        resources: [] as any // Empty array
      }),
      { wrapper: createTestWrapper() }
    );

    await waitMs(100);

    expect(apiCallCount.current).toBe(0);
    expect(result.current.loading).toBe(false);
  });
});
