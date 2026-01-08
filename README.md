# @project-kessel/frontend-kessel-access-checks

A React SDK for performing granular and bulk access checks against the Kessel access check service. This package provides a standardized way to verify user permissions for resources like workspaces, inventory groups, and other entities in your application.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [AccessCheck.Provider](#accesscheckprovider)
  - [useSelfAccessCheck](#useselfaccesscheck)
- [Usage Examples](#usage-examples)
  - [Single Resource Check](#single-resource-check)
  - [Bulk Resource Check - Same Relation](#bulk-resource-check---same-relation)
  - [Bulk Resource Check - Nested Relations](#bulk-resource-check---nested-relations)
  - [Conditional Rendering](#conditional-rendering)
  - [Filtering Resources](#filtering-resources)
  - [Using Consistency Tokens](#using-consistency-tokens)
- [Configuration](#configuration)
- [TypeScript Support](#typescript-support)
- [Architecture](#architecture)
- [Backend API Integration](#backend-api-integration)
- [HCC-Specific Usage](#hcc-specific-usage)
- [Best Practices](#best-practices)
- [Contributing](#contributing)
- [License](#license)
- [Related Resources](#related-resources)

## Features

- **Single Access Checks**: Verify if a user has a specific relation to a resource
- **Bulk Access Checks**: Efficiently check permissions for multiple resources in a single request
- **Nested Relations**: Support for checking different relations on different resources in a single bulk request
- **Consistency Tokens**: Support for read-your-writes consistency guarantees
- **React Context Integration**: Centralized, lifecycle-aware data layer with automatic caching and deduplication
- **TypeScript Support**: Full type definitions with function overloads for enhanced developer experience
- **Configurable**: Flexible configuration for base URL and API path
- **Self-Service Checks Only**: All checks are performed on behalf of the authenticated user
- **Framework Agnostic Backend**: Works with any REST API implementing the Kessel access check specification

## Installation

```bash
npm install @project-kessel/frontend-kessel-access-checks
```

or

```bash
yarn add @project-kessel/frontend-kessel-access-checks
```

or

```bash
pnpm add @project-kessel/frontend-kessel-access-checks
```

## Quick Start

```jsx
import React from 'react';
import { AccessCheck, useSelfAccessCheck } from '@project-kessel/frontend-kessel-access-checks';

// 1. Wrap your application with the provider
function App() {
  return (
    <AccessCheck.Provider
      baseUrl="https://console.redhat.com"
      apiPath="/api/inventory/v1beta2"
    >
      <YourApplication />
    </AccessCheck.Provider>
  );
}

// 2. Use the hook in your components
function WorkspaceView({ workspaceId }) {
  const { data, loading, error } = useSelfAccessCheck({
    relation: 'view',
    resource: { id: workspaceId, type: 'workspace' }
  });

  if (loading) {
    return <Spinner />;
  }

  if (!data?.allowed) {
    return <div>You don't have permission to view this workspace.</div>;
  }

  return <div>Workspace Content...</div>;
}
```

## API Reference

### AccessCheck.Provider

The main provider component that wraps your application and provides access check context to all child components.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `baseUrl` | `string` | No | `window.location.origin` | The base URL for the API server |
| `apiPath` | `string` | No | `'/api/inventory/v1beta2'` | The base path for the access check API endpoints |
| `children` | `ReactNode` | Yes | - | Child components that will have access to the access check hooks |

#### Example

```jsx
<AccessCheck.Provider
  baseUrl="https://console.redhat.com"
  apiPath="/api/inventory/v1beta2"
>
  <App />
</AccessCheck.Provider>
```

### useSelfAccessCheck

Hook for checking if the current user has the specified relation(s) to resource(s). Supports three overloads for different use cases.

#### Overload 1: Single Resource Check

Check if the user has a specific relation to a single resource.

**Signature**
```typescript
function useSelfAccessCheck(params: {
  relation: string;
  resource: {
    id: string;
    type: string;
    [key: string]: unknown;
  };
}): {
  data?: {
    allowed: boolean;
    resource: SelfAccessCheckResource;
  };
  loading: boolean;
  error?: SelfAccessCheckError;
}
```

**Example**
```jsx
const { data, loading, error } = useSelfAccessCheck({
  relation: 'delete',
  resource: { id: 'ws-123', type: 'workspace' }
});

if (loading) return <Spinner />;
if (error) return <ErrorMessage />;

return (
  <Button disabled={!data?.allowed}>
    Delete Workspace
  </Button>
);
```

#### Overload 2: Bulk Resource Check - Same Relation

Check the same relation across multiple resources.

**Signature**
```typescript
function useSelfAccessCheck(params: {
  relation: string;
  resources: [
    { id: string; type: string; [key: string]: unknown },
    ...Array<{ id: string; type: string; [key: string]: unknown }>
  ];
  options?: {
    consistency?: {
      minimizeLatency?: boolean;
      atLeastAsFresh?: { token: string };
    };
  };
}): {
  data?: Array<{
    allowed: boolean;
    resource: SelfAccessCheckResource;
    relation: string;
    error?: SelfAccessCheckError;
  }>;
  loading: boolean;
  error?: SelfAccessCheckError;
  consistencyToken?: { token: string };
}
```

**Example**
```jsx
const { data: checks, loading } = useSelfAccessCheck({
  relation: 'delete',
  resources: [
    { id: 'ws-1', type: 'workspace' },
    { id: 'ws-2', type: 'workspace' },
    { id: 'ws-3', type: 'workspace' }
  ]
});

const deletableWorkspaces = checks
  ?.filter(check => check.allowed)
  .map(check => check.resource);
```

#### Overload 3: Bulk Resource Check - Nested Relations

Check different relations on different resources in a single request.

**Signature**
```typescript
function useSelfAccessCheck(params: {
  resources: [
    { id: string; type: string; relation: string; [key: string]: unknown },
    ...Array<{ id: string; type: string; relation: string; [key: string]: unknown }>
  ];
  options?: {
    consistency?: {
      minimizeLatency?: boolean;
      atLeastAsFresh?: { token: string };
    };
  };
}): {
  data?: Array<{
    allowed: boolean;
    resource: SelfAccessCheckResource;
    relation: string;
    error?: SelfAccessCheckError;
  }>;
  loading: boolean;
  error?: SelfAccessCheckError;
  consistencyToken?: { token: string };
}
```

**Example**
```jsx
const { data: checks, loading } = useSelfAccessCheck({
  resources: [
    { id: 'ws-1', type: 'workspace', relation: 'delete' },
    { id: 'ws-2', type: 'workspace', relation: 'view' },
    { id: 'ws-3', type: 'workspace', relation: 'edit' }
  ]
});

// Find any errors in the bulk check
const errors = checks?.filter(check => check.error);
```

## Usage Examples

### Single Resource Check

Check if a user can delete a specific workspace:

```jsx
import { useSelfAccessCheck } from '@project-kessel/frontend-kessel-access-checks';

function WorkspaceActions({ workspaceId }) {
  const { data: deleteCheck, loading } = useSelfAccessCheck({
    relation: 'delete',
    resource: { id: workspaceId, type: 'workspace' }
  });

  if (loading) return <Spinner />;

  return (
    <div>
      <Button disabled={!deleteCheck?.allowed}>
        Delete Workspace
      </Button>
    </div>
  );
}
```

### Bulk Resource Check - Same Relation

Check which workspaces a user can delete:

```jsx
import { useSelfAccessCheck } from '@project-kessel/frontend-kessel-access-checks';

function WorkspaceList({ workspaces }) {
  const { data: deleteChecks, loading } = useSelfAccessCheck({
    relation: 'delete',
    resources: workspaces.map(ws => ({ id: ws.id, type: 'workspace' }))
  });

  if (loading) return <Spinner />;

  return (
    <ul>
      {workspaces.map(workspace => {
        const canDelete = deleteChecks?.find(
          check => check.resource.id === workspace.id
        )?.allowed;

        return (
          <li key={workspace.id}>
            {workspace.name}
            <DeleteButton disabled={!canDelete} />
          </li>
        );
      })}
    </ul>
  );
}
```

### Bulk Resource Check - Nested Relations

Check multiple different permissions in a single request:

```jsx
import { useSelfAccessCheck } from '@project-kessel/frontend-kessel-access-checks';

function WorkspacePermissions({ workspaceId }) {
  const { data: checks, loading } = useSelfAccessCheck({
    resources: [
      { id: workspaceId, type: 'workspace', relation: 'view' },
      { id: workspaceId, type: 'workspace', relation: 'edit' },
      { id: workspaceId, type: 'workspace', relation: 'delete' }
    ]
  });

  if (loading) return <Spinner />;

  const canView = checks?.find(c => c.relation === 'view')?.allowed;
  const canEdit = checks?.find(c => c.relation === 'edit')?.allowed;
  const canDelete = checks?.find(c => c.relation === 'delete')?.allowed;

  return (
    <div>
      <p>View: {canView ? '✓' : '✗'}</p>
      <p>Edit: {canEdit ? '✓' : '✗'}</p>
      <p>Delete: {canDelete ? '✓' : '✗'}</p>
    </div>
  );
}
```

### Conditional Rendering

Show different UI based on permissions:

```jsx
import { useSelfAccessCheck } from '@project-kessel/frontend-kessel-access-checks';

function ResourceActions({ resourceId, resourceType }) {
  const { data: checks, loading } = useSelfAccessCheck({
    resources: [
      { id: resourceId, type: resourceType, relation: 'view' },
      { id: resourceId, type: resourceType, relation: 'edit' },
      { id: resourceId, type: resourceType, relation: 'delete' }
    ]
  });

  if (loading) return <Spinner />;

  const canView = checks?.find(c => c.relation === 'view')?.allowed;
  const canEdit = checks?.find(c => c.relation === 'edit')?.allowed;
  const canDelete = checks?.find(c => c.relation === 'delete')?.allowed;

  if (!canView) {
    return <div>You don't have permission to view this resource.</div>;
  }

  return (
    <div>
      <ViewContent />
      {canEdit && <EditButton />}
      {canDelete && <DeleteButton />}
      {!canEdit && !canDelete && <div>Read-only access</div>}
    </div>
  );
}
```

### Filtering Resources

Filter a list to show only items the user can access:

```jsx
import { useSelfAccessCheck } from '@project-kessel/frontend-kessel-access-checks';

function FilteredWorkspaceList({ allWorkspaces }) {
  const { data: viewChecks, loading } = useSelfAccessCheck({
    relation: 'view',
    resources: allWorkspaces.map(ws => ({ id: ws.id, type: 'workspace' }))
  });

  if (loading) return <Spinner />;

  const visibleWorkspaces = allWorkspaces.filter(ws =>
    viewChecks?.find(check => check.resource.id === ws.id)?.allowed
  );

  return (
    <div>
      <h2>Your Workspaces ({visibleWorkspaces.length})</h2>
      {visibleWorkspaces.map(ws => (
        <WorkspaceCard key={ws.id} workspace={ws} />
      ))}
    </div>
  );
}
```

### Using Consistency Tokens

Ensure read-your-writes consistency after making changes:

```jsx
import { useSelfAccessCheck } from '@project-kessel/frontend-kessel-access-checks';

function WorkspaceManager({ workspaces }) {
  const [consistencyToken, setConsistencyToken] = useState();

  const { data: checks, consistencyToken: newToken } = useSelfAccessCheck({
    relation: 'edit',
    resources: workspaces.map(ws => ({ id: ws.id, type: 'workspace' })),
    options: {
      consistency: {
        minimizeLatency: false,
        ...(consistencyToken && { atLeastAsFresh: { token: consistencyToken } })
      }
    }
  });

  // Save token for next request
  useEffect(() => {
    if (newToken) {
      setConsistencyToken(newToken.token);
    }
  }, [newToken]);

  // ... rest of component
}
```

## Configuration

### Default Configuration

If no props are provided to `AccessCheck.Provider`, it uses these defaults:

- `baseUrl`: `window.location.origin`
- `apiPath`: `'/api/inventory/v1beta2'`

### Custom Configuration

For different environments or custom API endpoints:

```jsx
// Development
<AccessCheck.Provider
  baseUrl="http://localhost:8000"
  apiPath="/api/inventory/v1beta2"
>
  <App />
</AccessCheck.Provider>

// Production
<AccessCheck.Provider
  baseUrl="https://console.redhat.com"
  apiPath="/api/inventory/v1beta2"
>
  <App />
</AccessCheck.Provider>

// Environment-based
<AccessCheck.Provider
  baseUrl={process.env.REACT_APP_API_URL}
  apiPath={process.env.REACT_APP_ACCESS_CHECK_PATH}
>
  <App />
</AccessCheck.Provider>
```

## TypeScript Support

This package includes full TypeScript definitions with function overloads.

```typescript
import {
  AccessCheck,
  useSelfAccessCheck,
  // Types
  SelfAccessCheckResource,
  SelfAccessCheckParams,
  BulkSelfAccessCheckParams,
  BulkSelfAccessCheckNestedRelationsParams,
  SelfAccessCheckResult,
  BulkSelfAccessCheckResult,
  SelfAccessCheckError
} from '@project-kessel/frontend-kessel-access-checks';

// Resource type
const resource: SelfAccessCheckResource = {
  id: 'ws-123',
  type: 'workspace',
  // Can include additional properties
  name: 'My Workspace'
};

// Single check
const singleCheck: SelfAccessCheckResult = useSelfAccessCheck({
  relation: 'delete',
  resource
});

// Bulk check - same relation
const bulkCheck: BulkSelfAccessCheckResult = useSelfAccessCheck({
  relation: 'view',
  resources: [
    { id: 'id1', type: 'workspace' },
    { id: 'id2', type: 'workspace' }
  ]
});

// Bulk check - nested relations
const nestedCheck: BulkSelfAccessCheckResult = useSelfAccessCheck({
  resources: [
    { id: 'id1', type: 'workspace', relation: 'delete' },
    { id: 'id2', type: 'workspace', relation: 'edit' }
  ]
});
```

### Available Types

- `NotEmptyArray<T>` - Array with at least one element
- `SelfAccessCheckResource` - Resource object with id and type
- `SelfAccessCheckResourceWithRelation` - Resource with embedded relation
- `SelfAccessCheckError` - Error object structure
- `SelfAccessCheckParams` - Parameters for single resource check
- `BulkSelfAccessCheckParams` - Parameters for bulk same-relation check
- `BulkSelfAccessCheckNestedRelationsParams` - Parameters for bulk nested-relations check
- `SelfAccessCheckResultItem` - Result item for single check
- `SelfAccessCheckResultItemWithRelation` - Result item for bulk checks
- `SelfAccessCheckResult` - Return type for single check
- `BulkSelfAccessCheckResult` - Return type for bulk checks

## Architecture

This SDK uses a Provider/Context pattern for several key benefits:

- **Centralized Data Layer**: Single source of truth for access checks across your application
- **Automatic Caching**: Prevents duplicate requests for the same permission checks (planned)
- **Request Deduplication**: Multiple components can request the same check without triggering multiple API calls (planned)
- **Lifecycle Awareness**: Automatically handles component mounting/unmounting
- **React Integration**: Works seamlessly with Error Boundaries, Suspense, and other React features
- **Reduced Prop Drilling**: Access hooks from any component without passing props through the tree

### Why Provider + Hooks?

The Provider/Context with hooks approach is preferred over direct async functions because it:

1. Integrates cleanly with React's lifecycle (avoids setState on unmounted components)
2. Provides automatic caching and deduplication (when implemented)
3. Centralizes cross-cutting concerns (auth headers, retries, error handling, telemetry)
4. Supports SSR/SSG via cache hydration
5. Improves testability by swapping providers in unit tests
6. Enhances dev ergonomics with predictable data flow

Direct async functions are better suited for:
- Simple, one-off actions (like form submissions)
- Code outside React components
- Cases requiring very specific control flow

## Backend API Integration

This SDK expects the backend to implement two REST endpoints:

### Self Access Check

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

Allowed values: `ALLOWED_UNSPECIFIED`, `ALLOWED_TRUE`, or `ALLOWED_FALSE`

### Bulk Self Access Check

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

### Authentication

All requests include the user's JWT token in the Authorization header. The backend service authenticates the user and performs checks on their behalf. Cross-user checks are not supported.

## HCC-Specific Usage

In Hybrid Cloud Console (HCC), the `AccessCheck.Provider` is already configured in the common chroming layer. Applications don't need to wrap their components in the provider.

Simply import and use the hooks:

```jsx
import { useSelfAccessCheck } from '@project-kessel/frontend-kessel-access-checks';

function MyHCCApp({ workspaceId }) {
  const { data, loading } = useSelfAccessCheck({
    relation: 'view',
    resource: { id: workspaceId, type: 'workspace' }
  });

  return <div>{data?.allowed && <WorkspaceContent />}</div>;
}
```

## Best Practices

### 1. Handle Loading States

Always handle the loading state while checks are in progress:

```jsx
const { data, loading, error } = useSelfAccessCheck({
  relation: 'delete',
  resource: { id: resourceId, type: 'workspace' }
});

if (loading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
```

### 2. Use Bulk Checks for Multiple Resources

When checking the same permission across multiple resources, always use the bulk form:

```jsx
// Good
const { data: checks } = useSelfAccessCheck({
  relation: 'delete',
  resources: workspaces.map(ws => ({ id: ws.id, type: 'workspace' }))
});

// Avoid - triggers multiple API calls
workspaces.forEach(ws => {
  const { data } = useSelfAccessCheck({
    relation: 'delete',
    resource: { id: ws.id, type: 'workspace' }
  });
});
```

### 3. Use Nested Relations for Different Permissions

When checking multiple different permissions, use nested relations:

```jsx
const { data: checks } = useSelfAccessCheck({
  resources: [
    { id: wsId, type: 'workspace', relation: 'view' },
    { id: wsId, type: 'workspace', relation: 'edit' },
    { id: wsId, type: 'workspace', relation: 'delete' }
  ]
});
```

### 4. Access Checks Are Self-Service Only

All checks are performed for the currently authenticated user. You cannot check permissions on behalf of other users.

### 5. Frontend Checks Are Not Security

Access checks in the frontend provide UX improvements (hiding/disabling UI elements). Always enforce permissions on the backend when performing actual operations.

### 6. Minimize Provider Nesting

Place the `AccessCheck.Provider` as high as possible in your component tree, typically at the application root:

```jsx
// Good
<AccessCheck.Provider>
  <Router>
    <App />
  </Router>
</AccessCheck.Provider>

// Avoid
<Router>
  <AccessCheck.Provider>
    <ComponentA />
  </AccessCheck.Provider>
  <AccessCheck.Provider>
    <ComponentB />
  </AccessCheck.Provider>
</Router>
```

### 7. Resource Types and Relations

**Resource Types**: `workspace`, `group`, `inventory_group`, etc.

**Relations**: `view`, `edit`, `delete`, `create`, `move`, `rename`, `role_bindings_view`, `role_bindings_grant`, `role_bindings_revoke`, etc.

Resources are objects with `id` and `type` properties, and can include additional metadata.

### 8. Handle Per-Item Errors

When using bulk checks, check for per-item errors:

```jsx
const { data: checks } = useSelfAccessCheck({
  relation: 'delete',
  resources: workspaces.map(ws => ({ id: ws.id, type: 'workspace' }))
});

const errors = checks?.filter(check => check.error);
if (errors?.length) {
  console.error('Some checks failed:', errors);
}
```

## Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/redhat-cloud-services/access-checks.git
cd access-checks

# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Build the package
npm run build

# Run linter
npm run lint

# Type check
npm run typecheck
```

This project uses **NX** for build tooling, which provides intelligent caching and faster builds. NX will cache successful builds and tests, making subsequent runs significantly faster.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Related Resources

- [Kessel Relations API](https://github.com/project-kessel/relations-api) - OpenAPI specification for Kessel
- [Kessel Inventory API](https://github.com/project-kessel/inventory-api) - Backend service implementation
- [RHCLOUD-42267](https://issues.redhat.com/browse/RHCLOUD-42267) - Access Checks SDK Epic
- [RHCLOUD-42186](https://issues.redhat.com/browse/RHCLOUD-42186) - Kessel Bulk Access Check API Epic
- [Management Fabric Integration Tracking](https://docs.google.com/spreadsheets/d/1V3mH2pDgXOcxeyxt0fH8RnzzmDsKRDxKzDxxmuaP1mk/edit?usp=sharing)

---

**Maintainers**: Red Hat Cloud Services Team

**Questions or Issues?** Please open an issue on [GitHub](https://github.com/redhat-cloud-services/access-checks/issues)
