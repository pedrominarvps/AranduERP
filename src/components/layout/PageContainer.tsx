import { ReactNode } from 'react';

interface PageContainerProps {
  isSidebarOpen: boolean;
  sidebarOverlay: ReactNode;
  sidebar: ReactNode;
  topBar: ReactNode;
  children: ReactNode;
  mobileNav: ReactNode;
}

export function PageContainer({ isSidebarOpen, sidebarOverlay, sidebar, topBar, children, mobileNav }: PageContainerProps) {
  return (
    <div className="app-container">
      {sidebarOverlay}
      {sidebar}
      <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        {topBar}
        {children}
      </main>
      {mobileNav}
    </div>
  );
}
