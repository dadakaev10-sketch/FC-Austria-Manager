'use client';

import { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth-store';
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
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Typen
// ---------------------------------------------------------------------------

interface MockAnnouncement {
  id: string;
  title: string;
  content: string;
  announcementType: 'general' | 'training_reminder' | 'match_reminder' | 'parent_message';
  isPinned: boolean;
  authorName: string;
  teamName: string | null;
  createdAt: string;
}

interface MockReminder {
  id: string;
  title: string;
  type: 'training' | 'match';
  date: string;
  time: string;
  location: string;
  teamName: string;
}

// ---------------------------------------------------------------------------
// Mock-Daten
// ---------------------------------------------------------------------------

const MOCK_ANNOUNCEMENTS: MockAnnouncement[] = [
  {
    id: 'a1',
    title: 'Trainingsplan fuer Maerz aktualisiert',
    content:
      'Der Trainingsplan fuer Maerz ist finalisiert. Bitte pruefe den Kalender fuer deine mannschaftsspezifischen Einheiten. Die U15-Einheiten wurden auf Trainingsplatz A verschoben.',
    announcementType: 'general',
    isPinned: true,
    authorName: 'Trainer Hofer',
    teamName: null,
    createdAt: '2026-03-03T10:00:00Z',
  },
  {
    id: 'a2',
    title: 'Spieltag-Trikots koennen abgeholt werden',
    content:
      'Die neuen Spieltag-Trikots fuer alle Jugendmannschaften sind jetzt im Vereinsbuero abholbereit. Bitte vor Samstag abholen. Jeder Spieler erhaelt ein Heim- und Auswaertstrikot.',
    announcementType: 'general',
    isPinned: true,
    authorName: 'Vereinsleitung',
    teamName: null,
    createdAt: '2026-03-02T14:30:00Z',
  },
  {
    id: 'a3',
    title: 'U15 Trainingserinnerung',
    content:
      'Erinnerung: U15 hat morgen Training um 16:00 auf Trainingsplatz A. Bitte 15 Minuten frueher zum Aufwaermen erscheinen. Schienbeinschoner und Wasser mitbringen.',
    announcementType: 'training_reminder',
    isPinned: false,
    authorName: 'Trainer Hofer',
    teamName: 'U15',
    createdAt: '2026-03-01T09:00:00Z',
  },
  {
    id: 'a4',
    title: 'Samstag Spiel gegen FC Rapid - Verfuegbarkeit bestaetigen',
    content:
      'Bitte bestaetigt eure Verfuegbarkeit fuer das U17-Spiel gegen FC Rapid Wien II am Samstag um 10:00. Antwortet auf diese Ankuendigung oder kontaktiert Trainer Hofer bis Donnerstag.',
    announcementType: 'match_reminder',
    isPinned: false,
    authorName: 'Trainer Hofer',
    teamName: 'U17',
    createdAt: '2026-02-28T16:00:00Z',
  },
  {
    id: 'a5',
    title: 'Eltern-Freiwillige gesucht',
    content:
      'Wir suchen Eltern-Freiwillige fuer die Organisation der kommenden Benefiz-Gala am 22. Maerz. Bei Interesse bitte das Vereinsbuero kontaktieren.',
    announcementType: 'parent_message',
    isPinned: false,
    authorName: 'Vereinsleitung',
    teamName: null,
    createdAt: '2026-02-27T11:00:00Z',
  },
  {
    id: 'a6',
    title: 'Anmeldung zum Fruehjahrsturnier geoeffnet',
    content:
      'Die Anmeldung fuer das Fruehjahrsturnier ist jetzt geoeffnet. Alle Mannschaften von U10 bis U19 koennen teilnehmen. Anmeldeschluss ist der 31. Maerz. Kontaktiert euren Trainer fuer Details.',
    announcementType: 'general',
    isPinned: false,
    authorName: 'Vereinsleitung',
    teamName: null,
    createdAt: '2026-02-25T08:30:00Z',
  },
];

const today = new Date();
const toISODate = (d: Date) => d.toISOString().split('T')[0];
const addDays = (d: Date, n: number) => {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
};

const MOCK_REMINDERS: MockReminder[] = [
  {
    id: 'r1',
    title: 'U15 Passspiel & Bewegung',
    type: 'training',
    date: toISODate(addDays(today, 1)),
    time: '16:00',
    location: 'Trainingsplatz A',
    teamName: 'U15',
  },
  {
    id: 'r2',
    title: 'U17 vs FC Rapid Wien II',
    type: 'match',
    date: toISODate(addDays(today, 3)),
    time: '10:00',
    location: 'Heimstadion',
    teamName: 'U17',
  },
  {
    id: 'r3',
    title: 'U19 Pressing & Konter',
    type: 'training',
    date: toISODate(addDays(today, 4)),
    time: '16:00',
    location: 'Trainingsplatz B',
    teamName: 'U19',
  },
  {
    id: 'r4',
    title: 'Kampfmannschaft vs SV Mattersburg',
    type: 'match',
    date: toISODate(addDays(today, 7)),
    time: '15:30',
    location: 'Heimstadion',
    teamName: 'Kampfmannschaft',
  },
];

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

const TEAM_OPTIONS = [
  { value: '', label: 'Vereinsweit (alle Teams)' },
  { value: 'U12', label: 'U12' },
  { value: 'U15', label: 'U15' },
  { value: 'U17', label: 'U17' },
  { value: 'U19', label: 'U19' },
  { value: 'Kampfmannschaft', label: 'Kampfmannschaft' },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CommunicationPage() {
  const { isCoachOrAbove } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'announcements' | 'reminders'>('announcements');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formular-Zustand
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formType, setFormType] = useState('general');
  const [formTeam, setFormTeam] = useState('');
  const [formPinned, setFormPinned] = useState(false);

  const canCreate = isCoachOrAbove();

  // Ankuendigungen sortieren: angepinnt zuerst, dann nach Datum
  const sortedAnnouncements = useMemo(() => {
    return [...MOCK_ANNOUNCEMENTS].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, []);

  function handleSubmit() {
    // In Produktion wuerden die Daten an Firestore gesendet
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
          {sortedAnnouncements.map((announcement) => (
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
                        <span>{announcement.authorName}</span>
                        <span>&middot;</span>
                        <span>{formatDate(announcement.createdAt)}</span>
                        {announcement.teamName && (
                          <>
                            <span>&middot;</span>
                            <span className="font-medium text-emerald-600">
                              {announcement.teamName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={getAnnouncementBadgeVariant(
                        announcement.announcementType
                      )}
                    >
                      {formatAnnouncementType(announcement.announcementType)}
                    </Badge>
                  </div>

                  {/* Inhaltsvorschau */}
                  <p className="text-sm leading-relaxed text-gray-600">
                    {announcement.content}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}

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
          {MOCK_REMINDERS.map((reminder) => {
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
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {reminder.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {MOCK_REMINDERS.length === 0 && (
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
