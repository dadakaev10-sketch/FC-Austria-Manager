'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useClubStore } from '@/stores/club-store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  User,
  Building,
  Shield,
  Bell,
  Save,
  Camera,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { updateUserProfile, clubsService } from '@/lib/firebase/services';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import type { UserRole, Profile } from '@/types/database';

// ---------------------------------------------------------------------------
// Static constants
// ---------------------------------------------------------------------------

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

interface ClubUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
}

export default function SettingsPage() {
  const { profile, hasRole } = useAuthStore();
  const { currentClub } = useClubStore();

  const isAdmin = hasRole(['admin']);
  const isAdminOrManager = hasRole(['admin', 'manager']);

  // Profil-Formular
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');

  // Vereins-Formular
  const [clubName, setClubName] = useState('');
  const [clubAddress, setClubAddress] = useState('');
  const [clubCity, setClubCity] = useState('');
  const [clubCountry, setClubCountry] = useState('');
  const [clubWebsite, setClubWebsite] = useState('');

  // Rollenverwaltung
  const [users, setUsers] = useState<ClubUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Saving state
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [savingClub, setSavingClub] = useState(false);
  const [savedClub, setSavedClub] = useState(false);
  const [savingRole, setSavingRole] = useState<string | null>(null);

  // Benachrichtigungseinstellungen
  const [notifyTraining, setNotifyTraining] = useState(true);
  const [notifyMatch, setNotifyMatch] = useState(true);
  const [notifyAnnouncements, setNotifyAnnouncements] = useState(true);

  // Initialize profile form from real data
  useEffect(() => {
    if (profile) {
      setProfileName(profile.fullName || '');
      setProfileEmail(profile.email || '');
      setProfilePhone(profile.phone || '');
    }
  }, [profile]);

  // Initialize club form from real data
  useEffect(() => {
    if (currentClub) {
      setClubName(currentClub.name || '');
      setClubAddress(currentClub.address || '');
      setClubCity(currentClub.city || '');
      setClubCountry(currentClub.country || '');
      setClubWebsite(currentClub.website || '');
    }
  }, [currentClub]);

  // Subscribe to users collection for the current club
  useEffect(() => {
    if (!currentClub?.id) {
      setUsers([]);
      setUsersLoading(false);
      return;
    }

    setUsersLoading(true);
    const q = query(
      collection(db, 'users'),
      where('clubId', '==', currentClub.id)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const clubUsers: ClubUser[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            fullName: data.fullName || '',
            email: data.email || '',
            role: data.role as UserRole,
            avatarUrl: data.avatarUrl || null,
          };
        });
        setUsers(clubUsers);
        setUsersLoading(false);
      },
      (error) => {
        console.error('[Settings] Error subscribing to users:', error.message);
        setUsers([]);
        setUsersLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentClub?.id]);

  // Save profile handler
  async function handleSaveProfile() {
    if (!profile?.id) return;
    setSavingProfile(true);
    setSavedProfile(false);
    try {
      await updateUserProfile(profile.id, {
        fullName: profileName,
        phone: profilePhone || null,
      });
      setSavedProfile(true);
      setTimeout(() => setSavedProfile(false), 3000);
    } catch (error) {
      console.error('[Settings] Error saving profile:', error);
    } finally {
      setSavingProfile(false);
    }
  }

  // Save club handler
  async function handleSaveClub() {
    if (!currentClub?.id) return;
    setSavingClub(true);
    setSavedClub(false);
    try {
      await clubsService.update(currentClub.id, {
        name: clubName,
        address: clubAddress || null,
        city: clubCity || null,
        country: clubCountry || null,
        website: clubWebsite || null,
      } as Partial<typeof currentClub>);
      setSavedClub(true);
      setTimeout(() => setSavedClub(false), 3000);
    } catch (error) {
      console.error('[Settings] Error saving club:', error);
    } finally {
      setSavingClub(false);
    }
  }

  // Role change handler
  async function handleRoleChange(userId: string, newRole: UserRole) {
    setSavingRole(userId);
    try {
      await updateUserProfile(userId, { role: newRole });
    } catch (error) {
      console.error('[Settings] Error updating role:', error);
    } finally {
      setSavingRole(null);
    }
  }

  // Show loading state while profile hasn't loaded yet
  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
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
                  src={profile.avatarUrl}
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
                disabled
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

            <div className="flex items-center justify-end gap-3">
              {savedProfile && (
                <span className="flex items-center gap-1 text-sm text-emerald-600">
                  <CheckCircle className="h-4 w-4" />
                  Gespeichert
                </span>
              )}
              <Button onClick={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Profil speichern
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vereinseinstellungen (Admin/Manager) */}
      {isAdminOrManager && currentClub && (
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

              <div className="flex items-center justify-end gap-3">
                {savedClub && (
                  <span className="flex items-center gap-1 text-sm text-emerald-600">
                    <CheckCircle className="h-4 w-4" />
                    Gespeichert
                  </span>
                )}
                <Button onClick={handleSaveClub} disabled={savingClub}>
                  {savingClub ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
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

            {usersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              </div>
            ) : users.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                Keine Benutzer gefunden.
              </p>
            ) : (
              <>
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
                            <div className="flex items-center gap-2">
                              <select
                                value={user.role}
                                onChange={(e) =>
                                  handleRoleChange(user.id, e.target.value as UserRole)
                                }
                                disabled={savingRole === user.id}
                                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              >
                                {ROLE_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              {savingRole === user.id && (
                                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                              )}
                            </div>
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
                        <div className="flex items-center gap-2">
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(user.id, e.target.value as UserRole)
                            }
                            disabled={savingRole === user.id}
                            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            {ROLE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          {savingRole === user.id && (
                            <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
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
