interface PermissionBadgeProps {
  allowed: boolean;
  relation: string;
  resource: { id: string; type: string; name?: string; [key: string]: unknown };
}

export default function PermissionBadge({ allowed, relation, resource }: PermissionBadgeProps) {
  return (
    <div className={`permission-badge ${allowed ? 'allowed' : 'denied'}`}>
      <span className="permission-icon">{allowed ? '✓' : '✗'}</span>
      <span className="permission-text">
        {allowed ? 'Allowed' : 'Denied'}: <strong>{relation}</strong> on{' '}
        <em>{resource.name || resource.id}</em>
      </span>
    </div>
  );
}
