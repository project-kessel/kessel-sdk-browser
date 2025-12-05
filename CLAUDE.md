# CLAUDE.md

This file provides context and guidelines for AI assistants working on this project.

## Project Overview

**Package Name**: `@redhat-cloud-services/frontend-kessel-access-checks`

**Purpose**: A React SDK for performing granular and bulk access checks against the Kessel access check service. This package provides a standardized way to verify user permissions for resources like workspaces, inventory groups, and other entities.

**Status**: Work in Progress (WIP)

**License**: Apache-2.0

## Architecture

### Design Decisions

1. **Provider/Context Pattern**: Uses React Context for centralized state management
   - Enables automatic caching and request deduplication
   - Lifecycle-aware data layer
   - Avoids prop drilling
   - Easy to test by swapping providers

2. **Component Naming Convention**: Uses `AccessCheck.Provider` instead of `AccessChecksProvider`
   - Namespace pattern for better organization
   - Matches modern React library conventions

3. **TypeScript First**: Full TypeScript implementation with strict type checking

4. **Minimal Dependencies**: Only React as a peer dependency to keep the bundle small

5. **Self-Service Only**: All access checks are performed on behalf of the authenticated user (no cross-user checks)

6. **NX Build System**: Uses NX for build orchestration, intelligent caching, and task execution
   - Caches build and test results for faster subsequent runs
   - Provides consistent local and CI/CD experience
   - Enables efficient monorepo-style tooling even in single-package setup
   - Based on configuration from platform-frontend-ai-toolkit

### Current State

**Note**: This is a barebones implementation. The components and hooks are scaffolded but contain minimal logic:

- `AccessCheck.Provider`: Renders children only, accepts `baseUrl` and `apiPath` props, no context implementation yet
- `useSelfAccessCheck`: Returns `{ data: undefined, loading: false, error: undefined }` structure and logs to console
  - Supports three overloads: single resource check, bulk same-relation check, and bulk nested-relations check

## Project Structure

```
kessel-access-checks/
├── src/
│   ├── AccessCheckProvider.tsx    # Provider component (barebones)
│   ├── AccessCheckProvider.test.tsx
│   ├── hooks.ts                   # Access check hooks (barebones)
│   ├── hooks.test.tsx
│   ├── types.ts                   # TypeScript type definitions
│   ├── setupTests.ts              # Jest setup
│   └── index.ts                   # Main exports
├── dist/                          # Compiled output (generated)
├── .github/
│   └── workflows/
│       └── pr-checks.yml          # CI/CD workflow
├── nx.json                        # NX workspace configuration
├── project.json                   # NX project configuration
├── jest.config.js                 # Jest configuration (extends NX preset)
├── jest.preset.js                 # NX Jest preset
├── tsconfig.json                  # TypeScript configuration
├── tsconfig.base.json             # Base TypeScript configuration
├── tsconfig.spec.json             # TypeScript configuration for tests
├── eslint.config.mjs              # ESLint configuration
├── package.json
├── README.md
├── LICENSE
└── CLAUDE.md                      # This file
```

## Backend API Integration

This SDK is designed to work with two REST endpoints (not yet implemented in the frontend):

### 1. Self Access Check
**POST** `/api/inventory/v1beta2/checkself`

Checks if the current user has the specified level of access to the provided resource.

**Request Body**:
```json
{
  "object": {
    "resourceId": "e07f0bbd-4743-404f-8dca-14d92026b52c",
    "resourceType": "workspace"
  },
  "relation": "view"
}
```

**Response**:
```json
{
  "allowed": "ALLOWED_TRUE"
}
```

**Allowed values**: `ALLOWED_UNSPECIFIED`, `ALLOWED_TRUE`, or `ALLOWED_FALSE`

### 2. Bulk Self Access Check
**POST** `/api/inventory/v1beta2/checkselfbulk`

Checks if the current user has the specified level of access to multiple resources.

**Request Body**:
```json
{
  "items": [
    {
      "object": {
        "resourceId": "3f2a1c9e-5b6d-4a1f-8c3b-2d7e9f01a2b3",
        "resourceType": "workspace"
      },
      "relation": "delete"
    },
    {
      "object": {
        "resourceId": "a8d4c2f1-9e0b-4d59-8a7e-3c1d5f6b8e90",
        "resourceType": "workspace"
      },
      "relation": "view"
    }
  ],
  "consistency": {
    "minimizeLatency": true
  }
}
```

