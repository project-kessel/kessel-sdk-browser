import { useState } from 'react';
import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';
import DemoSection from '../ui/DemoSection';
import CodeBlock from '../ui/CodeBlock';
import Spinner from '../ui/Spinner';
import ErrorMessage from '../ui/ErrorMessage';
import { workspaces } from '../../mocks/data';

const code = `const { data, loading, error, consistencyToken } = useSelfAccessCheck({
  relation: 'delete',
  resources: [
    { id: 'ws-1', type: 'workspace', name: 'Engineering Team' },
    { id: 'ws-2', type: 'workspace', name: 'Marketing Hub' },
    { id: 'ws-3', type: 'workspace', name: 'Sales Dashboard' }
  ]
});

// Filter only deletable workspaces
const deletable = data?.filter(result => result.allowed) || [];

return (
  <div>
    <h3>You can delete {deletable.length} workspaces</h3>
    {deletable.map(result => (
      <div key={result.resource.id}>{result.resource.name}</div>
    ))}
  </div>
);`;

export default function BulkSameRelation() {
  const [selectedRelation, setSelectedRelation] = useState('delete');

  const { data, loading, error, consistencyToken } = useSelfAccessCheck({
    relation: selectedRelation,
    resources: workspaces as [typeof workspaces[0], ...typeof workspaces[0][]]
  });

  const allowedCount = data?.filter(result => result.allowed).length || 0;
  const deniedCount = data?.filter(result => !result.allowed).length || 0;

  return (
    <DemoSection
      title="2. Bulk Same Relation Check"
      description="Check the same permission across multiple resources in a single API call. This is more efficient than multiple individual checks."
    >
      <div className="demo-controls">
        <div className="control-group">
          <label>Select Permission:</label>
          <select value={selectedRelation} onChange={e => setSelectedRelation(e.target.value)}>
            <option value="view">View</option>
            <option value="edit">Edit</option>
            <option value="delete">Delete</option>
            <option value="owner">Owner</option>
          </select>
        </div>
      </div>

      <div className="demo-result">
        {loading && (
          <div className="loading-container">
            <Spinner />
            <span>Checking permissions for {workspaces.length} workspaces...</span>
          </div>
        )}
        {error && <ErrorMessage error={error} />}
        {data && !loading && (
          <div className="bulk-results">
            <div className="bulk-summary">
              <div className="summary-item">
                <strong>Total Checked:</strong> {workspaces.length}
              </div>
              <div className="summary-item">
                <strong>Allowed:</strong> <span className="text-success">{allowedCount}</span>
              </div>
              <div className="summary-item">
                <strong>Denied:</strong> <span className="text-danger">{deniedCount}</span>
              </div>
              {consistencyToken && (
                <div className="summary-item">
                  <strong>Token:</strong> <code>{consistencyToken.token}</code>
                </div>
              )}
            </div>

            <div className="workspace-grid">
              {data.map(result => (
                <div
                  key={result.resource.id}
                  className={`workspace-card ${result.allowed ? 'allowed' : 'denied'}`}
                >
                  <div className="workspace-icon">{result.allowed ? '✓' : '✗'}</div>
                  <div className="workspace-info">
                    <h4>{(result.resource as { name?: string }).name}</h4>
                    <p className="workspace-id">{result.resource.id}</p>
                    <p className={`workspace-status ${result.allowed ? 'allowed' : 'denied'}`}>
                      {result.allowed ? `Can ${selectedRelation}` : `Cannot ${selectedRelation}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <CodeBlock code={code} />
    </DemoSection>
  );
}
