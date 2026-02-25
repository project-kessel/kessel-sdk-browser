/**
 * Integration Tests - Response Parsing
 *
 * Tests that verify graceful handling of invalid JSON responses,
 * HTML error pages, and malformed response bodies.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useSelfAccessCheck } from '../../hooks';
import { server } from '../../api-mocks/msw-server';
import { errorHandlers } from '../../api-mocks/handlers/error-handlers';
import {
  createTestWrapper,
  createMockResource,
  createMockResources,
} from '../../api-mocks/test-utils';

describe('Integration Tests - Response Parsing', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  /**
   * Test: HTML error page should be handled gracefully
   * Priority: CRITICAL
   *
   * Scenario: API returns HTML error page instead of JSON
   * Expected: JSON parsing fails gracefully, error state set
   * Coverage: Response parsing errors, unexpected content types
   */
  it('should handle HTML error page instead of JSON', async () => {
    server.use(errorHandlers.invalidJson);

    const resource = createMockResource();
    const { result } = renderHook(
      () => useSelfAccessCheck({ relation: 'view', resource }),
      { wrapper: createTestWrapper() }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.code).toBe(500);
    expect(result.current.data).toBeUndefined();
  });

  /**
   * Test: Invalid JSON on bulk endpoint
   */
  it('should handle invalid JSON on bulk endpoint', async () => {
    server.use(errorHandlers.invalidJsonBulk);

    const { result } = renderHook(
      () => useSelfAccessCheck({ relation: 'view', resources: createMockResources(2) as any }),
      { wrapper: createTestWrapper() }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });

  /**
   * Test: Malformed JSON syntax
   */
  it('should handle malformed JSON syntax', async () => {
    server.use(errorHandlers.malformedJson);

    const resource = createMockResource();
    const { result } = renderHook(
      () => useSelfAccessCheck({ relation: 'view', resource }),
      { wrapper: createTestWrapper() }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Should have an error (parsing failed)
    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });
});
