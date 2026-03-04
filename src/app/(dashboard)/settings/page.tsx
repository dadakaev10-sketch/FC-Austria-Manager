'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Settings,
  User,
  Building,
  Shield,
  Bell,
  Save,
  Camera,
} from 'lucide-react';
import type { UserRole } from '@/types/database';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_PROFILE = {
  full_name: 'Carlos Martinez',
  email: 'carlos.martinez@fcclub.com',
  phone: '+49 170 1234567',
  avatar_url: null as string | null,
};

const MOCK_CLUB = {
  name: 'FC Development Academy',
  address: 'Sportstr. 12',
  city: 'Munich',
  country: 'Germany',
  website: 'https://fc-academy.dev',
};

interface MockUser {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
}

const MOCK_USERS: MockUser[] = [
  {
    id: 'u1',
    full_name: 'Carlos Martinez',
    email: 'carlos.martinez@fcclub.com',
    role: 'admin',
    avatar_url: null,
  },
  {
    id: 'u2',
    full_name: 'Anna Schneider',
    email: 'anna.schneider@fcclub.com',
    role: 'club_manager',
    avatar_url: null,
  },
  {
    id: 'u3',
    full_name: 'Thomas Muller',
    email: 'thomas.muller@fcclub.com',
    role: 'coach',
    avatar_url: null,
  },
  {
    id: 'u4',
    full_name: 'Lisa Weber',
    email: 'lisa.weber@fcclub.com',
    role: 'coach',
    avatar_url: null,
  },
  {
    id: 'u5',
    full_name: 'Marco Rossi',
    email: 'marco.rossi@fcclub.com',
    role: 'assistant_coach',
    avatar_url: null,
  },
  {
    id: 'u6',
    full_name: 'Sophie Fischer',
    email: 'sophie.fischer@fcclub.com',
    role: 'assistant_coach',
    avatar_url: null,
  },
  {
    id: 'u7',
    full_name: 'Jan Becker',
    email: 'jan.becker@fcclub.com',
    role: 'player',
    avatar_url: null,
  },
  {
    id: 'u8',
    full_name: 'Maria Hoffmann',
    email: 'maria.hoffmann@fcclub.com',
    role: 'parent',
    avatar_url: null,
  },
];

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'club_manager', label: 'Club Manager' },
  { value: 'coach', label: 'Coach' },
  { value: 'assistant_coach', label: 'Assistant Coach' },
  { value: 'player', label: 'Player' },
  { value: 'parent', label: 'Parent' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRoleBadgeVariant(role: UserRole) {
  switch (role) {
    case 'admin':
      return 'danger' as const;
    case 'club_manager':
      return 'warning' as const;
    case 'coach':
      return 'success' as const;
    case 'assistant_coach':
      return 'info' as const;
    case 'player':
      return 'default' as const;
    case 'parent':
      return 'default' as const;
    default:
      return 'default' as const;
  }
}

function formatRoleLabel(role: string) {
  return role
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const { profile, hasRole } = useAuthStore();

  const isAdmin = hasRole(['admin']);
  const isAdminOrManager = hasRole(['admin', 'club_manager']);

  // Profile form state
  const [profileName, setProfileName] = useState(MOCK_PROFILE.full_name);
  const [profileEmail, setProfileEmail] = useState(MOCK_PROFILE.email);
  const [profilePhone, setProfilePhone] = useState(MOCK_PROFILE.phone);

  // Club form state
  const [clubName, setClubName] = useState(MOCK_CLUB.name);
  const [clubAddress, setClubAddress] = useState(MOCK_CLUB.address);
  const [clubCity, setClubCity] = useState(MOCK_CLUB.city);
  const [clubCountry, setClubCountry] = useState(MOCK_CLUB.country);
  const [clubWebsite, setClubWebsite] = useState(MOCK_CLUB.website);

  // Role management state
  const [users, setUsers] = useState<MockUser[]>(MOCK_USERS);

  // Notification preferences state
  const [notifyTraining, setNotifyTraining] = useState(true);
  const [notifyMatch, setNotifyMatch] = useState(true);
  const [notifyAnnouncements, setNotifyAnnouncements] = useState(true);

  function handleRoleChange(userId: string, newRole: UserRole) {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your profile, club settings, and notification preferences.
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-emerald-600" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Avatar section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar
                  name={profileName}
                  src={MOCK_PROFILE.avatar_url}
                  size="lg"
                />
                <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-white shadow-sm hover:bg-emerald-700">
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{profileName}</p>
                <p className="text-xs text-gray-500">
                  {profile?.role
                    ? formatRoleLabel(profile.role)
                    : 'Coach'}
                </p>
              </div>
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="profile-name"
                label="Full Name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
              <Input
                id="profile-email"
                label="Email"
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
              />
              <Input
                id="profile-phone"
                label="Phone"
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Club Settings (admin/club_manager only) */}
      {isAdminOrManager && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-emerald-600" />
              Club Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  id="club-name"
                  label="Club Name"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                />
                <Input
                  id="club-website"
                  label="Website"
                  type="url"
                  value={clubWebsite}
                  onChange={(e) => setClubWebsite(e.target.value)}
                />
                <Input
                  id="club-address"
                  label="Address"
                  value={clubAddress}
                  onChange={(e) => setClubAddress(e.target.value)}
                />
                <Input
                  id="club-city"
                  label="City"
                  value={clubCity}
                  onChange={(e) => setClubCity(e.target.value)}
                />
                <Input
                  id="club-country"
                  label="Country"
                  value={clubCountry}
                  onChange={(e) => setClubCountry(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Club Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Management (admin only) */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              Role Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-500">
              Manage user roles and permissions across the club.
            </p>

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-lg border border-gray-200 md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Current Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Change Role
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.full_name} src={user.avatar_url} size="sm" />
                          <span className="text-sm font-medium text-gray-900">
                            {user.full_name}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {formatRoleLabel(user.role)}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value as UserRole)
                          }
                          className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          {ROLE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="rounded-lg border border-gray-200 p-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={user.full_name} src={user.avatar_url} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.full_name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {formatRoleLabel(user.role)}
                    </Badge>
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value as UserRole)
                      }
                      className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-emerald-600" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-500">
            Choose which email notifications you would like to receive.
          </p>

          <div className="space-y-4">
            {/* Training reminders */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Training Reminders
                </p>
                <p className="text-xs text-gray-500">
                  Receive email reminders before scheduled training sessions.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifyTraining}
                onClick={() => setNotifyTraining(!notifyTraining)}
                className={cn(
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                  notifyTraining ? 'bg-emerald-600' : 'bg-gray-200'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                    notifyTraining ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>

            {/* Match reminders */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Match Reminders
                </p>
                <p className="text-xs text-gray-500">
                  Receive email reminders before upcoming matches.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifyMatch}
                onClick={() => setNotifyMatch(!notifyMatch)}
                className={cn(
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                  notifyMatch ? 'bg-emerald-600' : 'bg-gray-200'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                    notifyMatch ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>

            {/* Announcements */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Announcements
                </p>
                <p className="text-xs text-gray-500">
                  Receive email notifications for new club announcements.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifyAnnouncements}
                onClick={() => setNotifyAnnouncements(!notifyAnnouncements)}
                className={cn(
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                  notifyAnnouncements ? 'bg-emerald-600' : 'bg-gray-200'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                    notifyAnnouncements ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
