interface NavigationProps {
  activeDemo: string;
  onSelectDemo: (demo: string) => void;
}

const demos = [
  { id: 'single', label: '1. Single Resource Check' },
  { id: 'bulk-same', label: '2. Bulk Same Relation' },
  { id: 'bulk-nested', label: '3. Bulk Nested Relations' }
];

export default function Navigation({ activeDemo, onSelectDemo }: NavigationProps) {
  return (
    <nav className="sidebar">
      <div className="nav-header">
        <h3>Feature Demos</h3>
      </div>
      <ul className="nav-list">
        {demos.map(demo => (
          <li
            key={demo.id}
            className={`nav-item ${activeDemo === demo.id ? 'active' : ''}`}
            onClick={() => onSelectDemo(demo.id)}
          >
            {demo.label}
          </li>
        ))}
      </ul>
    </nav>
  );
}
