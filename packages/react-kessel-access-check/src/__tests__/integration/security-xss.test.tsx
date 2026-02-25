/**
 * Integration Tests - Security (XSS Prevention)
 *
 * Tests that verify malicious payloads in resource IDs are safely
 * passed through to the API without being executed.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useSelfAccessCheck } from '../../hooks';
import { server } from '../../api-mocks/msw-server';
import {
  createTestWrapper,
  createMaliciousResource,
} from '../../api-mocks/test-utils';
import { http, HttpResponse } from 'msw';

describe('Integration Tests - Security (XSS Prevention)', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  // Helper: Creates MSW handler that validates resource ID in request
  const createXssValidationHandler = (expectedResourceId: string) =>
    http.post('/api/kessel/v1beta2/checkself', async ({ request }) => {
      const body = await request.json() as any;
      expect(body.object.resourceId).toBe(expectedResourceId);
      return HttpResponse.json({ allowed: 'ALLOWED_TRUE' });
    });

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
