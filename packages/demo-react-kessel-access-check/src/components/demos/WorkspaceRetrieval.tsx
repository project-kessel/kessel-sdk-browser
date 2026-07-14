import { useState } from 'react';
import {
  fetchRootWorkspace,
  fetchDefaultWorkspace,
} from '@project-kessel/react-kessel-access-check';
import type { Workspace } from '@project-kessel/react-kessel-access-check';
import DemoSection from '../ui/DemoSection';
import CodeBlock from '../ui/CodeBlock';
import Spinner from '../ui/Spinner';

const RBAC_BASE = 'http://localhost:3000'; // MSW intercepts locally

const code = `import {
  fetchRootWorkspace,
  fetchDefaultWorkspace
} from '@project-kessel/react-kessel-access-check';

// SDK helpers always request with_ancestry=true so fallback workspaces
// (root, default) are included even without explicit inventory permission
const workspace = await fetchDefaultWorkspace(
  'https://console.redhat.com',
  { headers: { Authorization: \`Bearer \${token}\` } }
);

// Without with_ancestry, only workspaces you have explicit permission for are returned.
// Users with access still see default/root; this mock simulates an account without it:
const response = await fetch(
  'https://console.redhat.com/api/rbac/v2/workspaces/?type=default',
  { credentials: 'include' }
);
const { data } = await response.json(); // data: []

// Use workspace.id as the resource ID in access checks
const resource = {
  id: workspace.id,
  type: 'workspace',
  reporter: { type: 'rbac' },
};`;

type FetchState = {
  loading: boolean;
  data: Workspace[] | null;
  error: unknown;
};

const initial: FetchState = { loading: false, data: null, error: null };

export default function WorkspaceRetrieval() {
  const [root, setRoot] = useState<FetchState>(initial);
  const [def, setDef] = useState<FetchState>(initial);
  const [withoutAncestry, setWithoutAncestry] = useState<FetchState>(initial);

  async function handleFetchRoot() {
    setRoot({ loading: true, data: null, error: null });
    try {
      const ws = await fetchRootWorkspace(RBAC_BASE);
      setRoot({ loading: false, data: [ws], error: null });
    } catch (err) {
      setRoot({ loading: false, data: null, error: err });
    }
  }

  async function handleFetchDefault() {
    setDef({ loading: true, data: null, error: null });
    try {
      const ws = await fetchDefaultWorkspace(RBAC_BASE);
      setDef({ loading: false, data: [ws], error: null });
    } catch (err) {
      setDef({ loading: false, data: null, error: err });
    }
  }

  async function handleFetchDefaultWithoutAncestry() {
    setWithoutAncestry({ loading: true, data: null, error: null });
    try {
      const response = await fetch(
        `${RBAC_BASE}/api/rbac/v2/workspaces/?type=default`,
        { credentials: 'include' },
      );
      const { data } = await response.json() as { data?: Workspace[] };
      setWithoutAncestry({
        loading: false,
        data: data ?? [],
        error: null,
      });
    } catch (err) {
      setWithoutAncestry({ loading: false, data: null, error: err });
    }
  }

  return (
    <DemoSection
      title="4. Workspace Retrieval"
      description="Fetch root and default workspace IDs via the SDK helpers (with with_ancestry=true), or compare with a raw API call. The with_ancestry param includes fallback workspaces when you lack explicit permission — users who already have access see them either way. This mock simulates the no-permission case."
    >
      <div className="demo-controls">
        <div className="control-group">
          <label>Root Workspace</label>
          <button
            className="action-button primary"
            onClick={handleFetchRoot}
            disabled={root.loading}
          >
            {root.loading ? 'Fetching...' : 'Fetch Root'}
          </button>
        </div>

        <div className="control-group">
          <label>Default Workspace</label>
          <button
            className="action-button primary"
            onClick={handleFetchDefault}
            disabled={def.loading}
          >
            {def.loading ? 'Fetching...' : 'Fetch Default'}
          </button>
        </div>

        <div className="control-group">
          <label>Default (no with_ancestry)</label>
          <button
            className="action-button"
            onClick={handleFetchDefaultWithoutAncestry}
            disabled={withoutAncestry.loading}
          >
            {withoutAncestry.loading ? 'Fetching...' : 'Raw fetch'}
          </button>
        </div>
      </div>

      <div className="demo-result">
        {root.loading && (
          <div className="loading-container">
            <Spinner />
            <span>Fetching root workspace...</span>
          </div>
        )}
        {root.data?.[0] && <WorkspaceCard label="Root Workspace" workspace={root.data[0]} />}
        {root.error !== null && <WorkspaceError label="Root Workspace" error={root.error} />}

        {def.loading && (
          <div className="loading-container">
            <Spinner />
            <span>Fetching default workspace...</span>
          </div>
        )}
        {def.data?.[0] && <WorkspaceCard label="Default Workspace" workspace={def.data[0]} />}
        {def.error !== null && <WorkspaceError label="Default Workspace" error={def.error} />}

        {withoutAncestry.loading && (
          <div className="loading-container">
            <Spinner />
            <span>Fetching default workspace without with_ancestry...</span>
          </div>
        )}
        {withoutAncestry.data?.[0] && (
          <WorkspaceCard label="Default (no with_ancestry)" workspace={withoutAncestry.data[0]} />
        )}
        {withoutAncestry.data?.length === 0 && (
          <EmptyListResult label="Default (no with_ancestry)" />
        )}
        {withoutAncestry.error !== null && (
          <WorkspaceError label="Default (no with_ancestry)" error={withoutAncestry.error} />
        )}
      </div>

      <CodeBlock code={code} />
    </DemoSection>
  );
}

function WorkspaceCard({ label, workspace }: { label: string; workspace: Workspace }) {
  return (
    <div className="success-message" style={{ marginBottom: '1rem' }}>
      <div className="success-content">
        <div className="success-text">{label}</div>
        <div className="success-details">
          <strong>ID:</strong> <code>{workspace.id}</code>
          <br />
          <strong>Type:</strong> {workspace.type}
          <br />
          <strong>Name:</strong> {workspace.name}
          {workspace.description && (
            <>
              <br />
              <strong>Description:</strong> {workspace.description}
            </>
          )}
          {workspace.parent_id && (
            <>
              <br />
              <strong>Parent ID:</strong> <code>{workspace.parent_id}</code>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyListResult({ label }: { label: string }) {
  return (
    <div
      className="success-message"
      style={{ marginBottom: '1rem', background: '#fff8c5', borderColor: 'var(--warning)', color: '#7d4e00' }}
    >
      <div className="success-content">
        <div className="success-text">{label}</div>
        <div className="success-details">
          API returned <strong>200 OK</strong> with an empty <code>data</code> list.
          Without <code>with_ancestry</code>, only workspaces you have explicit inventory
          permission for are returned — if you had access, default/root would appear here too.
          This mock simulates an account without that permission;{' '}
          <code>with_ancestry=true</code> adds fallback workspaces anyway, which is why the SDK
          helpers always pass it.
        </div>
      </div>
    </div>
  );
}

function WorkspaceError({ label, error }: { label: string; error: unknown }) {
  const errorObj = error as { code?: number; message?: string };
  return (
    <div className="error-message" style={{ marginBottom: '1rem' }}>
      <div className="error-icon">&#x26A0;&#xFE0F;</div>
      <div className="error-content">
        {errorObj.code && <div className="error-code">{label} — Error {errorObj.code}</div>}
        <div className="error-text">{errorObj.message || 'An unknown error occurred'}</div>
      </div>
    </div>
  );
}
