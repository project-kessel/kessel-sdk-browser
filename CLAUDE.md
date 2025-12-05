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

- `AccessCheck.Provider`: Renders children only, no context implementation yet
- `useAccessCheck`: Returns `undefined` and logs to console
- `useBulkAccessCheck`: Returns `undefined` and logs to console

## Project Structure

```
kessel-access-checks/
├── src/
│   ├── AccessCheckProvider.tsx    # Provider component (barebones)
│   ├── AccessCheckProvider.test.tsx
│   ├── hooks.ts                   # Access check hooks (barebones)
│   ├── hooks.test.tsx
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

### 1. Single Access Check
**GET** `/api/inventory/v2/accesscheck?check=<name_of_check>`

**Response**: `true` or `false`

**Example**:
```
GET /api/inventory/v2/accesscheck?check=inventory_group_view
Response: true
```

### 2. Bulk Access Check
**POST** `/api/inventory/v2/accesscheck/<name_of_check>`

**Request Body**: Array of resource UUIDs
```json
["uuid-1", "uuid-2", "uuid-3"]
```

**Response**: Array of UUIDs where check is true
```json
["uuid-1", "uuid-3"]
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
   - Check names follow pattern: `<resource>_<action>` (e.g., `inventory_group_view`, `workspaces_delete`)
   - Use camelCase for variables and functions
   - Use PascalCase for components

### Testing

- **Framework**: Jest with React Testing Library
- **Build Tool**: NX (provides caching and intelligent task execution)
- **Coverage**: All exports should have basic tests
- **Mocking**: Use `jest.spyOn` for console logs and future API calls
- **Current Coverage**: 14 tests covering Provider and hooks

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
- Accept `baseUrl` and `apiPath` props (with defaults)
- Store authentication tokens from headers
- Implement request caching/deduplication
- Handle loading and error states

### 2. Hook Implementation

**useAccessCheck**:
- Make GET request to `/api/inventory/v2/accesscheck?check={name}`
- Return boolean or undefined (while loading)
- Cache results to prevent duplicate requests
- Handle errors gracefully

**useBulkAccessCheck**:
- Make POST request to `/api/inventory/v2/accesscheck/{name}`
- Send array of resource IDs in request body
- Return array of IDs where check is true, or undefined (while loading)
- Cache results based on check name + resource IDs

### 3. Error Handling

- Network errors should be caught and logged
- Invalid check names should warn in development
- Failed requests should not crash the application
- Consider retry logic for transient failures

### 4. Performance Considerations

- Debounce rapid consecutive checks
- Batch multiple checks when possible
- Consider using React Query or SWR for data fetching
- Implement request cancellation for unmounted components

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

## Access Check Naming Examples

- `inventory_group_view`
- `inventory_group_update`
- `inventory_group_delete`
- `workspaces_view`
- `workspaces_create`
- `workspaces_update`
- `workspaces_delete`
- `workspaces_rename`

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
