/**
 * Integration Tests - HTTP Error Handling
 *
 * Tests that verify proper handling of HTTP error responses (401, 403)
 * and distinguish them from allowed=false responses.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useSelfAccessCheck } from '../../hooks';
import { server } from '../../api-mocks/msw-server';
import { errorHandlers } from '../../api-mocks/handlers/error-handlers';
import {
  createTestWrapper,
  createMockResource,
  createMockResources,
  expectValidErrorStructure,
} from '../../api-mocks/test-utils';
import { http, HttpResponse } from 'msw';

describe('Integration Tests - HTTP Error Handling', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('401 Unauthorized', () => {
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

  describe('403 Forbidden', () => {
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
});
