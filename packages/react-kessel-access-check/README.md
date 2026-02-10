# @project-kessel/react-kessel-access-check

A React SDK for performing granular and bulk access checks against the Kessel access check service. This package provides a standardized way to verify user permissions for resources like workspaces, inventory groups, and other entities in your application.

## Table of Contents

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
- [Best Practices](#best-practices)


## Installation

```bash
npm install @project-kessel/react-kessel-access-check
```

or

```bash
yarn add @project-kessel/react-kessel-access-check
```

or

```bash
pnpm add @project-kessel/react-kessel-access-check
```

## Quick Start

```jsx
import React from 'react';
import { AccessCheck, useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';

// 1. Wrap your application with the provider
function App() {
  return (
    <AccessCheck.Provider
      baseUrl="https://console.redhat.com"
      apiPath="/api/kessel/v1beta2"
    >
      <YourApplication />
    </AccessCheck.Provider>
  );
}

// 2. Use the hook in your components
function WorkspaceView({ workspaceId }) {
  const { data, loading, error } = useSelfAccessCheck({
    relation: 'view',
    resource: {
      id: workspaceId,
      type: 'workspace',
      reporter: { type: 'rbac' }
    }
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

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `baseUrl` | `string` | Yes | The base URL for the API server (e.g., `https://console.redhat.com`) |
| `apiPath` | `string` | Yes | The base path for the access check API endpoints (e.g., `/api/kessel/v1beta2`) |
| `bulkCheckConfig` | `{ bulkRequestLimit?: number }` | No | Configuration for bulk access checks. Set `bulkRequestLimit` to limit the number of items per bulk request |
| `children` | `ReactNode` | Yes | Child components that will have access to the access check hooks |

#### Example

```jsx
<AccessCheck.Provider
  baseUrl="https://console.redhat.com"
  apiPath="/api/kessel/v1beta2"
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
    reporter: { type: string; instanceId?: string };
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
  resource: {
    id: 'ws-123',
    type: 'workspace',
    reporter: { type: 'rbac' }
  }
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
    { id: string; type: string; reporter: { type: string; instanceId?: string }; [key: string]: unknown },
    ...Array<{ id: string; type: string; reporter: { type: string; instanceId?: string }; [key: string]: unknown }>
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
    { id: 'ws-1', type: 'workspace', reporter: { type: 'rbac' } },
    { id: 'ws-2', type: 'workspace', reporter: { type: 'rbac' } },
    { id: 'ws-3', type: 'workspace', reporter: { type: 'rbac' } }
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
    { id: string; type: string; relation: string; reporter: { type: string; instanceId?: string }; [key: string]: unknown },
    ...Array<{ id: string; type: string; relation: string; reporter: { type: string; instanceId?: string }; [key: string]: unknown }>
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
    { id: 'ws-1', type: 'workspace', relation: 'delete', reporter: { type: 'rbac' } },
    { id: 'ws-2', type: 'workspace', relation: 'view', reporter: { type: 'rbac' } },
    { id: 'ws-3', type: 'workspace', relation: 'edit', reporter: { type: 'rbac' } }
  ]
});

// Find any errors in the bulk check
const errors = checks?.filter(check => check.error);
```

## Usage Examples

### Single Resource Check

Check if a user can delete a specific workspace:

```jsx
import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';

function WorkspaceActions({ workspaceId }) {
  const { data: deleteCheck, loading } = useSelfAccessCheck({
    relation: 'delete',
    resource: {
      id: workspaceId,
      type: 'workspace',
      reporter: { type: 'rbac' }
    }
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
import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';

function WorkspaceList({ workspaces }) {
  const { data: deleteChecks, loading } = useSelfAccessCheck({
    relation: 'delete',
    resources: workspaces.map(ws => ({
      id: ws.id,
      type: 'workspace',
      reporter: { type: 'rbac' }
    }))
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
import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';

function WorkspacePermissions({ workspaceId }) {
  const { data: checks, loading } = useSelfAccessCheck({
    resources: [
      { id: workspaceId, type: 'workspace', relation: 'view', reporter: { type: 'rbac' } },
      { id: workspaceId, type: 'workspace', relation: 'edit', reporter: { type: 'rbac' } },
      { id: workspaceId, type: 'workspace', relation: 'delete', reporter: { type: 'rbac' } }
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
import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';

function ResourceActions({ resourceId, resourceType }) {
  const { data: checks, loading } = useSelfAccessCheck({
    resources: [
      { id: resourceId, type: resourceType, relation: 'view', reporter: { type: 'rbac' } },
      { id: resourceId, type: resourceType, relation: 'edit', reporter: { type: 'rbac' } },
      { id: resourceId, type: resourceType, relation: 'delete', reporter: { type: 'rbac' } }
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
import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';

function FilteredWorkspaceList({ allWorkspaces }) {
  const { data: viewChecks, loading } = useSelfAccessCheck({
    relation: 'view',
    resources: allWorkspaces.map(ws => ({
      id: ws.id,
      type: 'workspace',
      reporter: { type: 'rbac' }
    }))
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
import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';

function WorkspaceManager({ workspaces }) {
  const [consistencyToken, setConsistencyToken] = useState();

  const { data: checks, consistencyToken: newToken } = useSelfAccessCheck({
    relation: 'edit',
    resources: workspaces.map(ws => ({
      id: ws.id,
      type: 'workspace',
      reporter: { type: 'rbac' }
    })),
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

The `AccessCheck.Provider` requires both `baseUrl` and `apiPath` props to be provided. These should be configured based on your environment:

```jsx
// Development
<AccessCheck.Provider
  baseUrl="http://localhost:8000"
  apiPath="/api/kessel/v1beta2"
>
  <App />
</AccessCheck.Provider>

// Production
<AccessCheck.Provider
  baseUrl="https://console.redhat.com"
  apiPath="/api/kessel/v1beta2"
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
} from '@project-kessel/react-kessel-access-check';

