'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/components/providers/auth-provider';
import { AppShell } from '@/components/layout/app-shell';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // On the onboarding page, render without the AppShell (no sidebar/header)
  if (pathname === '/onboarding') {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return <AppShell>{children}</AppShell>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  );
}
