'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { formatDate, formatTime } from '@/lib/utils';
import { Trophy, Plus, MapPin, Calendar } from 'lucide-react';

// ---------------------------------------------------------------------------
// Mock-Daten -- werden spaeter durch Firestore-Abfragen ersetzt
// ---------------------------------------------------------------------------

const today = new Date();
const toISODate = (d: Date) => d.toISOString().split('T')[0];
const addDays = (d: Date, n: number) => {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
};

interface MockMatch {
  id: string;
  teamId: string;
  teamName: string;
  opponent: string;
  competition: string;
  date: string;
  time: string;
  location: string;
  homeOrAway: 'home' | 'away';
  scoreHome: number | null;
  scoreAway: number | null;
}

const MOCK_MATCHES: MockMatch[] = [
  // Kommende Spiele
  {
    id: 'm1',
    teamId: '2',
    teamName: 'U15',
    opponent: 'FC Rapid Wien II',
    competition: 'Wiener Liga',
    date: toISODate(addDays(today, 3)),
    time: '10:00:00',
    location: 'Heimstadion',
    homeOrAway: 'home',
    scoreHome: null,
    scoreAway: null,
  },
  {
    id: 'm2',
    teamId: '3',
    teamName: 'U17',
    opponent: 'SC Admira Jugend',
    competition: 'OeFB Jugendcup',
    date: toISODate(addDays(today, 5)),
    time: '14:00:00',
    location: 'Admira Sportpark',
    homeOrAway: 'away',
    scoreHome: null,
    scoreAway: null,
  },
  {
    id: 'm3',
    teamId: '5',
    teamName: 'Kampfmannschaft',
    opponent: 'SV Mattersburg',
    competition: 'Regionalliga Ost',
    date: toISODate(addDays(today, 7)),
    time: '15:30:00',
    location: 'Heimstadion',
    homeOrAway: 'home',
    scoreHome: null,
    scoreAway: null,
  },
  {
    id: 'm4',
    teamId: '1',
    teamName: 'U12',
    opponent: 'SK Sturm Graz Jugend',
    competition: 'Wiener Liga',
    date: toISODate(addDays(today, 10)),
    time: '09:00:00',
    location: 'Sturm Arena',
    homeOrAway: 'away',
    scoreHome: null,
    scoreAway: null,
  },
  {
    id: 'm5',
    teamId: '4',
    teamName: 'U19',
    opponent: 'FK Austria Wien II',
    competition: 'OeFB Jugendcup',
    date: toISODate(addDays(today, 12)),
    time: '11:00:00',
    location: 'Heimstadion',
    homeOrAway: 'home',
    scoreHome: null,
    scoreAway: null,
  },
  // Ergebnisse
  {
    id: 'm6',
    teamId: '2',
    teamName: 'U15',
    opponent: 'SC Admira Jugend',
    competition: 'Wiener Liga',
    date: toISODate(addDays(today, -3)),
    time: '10:00:00',
    location: 'Admira Sportpark',
    homeOrAway: 'away',
    scoreHome: 1,
    scoreAway: 3,
  },
  {
    id: 'm7',
    teamId: '5',
    teamName: 'Kampfmannschaft',
    opponent: 'FC Rapid Wien II',
    competition: 'Regionalliga Ost',
    date: toISODate(addDays(today, -7)),
    time: '15:30:00',
    location: 'Heimstadion',
    homeOrAway: 'home',
    scoreHome: 2,
    scoreAway: 1,
  },
  {
    id: 'm8',
    teamId: '3',
    teamName: 'U17',
    opponent: 'SK Sturm Graz Jugend',
    competition: 'OeFB Jugendcup',
    date: toISODate(addDays(today, -10)),
    time: '14:00:00',
    location: 'Heimstadion',
    homeOrAway: 'home',
    scoreHome: 4,
    scoreAway: 0,
  },
  {
    id: 'm9',
    teamId: '4',
    teamName: 'U19',
    opponent: 'SV Mattersburg',
    competition: 'OeFB Jugendcup',
    date: toISODate(addDays(today, -14)),
    time: '11:00:00',
    location: 'Mattersburg Arena',
    homeOrAway: 'away',
    scoreHome: 2,
    scoreAway: 2,
  },
  {
    id: 'm10',
    teamId: '1',
    teamName: 'U12',
    opponent: 'FK Austria Wien II',
    competition: 'Wiener Liga',
    date: toISODate(addDays(today, -18)),
    time: '09:00:00',
    location: 'Heimstadion',
    homeOrAway: 'home',
    scoreHome: 3,
    scoreAway: 1,
  },
];

// ---------------------------------------------------------------------------
// Filteroptionen
// ---------------------------------------------------------------------------

const TEAM_OPTIONS = [
  { value: '', label: 'Alle Mannschaften' },
  { value: 'U12', label: 'U12' },
  { value: 'U15', label: 'U15' },
  { value: 'U17', label: 'U17' },
  { value: 'U19', label: 'U19' },
  { value: 'Kampfmannschaft', label: 'Kampfmannschaft' },
];

