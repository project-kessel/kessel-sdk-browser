# React SDK Layer Guidelines

This directory contains the React-specific layer: hooks, Provider/Context, types, and the public API surface for `@project-kessel/react-kessel-access-check`.

## Package Architecture

```
src/
  index.ts               # Public API -- every consumer import resolves here
  types.ts               # All TypeScript types (single source of truth)
  AccessCheckContext.tsx  # createContext + useAccessCheckContext guard
  AccessCheckProvider.tsx # AccessCheck.Provider component
  hooks.ts               # useSelfAccessCheck (3 overloads)
  core/                  # Pure functions, no React (see core/GUIDELINES.md)
  api-mocks/             # MSW test infrastructure (excluded from build)
  __tests__/integration/ # Integration test suites (excluded from build)
```

## Provider/Context Pattern

- `AccessCheck.Provider` is exported as a namespace object (`AccessCheck = { Provider }`) -- not as a bare component. Consumers write `<AccessCheck.Provider>`, not `<AccessCheckProvider>`.
- The Provider accepts `baseUrl`, `apiPath`, and optional `bulkCheckConfig`. These are memoized into an `ApiConfig` context value.
- `useAccessCheckContext()` throws if called outside the Provider. This is the only way hooks get their configuration.
- Provider validates `baseUrl` and `apiPath` with `console.warn` in non-production environments only.

## Hook Design: `useSelfAccessCheck`

### Three Overloads

1. **Single resource**: `{ relation, resource }` -- returns `SelfAccessCheckResult` with `data: { allowed, resource }`
2. **Bulk same-relation**: `{ relation, resources }` -- returns `BulkSelfAccessCheckResult` with `data: SelfAccessCheckResultItemWithRelation[]`
3. **Bulk nested-relations**: `{ resources }` where each resource has its own `relation` -- returns `BulkSelfAccessCheckResult`

The `resources` param requires `NotEmptyArray<T>` (`[T, ...T[]]`) in the type signatures. In tests, cast with `as [Type, ...Type[]]` or `as any` for empty-array edge cases.

### Rules of Hooks Compliance

Both `useSingleAccessCheck` and `useBulkAccessCheck` are always called unconditionally inside `useSelfAccessCheck`. An `enabled` boolean flag controls which one actually performs work. This avoids conditional hook calls while preventing duplicate API requests.

### Dependency Keys for useEffect

- Single checks depend on: `config`, `enabled`, `resource?.id`, `resource?.type`, `resource?.reporter`, `relation`, `consistencyKey`
- Bulk checks depend on: `config`, `enabled`, `resourcesKey`, `sharedRelation`, `consistencyKey`
- `useBulkResourcesKey` and `useConsistencyKey` are `useMemo` wrappers that produce stable JSON strings for dependency comparison. This prevents re-fetching on every render when object references change but values are identical.
- The eslint-disable for `react-hooks/exhaustive-deps` is intentional -- the key values represent the actual dependencies.

### Cleanup Pattern

Each internal hook creates an `AbortController` and an `isMounted` flag. On cleanup:
- `isMounted = false` prevents state updates after unmount
- `abortController.abort()` cancels in-flight requests

The `AbortController` is created but the signal is not currently wired to `fetch`. The `isMounted` guard is the active protection against memory leaks.

### Error Handling

- Top-level HTTP errors (401, 403, 500, network failures) go into the `error` field on the hook result.
- Per-item errors in bulk responses appear on individual `data[i].error` -- the top-level `error` remains undefined.
- `handleApiError` casts the thrown error to `{ code, message, details }` with a `details || []` fallback.
- Always check **both** `result.error` (request-level) and `result.data[i].error` (item-level) when consuming bulk results.

## Type Conventions (`types.ts`)

- All shared types live in `types.ts` -- do not define types inline in component or hook files.
- `SelfAccessCheckResource` uses `[key: string]: unknown` to allow additional properties. Consumers can attach metadata that passes through to results.
- `ReporterReference` requires `type: string` with optional `instanceId`. The `type` is typically `'rbac'`.
- Result types use a common base (`SelfAccessCheckResultCommon`) extended with check-type-specific fields.

