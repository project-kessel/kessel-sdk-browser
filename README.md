# @redhat-cloud-services/access-checks

A React SDK for performing granular and bulk access checks against the Kessel access check service. This package provides a standardized way to verify user permissions for resources like workspaces, inventory groups, and other entities in your application.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [AccessChecksProvider](#accesschecksprovider)
  - [useAccessCheck](#useaccesscheck)
  - [useBulkAccessCheck](#usebulkaccesscheck)
- [Usage Examples](#usage-examples)
  - [Single Access Check](#single-access-check)
  - [Bulk Access Check](#bulk-access-check)
  - [Conditional Rendering](#conditional-rendering)
  - [Filtering Resources](#filtering-resources)
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

- **Single Access Checks**: Verify if a user has any level of access to a specific permission
- **Bulk Access Checks**: Efficiently check permissions for multiple resources in a single request
- **React Context Integration**: Centralized, lifecycle-aware data layer with automatic caching and deduplication
- **TypeScript Support**: Full type definitions for enhanced developer experience
- **Configurable**: Flexible configuration for base URL and API path
- **Self-Service Checks Only**: All checks are performed on behalf of the authenticated user
- **Framework Agnostic Backend**: Works with any REST API implementing the Kessel access check specification

## Installation

```bash
npm install @redhat-cloud-services/access-checks
```

or

```bash
yarn add @redhat-cloud-services/access-checks
```

or

```bash
pnpm add @redhat-cloud-services/access-checks
```

## Quick Start

```jsx
import React from 'react';
import { AccessChecksProvider, useAccessCheck } from '@redhat-cloud-services/access-checks';

// 1. Wrap your application with the provider
function App() {
  return (
    <AccessChecksProvider
      baseUrl="https://console.redhat.com"
      apiPath="/api/inventory/v2"
    >
      <YourApplication />
    </AccessChecksProvider>
  );
}

// 2. Use the hook in your components
function InventoryGroupView() {
  const canViewInventory = useAccessCheck('inventory_group_view');

  if (!canViewInventory) {
    return <div>You don't have permission to view inventory groups.</div>;
  }

  return <div>Inventory Groups List...</div>;
}
```

## API Reference

### AccessChecksProvider

The main provider component that wraps your application and provides access check context to all child components.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `baseUrl` | `string` | No | `window.location.origin` | The base URL for the API server |
| `apiPath` | `string` | No | `'/api/inventory/v2'` | The base path for the access check API endpoints |
| `children` | `ReactNode` | Yes | - | Child components that will have access to the access check hooks |

#### Example

```jsx
<AccessChecksProvider
  baseUrl="https://console.redhat.com"
  apiPath="/api/inventory/v2"
>
  <App />
</AccessChecksProvider>
```

### useAccessCheck

Hook for checking if the current user has any level of access to a specified permission.

#### Signature

```typescript
function useAccessCheck(accessCheck: string): boolean | undefined
```

#### Parameters

- `accessCheck` (string): The name of the permission to check (e.g., `'inventory_group_view'`, `'workspaces_delete'`)

#### Returns

- `true` if the user has the permission
- `false` if the user does not have the permission
- `undefined` while the check is loading

#### Example

```jsx
const canDelete = useAccessCheck('workspaces_delete');

if (canDelete === undefined) {
  return <Spinner />;
}

return (
  <Button disabled={!canDelete}>
    Delete Workspace
  </Button>
);
```

### useBulkAccessCheck

Hook for checking permissions for multiple resources in a single request. Returns the list of resource IDs where the check is true.

#### Signature

```typescript
function useBulkAccessCheck(
  accessCheck: string,
  resourceIDs: string[]
): string[] | undefined
```

#### Parameters

- `accessCheck` (string): The name of the permission to check
- `resourceIDs` (string[]): Array of resource UUIDs to check (e.g., workspace IDs, group IDs)

#### Returns

- `string[]`: Array of resource IDs where the permission check is true
- `undefined` while the check is loading

#### Example

```jsx
const workspaceIds = ['ws-1', 'ws-2', 'ws-3', 'ws-4'];
const deletableWorkspaces = useBulkAccessCheck('workspaces_delete', workspaceIds);

if (deletableWorkspaces === undefined) {
  return <Spinner />;
}

const workspacesWithDeleteAccess = workspaces.filter(
  ws => deletableWorkspaces.includes(ws.id)
);
```

## Usage Examples

### Single Access Check

Check if a user can view inventory groups:

```jsx
import { useAccessCheck } from '@redhat-cloud-services/access-checks';

function InventoryPage() {
  const canView = useAccessCheck('inventory_group_view');
  const canUpdate = useAccessCheck('inventory_group_update');

  return (
    <div>
      {canView && <InventoryList />}
      {canUpdate && <EditButton />}
    </div>
  );
}
```

### Bulk Access Check

Check which workspaces a user can delete:

```jsx
import { useBulkAccessCheck } from '@redhat-cloud-services/access-checks';

function WorkspaceList({ workspaces }) {
  const workspaceIds = workspaces.map(ws => ws.id);
  const deletableIds = useBulkAccessCheck('workspaces_delete', workspaceIds);

  return (
    <ul>
      {workspaces.map(workspace => (
        <li key={workspace.id}>
          {workspace.name}
          <DeleteButton
            disabled={!deletableIds?.includes(workspace.id)}
          />
        </li>
      ))}
    </ul>
  );
}
```

### Conditional Rendering

Show different UI based on permissions:

```jsx
import { useAccessCheck } from '@redhat-cloud-services/access-checks';

function ResourceActions() {
  const canCreate = useAccessCheck('resource_create');
  const canDelete = useAccessCheck('resource_delete');
  const canUpdate = useAccessCheck('resource_update');

  if (canCreate === undefined) {
    return <Spinner />;
  }

  return (
    <div>
      {canCreate && <CreateButton />}
      {canUpdate && <EditButton />}
      {canDelete && <DeleteButton />}
      {!canCreate && !canUpdate && !canDelete && (
        <div>Read-only access</div>
      )}
    </div>
  );
}
```

### Filtering Resources

Filter a list to show only items the user can access:

```jsx
import { useBulkAccessCheck } from '@redhat-cloud-services/access-checks';

function FilteredWorkspaceList({ allWorkspaces }) {
  const workspaceIds = allWorkspaces.map(ws => ws.id);
  const viewableIds = useBulkAccessCheck('workspaces_view', workspaceIds);

  if (viewableIds === undefined) {
    return <Spinner />;
  }

  const visibleWorkspaces = allWorkspaces.filter(
    ws => viewableIds.includes(ws.id)
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

### Helper Function for Mapping

When using bulk checks, you may want to map results back to resources:

```jsx
// Helper function to filter resources based on bulk check results
function filterByAccess(resources, resourceIds, allowedIds) {
  return resources.filter((_, index) => allowedIds.includes(resourceIds[index]));
}

// Usage
function WorkspaceManager({ workspaces }) {
  const ids = workspaces.map(ws => ws.id);
  const deletableIds = useBulkAccessCheck('workspaces_delete', ids);

  if (!deletableIds) return <Spinner />;

  const deletableWorkspaces = workspaces.filter(ws =>
    deletableIds.includes(ws.id)
  );

  return (
    <div>
      <h3>Deletable Workspaces: {deletableWorkspaces.length}</h3>
      {/* ... */}
    </div>
  );
}
```

## Configuration

### Default Configuration

If no props are provided to `AccessChecksProvider`, it uses these defaults:

- `baseUrl`: `window.location.origin`
- `apiPath`: `'/api/inventory/v2'`

### Custom Configuration

For different environments or custom API endpoints:

```jsx
// Development
<AccessChecksProvider
  baseUrl="http://localhost:8000"
  apiPath="/api/v2"
>
  <App />
</AccessChecksProvider>

// Production
<AccessChecksProvider
  baseUrl="https://console.redhat.com"
  apiPath="/api/inventory/v2"
>
  <App />
</AccessChecksProvider>

// Environment-based
<AccessChecksProvider
  baseUrl={process.env.REACT_APP_API_URL}
  apiPath={process.env.REACT_APP_ACCESS_CHECK_PATH}
>
  <App />
</AccessChecksProvider>
```

## TypeScript Support

This package includes full TypeScript definitions.

```typescript
import {
  AccessChecksProvider,
  useAccessCheck,
  useBulkAccessCheck,
  AccessCheckResponse,
  BulkAccessCheckResponse
} from '@redhat-cloud-services/access-checks';

// Type definitions
type AccessCheckResponse = boolean | undefined;
type BulkAccessCheckResponse = string[] | undefined;

// Typed usage
const canDelete: AccessCheckResponse = useAccessCheck('workspaces_delete');
const deletableIds: BulkAccessCheckResponse = useBulkAccessCheck(
  'workspaces_delete',
  ['id1', 'id2', 'id3']
);
```

## Architecture

This SDK uses a Provider/Context pattern for several key benefits:

- **Centralized Data Layer**: Single source of truth for access checks across your application
- **Automatic Caching**: Prevents duplicate requests for the same permission checks
- **Request Deduplication**: Multiple components can request the same check without triggering multiple API calls
- **Lifecycle Awareness**: Automatically handles component mounting/unmounting
- **React Integration**: Works seamlessly with Error Boundaries, Suspense, and other React features
- **Reduced Prop Drilling**: Access hooks from any component without passing props through the tree

### Why Provider + Hooks?

The Provider/Context with hooks approach is preferred over direct async functions because it:

1. Integrates cleanly with React's lifecycle (avoids setState on unmounted components)
2. Provides automatic caching and deduplication
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

### Single Access Check

**GET** `/api/inventory/v2/accesscheck?check=<name_of_check>`

**Response**: `true` or `false`

Example:
```
GET /api/inventory/v2/accesscheck?check=inventory_group_view
Response: true
```

### Bulk Access Check

**POST** `/api/inventory/v2/accesscheck/<name_of_check>`

**Request Body**: Array of resource UUIDs
```json
["uuid-1", "uuid-2", "uuid-3"]
```

**Response**: Array of UUIDs where check is true
```json
["uuid-1", "uuid-3"]
```

Example:
```
POST /api/inventory/v2/accesscheck/workspaces_delete
Body: ["ws-1", "ws-2", "ws-3"]
Response: ["ws-1", "ws-3"]
```

### Authentication

All requests include the user's JWT token in the Authorization header. The backend service authenticates the user and performs checks on their behalf. Cross-user checks are not supported.

## HCC-Specific Usage

In Hybrid Cloud Console (HCC), the `AccessChecksProvider` is already configured in the common chroming layer. Applications don't need to wrap their components in the provider.

Simply import and use the hooks:

```jsx
import { useAccessCheck, useBulkAccessCheck } from '@redhat-cloud-services/access-checks';

function MyHCCApp() {
  const canView = useAccessCheck('inventory_group_view');

  return <div>{canView && <InventoryContent />}</div>;
}
```

## Best Practices

### 1. Handle Loading States

Always handle the `undefined` state while checks are loading:

```jsx
const canDelete = useAccessCheck('resource_delete');

if (canDelete === undefined) {
  return <Spinner />;
}
```

### 2. Use Bulk Checks for Multiple Resources

When checking the same permission across multiple resources, always use `useBulkAccessCheck`:

```jsx
// Good
const deletableIds = useBulkAccessCheck('delete', resourceIds);

// Avoid - triggers multiple API calls
resourceIds.forEach(id => {
  const canDelete = useAccessCheck(`delete_${id}`); // Don't do this
});
```

### 3. Access Checks Are Self-Service Only

All checks are performed for the currently authenticated user. You cannot check permissions on behalf of other users.

### 4. Frontend Checks Are Not Security

Access checks in the frontend provide UX improvements (hiding/disabling UI elements). Always enforce permissions on the backend when performing actual operations.

### 5. Minimize Provider Nesting

Place the `AccessChecksProvider` as high as possible in your component tree, typically at the application root:

```jsx
// Good
<AccessChecksProvider>
  <Router>
    <App />
  </Router>
</AccessChecksProvider>

// Avoid
<Router>
  <AccessChecksProvider>
    <ComponentA />
  </AccessChecksProvider>
  <AccessChecksProvider>
    <ComponentB />
  </AccessChecksProvider>
</Router>
```

### 6. Check Naming Convention

Use clear, descriptive check names following the pattern: `<resource>_<action>`

Examples:
- `inventory_group_view`
- `inventory_group_update`
- `workspaces_delete`
- `workspaces_create`

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

# Build the package
npm run build

# Run linter
npm run lint
```

### Adding New Access Checks

Access checks are defined in the backend API repository. To propose a new check:

1. Submit a request to the backend team with the check name and description
2. Follow the naming convention: `<resource>_<action>`
3. Ensure the check name is URL-safe
4. Document the check's purpose and use cases

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
