'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useClubStore } from '@/stores/club-store';
import {
  subscribeClubAnnouncements,
  subscribeClubTrainings,
  subscribeClubMatches,
  announcementsService,
} from '@/lib/firebase/services';
import type { Announcement, Training, Match, AnnouncementType } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Pin,
  Plus,
  Bell,
  Send,
  Dumbbell,
  Trophy,
  Clock,
  MapPin,
  Loader2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAnnouncementBadgeVariant(type: string) {
  switch (type) {
    case 'training_reminder':
      return 'info' as const;
    case 'match_reminder':
      return 'warning' as const;
    case 'parent_message':
      return 'success' as const;
    default:
      return 'default' as const;
  }
}

function formatAnnouncementType(type: string) {
  switch (type) {
    case 'general':
      return 'Allgemein';
    case 'training_reminder':
      return 'Training';
    case 'match_reminder':
      return 'Spiel';
    case 'parent_message':
      return 'Eltern';
    default:
      return type;
  }
}

// ---------------------------------------------------------------------------
// Konstanten
// ---------------------------------------------------------------------------

const TYPE_OPTIONS = [
  { value: 'general', label: 'Allgemein' },
  { value: 'training_reminder', label: 'Trainingserinnerung' },
  { value: 'match_reminder', label: 'Spielerinnerung' },
  { value: 'parent_message', label: 'Elternnachricht' },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CommunicationPage() {
  const { profile, isCoachOrAbove } = useAuthStore();
  const { currentClub, teams } = useClubStore();
  const [activeTab, setActiveTab] = useState<'announcements' | 'reminders'>('announcements');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formular-Zustand
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formType, setFormType] = useState('general');
  const [formTeam, setFormTeam] = useState('');
  const [formPinned, setFormPinned] = useState(false);

  // Firestore state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const canCreate = isCoachOrAbove();

  // Dynamic team options from store
  const TEAM_OPTIONS = useMemo(() => {
    const options = [{ value: '', label: 'Vereinsweit (alle Teams)' }];
    teams.forEach((t) => {
      options.push({ value: t.id, label: t.name });
    });
    return options;
  }, [teams]);

  // Subscribe to Firestore collections
  useEffect(() => {
    if (!currentClub?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let announcementsLoaded = false;
    let trainingsLoaded = false;
    let matchesLoaded = false;

    function checkAllLoaded() {
      if (announcementsLoaded && trainingsLoaded && matchesLoaded) {
        setIsLoading(false);
      }
    }

    const unsubAnnouncements = subscribeClubAnnouncements(currentClub.id, (data) => {
      setAnnouncements(data);
      announcementsLoaded = true;
      checkAllLoaded();
    });

    const unsubTrainings = subscribeClubTrainings(currentClub.id, (data) => {
      setTrainings(data);
      trainingsLoaded = true;
      checkAllLoaded();
    });

    const unsubMatches = subscribeClubMatches(currentClub.id, (data) => {
      setMatches(data);
      matchesLoaded = true;
      checkAllLoaded();
    });

    return () => {
      unsubAnnouncements();
      unsubTrainings();
      unsubMatches();
    };
  }, [currentClub?.id]);

  // Ankuendigungen sortieren: angepinnt zuerst, dann nach Datum
  const sortedAnnouncements = useMemo(() => {
    return [...announcements].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [announcements]);

  // Erinnerungen aus kommenden Trainings + Spielen ableiten
  const reminders = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const items: {
      id: string;
      title: string;
      type: 'training' | 'match';
      date: string;
      time: string;
      location: string;
      teamName: string;
    }[] = [];

    trainings.forEach((t) => {
      if (t.date >= todayStr) {
        const teamName = teams.find((tm) => tm.id === t.teamId)?.name || t.teamId;
        items.push({
          id: t.id,
          title: teamName + ' ' + t.focus,
          type: 'training',
          date: t.date,
          time: t.startTime,
          location: t.location,
          teamName,
        });
      }
    });

    matches.forEach((m) => {
      if (m.date >= todayStr) {
        const teamName = teams.find((tm) => tm.id === m.teamId)?.name || m.teamId;
        items.push({
          id: m.id,
          title: teamName + ' vs ' + m.opponent,
          type: 'match',
          date: m.date,
          time: m.time,
          location: m.location || '',
          teamName,
        });
      }
    });

    items.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });

    return items.slice(0, 10);
  }, [trainings, matches, teams]);

  async function handleSubmit() {
    if (!currentClub?.id || !profile?.id) return;

    try {
      await announcementsService.create({
        clubId: currentClub.id,
        teamId: formTeam || null,
        authorId: profile.id,
        title: formTitle.trim(),
        content: formContent.trim(),
        type: formType as AnnouncementType,
        isPinned: formPinned,
      });
    } catch (error) {
      console.error('Fehler beim Erstellen der Ankuendigung:', error);
    }

    setIsModalOpen(false);
    setFormTitle('');
    setFormContent('');
    setFormType('general');
    setFormTeam('');
    setFormPinned(false);
  }

  function openModal() {
    setIsModalOpen(true);
  }

  // ---- Loading state ----
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seitenkopf */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kommunikation</h1>
          <p className="mt-1 text-sm text-gray-500">
            Ankuendigungen, Erinnerungen und Nachrichten fuer Teams und Eltern.
          </p>
        </div>
        {canCreate && (
          <Button onClick={openModal}>
            <Plus className="mr-2 h-4 w-4" />
            Neue Ankuendigung
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 w-fit">
        <button
          onClick={() => setActiveTab('announcements')}
          className={cn(
            'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'announcements'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          <MessageSquare className="h-4 w-4" />
          Ankuendigungen
        </button>
        <button
          onClick={() => setActiveTab('reminders')}
          className={cn(
            'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'reminders'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          <Bell className="h-4 w-4" />
          Erinnerungen
        </button>
      </div>

      {/* Ankuendigungen-Tab */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          {sortedAnnouncements.map((announcement) => {
            const teamName = announcement.teamId
              ? teams.find((t) => t.id === announcement.teamId)?.name || null
              : null;
            const authorName =
              profile && announcement.authorId === profile.id
                ? 'Du'
                : announcement.authorId;

            return (
              <Card key={announcement.id} className="transition-shadow hover:shadow-md">
                <CardContent className="py-5">
                  <div className="space-y-3">
                    {/* Kopfzeile */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-semibold text-gray-900">
                            {announcement.title}
                          </h3>
                          {announcement.isPinned && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              <Pin className="h-3 w-3" />
                              Angepinnt
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                          <span>{authorName}</span>
                          <span>&middot;</span>
                          <span>{formatDate(announcement.createdAt)}</span>
                          {teamName && (
                            <>
                              <span>&middot;</span>
                              <span className="font-medium text-emerald-600">
                                {teamName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={getAnnouncementBadgeVariant(announcement.type)}
                      >
                        {formatAnnouncementType(announcement.type)}
                      </Badge>
                    </div>

                    {/* Inhaltsvorschau */}
                    <p className="text-sm leading-relaxed text-gray-600">
                      {announcement.content}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {sortedAnnouncements.length === 0 && (
            <Card>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="mb-3 h-8 w-8 text-gray-300" />
                  <p className="text-sm font-medium text-gray-900">
                    Noch keine Ankuendigungen
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Erstelle eine neue Ankuendigung, um Informationen mit deinen Teams zu teilen.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Erinnerungen-Tab */}
      {activeTab === 'reminders' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Kommende Trainings und Spiele automatisch aus dem Zeitplan generiert.
          </p>
          {reminders.map((reminder) => {
            const isMatch = reminder.type === 'match';
            return (
              <Card key={reminder.id} className="transition-shadow hover:shadow-md">
                <CardContent className="py-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
                        isMatch
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-emerald-100 text-emerald-600'
                      )}
                    >
                      {isMatch ? (
                        <Trophy className="h-5 w-5" />
                      ) : (
                        <Dumbbell className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-semibold text-gray-900">
                          {reminder.title}
                        </h3>
                        <Badge variant={isMatch ? 'info' : 'success'}>
                          {isMatch ? 'Spiel' : 'Training'}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-sm font-medium text-emerald-600">
                        {reminder.teamName}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(reminder.date)} &middot; {reminder.time}
                        </span>
                        {reminder.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {reminder.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {reminders.length === 0 && (
            <Card>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="mb-3 h-8 w-8 text-gray-300" />
                  <p className="text-sm font-medium text-gray-900">
                    Keine kommenden Erinnerungen
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Erinnerungen erscheinen hier, wenn Trainings oder Spiele geplant sind.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Modal: Neue Ankuendigung */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Neue Ankuendigung"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            id="announcement-title"
            label="Titel"
            placeholder="Titel der Ankuendigung..."
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />

          <div className="space-y-1">
            <label
              htmlFor="announcement-content"
              className="block text-sm font-medium text-gray-700"
            >
              Inhalt
            </label>
            <textarea
              id="announcement-content"
              rows={4}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Schreibe deine Ankuendigung..."
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              id="announcement-type"
              label="Typ"
              options={TYPE_OPTIONS}
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
            />
            <Select
              id="announcement-team"
              label="Mannschaft (optional)"
              options={TEAM_OPTIONS}
              value={formTeam}
              onChange={(e) => setFormTeam(e.target.value)}
            />
          </div>

          {/* Anpinnen-Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={formPinned}
              onClick={() => setFormPinned(!formPinned)}
              className={cn(
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                formPinned ? 'bg-emerald-600' : 'bg-gray-200'
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                  formPinned ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Pin className="h-4 w-4" />
              Ankuendigung anpinnen
            </label>
          </div>

          {/* Aktionen */}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formTitle.trim() || !formContent.trim()}
            >
              <Send className="mr-2 h-4 w-4" />
              Veroeffentlichen
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
