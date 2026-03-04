'use client';

import { useAuthStore } from '@/stores/auth-store';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Dumbbell,
  Trophy,
  TrendingUp,
  Calendar,
  MapPin,
  Clock,
  Megaphone,
} from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Mock / Platzhalterdaten
// Diese werden spaeter durch echte Firebase/Firestore-Abfragen ersetzt.
// ---------------------------------------------------------------------------

// TODO: Spieleranzahl aus Firestore abrufen
const MOCK_TOTAL_PLAYERS = 42;

// TODO: Kommende Trainings aus Firestore abrufen
const MOCK_UPCOMING_TRAININGS = 8;

// TODO: Kommende Spiele aus Firestore abrufen
const MOCK_UPCOMING_MATCHES = 3;

// TODO: Anwesenheitsrate aus Firestore berechnen
const MOCK_ATTENDANCE_RATE = 87;

// TODO: Naechstes Training aus Firestore abrufen
const MOCK_NEXT_TRAINING = {
  id: '1',
  date: '2026-03-04',
  startTime: '17:00',
  endTime: '18:30',
  location: 'Trainingsplatz A',
  focus: 'Taktische Positionierung & Pressing',
  team: { name: 'U15' },
};

// TODO: Kommende Spiele aus Firestore abrufen
const MOCK_UPCOMING_MATCHES_LIST = [
  {
    id: '1',
    date: '2026-03-07',
    time: '15:00',
    opponent: 'FC Rapid Wien II',
    homeOrAway: 'home' as const,
    competition: 'Wiener Liga',
    team: { name: 'U15' },
  },
  {
    id: '2',
    date: '2026-03-14',
    time: '10:30',
    opponent: 'SC Admira Jugend',
    homeOrAway: 'away' as const,
    competition: 'OeFB Jugendcup',
    team: { name: 'U17' },
  },
  {
    id: '3',
    date: '2026-03-21',
    time: '14:00',
    opponent: 'SK Sturm Graz Jugend',
    homeOrAway: 'home' as const,
    competition: 'Wiener Liga',
    team: { name: 'U15' },
  },
];

// TODO: Ankuendigungen aus Firestore abrufen
const MOCK_ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'Trainingsplan fuer Maerz aktualisiert',
    announcementType: 'general' as const,
    createdAt: '2026-03-03T10:00:00Z',
    author: { fullName: 'Trainer Hofer' },
  },
  {
    id: '2',
    title: 'Spieltag-Trikots koennen abgeholt werden',
    announcementType: 'general' as const,
    createdAt: '2026-03-02T14:30:00Z',
    author: { fullName: 'Vereinsleitung' },
  },
  {
    id: '3',
    title: 'Erinnerung: U15 Training morgen um 17 Uhr',
    announcementType: 'training_reminder' as const,
    createdAt: '2026-03-01T09:00:00Z',
    author: { fullName: 'Trainer Hofer' },
  },
  {
    id: '4',
    title: 'Samstag Spiel gegen FC Rapid - bitte Verfuegbarkeit bestaetigen',
    announcementType: 'match_reminder' as const,
    createdAt: '2026-02-28T16:00:00Z',
    author: { fullName: 'Trainer Hofer' },
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
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { profile } = useAuthStore();

  const firstName = profile?.fullName?.split(' ')[0] ?? 'Trainer';

  return (
    <div className="space-y-8">
      {/* Seitenkopf */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Willkommen zurueck, {firstName}. Hier ist dein Ueberblick.
        </p>
      </div>

      {/* Statistik-Karten */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Spieler gesamt"
          value={MOCK_TOTAL_PLAYERS}
          change="+3 diesen Monat"
          changeType="positive"
          icon={Users}
          iconColor="text-blue-600 bg-blue-100"
        />
        <StatCard
          title="Kommende Trainings"
          value={MOCK_UPCOMING_TRAININGS}
          change="Naechste 7 Tage"
          changeType="neutral"
          icon={Dumbbell}
          iconColor="text-emerald-600 bg-emerald-100"
        />
        <StatCard
          title="Kommende Spiele"
          value={MOCK_UPCOMING_MATCHES}
          change="Naechste 30 Tage"
          changeType="neutral"
          icon={Trophy}
          iconColor="text-amber-600 bg-amber-100"
        />
        <StatCard
          title="Anwesenheitsrate"
          value={`${MOCK_ATTENDANCE_RATE}%`}
          change="+2% vs. letzten Monat"
          changeType="positive"
          icon={TrendingUp}
          iconColor="text-purple-600 bg-purple-100"
        />
      </div>

      {/* Zwei-Spalten-Layout: Training + Spiele */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Heutiges Training */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-emerald-600" />
              Heutiges Training
            </CardTitle>
          </CardHeader>
          <CardContent>
            {MOCK_NEXT_TRAINING ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {MOCK_NEXT_TRAINING.focus}
                    </p>
                    <Badge variant="info" className="mt-1">
                      {MOCK_NEXT_TRAINING.team.name}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>
                      {formatTime(MOCK_NEXT_TRAINING.startTime)} &ndash;{' '}
                      {formatTime(MOCK_NEXT_TRAINING.endTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{MOCK_NEXT_TRAINING.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{formatDate(MOCK_NEXT_TRAINING.date)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <Dumbbell className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">
                  Keine Trainingseinheiten fuer heute geplant.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Kommende Spiele */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-600" />
              Kommende Spiele
            </CardTitle>
          </CardHeader>
          <CardContent>
            {MOCK_UPCOMING_MATCHES_LIST.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {MOCK_UPCOMING_MATCHES_LIST.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">
                        vs {match.opponent}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatDate(match.date)}</span>
                        <span>&middot;</span>
                        <span>{formatTime(match.time)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="info">{match.team.name}</Badge>
                      <Badge
                        variant={
                          match.homeOrAway === 'home' ? 'success' : 'warning'
                        }
                      >
                        {match.homeOrAway === 'home' ? 'Heim' : 'Auswaerts'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Trophy className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">
                  Keine kommenden Spiele geplant.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Letzte Aktivitaeten / Ankuendigungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-gray-600" />
            Letzte Aktivitaeten
          </CardTitle>
        </CardHeader>
        <CardContent>
          {MOCK_ANNOUNCEMENTS.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {MOCK_ANNOUNCEMENTS.map((announcement) => (
                <div
                  key={announcement.id}
                  className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">
                      {announcement.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {announcement.author.fullName} &middot;{' '}
                      {formatDate(announcement.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant={getAnnouncementBadgeVariant(
                      announcement.announcementType
                    )}
                  >
                    {formatAnnouncementType(announcement.announcementType)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Megaphone className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">
                Keine aktuellen Ankuendigungen.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