**Response**:
```json
{
  "pairs": [
    {
      "request": {
        "object": {
          "resourceId": "3f2a1c9e-5b6d-4a1f-8c3b-2d7e9f01a2b3",
          "resourceType": "workspace"
        },
        "relation": "delete"
      },
      "item": {
        "allowed": "ALLOWED_TRUE"
      }
    },
    {
      "request": {
        "object": {
          "resourceId": "a8d4c2f1-9e0b-4d59-8a7e-3c1d5f6b8e90",
          "resourceType": "workspace"
        },
        "relation": "view"
      },
      "item": {
        "allowed": "ALLOWED_FALSE"
      },
      "error": {
        "code": 403,
        "message": "Access denied",
        "details": []
      }
    }
  ],
  "consistencyToken": {
    "token": "ZGVhZGJlZWY="
  }
}
```

## Development Guidelines

### Code Style

1. **TypeScript**: Use strict type checking, avoid `any` when possible
2. **React**:
   - No need for `import React` in files (React 17+ JSX transform)
   - Use functional components with hooks
   - Use TypeScript for prop validation (not PropTypes)
3. **Console Logs**: Allowed in the current barebones implementation
4. **Naming**:
   - Resources: objects with `id` and `type` properties (e.g., `{ id: 'uuid', type: 'workspace' }`)
   - Relations: simple strings (e.g., `'view'`, `'edit'`, `'delete'`, `'role_bindings_view'`)
   - Use camelCase for variables and functions
   - Use PascalCase for components

### Testing

- **Framework**: Jest with React Testing Library
- **Build Tool**: NX (provides caching and intelligent task execution)
- **Coverage**: All exports should have basic tests
- **Mocking**: Use `jest.spyOn` for console logs and future API calls
- **Current Coverage**: 18 tests covering Provider and hooks

**Run Tests**:
```bash
npm test                 # Run all tests with NX
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
```

**Note**: NX caches test results, so re-running tests without code changes will be instant.

### Linting

- **Tool**: ESLint with TypeScript and React plugins
- **Config**: Modern flat config format (eslint.config.mjs)
- **Rules**: Reasonable defaults, not overly strict

**Run Linter**:
```bash
npm run lint             # Check for issues
npm run lint:fix         # Auto-fix issues
```

### Building

- **Build Tool**: NX with TypeScript compiler (tsc)
- **Output**: `dist/` directory with .js and .d.ts files
- **Caching**: NX caches builds for faster subsequent builds

**Build**:
```bash
npm run build            # Build with NX (cached)
npm run typecheck        # Type check without emitting files
```

## CI/CD

### GitHub Actions Workflow

**File**: `.github/workflows/pr-checks.yml`

**Triggers**:
- Pull requests to `main` branch
- Direct pushes to `main` branch

**Jobs**:

1. **build-and-test** (Matrix: Node 18.x, 20.x)
   - Install dependencies (including NX)
   - Run linter via NX
   - Run tests via NX
   - Build package via NX
   - Verify build artifacts

2. **test-coverage**
   - Run tests with coverage via NX
   - Upload to Codecov (optional)

All checks must pass before merging PRs.

**Note**: NX is used for all build, test, and lint operations, providing consistent local and CI experiences with intelligent caching.

## Future Implementation Notes

When implementing the actual functionality:

### 1. Context Implementation

The Provider should:
- Create a React Context for access check state
- Accept `baseUrl` and `apiPath` props (with defaults, default apiPath: `/api/inventory/v1beta2`)
- Store authentication tokens from headers (JWT)
- Implement caching by resource type, id, and relation with TTL
- Implement request deduplication (dedupe identical type, id, relation entries)
- Handle loading and error states
- Manage consistency tokens for read-your-writes guarantees

### 2. Hook Implementation

**useSelfAccessCheck** (three overloads):

**Overload 1 - Single Resource Check**:
- Make POST request to `/api/inventory/v1beta2/checkself`
- Send `{ object: { resourceId, resourceType }, relation }` in request body
- Map response `allowed` enum to boolean (`ALLOWED_TRUE` → `true`, others → `false`)
- Return `{ data: { allowed: boolean, resource }, loading, error }`
- Cache results to prevent duplicate requests

**Overload 2 - Bulk Same Relation**:
- Make POST request to `/api/inventory/v1beta2/checkselfbulk`
- Send `{ items: [{ object, relation }], consistency }` in request body
- Handle automatic chunking if resources array > 1000 items (backend max limit)
- Preserve order when chunking
- Deduplicate identical entries (type, id, relation) before sending
- Map response pairs to `{ allowed: boolean, resource, relation, error? }`
- Return `{ data: array, loading, error, consistencyToken }`

