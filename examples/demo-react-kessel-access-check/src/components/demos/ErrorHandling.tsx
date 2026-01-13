import { useState } from 'react';
import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';
import DemoSection from '../ui/DemoSection';
import CodeBlock from '../ui/CodeBlock';
import Spinner from '../ui/Spinner';
import ErrorMessage from '../ui/ErrorMessage';

const code = `// Global error handling
const { data, loading, error } = useSelfAccessCheck({
  relation: 'view',
  resource: { id: 'error-network', type: 'workspace' }
});

if (error) {
  return <ErrorMessage error={error} />;
}

// Per-item error handling in bulk operations
const { data: bulkData } = useSelfAccessCheck({
  resources: [
    { id: 'ws-1', type: 'workspace', relation: 'view' },
    { id: 'error-item', type: 'workspace', relation: 'view' }
  ]
});

bulkData?.forEach(result => {
  if (result.error) {
    console.error(\`Error for \${result.resource.id}:\`, result.error);
  }
});`;

export default function ErrorHandling() {
  const [errorType, setErrorType] = useState<'none' | 'network' | 'permission' | 'per-item' | 'bulk'>('none');

  // Single resource error scenarios
  const singleResourceId =
    errorType === 'network' ? 'error-network' : errorType === 'permission' ? 'error-permission' : 'ws-1';

  const { data: singleData, loading: singleLoading, error: singleError } = useSelfAccessCheck({
    relation: 'view',
    resource: { id: singleResourceId, type: 'workspace', name: 'Test Workspace' }
  });

  // Bulk error scenarios
  const bulkResources =
    errorType === 'bulk'
      ? [{ id: 'error-bulk', type: 'workspace', relation: 'view' }]
      : errorType === 'per-item'
        ? [
            { id: 'ws-1', type: 'workspace', name: 'Engineering Team', relation: 'view' },
            { id: 'error-item', type: 'workspace', name: 'Error Item', relation: 'view' },
            { id: 'ws-2', type: 'workspace', name: 'Marketing Hub', relation: 'view' }
          ]
        : [{ id: 'ws-1', type: 'workspace', relation: 'view' }];

  const { data: bulkData, loading: bulkLoading, error: bulkError } = useSelfAccessCheck({
    resources: bulkResources as [typeof bulkResources[0], ...typeof bulkResources[0][]]
  });

  const hasPerItemErrors = bulkData?.some(result => result.error);

  return (
    <DemoSection
      title="6. Error Handling"
      description="Handle various error scenarios including network errors, permission denied, and per-item errors in bulk operations."
    >
      <div className="demo-controls">
        <div className="control-group">
          <label>Select Error Scenario:</label>
          <select value={errorType} onChange={e => setErrorType(e.target.value as typeof errorType)}>
            <option value="none">No Error (Success)</option>
            <option value="network">Network Error (503)</option>
            <option value="permission">Permission Denied (403)</option>
            <option value="per-item">Per-Item Errors (Bulk)</option>
            <option value="bulk">Bulk Operation Error (500)</option>
          </select>
        </div>
      </div>

      <div className="demo-result">
        {errorType !== 'per-item' && errorType !== 'bulk' && (
          <div className="error-demo-section">
            <h4>Single Resource Check</h4>
            {singleLoading && (
              <div className="loading-container">
                <Spinner />
                <span>Checking permission...</span>
              </div>
            )}
            {singleError && <ErrorMessage error={singleError} />}
            {singleData && !singleLoading && !singleError && (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <div className="success-content">
                  <div className="success-text">Permission check successful!</div>
                  <div className="success-details">
                    Access {singleData.allowed ? 'granted' : 'denied'} for resource:{' '}
                    {(singleData.resource as { name?: string }).name || singleData.resource.id}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {(errorType === 'per-item' || errorType === 'bulk') && (
          <div className="error-demo-section">
            <h4>Bulk Operation</h4>
            {bulkLoading && (
              <div className="loading-container">
                <Spinner />
                <span>Checking permissions...</span>
              </div>
            )}
            {bulkError && <ErrorMessage error={bulkError} />}
            {bulkData && !bulkLoading && (
              <div className="bulk-error-results">
                {hasPerItemErrors && (
                  <div className="error-summary">
                    <strong>⚠️ Some items failed:</strong>
                    {bulkData.filter(r => r.error).length} of {bulkData.length} items encountered errors
                  </div>
                )}
                <div className="bulk-items">
                  {bulkData.map((result, index) => (
                    <div
                      key={index}
                      className={`bulk-item ${result.error ? 'error' : result.allowed ? 'success' : 'denied'}`}
                    >
                      <div className="item-icon">
                        {result.error ? '⚠️' : result.allowed ? '✓' : '✗'}
                      </div>
                      <div className="item-content">
                        <div className="item-name">{(result.resource as { name?: string }).name || result.resource.id}</div>
                        {result.error ? (
                          <ErrorMessage error={result.error} />
                        ) : (
                          <div className="item-status">
                            {result.allowed ? 'Access granted' : 'Access denied'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="error-info">
          <h5>Error Handling Best Practices:</h5>
          <ul>
            <li>Always check for <code>error</code> in the hook response</li>
            <li>In bulk operations, check both global <code>error</code> and per-item <code>result.error</code></li>
            <li>Display user-friendly error messages based on error codes</li>
            <li>Implement retry logic for transient network errors</li>
            <li>Log errors for debugging and monitoring</li>
          </ul>
        </div>
      </div>

      <CodeBlock code={code} />
    </DemoSection>
  );
}
