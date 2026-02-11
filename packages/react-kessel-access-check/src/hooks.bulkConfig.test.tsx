import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { useSelfAccessCheck } from './hooks';
import { AccessCheck } from './AccessCheckProvider';
import { server } from './api-mocks/msw-server';
import { http, HttpResponse } from 'msw';

describe('useSelfAccessCheck - bulkCheckConfig', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('bulkCheckConfig from context', () => {
    it('should use default bulk config when none provided', async () => {
      const resources = Array.from({ length: 5 }, (_, i) => ({
        id: `ws-${i}`,
        type: 'workspace',
        reporter: { type: 'rbac' }
      })) as [{ id: string; type: string; reporter: { type: string } }, ...{ id: string; type: string; reporter: { type: string } }[]];

      let callCount = 0;
      server.use(
        http.post('https://api.example.com/api/kessel/v1beta2/checkselfbulk', async ({ request }) => {
          callCount++;
          const body = await request.json() as any;
          return HttpResponse.json({
            pairs: body.items.map((item: any) => ({
              request: item,
              item: { allowed: 'ALLOWED_TRUE' },
            })),
            consistencyToken: { token: 'default-config-token' },
          });
        })
      );

      // Default wrapper without bulkCheckConfig
      const defaultWrapper = ({ children }: { children: React.ReactNode }) => (
        <AccessCheck.Provider baseUrl="https://api.example.com" apiPath="/api/kessel/v1beta2">
          {children}
        </AccessCheck.Provider>
      );

      const { result } = renderHook(
        () =>
          useSelfAccessCheck({
            relation: 'view',
            resources,
          }),
        { wrapper: defaultWrapper }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      // Should make a single API call since no chunking limit is set
      expect(callCount).toBe(1);
      expect(result.current.data).toHaveLength(5);
      expect(result.current.error).toBeUndefined();
    });

    it('should use custom bulk config for request chunking', async () => {
      const resources = Array.from({ length: 5 }, (_, i) => ({
        id: `ws-${i}`,
        type: 'workspace',
        reporter: { type: 'rbac' }
      })) as [{ id: string; type: string; reporter: { type: string } }, ...{ id: string; type: string; reporter: { type: string } }[]];

      let callCount = 0;
      const chunks: any[] = [];

      server.use(
        http.post('https://api.example.com/api/kessel/v1beta2/checkselfbulk', async ({ request }) => {
          callCount++;
          const body = await request.json() as any;
          chunks.push(body);

          return HttpResponse.json({
            pairs: body.items.map((item: any) => ({
              request: item,
              item: { allowed: 'ALLOWED_TRUE' },
            })),
            consistencyToken: { token: `chunk-${callCount}-token` },
          });
        })
      );

      // Wrapper with custom bulkCheckConfig
      const customConfigWrapper = ({ children }: { children: React.ReactNode }) => (
        <AccessCheck.Provider
          baseUrl="https://api.example.com"
          apiPath="/api/kessel/v1beta2"
          bulkCheckConfig={{ bulkRequestLimit: 2 }}
        >
          {children}
        </AccessCheck.Provider>
      );

      const { result } = renderHook(
        () =>
          useSelfAccessCheck({
            relation: 'view',
            resources,
          }),
        { wrapper: customConfigWrapper }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      // Should make 3 API calls due to chunking (2 + 2 + 1)
      expect(callCount).toBe(3);
      expect(chunks[0].items).toHaveLength(2); // First chunk
      expect(chunks[1].items).toHaveLength(2); // Second chunk
      expect(chunks[2].items).toHaveLength(1); // Last chunk

      expect(result.current.data).toHaveLength(5);
      expect(result.current.consistencyToken).toEqual({ token: 'chunk-3-token' }); // Last chunk token
      expect(result.current.error).toBeUndefined();
    });
  });
});