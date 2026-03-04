'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useClubStore } from '@/stores/club-store';
import {
  subscribeClubMatches,
  subscribeClubTrainings,
  subscribeClubAnnouncements,
} from '@/lib/firebase/services';
import type { Match, Training, Announcement } from '@/types/database';
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
  Loader2,
} from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';

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
  const { currentClub, players, teams } = useClubStore();

  const [matches, setMatches] = useState<Match[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ---------------------------------------------------------------------------
  // Firestore subscriptions
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!currentClub?.id) {
      setIsLoading(false);
      return;
    }

    let loaded = 0;
    const checkDone = () => {
      loaded++;
      if (loaded >= 3) setIsLoading(false);
    };

    const unsub1 = subscribeClubMatches(currentClub.id, (data) => {
      setMatches(data);
      checkDone();
    });
    const unsub2 = subscribeClubTrainings(currentClub.id, (data) => {
      setTrainings(data);
      checkDone();
    });
    const unsub3 = subscribeClubAnnouncements(currentClub.id, (data) => {
      setAnnouncements(data);
      checkDone();
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [currentClub?.id]);

  // ---------------------------------------------------------------------------
  // Computed values
  // ---------------------------------------------------------------------------
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const totalPlayers = players.length;

  const upcomingTrainings = useMemo(
    () => trainings.filter((t) => new Date(t.date) >= today).length,
    [trainings, today]
  );

  const upcomingMatchesCount = useMemo(
    () => matches.filter((m) => new Date(m.date) >= today).length,
    [matches, today]
  );

  const nextTraining = useMemo(() => {
    const future = trainings
      .filter((t) => new Date(t.date) >= today)
      .sort((a, b) => a.date.localeCompare(b.date));
    return future[0] ?? null;
  }, [trainings, today]);

  const nextTrainingTeamName = useMemo(() => {
    if (!nextTraining) return '';
    return teams.find((t) => t.id === nextTraining.teamId)?.name ?? '';
  }, [nextTraining, teams]);

  const upcomingMatchesList = useMemo(() => {
    return matches
      .filter((m) => m.scoreHome === null)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [matches]);

  const recentAnnouncements = useMemo(
    () => announcements.slice(0, 5),
    [announcements]
  );

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  const firstName = profile?.fullName?.split(' ')[0] ?? 'Trainer';

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

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
          value={totalPlayers}
          change=""
          changeType="neutral"
          icon={Users}
          iconColor="text-blue-600 bg-blue-100"
        />
        <StatCard
          title="Kommende Trainings"
          value={upcomingTrainings}
          change=""
          changeType="neutral"
          icon={Dumbbell}
          iconColor="text-emerald-600 bg-emerald-100"
        />
        <StatCard
          title="Kommende Spiele"
          value={upcomingMatchesCount}
          change=""
          changeType="neutral"
          icon={Trophy}
          iconColor="text-amber-600 bg-amber-100"
        />
        <StatCard
          title="Anwesenheitsrate"
          value={'\u2014'}
          change=""
          changeType="neutral"
          icon={TrendingUp}
          iconColor="text-purple-600 bg-purple-100"
        />
      </div>

      {/* Zwei-Spalten-Layout: Training + Spiele */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Naechstes Training */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-emerald-600" />
              Naechstes Training
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextTraining ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {nextTraining.focus}
                    </p>
                    {nextTrainingTeamName && (
                      <Badge variant="info" className="mt-1">
                        {nextTrainingTeamName}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>
                      {formatTime(nextTraining.startTime)} &ndash;{' '}
                      {formatTime(nextTraining.endTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{nextTraining.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{formatDate(nextTraining.date)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <Dumbbell className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">
                  Keine kommenden Trainingseinheiten geplant.
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
            {upcomingMatchesList.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {upcomingMatchesList.map((match) => {
                  const matchTeamName =
                    teams.find((t) => t.id === match.teamId)?.name ?? '';
                  return (
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
                        {matchTeamName && (
                          <Badge variant="info">{matchTeamName}</Badge>
                        )}
                        <Badge
                          variant={
                            match.homeOrAway === 'home' ? 'success' : 'warning'
                          }
                        >
                          {match.homeOrAway === 'home' ? 'Heim' : 'Auswaerts'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
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
          {recentAnnouncements.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {recentAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">
                      {announcement.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {formatDate(announcement.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant={getAnnouncementBadgeVariant(announcement.type)}
                  >
                    {formatAnnouncementType(announcement.type)}
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
