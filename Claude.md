# Claude.md - Project Context for AI Assistants

This document provides essential context about the Kessel SDK Browser monorepo for AI assistants working on this codebase.

## Project Overview

**Kessel SDK Browser** is an NX-based monorepo containing browser-based SDK packages for Project Kessel's authorization and inventory APIs. Currently contains one package:

- **@project-kessel/react-kessel-access-check**: React SDK for performing granular and bulk access checks against the Kessel access check service

### What is Project Kessel?

Project Kessel is Red Hat's authorization system that provides fine-grained access control for resources. This SDK allows frontend applications to check user permissions for UI rendering and user interactions.

### Key Concepts

- **Access Checks**: Permission checks that determine if a user has a specific relation to a resource
- **Relations**: Actions a user can perform (e.g., `view`, `edit`, `delete`, `create`)
- **Resources**: Objects with `id`, `type`, and `reporter` fields (e.g., workspaces, groups)
- **Reporter**: Identifies the service making the access check request (usually `{ type: 'rbac' }`)
- **Bulk Checks**: Single API request checking multiple resources or relations
- **Consistency Tokens**: Used for read-your-writes consistency after making changes

## Architecture

### Provider/Context Pattern

The SDK uses React Context to provide centralized access checking:

```
<AccessCheck.Provider> → React Context → useSelfAccessCheck() hook
```

**Why this pattern?**
- Centralized configuration (baseUrl, apiPath)
- Automatic lifecycle management (cleanup on unmount)
- Future-ready for caching and request deduplication
- Clean integration with React features (Error Boundaries, Suspense)
- Better testability (swap providers in tests)

### Hook Overloads

The `useSelfAccessCheck` hook has three TypeScript overloads:

1. **Single Resource Check**: `{ relation, resource }`
2. **Bulk Same Relation**: `{ relation, resources: [...] }`
3. **Bulk Nested Relations**: `{ resources: [{ relation, ...resource }] }`

TypeScript's function overloading automatically provides the correct return type based on input parameters.

### API Integration

Backend endpoints:
- `POST /api/kessel/v1beta2/checkself` - Single access check
- `POST /api/kessel/v1beta2/checkselfbulk` - Bulk access checks

All requests include JWT token in Authorization header. The backend authenticates the user and performs checks on their behalf (no cross-user checks).

## Codebase Structure

```
kessel-sdk-browser/
├── packages/
│   └── react-kessel-access-check/
│       ├── src/
│       │   ├── core/
│       │   │   ├── api-client.ts          # Fetch logic for API calls
│       │   │   └── transformers.ts        # Request/response transformations
│       │   ├── api-mocks/                 # Test infrastructure
│       │   │   ├── handlers/
│       │   │   │   ├── success-handlers.ts # MSW success scenarios
│       │   │   │   ├── error-handlers.ts   # MSW error scenarios
│       │   │   │   └── index.ts           # Handler exports
│       │   │   ├── msw-server.ts          # MSW server setup
│       │   │   └── test-utils.tsx         # Test helper functions
│       │   ├── __tests__/
│       │   │   ├── integration/
│       │   │   │   └── critical-scenarios.test.tsx
│       │   │   └── docs/                  # Test documentation
│       │   ├── AccessCheckContext.tsx     # React Context definition
│       │   ├── AccessCheckProvider.tsx    # Provider component
│       │   ├── hooks.ts                   # useSelfAccessCheck hook
│       │   ├── types.ts                   # TypeScript types
│       │   └── index.ts                   # Public API exports
│       ├── README.md                      # Package documentation
│       ├── CHANGELOG.md                   # Auto-generated changelog
│       ├── package.json                   # Package metadata
│       └── project.json                   # NX project configuration
├── examples/
│   └── demo-react-kessel-access-check/    # Example React app
├── .github/
│   └── workflows/
│       └── ci.yaml                        # CI/CD pipeline with automated releases
├── package.json                           # Root workspace configuration
├── nx.json                                # NX workspace configuration
├── tsconfig.base.json                     # Shared TypeScript config
├── jest.preset.js                         # Shared Jest config
└── eslint.config.mjs                      # Shared ESLint config
```

### Key Files

- **`src/hooks.ts`**: Main hook implementation with three overloads
- **`src/core/api-client.ts`**: API request logic, fetch wrapper
- **`src/core/transformers.ts`**: Transforms between SDK types and API format
- **`src/types.ts`**: All TypeScript type definitions
- **`src/AccessCheckProvider.tsx`**: Provider component with config
- **`src/index.ts`**: Public API surface (what gets exported from the package)

