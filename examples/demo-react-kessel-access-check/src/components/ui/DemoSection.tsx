import type { ReactNode } from 'react';

interface DemoSectionProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function DemoSection({ title, description, children }: DemoSectionProps) {
  return (
    <div className="demo-section">
      <h2 className="demo-title">{title}</h2>
      <p className="demo-description">{description}</p>
      <div className="demo-content">{children}</div>
    </div>
  );
}
