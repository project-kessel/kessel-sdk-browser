import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';
import DemoSection from '../ui/DemoSection';
import CodeBlock from '../ui/CodeBlock';
import Spinner from '../ui/Spinner';
import { workspaces } from '../../mocks/data';

const code = `function WorkspaceCard({ workspace }) {
  const { data: permissions } = useSelfAccessCheck({
    resources: [
      { ...workspace, relation: 'view' },
      { ...workspace, relation: 'edit' },
      { ...workspace, relation: 'delete' }
    ]
  });

  const canView = permissions?.find(p => p.relation === 'view')?.allowed;
  const canEdit = permissions?.find(p => p.relation === 'edit')?.allowed;
  const canDelete = permissions?.find(p => p.relation === 'delete')?.allowed;

  if (!canView) return null; // Don't show if can't view

  return (
    <div className="workspace-card">
      <h3>{workspace.name}</h3>
      <div className="actions">
        {canEdit && <button>Edit</button>}
        {canDelete && <button>Delete</button>}
      </div>
    </div>
  );
}`;

function WorkspaceCard({ workspace }: { workspace: typeof workspaces[0] }) {
  const { data: permissions, loading } = useSelfAccessCheck({
    resources: [
      { ...workspace, relation: 'view' },
      { ...workspace, relation: 'edit' },
      { ...workspace, relation: 'delete' }
    ]
  });

  const canView = permissions?.find(p => p.relation === 'view')?.allowed;
  const canEdit = permissions?.find(p => p.relation === 'edit')?.allowed;
  const canDelete = permissions?.find(p => p.relation === 'delete')?.allowed;

  if (loading) {
    return (
      <div className="workspace-card-item loading">
        <Spinner />
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="workspace-card-item hidden">
        <div className="hidden-icon">🔒</div>
        <div className="hidden-text">Hidden (No view permission)</div>
      </div>
    );
  }

  return (
    <div className="workspace-card-item">
      <div className="workspace-header">
        <h4>{workspace.name}</h4>
        <span className="workspace-type">{workspace.type}</span>
      </div>
      <p className="workspace-meta">Created: {workspace.createdAt}</p>
      <div className="workspace-actions">
        <button className="action-button small">👁️ View</button>
        {canEdit ? (
          <button className="action-button small">✏️ Edit</button>
        ) : (
          <button className="action-button small" disabled>
            ✏️ Edit (No permission)
          </button>
        )}
        {canDelete ? (
          <button className="action-button small danger">🗑️ Delete</button>
        ) : (
          <button className="action-button small" disabled>
            🗑️ Delete (No permission)
          </button>
        )}
      </div>
    </div>
  );
}

export default function ConditionalRendering() {
  return (
    <DemoSection
      title="4. Conditional Rendering"
      description="Show or hide UI elements based on user permissions. This is the most common use case in real applications."
    >
      <div className="demo-result">
        <div className="workspace-grid-list">
          {workspaces.map(workspace => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </div>
        <p className="demo-note">
          💡 <strong>Note:</strong> Workspace #4 (Product Analytics) is hidden because you don't have view
          permission. Edit and Delete buttons are disabled when you lack those permissions.
        </p>
      </div>

      <CodeBlock code={code} />
    </DemoSection>
  );
}
