'use client';

import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Dumbbell,
  Trophy,
  BarChart3,
  CalendarDays,
  MessageSquare,
  Settings,
  ChevronLeft,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Teams', href: '/teams', icon: Users },
  { name: 'Players', href: '/players', icon: UserCircle },
  { name: 'Trainings', href: '/trainings', icon: Dumbbell },
  { name: 'Matches', href: '/matches', icon: Trophy },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Calendar', href: '/calendar', icon: CalendarDays },
  { name: 'Communication', href: '/communication', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { profile } = useAuthStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600">
            <Shield className="h-6 w-6 text-white" />
          </div>
          {sidebarOpen && (
            <span className="text-lg font-bold text-gray-900">FC Manager</span>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <ChevronLeft
            className={cn('h-5 w-5 transition-transform', !sidebarOpen && 'rotate-180')}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
              title={!sidebarOpen ? item.name : undefined}
            >
              <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-emerald-600')} />
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      {profile && sidebarOpen && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
              {profile.full_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">
                {profile.full_name}
              </p>
              <p className="truncate text-xs text-gray-500 capitalize">{profile.role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