## Development Workflow

### Installation

```bash
npm install
```

### Building

```bash
# Build all packages
npm run build

# Build specific package
npx nx run @project-kessel/react-kessel-access-check:build
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Test specific package
npx nx test react-kessel-access-check

# Run only integration tests
npx nx test react-kessel-access-check --testPathPattern=integration

# Run specific test file
npx nx test react-kessel-access-check --testPathPattern=critical-scenarios
```

### Linting

```bash
# Lint all packages
npm run lint

# Fix linting issues
npm run lint:fix
```

### Type Checking

```bash
npm run typecheck
```

### Running Examples

```bash
cd examples/demo-react-kessel-access-check
npm run dev
```

## Automated Releases

This repo uses automated releases via NX and GitHub Actions. When commits are pushed to `master`:

1. Conventional commit messages are analyzed
2. Version is bumped automatically:
   - `fix:` → patch (0.0.x)
   - `feat:` → minor (0.x.0)
   - `BREAKING CHANGE:` or `!` → major (x.0.0)
3. CHANGELOG.md is updated
4. Git tags are created
5. Packages are published to npm

**Commit Message Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Examples:**
```bash
fix(react-kessel-access-check): resolve TypeScript type errors
feat(react-kessel-access-check): add caching for access check results
feat(react-kessel-access-check)!: redesign API surface
```

## Important Patterns and Conventions

### TypeScript Function Overloads

The `useSelfAccessCheck` hook uses TypeScript function overloads to provide different return types based on input parameters. When modifying this hook:

1. Update all three overload signatures in the type definition
2. Update the implementation signature (the one with the function body)
3. Add type guards to distinguish between overloads at runtime
4. Update tests for all three overloads

### Error Handling

- **Top-level errors**: Network failures, auth errors → returned in `error` field
- **Per-item errors**: Individual check failures in bulk requests → returned in `check.error` field
- Always handle both error types in bulk checks

### Testing Philosophy

- Use MSW (Mock Service Worker) for API mocking
- Test all three hook overloads separately
- Test loading states, error states, and success states
- Test edge cases (empty arrays, network errors, malformed responses)
- Separate unit tests and integration tests into different directories
- Files:
  - Unit tests: `hooks.test.tsx`, `api-client.test.ts`, `AccessCheckProvider.test.tsx`
  - Integration tests: `__tests__/integration/critical-scenarios.test.tsx`

#### MSW Handler Library

Integration tests use a comprehensive MSW handler library:
- `api-mocks/handlers/success-handlers.ts` - Happy path scenarios
- `api-mocks/handlers/error-handlers.ts` - Error scenarios (401, 403, 404, 500, etc.)
- `api-mocks/test-utils.tsx` - Test utilities and factories

**Using MSW handlers in tests:**
```typescript
import { server } from '../api-mocks/msw-server';
import { errorHandlers } from '../api-mocks/handlers/error-handlers';

// Override default handler for specific test
test('should handle 401 error', async () => {
  server.use(errorHandlers.unauthorized);
  // ... test code
});
```

#### Test Utilities

Helper functions for writing tests:
- `createTestWrapper(config?)` - Provider wrapper for renderHook
- `createMockResource(overrides?)` - Factory for mock resources
- `createMockResources(count, overrides?)` - Generate multiple resources
- `createMaliciousResource(type)` - Security testing payloads (XSS, SQL injection, etc.)
- `createInvalidReporterResource(variant)` - Invalid reporter configurations ('missing', 'null', 'malformed')
- `expectValidErrorStructure(error, includeDetails?)` - Validates error object shape
- `waitMs(ms)` - Promise delay for testing loading states
- `isApiError(error)` - Type guard for API errors

**Example tests:**
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import {
  createTestWrapper,
  createMockResource,
  createMockResources,
  createInvalidReporterResource,
  expectValidErrorStructure
} from '../api-mocks/test-utils';

// Basic permission check
test('should check permission', async () => {
  const resource = createMockResource({ id: 'ws-123' });
  const { result } = renderHook(
    () => useSelfAccessCheck({ relation: 'view', resource }),
    { wrapper: createTestWrapper() }
  );

  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data?.allowed).toBe(true);
});

// Bulk check with multiple resources
test('should check multiple resources', async () => {
  const resources = createMockResources(5); // Creates 5 resources
  const { result } = renderHook(
    () => useSelfAccessCheck({ relation: 'view', resources }),
    { wrapper: createTestWrapper() }
  );

  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data).toHaveLength(5);
});

