---
name: release-browser-sdk
description: Release packages from the kessel-sdk-browser monorepo. When invoked, gathers repo state, runs all quality checks (lint, test, typecheck, build), verifies build artifacts, and reports release readiness. Also covers the automated NX-based release pipeline, conventional commit conventions, release verification, and manual/emergency release procedures. Use when the user wants to release, publish, check release status, troubleshoot a failed release, or understand how versioning works in this repo.
---

# Release Kessel Browser SDK

This repo uses a **fully automated** release pipeline. Merging a PR to `master` with properly formatted commit messages triggers versioning, changelog generation, npm publishing, and GitHub release creation -- no manual steps required.

## Agent Instructions

When this skill is invoked, execute the following steps **in order**. Do not skip any step.

### Step 1: Gather repo state

Run these commands in parallel to understand the current release posture:

- `git branch --show-current` — confirm we're on `master`
- `git fetch origin master --quiet && git log HEAD..origin/master --oneline` — check if local is behind remote
- `git tag --sort=-v:refname | head -5` — find the latest release tag
- `npm view @project-kessel/react-kessel-access-check versions --json | tail -5` — check what's published on npm
- `gh pr list --state open` — check for open PRs
- `gh run list --branch master --limit 3` — check recent CI status

Then use the latest tag from above to list unreleased commits:

- `git log <latest-tag>..HEAD --oneline` — list unreleased commits since the last tag

Report findings to the user before proceeding.

### Step 2: Run quality checks locally

Run **all four** checks. Run lint, tests, typecheck, and build in parallel:

```bash
npm run lint
npm test
npx tsc --noEmit -p packages/react-kessel-access-check/tsconfig.lib.json && npx tsc --noEmit -p packages/react-kessel-access-check/tsconfig.spec.json
npm run build
```

**Important**: Do NOT use `npm run typecheck` — it runs `tsc --noEmit` at the root which has no `tsconfig.json` and silently fails. Always use the per-package tsconfig paths above.

After all four complete, report a summary table with pass/fail status for each check.

### Step 3: Verify build artifacts

```bash
ls dist/packages/react-kessel-access-check/index.js
ls dist/packages/react-kessel-access-check/index.d.ts
```

### Step 4: Report release readiness

Summarize:
- Whether there are unreleased commits (and if any are releasable `feat:`/`fix:` types)
- Whether all quality checks passed
- Whether CI is green
- What the next action is (merge a PR, nothing to release, fix failures, etc.)

## How Releases Work

```
PR merged to master
  -> CI job (lint, test, build)
  -> Release job (only on master, not PRs)
       -> npx nx release --skip-publish  (version bump + changelog + git commit + tag)
       -> npx nx run-many -t build       (rebuild with new version)
       -> git push + git push --tags      (push version commit and tags)
       -> npx nx release publish          (publish to npm with provenance)
       -> force-push last-release tag
```

Key configuration:
- **Workflow**: `.github/workflows/ci.yaml` triggers the composite action `.github/actions/release/action.yml`
- **NX release config**: `nx.json` under the `release` key
- **Independent versioning**: each package under `packages/*` (excluding `demo-*`) is versioned independently
- **Tag pattern**: `{projectName}@{version}` (e.g. `react-kessel-access-check@0.5.0`)
- **npm provenance**: enabled via `NPM_CONFIG_PROVENANCE=true`, using GitHub's OIDC `id-token: write` permission

NX analyzes conventional commits since the last release tag to determine the version bump. If no releasable commits are found, the release step is a no-op.

## Controlling Version Bumps

Version bumps are driven entirely by **conventional commit messages**. Commitlint enforces the format on PRs via `.commitlintrc.json`.

### Commit format

```
<type>(<scope>): <subject>

<optional body>

<optional footer>
```

### Allowed types

