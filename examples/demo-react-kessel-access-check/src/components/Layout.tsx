import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <header className="header">
        <h1 className="header-title">@project-kessel/react-kessel-access-check</h1>
        <p className="header-subtitle">Interactive Demo & Feature Showcase</p>
      </header>
      {children}
    </div>
  );
}
