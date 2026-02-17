import { http, HttpResponse, delay } from 'msw';

/**
 * Error scenario handlers for MSW
 * These handlers simulate various error conditions for testing error handling
 */

export const errorHandlers = {
  /**
   * 400 Bad Request - Missing required fields
   */
  badRequest: http.post('/api/kessel/v1beta2/checkself', () => {
    return HttpResponse.json(
      {
        code: 400,
        message: 'Bad Request: Missing required field',
        details: []
      },
      { status: 400 }
    );
  }),

  /**
   * 400 Bad Request - Invalid reporter field
   */
  badRequestInvalidReporter: http.post('/api/kessel/v1beta2/checkself', () => {
    return HttpResponse.json(
      {
        code: 400,
        message: 'Bad Request: Invalid reporter configuration',
        details: ['reporter.type is required']
      },
      { status: 400 }
    );
  }),

  /**
   * 401 Unauthorized - JWT expired or missing
   */
  unauthorized: http.post('/api/kessel/v1beta2/checkself', () => {
    return HttpResponse.json(
      {
        code: 401,
        message: 'Unauthorized: Authentication required',
        details: []
      },
      { status: 401 }
    );
  }),

  /**
   * 401 Unauthorized - For bulk endpoint
   */
  unauthorizedBulk: http.post('/api/kessel/v1beta2/checkselfbulk', () => {
    return HttpResponse.json(
      {
        code: 401,
        message: 'Unauthorized: Authentication required',
        details: []
      },
      { status: 401 }
    );
  }),

  /**
   * 403 Forbidden - User authenticated but lacks permission
   */
  forbidden: http.post('/api/kessel/v1beta2/checkself', () => {
    return HttpResponse.json(
      {
        code: 403,
        message: 'Forbidden: Insufficient permissions',
        details: []
      },
      { status: 403 }
    );
  }),

  /**
   * 403 Forbidden - For bulk endpoint
   */
  forbiddenBulk: http.post('/api/kessel/v1beta2/checkselfbulk', () => {
    return HttpResponse.json(
      {
        code: 403,
        message: 'Forbidden: Insufficient permissions',
        details: []
      },
      { status: 403 }
    );
  }),

  /**
   * 404 Not Found - Resource doesn't exist
   */
  notFound: http.post('/api/kessel/v1beta2/checkself', () => {
    return HttpResponse.json(
      {
        code: 404,
        message: 'Not Found: Resource does not exist',
        details: []
      },
      { status: 404 }
    );
  }),

  /**
   * 429 Rate Limit Exceeded
   */
  rateLimited: http.post('/api/kessel/v1beta2/checkself', () => {
    return HttpResponse.json(
      {
        code: 429,
        message: 'Rate Limit Exceeded: Too many requests',
        details: []
      },
      {
        status: 429,
        headers: {
          'Retry-After': '60'
        }
      }
    );
  }),

  /**
   * 500 Internal Server Error
   */
  internalServerError: http.post('/api/kessel/v1beta2/checkself', () => {
    return HttpResponse.json(
      {
        code: 500,
        message: 'Internal Server Error',
        details: []
      },
      { status: 500 }
    );
  }),

  /**
   * 500 Internal Server Error - For bulk endpoint
   */
  internalServerErrorBulk: http.post('/api/kessel/v1beta2/checkselfbulk', () => {
    return HttpResponse.json(
      {
        code: 500,
        message: 'Internal Server Error',
        details: []
      },
      { status: 500 }
    );
  }),

  /**
   * 503 Service Unavailable - Maintenance mode
   */
  serviceUnavailable: http.post('/api/kessel/v1beta2/checkself', () => {
    return HttpResponse.json(
      {
        code: 503,
        message: 'Service Unavailable: Under maintenance',
        details: []
      },
      { status: 503 }
    );
  }),

  /**
   * Network timeout - Never resolves
   */
  timeout: http.post('/api/kessel/v1beta2/checkself', async () => {
    await delay('infinite');
    return HttpResponse.json({ allowed: 'ALLOWED_TRUE' });
  }),

  /**
   * Invalid JSON response - Returns HTML error page
   */
  invalidJson: http.post('/api/kessel/v1beta2/checkself', () => {
    return new Response('<html><body>Error</body></html>', {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }),

  /**
   * Invalid JSON response - For bulk endpoint
   */
  invalidJsonBulk: http.post('/api/kessel/v1beta2/checkselfbulk', () => {
    return new Response('<html><body>Error</body></html>', {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }),

  /**
   * Malformed JSON - Invalid JSON syntax
   */
  malformedJson: http.post('/api/kessel/v1beta2/checkself', () => {
    return new Response('{invalid json}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }),

  /**
   * Network error - Simulates network failure
   */
  networkError: http.post('/api/kessel/v1beta2/checkself', () => {
    return HttpResponse.error();
  }),

  /**
   * Network error - For bulk endpoint
   */
  networkErrorBulk: http.post('/api/kessel/v1beta2/checkselfbulk', () => {
    return HttpResponse.error();
  }),
};
