# React Kessel Access Check Demo

Interactive demo app showcasing the `@project-kessel/react-kessel-access-check` SDK. Uses MSW to mock the Kessel backend so you can explore all access check patterns without a real server.

## Running the App

This app is an NX-managed project inside the monorepo. From the **repository root**:

```bash
# Install dependencies (if you haven't already)
npm install

# Start the dev server
npx nx run demo-react-kessel-access-check:dev
```

The app will open at `http://localhost:5173` with Mock Service Worker intercepting API calls.

Other targets:

```bash
# Production build
npx nx run demo-react-kessel-access-check:build

# Lint
npx nx run demo-react-kessel-access-check:lint
```

> The build target automatically builds the SDK first (`dependsOn: ["^build"]`), so you always get the latest local SDK changes.

## Features Demonstrated

1. **Single Resource Check** — check if the current user has a specific permission on one resource
2. **Bulk Same Relation** — check the same permission across multiple resources in a single API call
3. **Bulk Nested Relations** — check different permissions on one or more resources in a single request

## Mock Data

The demo includes 5 sample workspaces with varying permissions and simulated network latency. Edit `src/mocks/data.ts` to change workspaces, permissions, or error scenarios. Edit `src/mocks/handlers.ts` to change API response format or latency.

## Connecting to a Real Backend

1. Remove or disable MSW initialization in `src/main.tsx`
2. Update the `baseUrl` in `App.tsx` to point to your backend
3. Ensure your backend implements the Kessel access check API endpoints
4. Configure authentication (JWT tokens via cookie-based auth)