## Public API (`index.ts`)

Exports are intentionally minimal. Only re-export what consumers need:
- `AccessCheck` (namespace with `Provider`)
- `useSelfAccessCheck` (hook)
- `useAccessCheckContext` (escape hatch for advanced use)
- `fetchRootWorkspace`, `fetchDefaultWorkspace` (standalone async functions)
- Type exports for consumers' TypeScript usage

Internal helpers (`checkSelf`, `checkSelfBulk`, transformers, `ApiConfig`, `BulkCheckConfig`) are not exported. If you add a new public export, update `index.ts`.

## Testing

### Test File Layout

- Unit tests: colocated as `*.test.tsx` / `*.test.ts` next to source files
- Integration tests: `__tests__/integration/*.test.tsx` -- one file per concern
- Test infrastructure: `api-mocks/` (handlers, server, utilities)

### MSW Setup

Two patterns exist in the codebase -- use the right one for each test type:

**Integration tests** (and `api-client.test.ts`, `hooks.bulkConfig.test.tsx`): Use the shared MSW server.
```typescript
import { server } from '../api-mocks/msw-server';
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**Unit tests** (`hooks.test.tsx`, `AccessCheckProvider.test.tsx`, `workspace-client.test.ts`): Use `jest.fn()` to mock `global.fetch` directly. Reset with `mockFetch.mockClear()` in `beforeEach`.

### Test Wrapper

Use `createTestWrapper()` from `api-mocks/test-utils.tsx` for `renderHook` calls:
```typescript
const { result } = renderHook(
  () => useSelfAccessCheck({ relation: 'view', resource }),
  { wrapper: createTestWrapper() }
);
```

Override defaults with `createTestWrapper({ baseUrl: '...', bulkCheckConfig: { bulkRequestLimit: 2 } })`.

### Test Factories

- `createMockResource(overrides?)` -- defaults to `{ id: 'test-resource-id', type: 'workspace', reporter: { type: 'rbac' } }`
- `createMockResources(count, overrides?)` -- generates indexed resources (`resource-0000`, `resource-0001`, ...)
- `createMaliciousResource(type)` -- XSS, SQL injection, JSON injection, and Unicode payloads for security tests
- `expectValidErrorStructure(error, includeDetails?)` -- asserts `{ code: number, message: string }` shape

### Handler Library

Override default handlers in specific tests:
```typescript
import { errorHandlers } from '../api-mocks/handlers/error-handlers';
server.use(errorHandlers.unauthorized);  // single endpoint
server.use(errorHandlers.unauthorizedBulk);  // bulk endpoint
```

Handlers exist for both `/checkself` and `/checkselfbulk` endpoints. Error handlers are named with a `Bulk` suffix for the bulk variant (e.g., `forbidden` vs `forbiddenBulk`).

### setupTests.ts

Polyfills `TextEncoder`, `TextDecoder`, `ReadableStream`, `TransformStream`, `WritableStream`, `BroadcastChannel`, and `cross-fetch` for the jsdom test environment. MSW v2 requires these.

## Build and Lint

- Build uses `@nx/js:tsc` with `tsconfig.lib.json`. Test files, `api-mocks/`, and `__tests__/` are excluded from the build.
- ESLint allows `no-explicit-any` in test files. Production code should avoid `any` (warning level).
- `no-redeclare` uses the TypeScript variant (`@typescript-eslint/no-redeclare`) to support function overloads.
- TypeScript strict mode is enabled. `noUnusedLocals` and `noImplicitReturns` are enforced.

## Commit Conventions

- Scope is required: `feat(react-kessel-access-check): ...`
- Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `revert`, `ci`, `build`
- `feat` triggers a minor version bump, `fix` triggers a patch bump
- Breaking changes: use `!` suffix or `BREAKING CHANGE:` in the commit footer
