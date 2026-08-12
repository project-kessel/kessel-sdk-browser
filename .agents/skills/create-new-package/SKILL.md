---
name: create-new-package
description: Scaffold a new NX library package under packages/. Creates all boilerplate files (project.json, package.json, tsconfigs, jest configs, setupTests, index.ts, README, CHANGELOG) and updates tsconfig.base.json path mapping. Uses react-kessel-access-check as the reference template. Use when adding a new publishable package to this monorepo.
---

# Create New Package

Scaffolds a new NX library package under `packages/`. This repo has no NX generators — all boilerplate is created manually.

## Agent Instructions

When this skill is invoked, ask the user for:

1. **Package name** — kebab-case (e.g. `react-kessel-inventory`). Will be scoped as `@project-kessel/<name>`.
2. **Description** — one-line package description for `package.json`.
3. **Peer dependencies** — what the package needs from consumers (React? Other packages?). Default: `react` with range `^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0`.

Then create all files below, substituting `<name>` with the package name.

## Files to create

### 1. `packages/<name>/project.json`

```json
{
  "name": "<name>",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "packages/<name>/src",
  "projectType": "library",
  "targets": {
    "build": {
      "executor": "@nx/js:tsc",
      "outputs": ["{options.outputPath}"],
      "options": {
        "rootDir": "packages/<name>/src",
        "outputPath": "dist/packages/<name>",
        "main": "packages/<name>/src/index.ts",
        "tsConfig": "packages/<name>/tsconfig.lib.json",
        "assets": [
          "packages/<name>/README.md"
        ]
      }
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/packages/<name>"],
      "options": {
        "jestConfig": "packages/<name>/jest.config.js",
        "passWithNoTests": true
      },
      "configurations": {
        "ci": {
          "ci": true,
          "coverage": true
        }
      }
    },
    "lint": {
      "executor": "nx:run-commands",
      "options": {
        "command": "eslint packages/<name> --ext .ts,.tsx",
        "cwd": "{workspaceRoot}"
      }
    }
  }
}
```

### 2. `packages/<name>/package.json`

```json
{
  "name": "@project-kessel/<name>",
  "version": "0.0.1",
  "description": "<description>",
  "main": "index.js",
  "types": "index.d.ts",
  "scripts": {
    "build": "nx build",
    "test": "nx test",
    "test:watch": "nx test --watch",
    "test:coverage": "nx test --coverage",
    "lint": "nx lint",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "typecheck": "tsc --noEmit"
  },
  "keywords": [
    "kessel",
    "redhat"
  ],
  "author": "Red Hat Cloud Services",
  "license": "Apache-2.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/project-kessel/kessel-sdk-browser.git",
    "directory": "packages/<name>"
  },
  "homepage": "https://github.com/project-kessel/kessel-sdk-browser#readme",
  "bugs": {
    "url": "https://github.com/project-kessel/kessel-sdk-browser/issues"
  },
  "publishConfig": {
    "access": "public"
  },
  "peerDependencies": {
    "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
  }
}
```

Adjust `peerDependencies` based on what the user specified. If the package is not React-based, remove the `react` peer dependency entirely.

### 3. `packages/<name>/tsconfig.lib.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "declaration": true,
    "outDir": "../../dist/packages/<name>",
    "rootDir": "./src",
    "ignoreDeprecations": "6.0"
  },
  "include": ["src/**/*"],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.test.tsx",
    "src/api-mocks/**/*",
    "src/__tests__/**/*"
  ]
}
```

### 4. `packages/<name>/tsconfig.spec.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "types": ["jest", "node"],
    "declarationMap": false,
    "ignoreDeprecations": "6.0",
    "rootDir": "src"
  },
  "include": [
    "jest.config.js",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.test.tsx",
    "src/**/*.spec.tsx",
    "src/**/*.d.ts",
    "src/setupTests.ts",
    "src/api-mocks/**/*",
    "src/__tests__/**/*"
  ]
}
```

### 5. `packages/<name>/jest.config.js`

```js
/* eslint-disable no-undef */
const { default: nxPreset } = require('@nx/jest/preset');

module.exports = {
  ...nxPreset,
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(msw|@mswjs|until-async)/)'
  ],
  maxWorkers: '50%',
  workerIdleMemoryLimit: '512MB'
};
```

If the package does not use MSW or browser APIs, simplify `transformIgnorePatterns` and `setupTests.ts` accordingly.

### 6. `packages/<name>/jest.config.unit.js`

```js
/* eslint-disable no-undef */
const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testPathIgnorePatterns: ['integration'],
  displayName: 'unit',
};
```

### 7. `packages/<name>/jest.config.integration.js`

```js
/* eslint-disable no-undef */
const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testMatch: ['**/__tests__/integration/**/*.test.ts?(x)'],
  displayName: 'integration',
};
```

### 8. `packages/<name>/src/index.ts`

```ts
// Public API — export only what consumers need
```

Start empty. Add exports as the package implementation develops.

### 9. `packages/<name>/src/setupTests.ts`

```ts
import '@testing-library/jest-dom';
import "cross-fetch/polyfill";
import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream, TransformStream , WritableStream} from 'node:stream/web'
import { BroadcastChannel } from 'node:worker_threads';

Object.assign(global, { TextDecoder, TextEncoder, ReadableStream, TransformStream, BroadcastChannel, WritableStream });
```

If the package does not use browser/stream APIs, simplify this to just the first two imports.

### 10. `packages/<name>/README.md`

```markdown
# @project-kessel/<name>

<description>

## Installation

```bash
npm install @project-kessel/<name>
```

## Usage

_Coming soon._

## Development

```bash
# Build
npx nx build <name>

# Test
npx nx test <name>

# Lint
npx nx lint <name>
```

## License

Apache-2.0
```

### 11. `packages/<name>/CHANGELOG.md`

Create as an empty file. NX release auto-populates this on first publish.

## Root config to update

### `tsconfig.base.json`

Add a path mapping entry to `compilerOptions.paths`:

```json
"@project-kessel/<name>": ["packages/<name>/src/index.ts"]
```

## After scaffolding

1. Run `npm install` to update the workspace lockfile
2. Verify NX recognizes the project: `npx nx show project <name>`
3. Build: `npx nx build <name>`
4. Run tests: `npx nx test <name>`
5. Typecheck: `npx tsc --noEmit -p packages/<name>/tsconfig.lib.json`

## Commit convention

```
feat(<name>): scaffold new package

Initial package scaffolding with build, test, and lint targets.
```

## Notes

- The `name` field in `project.json` is the NX project name (no scope prefix). The `name` in `package.json` is the npm name (scoped as `@project-kessel/<name>`).
- NX release config in `nx.json` auto-includes `packages/*` (excluding `demo-*`), so no release config changes needed.
- The package publishes from `dist/packages/<name>`, so `main` and `types` in `package.json` are relative to that dist root, not the source root.
