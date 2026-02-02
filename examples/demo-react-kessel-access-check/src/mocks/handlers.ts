import { http, HttpResponse, delay } from 'msw';
import { permissions } from './data';

// Consistency token counter for demo purposes
let consistencyTokenCounter = 1;

export const handlers = [
  // Single resource check endpoint
  http.post('http://localhost:3000/api/kessel/v1beta2/checkself', async ({ request }) => {
    await delay(800); // Simulate network latency

    const body = await request.json() as {
      object: { resourceId: string; resourceType: string };
      relation: string;
    };
    const { object, relation } = body;
    const { resourceId } = object;

    // Simulate error scenarios for demo purposes
    if (resourceId === 'error-network') {
      return HttpResponse.json(
        { code: 503, message: 'Service unavailable', details: [] },
        { status: 503 }
      );
    }

    if (resourceId === 'error-permission') {
      return HttpResponse.json(
        { code: 403, message: 'Permission denied', details: [] },
        { status: 403 }
      );
    }

    const isAllowed = permissions[resourceId]?.[relation] || false;
    const allowedEnum = isAllowed ? 'ALLOWED_TRUE' : 'ALLOWED_FALSE';

    return HttpResponse.json({
      allowed: allowedEnum,
    });
  }),

  // Bulk resource check endpoint - matches OpenAPI spec
  http.post('http://localhost:3000/api/kessel/v1beta2/checkselfbulk', async ({ request }) => {
    await delay(1000); // Simulate network latency

    const body = await request.json() as {
      items: Array<{
        object: { resourceId: string; resourceType: string };
        relation: string;
      }>;
      consistency?: {
        minimizeLatency?: boolean;
        atLeastAsFresh?: { token: string };
      };
    };
    const { items } = body;

    // Simulate global error for specific test cases
    if (items.some(item => item.object.resourceId === 'error-bulk')) {
      return HttpResponse.json(
        { code: 500, message: 'Internal server error', details: [] },
        { status: 500 }
      );
    }

    const pairs = items.map(item => {
      const { object, relation } = item;
      const resourceId = object.resourceId;

      // Simulate per-item errors
      if (resourceId === 'error-item') {
        return {
          request: item,
          item: { allowed: 'ALLOWED_FALSE' as const },
          error: {
            code: 404,
            message: `Resource ${resourceId} not found`,
            details: []
          }
        };
      }

      const isAllowed = permissions[resourceId]?.[relation] || false;
      const allowedEnum = isAllowed ? 'ALLOWED_TRUE' : 'ALLOWED_FALSE';

      return {
        request: item,
        item: { allowed: allowedEnum as 'ALLOWED_TRUE' | 'ALLOWED_FALSE' }
      };
    });

    const token = `token-${consistencyTokenCounter++}`;

    return HttpResponse.json({
      pairs,
      consistencyToken: { token }
    });
  })
];
