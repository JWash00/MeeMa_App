'use client';

import { useState, ReactNode } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface ShellProps {
  children: ReactNode;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRecommendedClick?: () => void;
}

export default function Shell({ children, searchQuery, onSearchChange, onRecommendedClick }: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="lg:ml-64">
        <TopBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="px-4 lg:px-8 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
