import { useState } from 'react';
import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';
import DemoSection from '../ui/DemoSection';
import CodeBlock from '../ui/CodeBlock';
import Spinner from '../ui/Spinner';
import { workspaces } from '../../mocks/data';

const code = `// Pattern 1: Simple loading state
const { data, loading } = useSelfAccessCheck({
  relation: 'view',
  resource: workspace
});

if (loading) return <Spinner />;
return <WorkspaceDetails workspace={data?.resource} />;

// Pattern 2: Skeleton loader
if (loading) {
  return <SkeletonCard />;
}

// Pattern 3: Progressive rendering
return (
  <div>
    <WorkspaceHeader workspace={workspace} />
    {loading ? (
      <Spinner />
    ) : (
      data?.allowed && <WorkspaceActions />
    )}
  </div>
);`;

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text short"></div>
      <div className="skeleton-buttons">
        <div className="skeleton skeleton-button"></div>
        <div className="skeleton skeleton-button"></div>
      </div>
    </div>
  );
}

export default function LoadingStates() {
  const [pattern, setPattern] = useState<'simple' | 'skeleton' | 'progressive'>('simple');
  const [triggerLoad, setTriggerLoad] = useState(0);

  const { data, loading } = useSelfAccessCheck({
    resources: [
      { ...workspaces[0], relation: 'view', _key: triggerLoad },
      { ...workspaces[0], relation: 'edit', _key: triggerLoad },
      { ...workspaces[0], relation: 'delete', _key: triggerLoad }
    ]
  }); // Re-trigger when count changes

  const canView = data?.find(p => p.relation === 'view')?.allowed;
  const canEdit = data?.find(p => p.relation === 'edit')?.allowed;
  const canDelete = data?.find(p => p.relation === 'delete')?.allowed;

  const handleReload = () => {
    setTriggerLoad(prev => prev + 1);
  };

  return (
    <DemoSection
      title="7. Loading States"
      description="Different UX patterns for handling loading states while permission checks are in flight."
    >
      <div className="demo-controls">
        <div className="control-group">
          <label>Loading Pattern:</label>
          <select value={pattern} onChange={e => setPattern(e.target.value as typeof pattern)}>
            <option value="simple">Simple Spinner</option>
            <option value="skeleton">Skeleton Loader</option>
            <option value="progressive">Progressive Rendering</option>
          </select>
        </div>
        <button className="action-button" onClick={handleReload}>
          🔄 Reload (Trigger Loading)
        </button>
      </div>

      <div className="demo-result">
        {pattern === 'simple' && (
          <div className="loading-pattern">
            <h4>Pattern 1: Simple Spinner</h4>
            <p className="pattern-description">Show a spinner while loading, then display content</p>
            <div className="pattern-demo">
              {loading ? (
                <div className="loading-container centered">
                  <Spinner />
                  <span>Loading workspace permissions...</span>
                </div>
              ) : (
                <div className="workspace-card-item">
                  <div className="workspace-header">
                    <h4>{workspaces[0].name}</h4>
                  </div>
                  <div className="workspace-actions">
                    {canView && <button className="action-button small">👁️ View</button>}
                    {canEdit && <button className="action-button small">✏️ Edit</button>}
                    {canDelete && <button className="action-button small danger">🗑️ Delete</button>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {pattern === 'skeleton' && (
          <div className="loading-pattern">
            <h4>Pattern 2: Skeleton Loader</h4>
            <p className="pattern-description">Show a placeholder skeleton that matches the final layout</p>
            <div className="pattern-demo">
              {loading ? (
                <SkeletonCard />
              ) : (
                <div className="workspace-card-item">
                  <div className="workspace-header">
                    <h4>{workspaces[0].name}</h4>
                  </div>
                  <p className="workspace-meta">Created: {workspaces[0].createdAt}</p>
                  <p className="workspace-meta">Owner: {workspaces[0].owner}</p>
                  <div className="workspace-actions">
                    {canView && <button className="action-button small">👁️ View</button>}
                    {canEdit && <button className="action-button small">✏️ Edit</button>}
                    {canDelete && <button className="action-button small danger">🗑️ Delete</button>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {pattern === 'progressive' && (
          <div className="loading-pattern">
            <h4>Pattern 3: Progressive Rendering</h4>
            <p className="pattern-description">Show static content immediately, load dynamic parts</p>
            <div className="pattern-demo">
              <div className="workspace-card-item">
                <div className="workspace-header">
                  <h4>{workspaces[0].name}</h4>
                  <span className="workspace-type">{workspaces[0].type}</span>
                </div>
                <p className="workspace-meta">Created: {workspaces[0].createdAt}</p>
                <p className="workspace-meta">Owner: {workspaces[0].owner}</p>

                <div className="workspace-actions">
                  {loading ? (
                    <div className="loading-container">
                      <Spinner />
                      <span>Loading available actions...</span>
                    </div>
                  ) : (
                    <>
                      {canView && <button className="action-button small">👁️ View</button>}
                      {canEdit && <button className="action-button small">✏️ Edit</button>}
                      {canDelete && <button className="action-button small danger">🗑️ Delete</button>}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="loading-info">
          <h5>Loading State Best Practices:</h5>
          <ul>
            <li><strong>Simple Spinner:</strong> Best for fast operations (&lt;1s) or full-page checks</li>
            <li><strong>Skeleton Loader:</strong> Best for perceived performance, reduces layout shift</li>
            <li><strong>Progressive Rendering:</strong> Best for showing static content while loading dynamic permissions</li>
            <li>Always provide visual feedback during async operations</li>
            <li>Avoid showing stale data - clearly indicate when permissions are loading</li>
          </ul>
        </div>
      </div>

      <CodeBlock code={code} />
    </DemoSection>
  );
}
