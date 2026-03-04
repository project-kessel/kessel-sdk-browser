import { useState } from 'react';
import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';
import DemoSection from '../ui/DemoSection';
import CodeBlock from '../ui/CodeBlock';
import PermissionBadge from '../ui/PermissionBadge';
import Spinner from '../ui/Spinner';
import ErrorMessage from '../ui/ErrorMessage';
import { workspaces } from '../../mocks/data';

const code = `const { data, loading, error } = useSelfAccessCheck({
  relation: 'view',
  resource: {
    id: 'ws-1',
    type: 'workspace',
    name: 'Engineering Team',
    reporter: { type: 'service', instanceId: 'console-ui' }
  }
});

if (loading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
if (!data?.allowed) return <div>Access denied</div>;

return <div>You can view this workspace!</div>;`;

export default function SingleResourceCheck() {
  const [selectedWorkspace, setSelectedWorkspace] = useState('ws-1');
  const [selectedRelation, setSelectedRelation] = useState('view');

  const workspace = workspaces.find(w => w.id === selectedWorkspace);

  const { data, loading, error } = useSelfAccessCheck({
    relation: selectedRelation,
    resource: workspace!
  });

  return (
    <DemoSection
      title="1. Single Resource Check"
      description="Check if the current user has a specific permission on a single resource. This is the most basic form of access control."
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
            <span>Checking permission...</span>
          </div>
        )}
        {error && <ErrorMessage error={error} />}
        {data && !loading && (
          <PermissionBadge allowed={data.allowed} relation={selectedRelation} resource={data.resource} />
        )}
      </div>

      <CodeBlock code={code} />
    </DemoSection>
  );
}
