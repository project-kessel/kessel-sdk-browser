/**
 * Integration Tests - Reporter Field Validation
 *
 * Tests that verify proper validation and error handling for
 * missing, null, or malformed reporter fields.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useSelfAccessCheck } from '../../hooks';
import { server } from '../../api-mocks/msw-server';
import { errorHandlers } from '../../api-mocks/handlers/error-handlers';
import { createTestWrapper, createMockResource } from '../../api-mocks/test-utils';

describe('Integration Tests - Reporter Field Validation', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  /**
   * Test: Missing reporter field should return validation error
   * Priority: CRITICAL
   *
   * Scenario: Developer forgets to include reporter field
   * Expected: API returns 400 error with clear message
   * Coverage: API validation, error handling
   */
  it('should handle missing reporter field with clear error', async () => {
    server.use(errorHandlers.badRequestInvalidReporter);

    const resourceWithoutReporter = {
      id: 'test-id',
      type: 'workspace',
      // reporter field intentionally missing
    } as any;

    const { result } = renderHook(
      () => useSelfAccessCheck({
        relation: 'view',
        resource: resourceWithoutReporter
      }),
      { wrapper: createTestWrapper() }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.code).toBe(400);
    expect(result.current.error?.message).toContain('Invalid reporter configuration');
    expect(result.current.data).toBeUndefined();
  });

  /**
   * Test: Malformed reporter (missing type field)
   */
  it('should handle malformed reporter with missing type', async () => {
    server.use(errorHandlers.badRequestInvalidReporter);

    const resourceWithMalformedReporter = createMockResource({
      reporter: { instanceId: 'test-app' } as any // Missing type field
    });

    const { result } = renderHook(
      () => useSelfAccessCheck({
        relation: 'view',
        resource: resourceWithMalformedReporter
      }),
      { wrapper: createTestWrapper() }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.code).toBe(400);
  });

  /**
   * Test: Null reporter field
   */
  it('should handle null reporter field', async () => {
    server.use(errorHandlers.badRequestInvalidReporter);

    const resourceWithNullReporter = {
      id: 'test-id',
      type: 'workspace',
      reporter: null
    } as any;

    const { result } = renderHook(
      () => useSelfAccessCheck({
        relation: 'view',
        resource: resourceWithNullReporter
      }),
      { wrapper: createTestWrapper() }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.code).toBe(400);
  });
});