// Resource type
const resource: SelfAccessCheckResource = {
  id: 'ws-123',
  type: 'workspace',
  reporter: { type: 'rbac' },
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
    { id: 'id1', type: 'workspace', reporter: { type: 'rbac' } },
    { id: 'id2', type: 'workspace', reporter: { type: 'rbac' } }
  ]
});

// Bulk check - nested relations
const nestedCheck: BulkSelfAccessCheckResult = useSelfAccessCheck({
  resources: [
    { id: 'id1', type: 'workspace', relation: 'delete', reporter: { type: 'rbac' } },
    { id: 'id2', type: 'workspace', relation: 'edit', reporter: { type: 'rbac' } }
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

**POST** `/api/kessel/v1beta2/checkself`

Checks if the current user has the specified level of access to the provided resource.

**Request Body**:
```json
{
  "object": {
    "resourceId": "e07f0bbd-4743-404f-8dca-14d92026b52c",
    "resourceType": "workspace",
    "reporter": {
      "type": "rbac"
    }
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

**POST** `/api/kessel/v1beta2/checkselfbulk`

Checks if the current user has the specified level of access to multiple resources.

**Request Body**:
```json
{
  "items": [
    {
      "object": {
        "resourceId": "3f2a1c9e-5b6d-4a1f-8c3b-2d7e9f01a2b3",
        "resourceType": "workspace",
        "reporter": {
          "type": "rbac"
        }
      },
      "relation": "delete"
    },
    {
      "object": {
        "resourceId": "a8d4c2f1-9e0b-4d59-8a7e-3c1d5f6b8e90",
        "resourceType": "workspace",
        "reporter": {
          "type": "rbac"
        }
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
          "resourceType": "workspace",
          "reporter": {
            "type": "rbac"
          }
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
          "resourceType": "workspace",
          "reporter": {
            "type": "rbac"
          }
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

## Best Practices

### 1. Handle Loading States

Always handle the loading state while checks are in progress:

```jsx
const { data, loading, error } = useSelfAccessCheck({
  relation: 'delete',
  resource: {
    id: resourceId,
    type: 'workspace',
    reporter: { type: 'rbac' }
  }
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
  resources: workspaces.map(ws => ({
    id: ws.id,
    type: 'workspace',
    reporter: { type: 'rbac' }
  }))
});

// Avoid - triggers multiple API calls
workspaces.forEach(ws => {
  const { data } = useSelfAccessCheck({
    relation: 'delete',
    resource: {
      id: ws.id,
      type: 'workspace',
      reporter: { type: 'rbac' }
    }
  });
});
```

### 3. Use Nested Relations for Different Permissions

When checking multiple different permissions, use nested relations:

```jsx
const { data: checks } = useSelfAccessCheck({
  resources: [
    { id: wsId, type: 'workspace', relation: 'view', reporter: { type: 'rbac' } },
    { id: wsId, type: 'workspace', relation: 'edit', reporter: { type: 'rbac' } },
    { id: wsId, type: 'workspace', relation: 'delete', reporter: { type: 'rbac' } }
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

**Reporter Field**: All resources must include a `reporter` object that identifies the service or system making the access check request:
- `{ type: 'rbac' }` - For RBAC-based authorization (most common)
- `{ type: 'service', instanceId: 'console-ui' }` - For service-specific authorization with an optional instance identifier

Resources are objects with `id`, `type`, and `reporter` properties, and can include additional metadata.

### 8. Handle Per-Item Errors

When using bulk checks, check for per-item errors:

```jsx
const { data: checks } = useSelfAccessCheck({
  relation: 'delete',
  resources: workspaces.map(ws => ({
    id: ws.id,
    type: 'workspace',
    reporter: { type: 'rbac' }
  }))
});

const errors = checks?.filter(check => check.error);
if (errors?.length) {
  console.error('Some checks failed:', errors);
}
```

## Troubleshooting

### Common Errors

#### "useAccessCheckContext must be used within an AccessCheckProvider"

This error occurs when you try to use `useSelfAccessCheck` outside of an `AccessCheck.Provider`. Make sure your component is wrapped in the provider:

```jsx
// ✗ Wrong
function App() {
  const { data } = useSelfAccessCheck({
    relation: 'view',
    resource: { id: '1', type: 'workspace', reporter: { type: 'rbac' } }
  });
  return <div>...</div>;
}

// ✓ Correct
function App() {
  return (
    <AccessCheck.Provider baseUrl="https://api.example.com" apiPath="/api/kessel/v1beta2">
      <MyComponent />
    </AccessCheck.Provider>
  );
}

function MyComponent() {
  const { data } = useSelfAccessCheck({
    relation: 'view',
    resource: { id: '1', type: 'workspace', reporter: { type: 'rbac' } }
  });
  return <div>...</div>;
}
```

#### Network or CORS Errors

Make sure:
1. Your `baseUrl` and `apiPath` are correctly configured
2. The backend API is accessible from your frontend
3. CORS is properly configured on the backend to allow requests from your frontend domain
4. JWT authentication cookies are being sent (credentials: 'include' is enabled by default)

#### Loading Never Completes

If the `loading` state never changes to `false`, check:
1. Network tab in browser DevTools to see if the request is being made
2. Console for any JavaScript errors
3. That the API endpoint is responding correctly
4. That there are no network errors or timeouts