const COMPETITION_OPTIONS = [
  { value: '', label: 'Alle Wettbewerbe' },
  { value: 'Wiener Liga', label: 'Wiener Liga' },
  { value: 'OeFB Jugendcup', label: 'OeFB Jugendcup' },
  { value: 'Regionalliga Ost', label: 'Regionalliga Ost' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isUpcoming(match: MockMatch): boolean {
  return match.scoreHome === null && match.scoreAway === null;
}

function getScoreDisplay(match: MockMatch): string {
  if (match.scoreHome === null || match.scoreAway === null) return '';
  return `${match.scoreHome} - ${match.scoreAway}`;
}

function getResultVariant(match: MockMatch) {
  if (match.scoreHome === null || match.scoreAway === null)
    return 'default' as const;

  const ourScore =
    match.homeOrAway === 'home' ? match.scoreHome : match.scoreAway;
  const theirScore =
    match.homeOrAway === 'home' ? match.scoreAway : match.scoreHome;

  if (ourScore > theirScore) return 'success' as const;
  if (ourScore < theirScore) return 'danger' as const;
  return 'warning' as const;
}

function getResultLabel(match: MockMatch): string {
  if (match.scoreHome === null || match.scoreAway === null) return '';

  const ourScore =
    match.homeOrAway === 'home' ? match.scoreHome : match.scoreAway;
  const theirScore =
    match.homeOrAway === 'home' ? match.scoreAway : match.scoreHome;

  if (ourScore > theirScore) return 'S';
  if (ourScore < theirScore) return 'N';
  return 'U';
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MatchesPage() {
  const { isCoachOrAbove } = useAuthStore();
  const [teamFilter, setTeamFilter] = useState('');
  const [competitionFilter, setCompetitionFilter] = useState('');

  const canAddMatch = isCoachOrAbove();

  const filteredMatches = useMemo(() => {
    return MOCK_MATCHES.filter((match) => {
      if (teamFilter && match.teamName !== teamFilter) return false;
      if (competitionFilter && match.competition !== competitionFilter)
        return false;
      return true;
    }).sort((a, b) => {
      // Kommende nach Datum aufsteigend, Ergebnisse nach Datum absteigend
      const aUp = isUpcoming(a);
      const bUp = isUpcoming(b);
      if (aUp && bUp) return a.date.localeCompare(b.date);
      if (!aUp && !bUp) return b.date.localeCompare(a.date);
      return 0;
    });
  }, [teamFilter, competitionFilter]);

  const upcomingMatches = filteredMatches.filter(isUpcoming);
  const results = filteredMatches.filter((m) => !isUpcoming(m));

  return (
    <div className="space-y-6">
      {/* Seitenkopf */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Spiele</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kommende Begegnungen und vergangene Ergebnisse.
          </p>
        </div>
        {canAddMatch && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Spiel hinzufuegen
          </Button>
        )}
      </div>

      {/* Filterleiste */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="w-full sm:w-48">
              <Select
                label="Mannschaft"
                options={TEAM_OPTIONS}
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                label="Wettbewerb"
                options={COMPETITION_OPTIONS}
                value={competitionFilter}
                onChange={(e) => setCompetitionFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kommende Spiele */}
      {upcomingMatches.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Kommende Spiele
          </h2>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {upcomingMatches.map((match) => (
              <Link key={match.id} href={`/matches/${match.id}`}>
                <Card className="group cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="py-5">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1 space-y-3">
                        {/* Gegner */}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-base font-semibold text-gray-900 group-hover:text-emerald-600">
                              vs {match.opponent}
                            </h3>
                            <Badge
                              variant={
                                match.homeOrAway === 'home'
                                  ? 'success'
                                  : 'warning'
                              }
                            >
                              {match.homeOrAway === 'home' ? 'Heim' : 'Auswaerts'}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm font-medium text-emerald-600">
                            {match.teamName}
                          </p>
                        </div>

                        {/* Details */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(match.date)} &middot;{' '}
                            {formatTime(match.time)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {match.location}
                          </span>
                        </div>
                      </div>

                      {/* Wettbewerb Badge */}
                      <div className="ml-4 flex flex-shrink-0 flex-col items-end">
                        <Badge variant="info">
                          <Trophy className="mr-1 h-3 w-3" />
                          {match.competition}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Ergebnisse */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Ergebnisse
          </h2>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {results.map((match) => (
              <Link key={match.id} href={`/matches/${match.id}`}>
                <Card className="group cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="py-5">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1 space-y-3">
                        {/* Gegner und Ergebnis */}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-base font-semibold text-gray-900 group-hover:text-emerald-600">
                              vs {match.opponent}
                            </h3>
                            <Badge
                              variant={
                                match.homeOrAway === 'home'
                                  ? 'success'
                                  : 'warning'
                              }
                            >
                              {match.homeOrAway === 'home' ? 'Heim' : 'Auswaerts'}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm font-medium text-emerald-600">
                            {match.teamName}
                          </p>
                        </div>

                        {/* Details */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(match.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {match.location}
                          </span>
                        </div>
                      </div>

                      {/* Ergebnis */}
                      <div className="ml-4 flex flex-shrink-0 flex-col items-end gap-2">
                        <Badge variant="info">
                          <Trophy className="mr-1 h-3 w-3" />
                          {match.competition}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            {getScoreDisplay(match)}
                          </span>
                          <Badge variant={getResultVariant(match)}>
                            {getResultLabel(match)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Leerer Zustand */}
      {filteredMatches.length === 0 && (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Trophy className="mb-3 h-8 w-8 text-gray-300" />
              <p className="text-sm font-medium text-gray-900">
                Keine Spiele gefunden
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Passe die Filter an oder fuege ein neues Spiel hinzu.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