**Overload 3 - Bulk Nested Relations**:
- Same as Overload 2, but each resource has its own `relation` property
- Each item in request body gets relation from resource object

**All overloads should**:
- Handle per-item errors in bulk responses
- Support consistency options (`minimizeLatency`, `atLeastAsFresh.token`)
- Extract and store consistency tokens for subsequent requests
- Implement request cancellation for unmounted components
- Cache results based on resource type + id + relation

### 3. Error Handling

- Network errors should be caught and logged
- Per-item errors in bulk responses should be included in result data
- Invalid resource types or relations should warn in development
- Failed requests should not crash the application
- Consider retry logic for transient failures
- Structured error objects: `{ code, message, details }`

### 4. Performance Considerations

- Debounce rapid consecutive checks
- Automatic chunking for bulk requests exceeding backend limit (1000 items)
- Deduplicate identical checks before sending to backend
- Cache results by (type, id, relation) with configurable TTL
- Consider using React Query or SWR for data fetching
- Implement request cancellation for unmounted components
- Use consistency tokens to avoid stale results after updates
- Batch multiple checks when possible

## HCC-Specific Context

**Hybrid Cloud Console (HCC)**: The primary consumer of this package

- HCC wraps all applications in common chroming
- The `AccessCheck.Provider` will be configured at the chroming level
- Tenant applications only need to import the hooks
- JWT authentication is handled by HCC infrastructure

## Important Conventions

1. **No New Files Without Purpose**: Only create files that are absolutely necessary
2. **Prefer Editing**: Always prefer editing existing files over creating new ones
3. **No Documentation Files**: Don't create additional .md files unless explicitly requested
4. **Minimal Dependencies**: Avoid adding new dependencies unless necessary
5. **Security**: Never commit secrets, always validate on backend
6. **NX Tooling**: This project uses NX for build orchestration, caching, and task execution

## Resource Types and Relations Examples

**Resource Types**:
- `workspace`
- `group`
- `inventory_group`

**Relations**:
- `view`
- `edit`
- `delete`
- `create`
- `move`
- `rename`
- `role_bindings_view`
- `role_bindings_grant`
- `role_bindings_revoke`

**Usage Example**:
```javascript
// Single check
useSelfAccessCheck({
  relation: 'delete',
  resource: { id: 'uuid-123', type: 'workspace' }
});

// Bulk check - same relation
useSelfAccessCheck({
  relation: 'view',
  resources: [
    { id: 'uuid-1', type: 'workspace' },
    { id: 'uuid-2', type: 'group' }
  ]
});

// Bulk check - nested relations
useSelfAccessCheck({
  resources: [
    { id: 'uuid-1', type: 'workspace', relation: 'delete' },
    { id: 'uuid-2', type: 'workspace', relation: 'edit' }
  ]
});
```

## Common Tasks

### Add a New Export

1. Create the component/hook in `src/`
2. Add tests in `src/*.test.tsx`
3. Export from `src/index.ts`
4. Update types if needed
5. Run tests and build

### Update Dependencies

```bash
npm update              # Update all dependencies
npm outdated            # Check for outdated packages
```

### Publish to NPM

**Note**: Not yet configured. Will require:
1. npm login with Red Hat Cloud Services credentials
2. npm publish (respects publishConfig in package.json)
3. Version bump before publishing

## Related Resources

- [Kessel Relations API](https://github.com/project-kessel/relations-api)
- [Kessel Inventory API](https://github.com/project-kessel/inventory-api)
- [JIRA Epic: RHCLOUD-42267](https://issues.redhat.com/browse/RHCLOUD-42267)
- [Management Fabric Integration Tracking](https://docs.google.com/spreadsheets/d/1V3mH2pDgXOcxeyxt0fH8RnzzmDsKRDxKzDxxmuaP1mk/edit?usp=sharing)

## Questions?

If you're an AI assistant working on this project and need clarification:
1. Check the README.md for user-facing documentation
2. Review the architecture decisions above
3. Look at existing test files for patterns
4. Check the GitHub workflow for CI/CD expectations
5. Ask the developer for clarification on ambiguous requirements

---

**Last Updated**: December 2025
**Maintainers**: Red Hat Cloud Services Team