`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `revert`, `ci`, `build`

### Allowed scopes

`react-kessel-access-check`, `demo-react-kessel-access-check`, `release`

### Version bump mapping

| Commit prefix | Semver bump | Example |
|---|---|---|
| `fix(react-kessel-access-check):` | **patch** (0.0.x) | `fix(react-kessel-access-check): handle null response body` |
| `feat(react-kessel-access-check):` | **minor** (0.x.0) | `feat(react-kessel-access-check): add caching support` |
| `feat(react-kessel-access-check)!:` | **major** (x.0.0) | `feat(react-kessel-access-check)!: redesign hook API` |
| `BREAKING CHANGE:` in footer | **major** (x.0.0) | Any type with a `BREAKING CHANGE:` footer |

Non-releasable types (`docs`, `style`, `refactor`, `test`, `chore`, `ci`, `build`) do **not** trigger a version bump or publish on their own. A release only happens when at least one `fix:` or `feat:` commit is present since the last tag.

### Scope matters

Commits must be scoped to the package they affect. A commit scoped to `demo-react-kessel-access-check` will not trigger a release of `react-kessel-access-check`.

## Run Quality Checks Locally

Run the CI suite locally before pushing or merging to catch issues early. See the [Development section of the README](README.md#development) for individual commands.

### Run everything (recommended before merge)

```bash
npm run lint && npm test && npm run build
```

### Run unit and integration tests separately (mirrors CI)

```bash
npm run test:unit
npm run test:integration
```

## Verifying a Release

After merging to `master`, verify the release succeeded:

### 1. Check CI

```bash
gh run list --branch master --limit 5
gh run view <run-id>
```

Look for the `release` job completing successfully.

### 2. Check git tags

```bash
git fetch --tags
git tag --sort=-v:refname | head -5
```

Expected format: `react-kessel-access-check@X.Y.Z`

### 3. Check npm

```bash
npm view @project-kessel/react-kessel-access-check versions --json | tail -5
```

Or visit: https://www.npmjs.com/package/@project-kessel/react-kessel-access-check

### 4. Check GitHub releases

```bash
gh release list --limit 5
```

### 5. Check changelog

The file `packages/react-kessel-access-check/CHANGELOG.md` should contain the new version entry.

## Manual / Emergency Release

Use this when CI automation fails (e.g. npm auth issue, transient GitHub error) or for dry-run previews.

### Dry run (safe, no side effects)

Preview versioning and changelog without making changes:

```bash
npx nx release --dry-run
```

### Full manual release

Only do this if CI automation has failed and you need to publish manually. Requires npm publish access to `@project-kessel/react-kessel-access-check`.

```bash
# 1. Ensure you're on master with latest changes
git checkout master && git pull origin master

# 2. Version, changelog, commit, and tag (but don't publish yet)
npx nx release --skip-publish --verbose

# 3. Rebuild with new version
npx nx run-many -t build --skipNxCache

# 4. Push version commit and tags
git push && git push --tags

# 5. Verify dist artifacts
ls -la dist/packages/react-kessel-access-check/index.js

# 6. Publish to npm
npx nx release publish

# 7. Update last-release tag
git tag -f last-release
git push origin last-release --force
```

### Publishing a specific version (override)

To force a specific version instead of letting conventional commits decide:

```bash
npx nx release --specifier=1.0.0 --skip-publish --verbose
```

## Troubleshooting

### Release job ran but no version was published

NX found no releasable commits (no `feat:` or `fix:` scoped to a publishable package since the last tag). This is expected behavior -- verify your commits have the correct type and scope.

### Tag conflict

If a tag already exists for the computed version:

```bash
git tag -d react-kessel-access-check@X.Y.Z
git push origin :refs/tags/react-kessel-access-check@X.Y.Z
```

Then re-run the release.

### npm publish failed with 403/401

- CI uses **OIDC trusted publishing** (`id-token: write`). Verify the npm package has GitHub Actions configured as a trusted publisher at https://www.npmjs.com/package/@project-kessel/react-kessel-access-check/access
- For manual publishes, ensure you're logged in: `npm whoami` and have publish access to the `@project-kessel` scope

### Commitlint rejecting PR commits

Check your commit against the allowed types and scopes listed in the **Controlling Version Bumps** section above.

Run locally to validate: `echo "your commit message" | npx commitlint`

### Changelog not updated

Changelog is only generated for packages matched by `release.projects` in `nx.json` (currently `packages/*` excluding `demo-*`). Ensure your commit scope maps to a releasable package.

## Quick Reference

```
Releasing @project-kessel/react-kessel-access-check:
- [ ] PR commits use conventional format with scope react-kessel-access-check
- [ ] At least one fix: or feat: commit present for a version bump
- [ ] Breaking changes marked with ! or BREAKING CHANGE: footer
- [ ] Local quality checks pass (lint, test, build)
- [ ] CI passes on PR
- [ ] Merge PR to master
- [ ] Automated: version bump, changelog, npm publish, GitHub release, git tags
- [ ] Verify: npm view, gh release list, git tag
```
