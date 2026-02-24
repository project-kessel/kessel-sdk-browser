import { http, HttpResponse } from 'msw';
import type { CheckSelfBulkRequest } from '../core/api-client';

/**
 * Default MSW handlers for testing
 * These provide realistic default responses for both single and bulk check endpoints
 */

export const handlers = [
  // Single check endpoint - returns allowed by default
  http.post('*/api/kessel/v1beta2/checkself', async () => {
    return HttpResponse.json({
      allowed: 'ALLOWED_TRUE',
      consistencyToken: {
        token: 'mock-consistency-token-' + crypto.randomUUID()
      }
    });
  }),

  // Bulk check endpoint - returns mixed permissions
  http.post('*/api/kessel/v1beta2/checkselfbulk', async ({ request }) => {
    const body = await request.json() as CheckSelfBulkRequest;
    const items = body.items;

    if (!items) {
      return HttpResponse.json(
        {
          code: 400,
          message: 'Invalid request: items field is required',
          details: []
        },
        { status: 400 }
      );
    }

    // Sample response with mixed permissions
    return HttpResponse.json({
      pairs: items.map((requestItem, index: number) => ({
        request: requestItem,
        item: {
          allowed: index % 3 === 0 ? 'ALLOWED_TRUE' :
                  index % 3 === 1 ? 'ALLOWED_FALSE' :
                  'ALLOWED_UNSPECIFIED'
        }
      })),
      consistencyToken: {
        token: 'mock-consistency-token-' + crypto.randomUUID()
      }
    });
  })
];
