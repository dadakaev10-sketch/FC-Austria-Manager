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
// Mock-Daten
// ---------------------------------------------------------------------------

const MOCK_PROFILE = {
  fullName: 'Stefan Hofer',
  email: 'stefan.hofer@fcclub.at',
  phone: '+43 664 1234567',
  avatarUrl: null as string | null,
};

const MOCK_CLUB = {
  name: 'FC Austria Wien Jugend',
  address: 'Fischhofgasse 12',
  city: 'Wien',
  country: 'Oesterreich',
  website: 'https://fc-austria-jugend.at',
};

interface MockUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
}

const MOCK_USERS: MockUser[] = [
  {
    id: 'u1',
    fullName: 'Stefan Hofer',
    email: 'stefan.hofer@fcclub.at',
    role: 'admin',
    avatarUrl: null,
  },
  {
    id: 'u2',
    fullName: 'Anna Schneider',
    email: 'anna.schneider@fcclub.at',
    role: 'manager',
    avatarUrl: null,
  },
  {
    id: 'u3',
    fullName: 'Thomas Mueller',
    email: 'thomas.mueller@fcclub.at',
    role: 'coach',
    avatarUrl: null,
  },
  {
    id: 'u4',
    fullName: 'Lisa Weber',
    email: 'lisa.weber@fcclub.at',
    role: 'coach',
    avatarUrl: null,
  },
  {
    id: 'u5',
    fullName: 'Marco Berger',
    email: 'marco.berger@fcclub.at',
    role: 'assistant_coach',
    avatarUrl: null,
  },
  {
    id: 'u6',
    fullName: 'Sophie Fischer',
    email: 'sophie.fischer@fcclub.at',
    role: 'assistant_coach',
    avatarUrl: null,
  },
  {
    id: 'u7',
    fullName: 'Jan Becker',
    email: 'jan.becker@fcclub.at',
    role: 'player',
    avatarUrl: null,
  },
  {
    id: 'u8',
    fullName: 'Maria Hoffmann',
    email: 'maria.hoffmann@fcclub.at',
    role: 'parent',
    avatarUrl: null,
  },
];

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'coach', label: 'Trainer' },
  { value: 'assistant_coach', label: 'Co-Trainer' },
  { value: 'player', label: 'Spieler' },
  { value: 'parent', label: 'Elternteil' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRoleBadgeVariant(role: UserRole) {
  switch (role) {
    case 'admin':
      return 'danger' as const;
    case 'manager':
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
  switch (role) {
    case 'admin':
      return 'Admin';
    case 'manager':
      return 'Manager';
    case 'coach':
      return 'Trainer';
    case 'assistant_coach':
      return 'Co-Trainer';
    case 'player':
      return 'Spieler';
    case 'parent':
      return 'Elternteil';
    default:
      return role;
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const { profile, hasRole } = useAuthStore();

  const isAdmin = hasRole(['admin']);
  const isAdminOrManager = hasRole(['admin', 'manager']);

  // Profil-Formular
  const [profileName, setProfileName] = useState(MOCK_PROFILE.fullName);
  const [profileEmail, setProfileEmail] = useState(MOCK_PROFILE.email);
  const [profilePhone, setProfilePhone] = useState(MOCK_PROFILE.phone);

  // Vereins-Formular
  const [clubName, setClubName] = useState(MOCK_CLUB.name);
  const [clubAddress, setClubAddress] = useState(MOCK_CLUB.address);
  const [clubCity, setClubCity] = useState(MOCK_CLUB.city);
  const [clubCountry, setClubCountry] = useState(MOCK_CLUB.country);
  const [clubWebsite, setClubWebsite] = useState(MOCK_CLUB.website);

  // Rollenverwaltung
  const [users, setUsers] = useState<MockUser[]>(MOCK_USERS);

  // Benachrichtigungseinstellungen
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
      {/* Seitenkopf */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
        <p className="mt-1 text-sm text-gray-500">
          Verwalte dein Profil, Vereinseinstellungen und Benachrichtigungen.
        </p>
      </div>

      {/* Profileinstellungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-emerald-600" />
            Profil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar
                  name={profileName}
                  src={MOCK_PROFILE.avatarUrl}
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
                    : 'Trainer'}
                </p>
              </div>
            </div>

            {/* Formularfelder */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="profile-name"
                label="Vollstaendiger Name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
              <Input
                id="profile-email"
                label="E-Mail"
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
              />
              <Input
                id="profile-phone"
                label="Telefon"
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Profil speichern
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vereinseinstellungen (Admin/Manager) */}
      {isAdminOrManager && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-emerald-600" />
              Vereinseinstellungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  id="club-name"
                  label="Vereinsname"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                />
                <Input
                  id="club-website"
                  label="Webseite"
                  type="url"
                  value={clubWebsite}
                  onChange={(e) => setClubWebsite(e.target.value)}
                />
                <Input
                  id="club-address"
                  label="Adresse"
                  value={clubAddress}
                  onChange={(e) => setClubAddress(e.target.value)}
                />
                <Input
                  id="club-city"
                  label="Stadt"
                  value={clubCity}
                  onChange={(e) => setClubCity(e.target.value)}
                />
                <Input
                  id="club-country"
                  label="Land"
                  value={clubCountry}
                  onChange={(e) => setClubCountry(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Vereinseinstellungen speichern
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rollenverwaltung (nur Admin) */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              Rollenverwaltung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-500">
              Verwalte Benutzerrollen und Berechtigungen im Verein.
            </p>

            {/* Desktop-Tabelle */}
            <div className="hidden overflow-hidden rounded-lg border border-gray-200 md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Benutzer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      E-Mail
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Aktuelle Rolle
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Rolle aendern
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
                          <span className="text-sm font-medium text-gray-900">
                            {user.fullName}
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

            {/* Mobile-Karten */}
            <div className="space-y-3 md:hidden">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="rounded-lg border border-gray-200 p-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.fullName}
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

      {/* Benachrichtigungseinstellungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-emerald-600" />
            Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-500">
            Waehle, welche E-Mail-Benachrichtigungen du erhalten moechtest.
          </p>

          <div className="space-y-4">
            {/* Trainingserinnerungen */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Trainingserinnerungen
                </p>
                <p className="text-xs text-gray-500">
                  E-Mail-Erinnerungen vor geplanten Trainingseinheiten erhalten.
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

            {/* Spielerinnerungen */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Spielerinnerungen
                </p>
                <p className="text-xs text-gray-500">
                  E-Mail-Erinnerungen vor kommenden Spielen erhalten.
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

            {/* Ankuendigungen */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Ankuendigungen
                </p>
                <p className="text-xs text-gray-500">
                  E-Mail-Benachrichtigungen bei neuen Vereinsankuendigungen erhalten.
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
              Einstellungen speichern
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
