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

// Fetch the default workspace
const workspace = await fetchDefaultWorkspace(
  'https://console.redhat.com',
  { headers: { Authorization: \`Bearer \${token}\` } }
);

// Use workspace.id as the resource ID in access checks
const resource = {
  id: workspace.id,
  type: 'workspace',
  reporter: { type: 'rbac' },
};`;

type FetchState = {
  loading: boolean;
  data: Workspace | null;
  error: unknown;
};

const initial: FetchState = { loading: false, data: null, error: null };

export default function WorkspaceRetrieval() {
  const [root, setRoot] = useState<FetchState>(initial);
  const [def, setDef] = useState<FetchState>(initial);

  async function handleFetchRoot() {
    setRoot({ loading: true, data: null, error: null });
    try {
      const ws = await fetchRootWorkspace(RBAC_BASE);
      setRoot({ loading: false, data: ws, error: null });
    } catch (err) {
      setRoot({ loading: false, data: null, error: err });
    }
  }

  async function handleFetchDefault() {
    setDef({ loading: true, data: null, error: null });
    try {
      const ws = await fetchDefaultWorkspace(RBAC_BASE);
      setDef({ loading: false, data: ws, error: null });
    } catch (err) {
      setDef({ loading: false, data: null, error: err });
    }
  }

  return (
    <DemoSection
      title="4. Workspace Retrieval"
      description="Fetch root and default workspace IDs from RBAC using the helper functions. These call GET /api/rbac/v2/workspaces/?type=root|default and return the workspace object, which you can then use as a resource ID in access checks."
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
      </div>

      <div className="demo-result">
        {root.loading && (
          <div className="loading-container">
            <Spinner />
            <span>Fetching root workspace...</span>
          </div>
        )}
        {root.data && <WorkspaceCard label="Root Workspace" workspace={root.data} />}
        {root.error !== null && <WorkspaceError label="Root Workspace" error={root.error} />}

        {def.loading && (
          <div className="loading-container">
            <Spinner />
            <span>Fetching default workspace...</span>
          </div>
        )}
        {def.data && <WorkspaceCard label="Default Workspace" workspace={def.data} />}
        {def.error !== null && <WorkspaceError label="Default Workspace" error={def.error} />}
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
