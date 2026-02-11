# Kessel SDKs Monorepo

A monorepo containing Kessel SDK packages for browser environments, providing unified access to Project Kessel's authorization and inventory APIs.

## Packages

This monorepo contains one package:

### [@project-kessel/react-kessel-access-check](./packages/react-kessel-access-check)

A React SDK for performing granular and bulk access checks against the Kessel access check service in browser environments.

**Use for**: Frontend applications needing permission checks for UI rendering and user interactions.

## Quick Start

Install the React SDK for frontend access checks:

```bash
npm install @project-kessel/react-kessel-access-check
```

Basic usage:

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
  const { data, loading } = useSelfAccessCheck({
    relation: 'view',
    resource: {
      id: workspaceId,
      type: 'workspace',
      reporter: { type: 'rbac' }
    }
  });

  if (loading) return <Spinner />;
  if (!data?.allowed) return <div>Access denied</div>;

  return <div>Workspace Content...</div>;
}
```

See [packages/react-kessel-access-check](./packages/react-kessel-access-check) for complete documentation.

## Package Documentation

For comprehensive documentation, see:

- **[@project-kessel/react-kessel-access-check](./packages/react-kessel-access-check)** - React SDK for browser-based access checks
  - Single and bulk permission checks
  - React Context integration
  - TypeScript support with function overloads
  - HCC (Hybrid Cloud Console) integration

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
npx nx run @project-kessel/react-kessel-access-check:build
```

### Testing

Run tests for all packages:

```bash
npm test
```

Run tests for a specific package:

```bash
npx nx run @project-kessel/react-kessel-access-check:test
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
├── .github/
│   ├── workflows/
│   │   └── ci.yaml                    # CI/CD pipeline
│   └── actions/
│       └── release/                   # Release automation
├── packages/
│   └── react-kessel-access-check/
│       ├── src/
│       │   ├── core/                  # Core utilities
│       │   ├── AccessCheckContext.tsx
│       │   ├── AccessCheckProvider.tsx
│       │   ├── hooks.ts
│       │   ├── types.ts
│       │   └── index.ts
│       ├── package.json
│       ├── project.json               # NX project configuration
│       ├── CHANGELOG.md               # Auto-generated changelog
│       ├── tsconfig.lib.json
│       ├── tsconfig.spec.json
│       └── jest.config.js
├── examples/
│   └── demo-react-kessel-access-check/ # Example React app
├── .commitlintrc.json                 # Commit message validation
├── package.json                       # Root workspace configuration
├── nx.json                            # NX workspace configuration
├── tsconfig.base.json                 # Shared TypeScript config
├── jest.preset.js                     # Shared Jest config
├── eslint.config.mjs                  # Shared ESLint config
└── README.md                          # This file
```

### Key Features

- **Shared Dependencies**: All packages share dependencies from the root `node_modules`, reducing duplication
- **TypeScript Path Aliases**: Import packages using their npm names (e.g., `@project-kessel/react-kessel-access-check`)
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
feat(react-kessel-access-check): add caching for access check results
fix(react-kessel-access-check): resolve TypeScript type errors
docs(readme): update installation instructions
```

## Automated Releases

This repository uses automated releases powered by NX and GitHub Actions. When commits are pushed to the `master` branch, the release process automatically:

1. Analyzes commit messages using conventional commits
2. Determines the appropriate version bump
3. Updates package versions and changelogs
4. Creates git tags
5. Publishes packages to npm

### Version Bumping Rules

The version bump is determined by the commit type following the conventional commits specification:

- `fix:` → **patch bump** (0.0.x) - Bug fixes
- `feat:` → **minor bump** (0.x.0) - New features
- `BREAKING CHANGE:` → **major bump** (x.0.0) - Breaking changes (in commit footer)
- Other types (`chore:`, `docs:`, `style:`, `refactor:`, `test:`, `ci:`, `build:`) → **no version bump**

### Example Release Flow

```bash
# A fix commit triggers a patch release
git commit -m "fix(react-kessel-access-check): resolve TypeScript type errors"
# Push to master → releases version 0.2.4 → 0.2.5

# A feature commit triggers a minor release
git commit -m "feat(react-kessel-access-check): add caching for access check results"
# Push to master → releases version 0.2.5 → 0.3.0

# A breaking change triggers a major release (using ! syntax)
git commit -m "feat(react-kessel-access-check)!: redesign API surface"
# Push to master → releases version 0.3.0 → 1.0.0

# Or with BREAKING CHANGE footer (requires multiple -m flags)
git commit -m "feat(react-kessel-access-check): redesign API surface" \
           -m "BREAKING CHANGE: The AccessCheck provider now requires explicit configuration"
# Push to master → releases version 0.3.0 → 1.0.0
```


## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Related Resources

- [Kessel Relations API](https://github.com/project-kessel/relations-api) - OpenAPI specification for Kessel
- [Kessel Inventory API](https://github.com/project-kessel/inventory-api) - Backend service implementation
- [Project Kessel](https://github.com/project-kessel) - Main project repository
- [JIRA Epic: RHCLOUD-42267](https://issues.redhat.com/browse/RHCLOUD-42267) - Access Checks SDK Epic
- [JIRA Epic: RHCLOUD-42186](https://issues.redhat.com/browse/RHCLOUD-42186) - Kessel Bulk Access Check API Epic
