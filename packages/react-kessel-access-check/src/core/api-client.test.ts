import { http, HttpResponse } from 'msw'
import { server } from "../api-mocks/msw-server";
import { checkSelfBulk } from "./api-client";
import type { CheckSelfBulkRequest } from './api-client';



describe('api-client', () => {
  // MSW server setup
  beforeAll(() => {
    server.listen({
      onUnhandledRequest: 'error',
    });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });
  
  test('should return 200 for self bulk check', async () => {
    const mockedUUID = '262ddb85-51ec-43f2-8227-970ab9f68ed1'
    jest.spyOn(global.crypto, 'randomUUID').mockReturnValue(mockedUUID);
    const expectedResult = {"consistencyToken": {"token": "mock-consistency-token-" + mockedUUID}, "pairs": []}
    const result = await checkSelfBulk({
      apiPath: '/api/kessel/v1beta2',
      baseUrl: '',
    }, {
      items: []
    });
    expect(result).toEqual(expectedResult);
  });

  test('should handle error response', async () => {
    server.use(http.post('/api/kessel/v1beta2/checkselfbulk', async () => {
      return HttpResponse.json({
        error: 'Invalid request: items field is required'
      }, { status: 400 });
    }));

    const config = { baseUrl: '', apiPath: '/api/kessel/v1beta2' };
    const params = { items: [] };

    await expect(checkSelfBulk(config, params)).rejects.toHaveProperty('error', "Invalid request: items field is required");
  });

  test('should return mixed permissions in response', async () => {
    const items: Parameters<typeof checkSelfBulk>[1]['items'] = [
      {
        relation: 'viewer',
        resource: {
          id: 'resource-1',
          type: 'document',
          reporter: {
            type: 'user',
          }
        }
      },
      {
        relation: 'viewer',
        resource: {
          id: 'resource-2',
          type: 'document',
          reporter: {
            type: 'user',
          }
        }
      },
      {
        relation: 'viewer',
        resource: {
          id: 'resource-3',
          type: 'document',
          reporter: {
            type: 'user',
          }
        }
      },
      {
        relation: 'viewer',
        resource: {
          id: 'resource-4',
          type: 'document',
          reporter: {
            type: 'user',
          }
        }
      },
    ];

    const result = await checkSelfBulk({
      apiPath: '/api/kessel/v1beta2',
      baseUrl: '',
    }, { items });

    expect(result.pairs).toHaveLength(4);
    expect(result.pairs[0].item.allowed).toBe('ALLOWED_TRUE');
    expect(result.pairs[1].item.allowed).toBe('ALLOWED_FALSE');
    expect(result.pairs[2].item.allowed).toBe('ALLOWED_UNSPECIFIED');
    expect(result.pairs[3].item.allowed).toBe('ALLOWED_TRUE');
  });

  describe('entity limit chunking', () => {
    let requestBodies: CheckSelfBulkRequest[] = [];

    const createMockItems = (count: number) => {
      return Array.from({ length: count }, (_, index) => ({
        resource: {
          id: `resource_${index.toString().padStart(4, '0')}`,
          type: 'document',
          reporter: { type: 'service', instanceId: 'test-app' },
        },
        relation: 'view',
      }));
    };

    beforeEach(() => {
      requestBodies = [];

      // Mock that captures all request bodies for analysis
      server.use(
        http.post('/api/kessel/v1beta2/checkselfbulk', async ({ request }) => {
          const body = await request.json() as CheckSelfBulkRequest;
          requestBodies.push(body);

          return HttpResponse.json({
            pairs: body.items.map((item) => ({
              request: item,
              item: { allowed: 'ALLOWED_TRUE' }
            })),
            consistencyToken: {
              token: `token_chunk_${requestBodies.length}`
            }
          });
        })
      );
    });

    test('should handle requests under default limit (no chunking)', async () => {
      const items = createMockItems(500);
      const result = await checkSelfBulk({
        baseUrl: '',
        apiPath: '/api/kessel/v1beta2',
      }, { items });

      expect(requestBodies).toHaveLength(1);
      expect(requestBodies[0].items).toHaveLength(500);
      expect(result.pairs).toHaveLength(500);
    });

    test('should chunk requests when exceeding entity limit', async () => {
      const configWithLimit = {
        baseUrl: '',
        apiPath: '/api/kessel/v1beta2',
        bulkCheckConfig: { bulkRequestLimit: 100 }
      };
      const items = createMockItems(250); // Should create 3 chunks: 100 + 100 + 50

      const result = await checkSelfBulk(configWithLimit, { items });

      expect(requestBodies).toHaveLength(3);
      expect(requestBodies[0].items).toHaveLength(100);
      expect(requestBodies[1].items).toHaveLength(100);
      expect(requestBodies[2].items).toHaveLength(50);
      expect(result.pairs).toHaveLength(250);
    });

    test('should handle exactly at the limit', async () => {
      const configWithLimit = {
        baseUrl: '',
        apiPath: '/api/kessel/v1beta2',
        bulkCheckConfig: { bulkRequestLimit: 1000 }
      };
      const items = createMockItems(1000);

      const result = await checkSelfBulk(configWithLimit, { items });

      expect(requestBodies).toHaveLength(1);
      expect(requestBodies[0].items).toHaveLength(1000);
      expect(result.pairs).toHaveLength(1000);
    });

    test('should handle one over the limit', async () => {
      const configWithLimit = {
        baseUrl: '',
        apiPath: '/api/kessel/v1beta2',
        bulkCheckConfig: { bulkRequestLimit: 1000 }
      };
      const items = createMockItems(1001); // Should create 2 chunks: 1000 + 1

      const result = await checkSelfBulk(configWithLimit, { items });

      expect(requestBodies).toHaveLength(2);
      expect(requestBodies[0].items).toHaveLength(1000);
      expect(requestBodies[1].items).toHaveLength(1);
      expect(result.pairs).toHaveLength(1001);
    });

    test('should preserve order across chunks', async () => {
      const configWithLimit = {
        baseUrl: '',
        apiPath: '/api/kessel/v1beta2',
        bulkCheckConfig: { bulkRequestLimit: 3 }
      };
      const items = createMockItems(10);

      const result = await checkSelfBulk(configWithLimit, { items });

      // Verify that results maintain the same order as input
      expect(result.pairs).toHaveLength(10);
      result.pairs.forEach((pair, index) => {
        expect(pair.request.object.resourceId).toBe(`resource_${index.toString().padStart(4, '0')}`);
      });
    });

    test('should use consistency token from last chunk', async () => {
      const configWithLimit = {
        baseUrl: '',
        apiPath: '/api/kessel/v1beta2',
        bulkCheckConfig: { bulkRequestLimit: 2 }
      };
      const items = createMockItems(5); // Creates 3 chunks: 2 + 2 + 1

      const result = await checkSelfBulk(configWithLimit, { items });

      expect(requestBodies).toHaveLength(3);
      expect(result.consistencyToken?.token).toBe('token_chunk_3');
    });

    test('should handle bulkRequestLimit of 1', async () => {
      const configWithLimit = {
        baseUrl: '',
        apiPath: '/api/kessel/v1beta2',
        bulkCheckConfig: { bulkRequestLimit: 1 }
      };
      const items = createMockItems(3);

      const result = await checkSelfBulk(configWithLimit, { items });

      expect(requestBodies).toHaveLength(3);
      requestBodies.forEach(body => {
        expect(body.items).toHaveLength(1);
      });
      expect(result.pairs).toHaveLength(3);
    });

    test('should handle zero or negative bulkRequestLimit as unlimited', async () => {
      const configWithZeroLimit = {
        baseUrl: '',
        apiPath: '/api/kessel/v1beta2',
        bulkCheckConfig: { bulkRequestLimit: 0 }
      };
      const items = createMockItems(2000);

      const result = await checkSelfBulk(configWithZeroLimit, { items });

      expect(requestBodies).toHaveLength(1);
      expect(requestBodies[0].items).toHaveLength(2000);
      expect(result.pairs).toHaveLength(2000);
    });

    test('should pass through consistency configuration to all chunks', async () => {
      const configWithLimit = {
        baseUrl: '',
        apiPath: '/api/kessel/v1beta2',
        bulkCheckConfig: { bulkRequestLimit: 2 }
      };
      const items = createMockItems(3);
      const consistency = {
        minimizeLatency: true,
        atLeastAsFresh: { token: 'input-token' }
      };

      await checkSelfBulk(configWithLimit, { items, consistency });

      expect(requestBodies).toHaveLength(2);
      requestBodies.forEach(body => {
        expect(body.consistency).toEqual(consistency);
      });
    });

    test('should handle chunk failure gracefully', async () => {
      const configWithLimit = {
        baseUrl: '',
        apiPath: '/api/kessel/v1beta2',
        bulkCheckConfig: { bulkRequestLimit: 2 }
      };

      // Mock server to fail on second request
      server.use(
        http.post('/api/kessel/v1beta2/checkselfbulk', async ({ request }) => {
          const body = await request.json() as CheckSelfBulkRequest;
          requestBodies.push(body);

          // Fail the second chunk
          if (requestBodies.length === 2) {
            return HttpResponse.json(
              { code: 500, message: 'Internal Server Error' },
              { status: 500 }
            );
          }

          return HttpResponse.json({
            pairs: body.items.map(item => ({
              request: item,
              item: { allowed: 'ALLOWED_TRUE' }
            })),
            consistencyToken: { token: `token_chunk_${requestBodies.length}` }
          });
        })
      );

      const items = createMockItems(3); // Creates 2 chunks: 2 + 1

      await expect(checkSelfBulk(configWithLimit, { items }))
        .rejects.toMatchObject({
          code: 500,
          message: 'Internal Server Error'
        });
    });
  });
});