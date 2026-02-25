/**
 * Integration Tests - Phase 1: Critical Scenarios
 *
 * These tests cover critical gaps identified in the test coverage plan:
 * 1. Empty resources array handling
 * 2. Missing reporter field validation
 * 3. Component unmount cleanup
 * 4. 401 Unauthorized handling
 * 5. Invalid JSON response handling
 * 6. XSS in resource IDs
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useSelfAccessCheck } from '../../hooks';
import { server } from '../../api-mocks/msw-server';
import { errorHandlers } from '../../api-mocks/handlers/error-handlers';
import {
  createTestWrapper,
  createMockResource,
  createMockResources,
  createMaliciousResource,
  createInvalidReporterResource,
  expectValidErrorStructure,
  waitMs,
} from '../../api-mocks/test-utils';
import { http, HttpResponse } from 'msw';

describe('Integration Tests - Critical Scenarios', () => {
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

  // Helper: Creates MSW handler that validates resource ID in request
  const createXssValidationHandler = (expectedResourceId: string) =>
    http.post('/api/kessel/v1beta2/checkself', async ({ request }) => {
      const body = await request.json() as any;
      expect(body.object.resourceId).toBe(expectedResourceId);
      return HttpResponse.json({ allowed: 'ALLOWED_TRUE' });
    });

  describe('1. Empty Resources Array Handling', () => {
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

  describe('2. Missing Reporter Field Validation', () => {
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

      const { result } = renderHook(
        () => useSelfAccessCheck({
          relation: 'view',
          resource: createInvalidReporterResource('missing')
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

      const { result } = renderHook(
        () => useSelfAccessCheck({
          relation: 'view',
          resource: createInvalidReporterResource('malformed')
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

      const { result } = renderHook(
        () => useSelfAccessCheck({
          relation: 'view',
          resource: createInvalidReporterResource('null')
        }),
        { wrapper: createTestWrapper() }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.code).toBe(400);
    });
  });

  describe('3. Component Unmount Cleanup', () => {
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

  describe('4. 401 Unauthorized Handling', () => {
    /**
     * Test: 401 Unauthorized should return auth error
     * Priority: CRITICAL
     *
     * Scenario: User's JWT expired or missing
     * Expected: Clear auth error message, app can redirect to login
     * Coverage: Auth error flow, error categorization
     */
    it('should handle 401 Unauthorized with clear error message', async () => {
      server.use(errorHandlers.unauthorized);

      const resource = createMockResource();
      const { result } = renderHook(
        () => useSelfAccessCheck({ relation: 'view', resource }),
        { wrapper: createTestWrapper() }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.code).toBe(401);
      expect(result.current.error?.message).toContain('Unauthorized');
      expect(result.current.error?.message).toContain('Authentication required');
      expect(result.current.data).toBeUndefined();
    });

    /**
     * Test: 401 on bulk check
     */
    it('should handle 401 on bulk check', async () => {
      server.use(errorHandlers.unauthorizedBulk);

      const { result } = renderHook(
        () => useSelfAccessCheck({ relation: 'view', resources: createMockResources(2) as any }),
        { wrapper: createTestWrapper() }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.code).toBe(401);
      expect(result.current.data).toBeUndefined();
    });

    /**
     * Test: Error object structure is consistent
     */
    it('should return consistent error object structure', async () => {
      server.use(errorHandlers.unauthorized);

      const resource = createMockResource();
      const { result } = renderHook(
        () => useSelfAccessCheck({ relation: 'view', resource }),
        { wrapper: createTestWrapper() }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expectValidErrorStructure(result.current.error);
    });
  });

  describe('4a. 403 Forbidden Handling', () => {
    /**
     * Test: 403 Forbidden should return clear error
     * Priority: CRITICAL
     *
     * Scenario: User authenticated but lacks API-level permission
     * Expected: Clear forbidden error message
     * Coverage: Permission error flow, 403 vs 401 vs allowed=false distinction
     *
     * Note: 403 differs from allowed=false:
     * - 403: User lacks permission to use the API itself
     * - allowed=false: User can use API but specific resource check denied
     */
    it('should handle 403 Forbidden with clear error message', async () => {
      server.use(errorHandlers.forbidden);

      const resource = createMockResource();
      const { result } = renderHook(
        () => useSelfAccessCheck({ relation: 'view', resource }),
        { wrapper: createTestWrapper() }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.code).toBe(403);
      expect(result.current.error?.message).toContain('Forbidden');
      expect(result.current.error?.message).toContain('Insufficient permissions');
      expect(result.current.data).toBeUndefined();
    });

    /**
     * Test: 403 on bulk check endpoint
     */
    it('should handle 403 on bulk check', async () => {
      server.use(errorHandlers.forbiddenBulk);

      const { result } = renderHook(
        () => useSelfAccessCheck({ relation: 'view', resources: createMockResources(2) as any }),
        { wrapper: createTestWrapper() }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.code).toBe(403);
      expect(result.current.data).toBeUndefined();
    });

    /**
     * Test: Distinguish 403 from allowed=false
     *
     * Important distinction:
     * - HTTP 403: API-level permission failure (can't use the API)
     * - allowed=false: Resource-level check failure (can use API, but check denied)
     */
    it('should distinguish 403 forbidden from allowed=false', async () => {
      // First: Test 403 error (API-level denial)
      server.use(errorHandlers.forbidden);

      const resource = createMockResource();
      const { result: forbiddenResult } = renderHook(
        () => useSelfAccessCheck({ relation: 'view', resource }),
        { wrapper: createTestWrapper() }
      );

      await waitFor(() => expect(forbiddenResult.current.loading).toBe(false));

      // 403 returns error, no data
      expect(forbiddenResult.current.error).toBeDefined();
      expect(forbiddenResult.current.error?.code).toBe(403);
      expect(forbiddenResult.current.data).toBeUndefined();

      // Second: Test allowed=false (successful API call, but permission denied)
      server.resetHandlers();
      server.use(
        http.post('*/api/kessel/v1beta2/checkself', () => {
          return HttpResponse.json({
            allowed: 'ALLOWED_FALSE',
            consistencyToken: { token: 'mock-token' }
          });
        })
      );

      const { result: deniedResult } = renderHook(
        () => useSelfAccessCheck({ relation: 'admin', resource }),
        { wrapper: createTestWrapper() }
      );

      await waitFor(() => expect(deniedResult.current.loading).toBe(false));

      // allowed=false returns data with allowed: false, no error
      expect(deniedResult.current.error).toBeUndefined();
      expect(deniedResult.current.data).toBeDefined();
      expect(deniedResult.current.data?.allowed).toBe(false);
    });

    /**
     * Test: 403 error object structure matches other HTTP errors
     */
    it('should return consistent error structure for 403', async () => {
      server.use(errorHandlers.forbidden);

      const resource = createMockResource();
      const { result } = renderHook(
        () => useSelfAccessCheck({ relation: 'view', resource }),
        { wrapper: createTestWrapper() }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expectValidErrorStructure(result.current.error, true);
    });
  });

  describe('5. Invalid JSON Response Handling', () => {
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

  describe('6. XSS in Resource IDs (Security)', () => {
    /**
     * Test: XSS payloads in resource IDs should be safe
     * Priority: CRITICAL
     *
     * Scenario: Resource ID contains <script> tags or other XSS payloads
     * Expected: SDK passes through safely to API without executing
     * Coverage: XSS prevention, input sanitization
     */
    it('should safely handle script tags in resource ID', async () => {
      const maliciousResource = createMaliciousResource('xss');
      server.use(createXssValidationHandler(maliciousResource.id));

      const { result } = renderHook(
        () => useSelfAccessCheck({ relation: 'view', resource: maliciousResource }),
        { wrapper: createTestWrapper() }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data?.allowed).toBe(true);
      expect(result.current.data?.resource.id).toBe('<script>alert("xss")</script>');
    });

    /**
     * Test: SQL injection patterns in resource type
     */
    it('should safely handle SQL injection patterns', async () => {
      const maliciousResource = createMaliciousResource('sql');
      server.use(createXssValidationHandler(maliciousResource.id));

      const { result } = renderHook(
        () => useSelfAccessCheck({ relation: 'view', resource: maliciousResource }),
        { wrapper: createTestWrapper() }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data?.allowed).toBe(true);
    });

    /**
     * Test: JSON injection / prototype pollution
     */
    it('should safely handle JSON injection patterns', async () => {
      const maliciousResource = createMaliciousResource('json');
      server.use(createXssValidationHandler(maliciousResource.id));

      const { result } = renderHook(
        () => useSelfAccessCheck({ relation: 'view', resource: maliciousResource }),
        { wrapper: createTestWrapper() }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data?.allowed).toBe(true);
      expect((Object.prototype as any).isAdmin).toBeUndefined();
    });

    /**
     * Test: Unicode and special characters
     */
    it('should safely handle unicode and special characters', async () => {
      const maliciousResource = createMaliciousResource('unicode');
      server.use(createXssValidationHandler(maliciousResource.id));

      const { result } = renderHook(
        () => useSelfAccessCheck({ relation: 'view', resource: maliciousResource }),
        { wrapper: createTestWrapper() }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data?.allowed).toBe(true);
    });

    /**
     * Test: XSS in bulk check
     */
    it('should safely handle XSS payloads in bulk check', async () => {
      server.use(
        http.post('*/api/kessel/v1beta2/checkselfbulk', async ({ request }) => {
          const body = await request.json() as any;

          // Verify payloads were sent as-is
          expect(body.items[0].object.resourceId).toBe('<script>alert("xss")</script>');
          expect(body.items[1].object.resourceId).toBe("'; DROP TABLE users; --");

          return HttpResponse.json({
            pairs: body.items.map((item: any) => ({
              request: item,
              item: { allowed: 'ALLOWED_TRUE' }
            }))
          });
        })
      );

      const maliciousResources = [
        createMaliciousResource('xss'),
        createMaliciousResource('sql')
      ];

      const { result } = renderHook(
        () => useSelfAccessCheck({ relation: 'view', resources: maliciousResources as any }),
        { wrapper: createTestWrapper() }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.[0].allowed).toBe(true);
      expect(result.current.data?.[1].allowed).toBe(true);
    });
  });
});
