---
name: update-api
description: Guide for modifying the Kessel access check API request/response format. Covers types, API client, transformers, MSW handlers, and tests. Use when the backend API contract changes (new fields, renamed fields, changed response shape) for the /checkself or /checkselfbulk endpoints.
---

# Update API Request/Response Format

When the Kessel access check API contract changes, multiple files must be updated in lockstep. This skill walks through each file in dependency order.

All paths below are relative to `packages/react-kessel-access-check/`.

## Step 1: Understand the change

Before editing code, clarify:

- Which endpoint changed? (`/checkself`, `/checkselfbulk`, or both)
- Is this a request change, response change, or both?
- Are fields added, renamed, removed, or restructured?
- Is this a breaking change for SDK consumers?

Check the OpenAPI spec at the repo root (`openapi.yaml`) if available, or reference the backend PR/docs describing the change.

## Step 2: Update types (`src/types.ts`)

This file defines all public TypeScript types. Update any types affected by the API change.

Key types to check:

- `SelfAccessCheckResource` — resource shape sent by consumers
- `SelfAccessCheckResourceWithRelation` — resource + relation for bulk nested
- `SelfAccessCheckParams` — single check hook params
- `BulkSelfAccessCheckParams` — bulk same-relation params
- `BulkSelfAccessCheckNestedRelationsParams` — bulk nested-relation params
- `CheckSelfBulkParamsItem` / `CheckSelfBulkParams` — API client bulk params
- `SelfAccessCheckResultItem` / `SelfAccessCheckResultItemWithRelation` — result items
- `SelfAccessCheckResult` / `BulkSelfAccessCheckResult` — hook return types
- `ConsistencyToken`, `ConsistencyOptions` — consistency fields
- `ReporterReference` — reporter shape
- `SelfAccessCheckError` — error shape

If adding optional fields, this is non-breaking. If changing or removing fields, mark the commit as a breaking change.

## Step 3: Update API client (`src/core/api-client.ts`)

This file contains the raw fetch logic and internal API types not exported to consumers.

Internal types to check:

- `CheckSelfRequest` — request body for `/checkself`
- `CheckSelfResponse` — response from `/checkself`
- `AllowedEnum` — `'ALLOWED_TRUE' | 'ALLOWED_FALSE' | 'ALLOWED_UNSPECIFIED'`
- `CheckSelfBulkRequestItem` — individual item in bulk request
- `CheckSelfBulkRequest` — full bulk request body
- `CheckSelfBulkResponseItem` / `CheckSelfBulkResponsePair` / `CheckSelfBulkResponse` — bulk response shapes

Functions to check:

- `checkSelf()` — builds request body from `SelfAccessCheckParams`, sends to `/checkself`
- `checkSelfBulk()` — builds bulk request, handles chunking (max `CHECK_SELF_BULK_MAX_ITEMS`), sends to `/checkselfbulk`
- `fetchSelfBulk()` — internal helper that makes the actual bulk fetch call
- `makeRequest()` — generic fetch wrapper with error handling

Pay attention to how request bodies are constructed (the `object` wrapper with `resourceId`, `resourceType`, `reporter`) and how responses are parsed.

## Step 4: Update transformers (`src/core/transformers.ts`)

Transformers convert between the raw API response and the hook's consumer-facing types.

Functions:

- `mapAllowedEnum()` — maps `AllowedEnum` string to boolean
- `transformSingleResponse()` — transforms `CheckSelfResponse` to `SelfAccessCheckResultItem`
- `transformBulkResponse()` — transforms `CheckSelfBulkResponse` to `SelfAccessCheckResultItemWithRelation[]`

If the response shape changes (new fields, renamed fields), update the transform logic here. If the allowed enum values change, update `mapAllowedEnum`.

## Step 5: Update hooks if needed (`src/hooks.ts`)

If the hook's return type or parameter types changed (from Step 2), verify `useSelfAccessCheck` still works correctly. The hook has three overloads:

1. **Single**: `(params: SelfAccessCheckParams)` returns `SelfAccessCheckResult`
2. **Bulk Same Relation**: `(params: BulkSelfAccessCheckParams)` returns `BulkSelfAccessCheckResult`
3. **Bulk Nested**: `(params: BulkSelfAccessCheckNestedRelationsParams)` returns `BulkSelfAccessCheckResult`

All three overload signatures, plus the implementation signature, must stay consistent.

## Step 6: Update MSW handlers

Three handler files need updating to match the new API shape:

### `src/api-mocks/handlers.ts` (default handlers)

This file provides the default MSW handlers used by `msw-server.ts`. It defines the baseline success responses for both endpoints. Update the response bodies to match the new format.

### `src/api-mocks/handlers/success-handlers.ts`

Named success scenarios. Each handler returns a specific success response shape. Update response bodies for:

- `singleCheckAllowed` / `singleCheckDenied`
- `bulkCheckAllAllowed` / `bulkCheckMixed` / `bulkCheckEmpty`

### `src/api-mocks/handlers/error-handlers.ts`

Named error scenarios. If the error response shape changed, update all error handlers. These cover: `badRequest`, `unauthorized`, `forbidden`, `notFound`, `rateLimited`, `internalServerError`, `serviceUnavailable`, `timeout`, `invalidJson`, `malformedJson`, `networkError`, and bulk variants.

### `src/api-mocks/handlers/index.ts`

Re-exports from the handler files. Update if new exports were added.

## Step 7: Update tests

### Unit tests

- `src/hooks.test.tsx` — test all three hook overloads with new format
- `src/hooks.bulkConfig.test.tsx` — test bulk configuration behavior
- `src/core/api-client.test.ts` — test request construction and response parsing

### Integration tests

- `src/__tests__/integration/` — update any tests that assert on response shapes

### Test utilities

- `src/api-mocks/test-utils.tsx` — update factory functions (`createMockResource`, etc.) if resource shape changed

## Step 8: Verify

Run all checks:

```bash
npm run lint
npm test
npx tsc --noEmit -p packages/react-kessel-access-check/tsconfig.lib.json
npx tsc --noEmit -p packages/react-kessel-access-check/tsconfig.spec.json
npm run build
```

## Step 9: Update public exports if needed (`src/index.ts`)

If new types were added to `src/types.ts` that consumers need, export them from `src/index.ts`.

## Commit convention

Use the appropriate commit type and scope:

```
fix(react-kessel-access-check): align API types with v1beta2 spec update
feat(react-kessel-access-check): add new field to access check response
feat(react-kessel-access-check)!: restructure access check request format
```
