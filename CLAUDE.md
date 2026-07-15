@AGENTS.md

## Build and Test Commands

Before any commit or PR:

```bash
npm install                    # Install all dependencies
npm run build                  # Build all packages
npm test                       # Run all tests
npm run lint                   # Lint all packages
npm run typecheck              # TypeScript type checking
```

### Separate Test Suites

```bash
npm run test:unit              # Unit tests only
npm run test:integration       # Integration tests only
```

### Demo App

```bash
npx nx run demo-react-kessel-access-check:dev  # Run demo app locally
```

## CI Pipeline Awareness

- `.github/workflows/ci.yaml` runs on every push/PR to master (lint, unit tests, integration tests, build, artifact verification)
- On push to master: release job runs after CI passes (versioning, changelog, npm publish, GitHub release)
- Node 20 (pinned in `.nvmrc` and CI)

## Claude Code Preferences

- Never edit generated files (build output in `dist/`, `CHANGELOG.md`, `package-lock.json`)
- Conventional commits are enforced -- always include a scope: `feat(react-kessel-access-check): ...`
- Run `npm run lint && npm test` before creating commits
- The `core/` directory must never import from React or from the parent `src/` directory
