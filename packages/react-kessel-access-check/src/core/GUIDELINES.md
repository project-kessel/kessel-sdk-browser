# Core Layer Guidelines

This directory contains pure API client functions and data transformers. It has **no React dependencies** -- nothing in `core/` may import from React or from the parent `src/` directory.

## Architecture Rules

- Dependency direction is strictly one-way: `src/*.tsx` and `src/hooks.ts` import from `core/`, never the reverse.
- All types consumed by `core/` are imported from `../types`. Do not duplicate type definitions here.
- Functions must be pure or async-pure (no side effects beyond the network call). No React hooks, no context, no state.

## API Client (`api-client.ts`)

### Endpoints

- Single check: `POST {baseUrl}{apiPath}/checkself`
- Bulk check: `POST {baseUrl}{apiPath}/checkselfbulk`

### Authentication

All fetch calls use `credentials: 'include'` for cookie-based JWT auth. Do not add an `Authorization` header in this layer -- the browser sends JWT cookies automatically.

### Error Structure

Every HTTP error must produce a `SelfAccessCheckError` with shape `{ code: number; message: string; details: unknown[] }`. When the response body is not valid JSON, construct this object from `response.status` and `response.statusText`. `checkSelf` implements this pattern inline; `checkSelfBulk` delegates to `makeRequest` which encapsulates the same logic.

### Bulk Check Chunking

- The default chunk size is `CHECK_SELF_BULK_MAX_ITEMS` (1000). Consumers can override it via `bulkCheckConfig.bulkRequestLimit` on `ApiConfig`.
- `resolveBulkChunkSize` treats non-positive values (0, negative) as "use the default." Only positive numbers override the limit.
- Chunks are dispatched with `Promise.all` -- all chunks fly concurrently.
- Results are reassembled with `flatMap` to preserve the original item order across chunks.
- The `consistencyToken` from the **last** chunk response is used as the aggregate token.
- If any chunk fails, the entire `Promise.all` rejects. There is no partial-success handling.
- Empty `items` arrays are sent directly to the API without chunking.

### Adding a New Endpoint

1. Define request/response types as unexported types in `api-client.ts` (only export what the React layer needs).
2. Implement error handling to throw `SelfAccessCheckError` on HTTP errors (inline as `checkSelf` does, or via `makeRequest` as `fetchSelfBulk` does).
3. Export the function and any response types the hooks layer will consume.

## Transformers (`transformers.ts`)

### AllowedEnum Mapping

The API returns an enum string, not a boolean. `mapAllowedEnum` converts:
- `ALLOWED_TRUE` -> `true`
- `ALLOWED_FALSE` -> `false`
- `ALLOWED_UNSPECIFIED` -> `false`
- Unknown/default -> `false`

Always use `mapAllowedEnum` rather than comparing strings directly.

### Transformer Conventions

- `transformSingleResponse` maps a `CheckSelfResponse` to `SelfAccessCheckResultItem`. It takes the original `resource` object so the caller gets back the same reference they passed in.
- `transformBulkResponse` uses index-based correlation -- `response.pairs[i]` corresponds to `originalResources[i]`. The API guarantees response order matches request order.
- Per-item errors from the bulk response (`pair.error`) are attached to the result item, not thrown. Top-level HTTP errors are thrown; per-item errors are data.

## Workspace Client (`workspace-client.ts`)

- Fetches workspace IDs from the RBAC v2 API at `/api/rbac/v2/workspaces/?type={root|default}`.
- This is a separate API from the Kessel access check endpoints. The base URL may differ.
- Supports an injectable `httpClient` parameter (defaults to global `fetch`) for testability and SSR.
- Auth is configurable via `WorkspaceAuthRequest`: callers can pass explicit `headers` (e.g., `Authorization: Bearer ...`) or rely on cookie-based auth.
- Strips trailing slashes from `rbacBaseEndpoint` before constructing the URL.
- Returns the first workspace from `data[]`. If `data` is empty, throws `SelfAccessCheckError` with code 404.

## Consistency Tokens

- Single checks accept `options.consistency` with `minimizeLatency` and/or `atLeastAsFresh` fields.
- Bulk checks pass `consistency` at the top level of `CheckSelfBulkRequest`, and it is forwarded to every chunk.
- Consistency is omitted from the request body entirely when not provided (spread conditional).

## Testing Conventions

- `api-client.test.ts` uses MSW (`server` from `../api-mocks/msw-server`) for integration-style testing. The standard setup/teardown pattern is:
  ```
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  ```
- `workspace-client.test.ts` uses `jest.fn()` to mock `global.fetch` directly (no MSW). This is intentional -- workspace tests need fine-grained control over individual response shapes.
- Chunking tests capture `requestBodies` via a custom MSW handler to assert chunk sizes and order.
- When testing `bulkRequestLimit`, set it to small values (1, 2, 3) to verify chunking without creating thousands of items.

## Exported API Surface

Only these are re-exported from `src/index.ts`:
- `fetchRootWorkspace`, `fetchDefaultWorkspace` (functions)
- `WorkspaceAuthRequest`, `HttpClient` (types)

`checkSelf`, `checkSelfBulk`, `ApiConfig`, `BulkCheckConfig`, and transformer functions are internal -- consumed by the hooks layer but not exposed to package consumers.
