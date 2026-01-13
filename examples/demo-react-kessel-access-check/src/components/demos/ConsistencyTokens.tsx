import { useState } from 'react';
import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';
import DemoSection from '../ui/DemoSection';
import CodeBlock from '../ui/CodeBlock';
import Spinner from '../ui/Spinner';

const code = `// Step 1: Create a resource and get consistency token
const createWorkspace = async () => {
  const response = await fetch('/api/workspaces', {
    method: 'POST',
    body: JSON.stringify({ name: 'New Workspace' })
  });
  const { workspace, consistencyToken } = await response.json();
  return { workspace, consistencyToken };
};

// Step 2: Immediately check permissions with the token
const { workspace, consistencyToken } = await createWorkspace();

const { data } = useSelfAccessCheck({
  relation: 'view',
  resources: [workspace],
  options: {
    consistency: {
      atLeastAsFresh: consistencyToken
    }
  }
});

// The check will see the newly created workspace
// even if eventual consistency hasn't propagated yet`;

export default function ConsistencyTokens() {
  const [step, setStep] = useState(1);
  const [_token, setToken] = useState<string | null>(null);
  const [newWorkspace] = useState({
    id: 'ws-new-1',
    type: 'workspace',
    name: 'Newly Created Workspace',
    createdAt: new Date().toISOString().split('T')[0]
  });

  // Simulate checking permissions for the new workspace
  const { data, loading, consistencyToken } = useSelfAccessCheck({
    relation: 'view',
    resources: [newWorkspace]
  });

  const handleCreateWorkspace = () => {
    setStep(2);
    // In a real app, this would be returned from the create API
    setTimeout(() => {
      setStep(3);
    }, 1000);
  };

  const handleCheckPermissions = () => {
    setStep(4);
    // Save the consistency token from the response
    if (consistencyToken) {
      setToken(consistencyToken.token);
    }
  };

  const handleReset = () => {
    setStep(1);
    setToken(null);
  };

  return (
    <DemoSection
      title="8. Consistency Tokens"
      description="Use consistency tokens to ensure read-your-writes consistency. After creating or updating a resource, use the returned token to guarantee subsequent permission checks see the latest state."
    >
      <div className="demo-result">
        <div className="consistency-flow">
          <div className={`flow-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Create Resource</h4>
              <p>User creates a new workspace</p>
              {step === 1 && (
                <button className="action-button" onClick={handleCreateWorkspace}>
                  ➕ Create Workspace
                </button>
              )}
              {step > 1 && (
                <div className="step-result">
                  <div className="workspace-preview">
                    <strong>📁 {newWorkspace.name}</strong>
                    <code>{newWorkspace.id}</code>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flow-arrow">↓</div>

          <div className={`flow-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Backend Returns Token</h4>
              <p>Server includes consistency token in response</p>
              {step === 2 && (
                <div className="loading-container">
                  <Spinner />
                  <span>Processing...</span>
                </div>
              )}
              {step > 2 && consistencyToken && (
                <div className="step-result">
                  <div className="token-display">
                    <strong>Consistency Token:</strong>
                    <code className="token">{consistencyToken.token}</code>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flow-arrow">↓</div>

          <div className={`flow-step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Check Permissions with Token</h4>
              <p>Use token to ensure seeing the new workspace</p>
              {step === 3 && (
                <button className="action-button" onClick={handleCheckPermissions}>
                  🔍 Check Permissions
                </button>
              )}
              {step > 3 && (
                <div className="step-result">
                  {loading ? (
                    <div className="loading-container">
                      <Spinner />
                      <span>Checking permissions...</span>
                    </div>
                  ) : data ? (
                    <div className="permission-result">
                      <div className="result-badge success">
                        ✓ Permission Check Successful
                      </div>
                      <div className="result-details">
                        <p>
                          <strong>Resource:</strong> {(data[0]?.resource as { name?: string })?.name}
                        </p>
                        <p>
                          <strong>Allowed:</strong>{' '}
                          <span className={data[0]?.allowed ? 'text-success' : 'text-danger'}>
                            {data[0]?.allowed ? 'Yes' : 'No'}
                          </span>
                        </p>
                        <p className="consistency-guarantee">
                          🔒 Guaranteed to see the newly created workspace thanks to consistency token
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {step > 3 && (
            <div className="flow-actions">
              <button className="action-button" onClick={handleReset}>
                🔄 Reset Demo
              </button>
            </div>
          )}
        </div>

        <div className="consistency-info">
          <h5>Why Consistency Tokens Matter:</h5>
          <ul>
            <li>
              <strong>Distributed Systems:</strong> In distributed databases, changes may not be immediately visible across all nodes
            </li>
            <li>
              <strong>Read-Your-Writes:</strong> Consistency tokens ensure users always see their own changes
            </li>
            <li>
              <strong>Better UX:</strong> Prevents confusing situations where users can't see resources they just created
            </li>
            <li>
              <strong>Optional:</strong> Only needed when you need guaranteed consistency; most reads can use eventual consistency
            </li>
          </ul>

          <h5>When to Use:</h5>
          <ul>
            <li>Immediately after creating a resource and checking permissions on it</li>
            <li>After updating resource permissions and verifying the changes</li>
            <li>In workflows where user actions depend on seeing their own changes</li>
          </ul>
        </div>
      </div>

      <CodeBlock code={code} />
    </DemoSection>
  );
}
