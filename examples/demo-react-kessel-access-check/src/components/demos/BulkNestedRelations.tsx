import { useState } from 'react';
import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';
import DemoSection from '../ui/DemoSection';
import CodeBlock from '../ui/CodeBlock';
import Spinner from '../ui/Spinner';
import ErrorMessage from '../ui/ErrorMessage';
import { workspaces } from '../../mocks/data';

const code = `const { data, loading, error } = useSelfAccessCheck({
  resources: [
    {
      id: 'ws-1',
      type: 'workspace',
      relation: 'view',
      reporter: { type: 'service', instanceId: 'console-ui' }
    },
    {
      id: 'ws-1',
      type: 'workspace',
      relation: 'edit',
      reporter: { type: 'service', instanceId: 'console-ui' }
    },
    {
      id: 'ws-1',
      type: 'workspace',
      relation: 'delete',
      reporter: { type: 'service', instanceId: 'console-ui' }
    },
    {
      id: 'ws-1',
      type: 'workspace',
      relation: 'owner',
      reporter: { type: 'service', instanceId: 'console-ui' }
    }
  ]
});

// Build a permission matrix
const permissions = data?.reduce((acc, result) => {
  acc[result.relation!] = result.allowed;
  return acc;
}, {} as Record<string, boolean>);

return (
  <div>
    {permissions?.view && <button>View</button>}
    {permissions?.edit && <button>Edit</button>}
    {permissions?.delete && <button>Delete</button>}
  </div>
);`;

export default function BulkNestedRelations() {
  const [selectedWorkspace, setSelectedWorkspace] = useState('ws-1');

  const workspace = workspaces.find(w => w.id === selectedWorkspace);

  const { data, loading, error } = useSelfAccessCheck({
    resources: [
      { ...workspace!, relation: 'view' },
      { ...workspace!, relation: 'edit' },
      { ...workspace!, relation: 'delete' },
      { ...workspace!, relation: 'owner' }
    ]
  });

  return (
    <DemoSection
      title="3. Bulk Nested Relations Check"
      description="Check multiple different permissions on one or more resources in a single API call. Perfect for building permission matrices."
    >
      <div className="demo-controls">
        <div className="control-group">
          <label>Select Workspace:</label>
          <select value={selectedWorkspace} onChange={e => setSelectedWorkspace(e.target.value)}>
            {workspaces.map(ws => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="demo-result">
        {loading && (
          <div className="loading-container">
            <Spinner />
            <span>Checking all permissions...</span>
          </div>
        )}
        {error && <ErrorMessage error={error} />}
        {data && !loading && (
          <div className="permission-matrix">
            <h3>Permission Matrix for: {workspace?.name}</h3>
            <div className="matrix-table">
              <div className="matrix-header">
                <div className="matrix-cell">Permission</div>
                <div className="matrix-cell">Status</div>
              </div>
              {data.map(result => (
                <div key={result.relation} className="matrix-row">
                  <div className="matrix-cell">
                    <strong>{result.relation}</strong>
                  </div>
                  <div className="matrix-cell">
                    <span className={`matrix-badge ${result.allowed ? 'allowed' : 'denied'}`}>
                      {result.allowed ? '✓ Allowed' : '✗ Denied'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="action-buttons">
              <h4>Available Actions:</h4>
              <div className="button-group">
                {data.find(r => r.relation === 'view')?.allowed && (
                  <button className="action-button">👁️ View</button>
                )}
                {data.find(r => r.relation === 'edit')?.allowed && (
                  <button className="action-button">✏️ Edit</button>
                )}
                {data.find(r => r.relation === 'delete')?.allowed && (
                  <button className="action-button danger">🗑️ Delete</button>
                )}
                {data.find(r => r.relation === 'owner')?.allowed && (
                  <button className="action-button primary">👑 Owner Settings</button>
                )}
              </div>
              {!data.some(r => r.allowed) && (
                <p className="no-permissions">No permissions available for this workspace</p>
              )}
            </div>
          </div>
        )}
      </div>

      <CodeBlock code={code} />
    </DemoSection>
  );
}
