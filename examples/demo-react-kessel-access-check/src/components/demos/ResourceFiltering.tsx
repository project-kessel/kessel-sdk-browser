import { useState } from 'react';
import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';
import DemoSection from '../ui/DemoSection';
import CodeBlock from '../ui/CodeBlock';
import Spinner from '../ui/Spinner';
import ErrorMessage from '../ui/ErrorMessage';
import { workspaces } from '../../mocks/data';

const code = `const { data, loading } = useSelfAccessCheck({
  relation: 'edit',
  resources: allWorkspaces
});

// Filter to only show resources user can edit
const editableWorkspaces = data
  ?.filter(result => result.allowed)
  .map(result => result.resource) || [];

return (
  <div>
    <h3>Workspaces You Can Edit ({editableWorkspaces.length})</h3>
    {editableWorkspaces.map(workspace => (
      <WorkspaceCard key={workspace.id} workspace={workspace} />
    ))}
  </div>
);`;

export default function ResourceFiltering() {
  const [filterRelation, setFilterRelation] = useState('view');

  const { data, loading, error } = useSelfAccessCheck({
    relation: filterRelation,
    resources: workspaces as [typeof workspaces[0], ...typeof workspaces[0][]]
  });

  const accessibleWorkspaces =
    data?.filter(result => result.allowed).map(result => result.resource) || [];

  return (
    <DemoSection
      title="5. Resource Filtering"
      description="Filter lists to show only resources the user has access to. Essential for building dashboards and resource lists."
    >
      <div className="demo-controls">
        <div className="control-group">
          <label>Filter by Permission:</label>
          <select value={filterRelation} onChange={e => setFilterRelation(e.target.value)}>
            <option value="view">Can View</option>
            <option value="edit">Can Edit</option>
            <option value="delete">Can Delete</option>
            <option value="owner">Is Owner</option>
          </select>
        </div>
      </div>

      <div className="demo-result">
        {loading && (
          <div className="loading-container">
            <Spinner />
            <span>Filtering workspaces...</span>
          </div>
        )}
        {error && <ErrorMessage error={error} />}
        {data && !loading && (
          <div className="filtered-results">
            <div className="filter-summary">
              <h4>
                Workspaces you can <strong>{filterRelation}</strong>: {accessibleWorkspaces.length} of{' '}
                {workspaces.length}
              </h4>
            </div>

            {accessibleWorkspaces.length > 0 ? (
              <div className="workspace-list">
                {accessibleWorkspaces.map(workspace => (
                  <div key={workspace.id} className="workspace-list-item">
                    <div className="workspace-icon">📁</div>
                    <div className="workspace-details">
                      <h4>{(workspace as { name?: string }).name}</h4>
                      <p className="workspace-meta">
                        ID: <code>{workspace.id}</code> • Created: {(workspace as { createdAt?: string }).createdAt}
                      </p>
                    </div>
                    <div className="workspace-badge">
                      <span className="badge-success">✓ {filterRelation}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🔒</div>
                <p>No workspaces found with {filterRelation} permission</p>
              </div>
            )}

            <div className="excluded-resources">
              <h5>Excluded (No {filterRelation} permission):</h5>
              {data
                .filter(result => !result.allowed)
                .map(result => (
                  <span key={result.resource.id} className="excluded-tag">
                    {(result.resource as { name?: string }).name}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>

      <CodeBlock code={code} />
    </DemoSection>
  );
}
