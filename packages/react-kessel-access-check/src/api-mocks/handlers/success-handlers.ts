import { http, HttpResponse } from 'msw';
import type { CheckSelfBulkRequest } from '../../core/api-client';

/**
 * Success scenario handlers for MSW
 * These handlers return successful responses for happy path testing
 */

export const successHandlers = {
  /**
   * Single check - returns ALLOWED_TRUE
   */
  singleCheckAllowed: http.post('/api/kessel/v1beta2/checkself', () => {
    return HttpResponse.json({
      allowed: 'ALLOWED_TRUE',
      consistencyToken: { token: 'mock-token-' + crypto.randomUUID() }
    });
  }),

  /**
   * Single check - returns ALLOWED_FALSE
   */
  singleCheckDenied: http.post('/api/kessel/v1beta2/checkself', () => {
    return HttpResponse.json({
      allowed: 'ALLOWED_FALSE',
      consistencyToken: { token: 'mock-token-' + crypto.randomUUID() }
    });
  }),

  /**
   * Bulk check - all allowed
   */
  bulkCheckAllAllowed: http.post('/api/kessel/v1beta2/checkselfbulk', async ({ request }) => {
    const body = await request.json() as CheckSelfBulkRequest;

    return HttpResponse.json({
      pairs: body.items.map(item => ({
        request: item,
        item: { allowed: 'ALLOWED_TRUE' }
      })),
      consistencyToken: { token: 'mock-token-' + crypto.randomUUID() }
    });
  }),

  /**
   * Bulk check - mixed permissions (for testing)
   */
  bulkCheckMixed: http.post('/api/kessel/v1beta2/checkselfbulk', async ({ request }) => {
    const body = await request.json() as CheckSelfBulkRequest;

    return HttpResponse.json({
      pairs: body.items.map((item, index) => ({
        request: item,
        item: {
          allowed: index % 3 === 0 ? 'ALLOWED_TRUE' :
                  index % 3 === 1 ? 'ALLOWED_FALSE' :
                  'ALLOWED_UNSPECIFIED'
        }
      })),
      consistencyToken: { token: 'mock-token-' + crypto.randomUUID() }
    });
  }),

  /**
   * Bulk check - empty array (should return empty pairs)
   */
  bulkCheckEmpty: http.post('/api/kessel/v1beta2/checkselfbulk', async () => {
    return HttpResponse.json({
      pairs: [],
      consistencyToken: { token: 'mock-token-' + crypto.randomUUID() }
    });
  }),
};
