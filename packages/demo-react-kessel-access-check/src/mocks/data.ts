// Sample workspaces for demonstrating permission checks
export const workspaces = [
  {
    id: 'ws-1',
    type: 'workspace',
    name: 'Engineering Team',
    owner: 'user-1',
    createdAt: '2025-01-01',
    reporter: { type: 'service', instanceId: 'console-ui' }
  },
  {
    id: 'ws-2',
    type: 'workspace',
    name: 'Marketing Hub',
    owner: 'user-2',
    createdAt: '2025-01-05',
    reporter: { type: 'service', instanceId: 'console-ui' }
  },
  {
    id: 'ws-3',
    type: 'workspace',
    name: 'Sales Dashboard',
    owner: 'user-1',
    createdAt: '2025-01-10',
    reporter: { type: 'service', instanceId: 'console-ui' }
  },
  {
    id: 'ws-4',
    type: 'workspace',
    name: 'Product Analytics',
    owner: 'user-3',
    createdAt: '2025-01-12',
    reporter: { type: 'service', instanceId: 'console-ui' }
  },
  {
    id: 'ws-5',
    type: 'workspace',
    name: 'Customer Support',
    owner: 'user-1',
    createdAt: '2025-01-15',
    reporter: { type: 'service', instanceId: 'console-ui' }
  }
];

// Sample documents for demonstrating nested resource checks
export const documents = [
  {
    id: 'doc-1',
    type: 'document',
    name: 'Q1 Strategy.pdf',
    workspaceId: 'ws-1',
    reporter: { type: 'service', instanceId: 'console-ui' }
  },
  {
    id: 'doc-2',
    type: 'document',
    name: 'Team Guidelines.md',
    workspaceId: 'ws-1',
    reporter: { type: 'service', instanceId: 'console-ui' }
  },
  {
    id: 'doc-3',
    type: 'document',
    name: 'Campaign Plan.docx',
    workspaceId: 'ws-2',
    reporter: { type: 'service', instanceId: 'console-ui' }
  }
];

// Permission rules - simulates backend authorization
// In a real app, this would be determined by the backend based on user roles, RBAC, etc.
export const permissions: Record<string, Record<string, boolean>> = {
  'ws-1': { view: true, edit: true, delete: true, owner: true },
  'ws-2': { view: true, edit: false, delete: false, owner: false },
  'ws-3': { view: true, edit: true, delete: false, owner: true },
  'ws-4': { view: false, edit: false, delete: false, owner: false },
  'ws-5': { view: true, edit: false, delete: true, owner: true },
  'doc-1': { view: true, edit: true, delete: false },
  'doc-2': { view: true, edit: false, delete: false },
  'doc-3': { view: true, edit: true, delete: true }
};
