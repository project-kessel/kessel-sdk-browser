import { http, HttpResponse, delay } from 'msw';
import { permissions } from './data';

// Consistency token counter for demo purposes
let consistencyTokenCounter = 1;

export const handlers = [
  // Single resource check endpoint
  http.post('/api/inventory/v1beta2/checkself', async ({ request }) => {
    await delay(800); // Simulate network latency

    const body = await request.json() as { relation: string; resource: { id: string; type: string; [key: string]: unknown } };
    const { relation, resource } = body;

    // Simulate error scenarios for demo purposes
    if (resource.id === 'error-network') {
      return HttpResponse.json(
        { code: 503, message: 'Service unavailable', details: [] },
        { status: 503 }
      );
    }

    if (resource.id === 'error-permission') {
      return HttpResponse.json(
        { code: 403, message: 'Permission denied', details: [] },
        { status: 403 }
      );
    }

    const allowed = permissions[resource.id]?.[relation] || false;

    return HttpResponse.json({
      allowed,
      resource
    });
  }),

  // Bulk resource check endpoint
  http.post('/api/inventory/v1beta2/checkselfbulk', async ({ request }) => {
    await delay(1000); // Simulate network latency

    const body = await request.json() as {
      relation?: string;
      resources: Array<{ id: string; type: string; relation?: string; [key: string]: unknown }>;
      consistency?: unknown;
    };
    const { relation, resources } = body;

    // Simulate global error for specific test cases
    if (resources.some(r => r.id === 'error-bulk')) {
      return HttpResponse.json(
        { code: 500, message: 'Internal server error', details: [] },
        { status: 500 }
      );
    }

    const results = resources.map(resource => {
      const resourceRelation = resource.relation || relation;

      // Simulate per-item errors
      if (resource.id === 'error-item') {
        return {
          allowed: false,
          resource,
          relation: resourceRelation,
          error: {
            code: 404,
            message: `Resource ${resource.id} not found`,
            details: []
          }
        };
      }

      const allowed = resourceRelation ? (permissions[resource.id]?.[resourceRelation] || false) : false;

      return {
        allowed,
        resource,
        relation: resourceRelation
      };
    });

    const token = `token-${consistencyTokenCounter++}`;

    return HttpResponse.json({
      results,
      consistencyToken: { token }
    });
  })
];