// Error validation
test('should handle missing reporter field', async () => {
  const resource = createInvalidReporterResource('missing');
  const { result } = renderHook(
    () => useSelfAccessCheck({ relation: 'view', resource }),
    { wrapper: createTestWrapper() }
  );

  await waitFor(() => expect(result.current.loading).toBe(false));
  expectValidErrorStructure(result.current.error, true);
  expect(result.current.error?.code).toBe(400);
});
```

### Code Organization

- **Core utilities** (`src/core/`): Pure functions, no React dependencies
- **React components** (`src/*.tsx`): Provider, Context
- **React hooks** (`src/hooks.ts`): Hook implementations
- **Types** (`src/types.ts`): All TypeScript types in one file
- **Public API** (`src/index.ts`): Only export what consumers need

## Common Tasks

### Adding a New Hook Parameter

1. Add type to `src/types.ts`
2. Update hook overload signatures in `src/hooks.ts`
3. Update transformer in `src/core/transformers.ts`
4. Add tests in `src/hooks.test.tsx`
5. Update README with new parameter documentation

### Adding a New Resource Type

Resource types are not hardcoded in the SDK. They're strings passed through to the API. No code changes needed in the SDK, but you may want to update examples and documentation.

### Modifying API Request/Response Format

1. Update transformer functions in `src/core/transformers.ts`
2. Update API client in `src/core/api-client.ts` if needed
3. Update MSW handlers in `src/api-mocks/handlers/` for tests:
   - `success-handlers.ts` for happy path scenarios
   - `error-handlers.ts` for error scenarios
4. Update types in `src/types.ts` if needed
5. Update tests to match new format

### Adding a New Provider Configuration Option

1. Add prop to `AccessCheckProviderProps` in `src/types.ts`
2. Update `AccessCheckProvider.tsx` to accept and use the prop
3. Update context value type if needed
4. Add tests in `src/AccessCheckProvider.test.tsx`
5. Update README documentation

## Important Context for Changes

### Security Considerations

- Frontend access checks are for UX only (hiding/disabling UI elements)
- Always enforce permissions on the backend for actual operations
- All checks are "self" checks (current user only, no cross-user checks)
- JWT tokens are sent via credentials: 'include' for cookie-based auth

### Performance Considerations

- Bulk checks are more efficient than multiple single checks
- Consistency tokens enable read-your-writes guarantees but may increase latency
- Future: caching and request deduplication planned but not implemented

### Breaking Changes to Avoid

- Changing public API surface (`src/index.ts` exports)
- Changing hook parameter types (breaks TypeScript consumers)
- Changing return value structure (breaks consumer code)
- Removing or renaming exported types

### Non-Breaking Changes

- Adding new optional parameters
- Adding new exports
- Internal refactoring (transformers, api-client)
- Performance improvements
- Bug fixes that don't change behavior

## NX Workspace

This is an NX monorepo. NX provides:

- Intelligent caching (build/test results cached)
- Task execution (dependency graph)
- Code generation (scaffolding)
- Workspace analytics

**NX Commands:**
```bash
# Run target for specific project
npx nx run @project-kessel/react-kessel-access-check:build
npx nx run @project-kessel/react-kessel-access-check:test

# Clear NX cache
npx nx reset

# View dependency graph
npx nx graph
```

## Related Resources

- [Kessel Relations API](https://github.com/project-kessel/relations-api) - OpenAPI spec
- [Kessel Inventory API](https://github.com/project-kessel/inventory-api) - Backend service
- [Project Kessel](https://github.com/project-kessel) - Main project
- [JIRA Epic: RHCLOUD-42267](https://issues.redhat.com/browse/RHCLOUD-42267) - Access Checks SDK
- [JIRA Epic: RHCLOUD-42186](https://issues.redhat.com/browse/RHCLOUD-42186) - Bulk Access Check API

## Tips for AI Assistants

1. **Always read before editing**: Use the Read tool to understand existing code before making changes
2. **Follow existing patterns**: Match the code style and patterns already in use
3. **Update all related files**: Changes to types often require updates to hooks, transformers, and tests
4. **Run tests**: Use `npm test` to verify changes don't break existing functionality
5. **Update documentation**: If changing public API, update README and examples
6. **Use conventional commits**: Follow the commit message format for proper versioning
7. **Check TypeScript**: Run `npm run typecheck` to catch type errors
8. **Test all overloads**: When modifying `useSelfAccessCheck`, test all three overloads
9. **Consider breaking changes**: Mark breaking changes with `!` or `BREAKING CHANGE:` in commits
10. **Keep it simple**: Avoid over-engineering, premature optimization, or unnecessary abstractions
