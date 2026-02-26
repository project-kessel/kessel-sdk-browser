import React from 'react';
import { AccessCheck } from '../AccessCheckProvider';
import type { BulkCheckConfig } from '../core/api-client';
import type { SelfAccessCheckResource } from '../types';

/**
 * Test utilities for integration tests
 */

/**
 * Creates a test wrapper with AccessCheck.Provider
 *
 * @example
 * const { result } = renderHook(
 *   () => useSelfAccessCheck({ relation: 'view', resource }),
 *   { wrapper: createTestWrapper() }
 * );
 */
export function createTestWrapper(config?: {
  baseUrl?: string;
  apiPath?: string;
  bulkCheckConfig?: BulkCheckConfig;
}) {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <AccessCheck.Provider
      baseUrl={config?.baseUrl ?? 'https://test.example.com'}
      apiPath={config?.apiPath ?? '/api/kessel/v1beta2'}
      bulkCheckConfig={config?.bulkCheckConfig}
    >
      {children}
    </AccessCheck.Provider>
  );
  TestWrapper.displayName = 'TestWrapper';
  return TestWrapper;
}

/**
 * Creates a mock resource with defaults
 *
 * @example
 * const resource = createMockResource({ id: 'custom-id' });
 */
export function createMockResource(
  overrides?: Partial<SelfAccessCheckResource>
): SelfAccessCheckResource {
  return {
    id: 'test-resource-id',
    type: 'workspace',
    reporter: { type: 'rbac' },
    ...overrides,
  };
}

/**
 * Creates an array of mock resources for bulk testing
 *
 * @example
 * const resources = createMockResources(10);
 */
export function createMockResources(
  count: number,
  overrides?: (index: number) => Partial<SelfAccessCheckResource>
): SelfAccessCheckResource[] {
  return Array.from({ length: count }, (_, i) =>
    createMockResource({
      id: `resource-${i.toString().padStart(4, '0')}`,
      ...(overrides ? overrides(i) : {}),
    })
  );
}

/**
 * Creates a mock resource with XSS payloads for security testing
 *
 * @example
 * const maliciousResource = createMaliciousResource('xss');
 */
export function createMaliciousResource(
  type: 'xss' | 'sql' | 'json' | 'unicode'
): SelfAccessCheckResource {
  const payloads = {
    xss: {
      id: '<script>alert("xss")</script>',
      type: '<img src=x onerror=alert(1)>',
    },
    sql: {
      id: "'; DROP TABLE users; --",
      type: "1' OR '1'='1",
    },
    json: {
      id: '{"__proto__":{"isAdmin":true}}',
      type: '\\u0000\\u0001\\u0002',
    },
    unicode: {
      id: '测试\u0000\uFFFD💩',
      type: '\u202E\u202D',
    },
  };

  return createMockResource(payloads[type]);
}

/**
 * Delays for a specified number of milliseconds
 * Useful for testing loading states
 *
 * @example
 * await waitMs(100);
 */
export function waitMs(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Type guard to check if an error is an API error
 */
export function isApiError(
  error: unknown
): error is { code: number; message: string; details?: unknown[] } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

/**
 * Validates that an error object has the expected structure
 * Used for consistent error shape testing
 *
 * @example
 * expectValidErrorStructure(result.current.error);
 * expectValidErrorStructure(result.current.error, true); // with details
 */
export function expectValidErrorStructure(
  error: unknown,
  includeDetails = false
): void {
  expect(error).toHaveProperty('code');
  expect(error).toHaveProperty('message');
  expect(typeof (error as any)?.code).toBe('number');
  expect(typeof (error as any)?.message).toBe('string');
  if (includeDetails) {
    expect(error).toHaveProperty('details');
    expect(Array.isArray((error as any)?.details)).toBe(true);
  }
}
