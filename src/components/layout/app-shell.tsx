'use client';

import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import { Sidebar } from './sidebar';
import { Header } from './header';
import type { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header />
      <main
        className={cn(
          'pt-16 transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-20'
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
