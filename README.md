# Kessel SDKs Monorepo

A monorepo containing Kessel SDK packages for browser and Node.js environments, providing unified access to Project Kessel's authorization, inventory, and CloudEvents APIs.

## Packages

This monorepo contains two packages:

### [@redhat-cloud-services/frontend-kessel-access-checks](./packages/kessel-access-checks)

A React SDK for performing granular and bulk access checks against the Kessel access check service in browser environments.

**Use for**: Frontend applications needing permission checks for UI rendering and user interactions.

### [@project-kessel/kessel-sdk](./packages/kessel-sdk)

The official Node.js SDK for Project Kessel, supporting server-side authorization, inventory management, and CloudEvents.

**Use for**: Backend services, CLI tools, and server-side applications requiring full Kessel API access.

## Quick Start

### Browser/React Applications

Install the React SDK for frontend access checks:

```bash
npm install @redhat-cloud-services/frontend-kessel-access-checks
```

Basic usage:

```jsx
import React from 'react';
import { AccessCheck, useSelfAccessCheck } from '@redhat-cloud-services/frontend-kessel-access-checks';

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
  const { data, loading } = useSelfAccessCheck({
    relation: 'view',
    resource: { id: workspaceId, type: 'workspace' }
  });

  if (loading) return <Spinner />;
  if (!data?.allowed) return <div>Access denied</div>;

  return <div>Workspace Content...</div>;
}
```

See [packages/kessel-access-checks](./packages/kessel-access-checks) for complete documentation.

### Node.js Applications

Install the Node.js SDK for backend services:

```bash
npm install @project-kessel/kessel-sdk
```

Basic usage:

```typescript
import { createInventoryClient } from '@project-kessel/kessel-sdk/kessel/inventory/v1beta2';
import { createAuthClient } from '@project-kessel/kessel-sdk/kessel/auth';

// Inventory operations
const inventoryClient = createInventoryClient({
  url: 'https://kessel.example.com:9000'
});

// Authorization checks
const authClient = createAuthClient({
  url: 'https://kessel.example.com:8000',
  auth: { token: 'your-jwt-token' }
});
```

See [packages/kessel-sdk](./packages/kessel-sdk) for complete documentation.

## Package Documentation

Each package has its own comprehensive documentation:

- **[Frontend Kessel Access Checks](./packages/kessel-access-checks)** - React SDK for browser-based access checks
  - Single and bulk permission checks
  - React Context integration
  - TypeScript support with function overloads
  - HCC (Hybrid Cloud Console) integration

- **[Kessel SDK (Node.js)](./packages/kessel-sdk)** - Full Node.js SDK for Kessel APIs
  - Inventory API (v1, v1beta2)
  - Authorization API (RBAC v2)
  - gRPC client support
  - CommonJS and ES Modules support

## Development

This is an NX-based monorepo. NX provides intelligent caching and task execution for faster builds.

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd kessel-sdk-browser
npm install
```

### Building

Build all packages:

```bash
npm run build
```

Build a specific package:

```bash
npx nx run @redhat-cloud-services/frontend-kessel-access-checks:build
npx nx run @project-kessel/kessel-sdk:build
```

### Testing

Run tests for all packages:

```bash
npm test
```

Run tests for a specific package:

```bash
npx nx run @redhat-cloud-services/frontend-kessel-access-checks:test
npx nx run @project-kessel/kessel-sdk:test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage:

```bash
npm run test:coverage
```

### Linting

Lint all packages:

```bash
npm run lint
```

Fix linting issues:

```bash
npm run lint:fix
```

### Type Checking

Type check all packages:

```bash
npm run typecheck
```

## Monorepo Structure

```
kessel-sdk-browser/
├── packages/
│   ├── kessel-access-checks/          # React SDK for browser
│   │   ├── src/
│   │   │   ├── AccessCheckProvider.tsx
│   │   │   ├── hooks.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── project.json               # NX project configuration
│   │   ├── tsconfig.lib.json
│   │   └── jest.config.js
│   │
│   └── kessel-sdk/                    # Node.js SDK
│       ├── src/
│       │   ├── kessel/
│       │   │   ├── inventory/
│       │   │   ├── auth/
│       │   │   ├── rbac/
│       │   │   └── grpc/
│       │   └── promisify.ts
│       ├── package.json
│       ├── project.json               # NX project configuration
│       ├── tsconfig.json
│       └── jest.config.cjs
│
├── node_modules/                      # Shared dependencies
├── dist/                              # Build outputs
│   └── packages/
│       └── kessel-access-checks/
│
├── package.json                       # Root workspace configuration
├── nx.json                            # NX workspace configuration
├── tsconfig.base.json                 # Shared TypeScript config
├── jest.preset.js                     # Shared Jest config
├── eslint.config.mjs                  # Shared ESLint config
└── README.md                          # This file
```

### Key Features

- **Shared Dependencies**: All packages share dependencies from the root `node_modules`, reducing duplication
- **TypeScript Path Aliases**: Import packages using their npm names (e.g., `@redhat-cloud-services/frontend-kessel-access-checks`)
- **NX Caching**: Build and test results are cached for faster subsequent runs
- **Independent Versioning**: Each package maintains its own version and can be published independently
- **Workspace Support**: Uses npm workspaces for package management


### Conventional Commits

This repository uses conventional commits for automated versioning. Commit messages should follow this format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples**:
```bash
feat(kessel-access-checks): add caching for access check results
fix(kessel-sdk): resolve TypeScript type errors in auth module
docs(readme): update installation instructions
```

## Publishing Packages

Each package can be published independently:

```bash
# Publish kessel-access-checks
cd packages/kessel-access-checks
npm publish

# Publish kessel-sdk
cd packages/kessel-sdk
npm publish
```

Or use NX release management:

```bash
npx nx release
```

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Related Resources

- [Kessel Relations API](https://github.com/project-kessel/relations-api) - OpenAPI specification for Kessel
- [Kessel Inventory API](https://github.com/project-kessel/inventory-api) - Backend service implementation
- [Project Kessel](https://github.com/project-kessel) - Main project repository
- [JIRA Epic: RHCLOUD-42267](https://issues.redhat.com/browse/RHCLOUD-42267) - Access Checks SDK Epic
- [JIRA Epic: RHCLOUD-42186](https://issues.redhat.com/browse/RHCLOUD-42186) - Kessel Bulk Access Check API Epic
