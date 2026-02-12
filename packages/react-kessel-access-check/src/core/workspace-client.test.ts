import { fetchRootWorkspace, fetchDefaultWorkspace } from './workspace-client';

// Mock fetch globally
global.fetch = jest.fn();

describe('workspace-client', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  const mockWorkspaceListResponse = (workspace: Record<string, unknown>) => ({
    meta: { count: 1, limit: 10, offset: 0 },
    links: { first: null, next: null, previous: null, last: null },
    data: [workspace],
  });

  describe('fetchRootWorkspace', () => {
    it('should fetch and return the root workspace', async () => {
      const mockWorkspace = {
        id: 'root-ws-456',
        type: 'root',
        name: 'Root Workspace',
        description: 'Organization root workspace',
        created: '2024-08-04T12:00:00Z',
        modified: '2024-08-04T12:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWorkspaceListResponse(mockWorkspace),
      } as Response);

      const result = await fetchRootWorkspace('https://api.example.com');

      expect(result).toEqual(mockWorkspace);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/rbac/v2/workspaces/?type=root',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        })
      );
    });

    it('should strip trailing slashes from rbacBaseEndpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWorkspaceListResponse({ id: 'ws1', type: 'root', name: 'WS', created: '', modified: '' }),
      } as Response);

      await fetchRootWorkspace('https://api.example.com///');

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toBe('https://api.example.com/api/rbac/v2/workspaces/?type=root');
    });

    it('should throw on empty data array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          meta: { count: 0, limit: 10, offset: 0 },
          links: { first: null, next: null, previous: null, last: null },
          data: [],
        }),
      } as Response);

      await expect(fetchRootWorkspace('https://api.example.com')).rejects.toEqual({
        code: 404,
        message: 'No root workspace found in response',
        details: [],
      });
    });

    it('should throw on HTTP error with JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          code: 403,
          message: 'Forbidden',
          details: [],
        }),
      } as Response);

      await expect(fetchRootWorkspace('https://api.example.com')).rejects.toEqual({
        code: 403,
        message: 'Forbidden',
        details: [],
      });
    });

    it('should throw on HTTP error with non-JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        json: async () => { throw new Error('not json'); },
      } as unknown as Response);

      await expect(fetchRootWorkspace('https://api.example.com')).rejects.toEqual({
        code: 502,
        message: 'Bad Gateway',
        details: [],
      });
    });

    it('should return the first workspace when multiple are returned', async () => {
      const workspaces = [
        { id: 'ws-first', type: 'root', name: 'First', created: '', modified: '' },
        { id: 'ws-second', type: 'root', name: 'Second', created: '', modified: '' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          meta: { count: 2, limit: 10, offset: 0 },
          links: { first: null, next: null, previous: null, last: null },
          data: workspaces,
        }),
      } as Response);

      const result = await fetchRootWorkspace('https://api.example.com');
      expect(result.id).toBe('ws-first');
    });
  });

  describe('fetchDefaultWorkspace', () => {
    it('should fetch and return the default workspace', async () => {
      const mockWorkspace = {
        id: 'default-ws-123',
        type: 'default',
        name: 'Default Workspace',
        description: 'Organization default workspace',
        parent_id: 'root-ws-456',
        created: '2024-08-04T12:00:00Z',
        modified: '2024-08-04T12:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWorkspaceListResponse(mockWorkspace),
      } as Response);

      const result = await fetchDefaultWorkspace('https://api.example.com');

      expect(result).toEqual(mockWorkspace);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/rbac/v2/workspaces/?type=default',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        })
      );
    });

    it('should throw on empty data array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          meta: { count: 0, limit: 10, offset: 0 },
          links: { first: null, next: null, previous: null, last: null },
          data: [],
        }),
      } as Response);

      await expect(fetchDefaultWorkspace('https://api.example.com')).rejects.toEqual({
        code: 404,
        message: 'No default workspace found in response',
        details: [],
      });
    });

    it('should throw on server error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          code: 500,
          message: 'Internal server error',
          details: [{ reason: 'database unavailable' }],
        }),
      } as Response);

      await expect(fetchDefaultWorkspace('https://api.example.com')).rejects.toEqual({
        code: 500,
        message: 'Internal server error',
        details: [{ reason: 'database unavailable' }],
      });
    });

    it('should include parent_id in returned workspace', async () => {
      const mockWorkspace = {
        id: 'default-ws',
        type: 'default',
        name: 'Default',
        parent_id: 'root-ws',
        created: '2024-01-01T00:00:00Z',
        modified: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWorkspaceListResponse(mockWorkspace),
      } as Response);

      const result = await fetchDefaultWorkspace('https://api.example.com');
      expect(result.parent_id).toBe('root-ws');
    });
  });

  describe('auth option', () => {
    it('should merge custom auth headers into the request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWorkspaceListResponse({ id: 'ws1', type: 'root', name: 'WS', created: '', modified: '' }),
      } as Response);

      await fetchRootWorkspace('https://api.example.com', {
        headers: { 'Authorization': 'Bearer my-jwt-token' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer my-jwt-token',
          },
          credentials: 'include',
        })
      );
    });

    it('should allow overriding credentials via auth', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWorkspaceListResponse({ id: 'ws1', type: 'default', name: 'WS', created: '', modified: '' }),
      } as Response);

      await fetchDefaultWorkspace('https://api.example.com', {
        headers: { 'Authorization': 'Bearer token' },
        credentials: 'omit',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'omit',
        })
      );
    });

    it('should default to credentials include when auth has no credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWorkspaceListResponse({ id: 'ws1', type: 'root', name: 'WS', created: '', modified: '' }),
      } as Response);

      await fetchRootWorkspace('https://api.example.com', {
        headers: { 'X-Custom': 'value' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });
  });

  describe('httpClient option', () => {
    it('should use a custom fetch function when provided', async () => {
      const customFetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockWorkspaceListResponse({ id: 'ws1', type: 'root', name: 'WS', created: '', modified: '' }),
      } as Response);

      const result = await fetchRootWorkspace('https://api.example.com', undefined, customFetch);

      expect(result.id).toBe('ws1');
      expect(customFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/rbac/v2/workspaces/?type=root',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      );
      // Global fetch should NOT have been called
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should use global fetch when httpClient is not provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWorkspaceListResponse({ id: 'ws1', type: 'default', name: 'WS', created: '', modified: '' }),
      } as Response);

      await fetchDefaultWorkspace('https://api.example.com');

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should pass auth headers through custom httpClient', async () => {
      const customFetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockWorkspaceListResponse({ id: 'ws1', type: 'default', name: 'WS', created: '', modified: '' }),
      } as Response);

      await fetchDefaultWorkspace(
        'https://api.example.com',
        { headers: { 'Authorization': 'Bearer token' } },
        customFetch,
      );

      expect(customFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token',
          },
        })
      );
    });
  });
});
