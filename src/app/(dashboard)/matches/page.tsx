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
// Mock data -- will be replaced with real Supabase data
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
  team_id: string;
  team_name: string;
  opponent: string;
  competition: string;
  date: string;
  time: string;
  location: string;
  home_or_away: 'home' | 'away';
  score_home: number | null;
  score_away: number | null;
}

const MOCK_MATCHES: MockMatch[] = [
  // Upcoming matches
  {
    id: 'm1',
    team_id: '2',
    team_name: 'U12 Development',
    opponent: 'FC Adler',
    competition: 'Youth League',
    date: toISODate(addDays(today, 3)),
    time: '10:00:00',
    location: 'Home Stadium',
    home_or_away: 'home',
    score_home: null,
    score_away: null,
  },
  {
    id: 'm2',
    team_id: '3',
    team_name: 'U14 Academy',
    opponent: 'SC Falken',
    competition: 'Regional Cup',
    date: toISODate(addDays(today, 5)),
    time: '14:00:00',
    location: 'Falken Sportpark',
    home_or_away: 'away',
    score_home: null,
    score_away: null,
  },
  {
    id: 'm3',
    team_id: '5',
    team_name: 'First Team',
    opponent: 'SV Stern',
    competition: 'Premier Division',
    date: toISODate(addDays(today, 7)),
    time: '15:30:00',
    location: 'Home Stadium',
    home_or_away: 'home',
    score_home: null,
    score_away: null,
  },
  {
    id: 'm4',
    team_id: '1',
    team_name: 'U10 Youth',
    opponent: 'TSV Blitz',
    competition: 'Youth League',
    date: toISODate(addDays(today, 10)),
    time: '09:00:00',
    location: 'Blitz Arena',
    home_or_away: 'away',
    score_home: null,
    score_away: null,
  },
  {
    id: 'm5',
    team_id: '4',
    team_name: 'U16 Junior',
    opponent: 'VfB Donner',
    competition: 'Junior Cup',
    date: toISODate(addDays(today, 12)),
    time: '11:00:00',
    location: 'Home Stadium',
    home_or_away: 'home',
    score_home: null,
    score_away: null,
  },
  // Completed matches
  {
    id: 'm6',
    team_id: '2',
    team_name: 'U12 Development',
    opponent: 'SC Falken',
    competition: 'Youth League',
    date: toISODate(addDays(today, -3)),
    time: '10:00:00',
    location: 'Falken Sportpark',
    home_or_away: 'away',
    score_home: 1,
    score_away: 3,
  },
  {
    id: 'm7',
    team_id: '5',
    team_name: 'First Team',
    opponent: 'FC Adler',
    competition: 'Premier Division',
    date: toISODate(addDays(today, -7)),
    time: '15:30:00',
    location: 'Home Stadium',
    home_or_away: 'home',
    score_home: 2,
    score_away: 1,
  },
  {
    id: 'm8',
    team_id: '3',
    team_name: 'U14 Academy',
    opponent: 'TSV Blitz',
    competition: 'Regional Cup',
    date: toISODate(addDays(today, -10)),
    time: '14:00:00',
    location: 'Home Stadium',
    home_or_away: 'home',
    score_home: 4,
    score_away: 0,
  },
  {
    id: 'm9',
    team_id: '4',
    team_name: 'U16 Junior',
    opponent: 'SV Stern',
    competition: 'Junior Cup',
    date: toISODate(addDays(today, -14)),
    time: '11:00:00',
    location: 'Stern Arena',
    home_or_away: 'away',
    score_home: 2,
    score_away: 2,
  },
  {
    id: 'm10',
    team_id: '1',
    team_name: 'U10 Youth',
    opponent: 'VfB Donner',
    competition: 'Youth League',
    date: toISODate(addDays(today, -18)),
    time: '09:00:00',
    location: 'Home Stadium',
    home_or_away: 'home',
    score_home: 3,
    score_away: 1,
  },
];

// ---------------------------------------------------------------------------
// Filter options
// ---------------------------------------------------------------------------

const TEAM_OPTIONS = [
  { value: '', label: 'All Teams' },
  { value: 'U10 Youth', label: 'U10 Youth' },
  { value: 'U12 Development', label: 'U12 Development' },
  { value: 'U14 Academy', label: 'U14 Academy' },
  { value: 'U16 Junior', label: 'U16 Junior' },
  { value: 'First Team', label: 'First Team' },
];

const COMPETITION_OPTIONS = [
  { value: '', label: 'All Competitions' },
  { value: 'Youth League', label: 'Youth League' },
  { value: 'Regional Cup', label: 'Regional Cup' },
  { value: 'Premier Division', label: 'Premier Division' },
  { value: 'Junior Cup', label: 'Junior Cup' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isUpcoming(match: MockMatch): boolean {
  return match.score_home === null && match.score_away === null;
}

function getScoreDisplay(match: MockMatch): string {
  if (match.score_home === null || match.score_away === null) return '';
  return `${match.score_home} - ${match.score_away}`;
}

function getResultVariant(match: MockMatch) {
  if (match.score_home === null || match.score_away === null)
    return 'default' as const;

  const ourScore =
    match.home_or_away === 'home' ? match.score_home : match.score_away;
  const theirScore =
    match.home_or_away === 'home' ? match.score_away : match.score_home;

  if (ourScore > theirScore) return 'success' as const;
  if (ourScore < theirScore) return 'danger' as const;
  return 'warning' as const;
}

function getResultLabel(match: MockMatch): string {
  if (match.score_home === null || match.score_away === null) return '';

  const ourScore =
    match.home_or_away === 'home' ? match.score_home : match.score_away;
  const theirScore =
    match.home_or_away === 'home' ? match.score_away : match.score_home;

  if (ourScore > theirScore) return 'W';
  if (ourScore < theirScore) return 'L';
  return 'D';
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
      if (teamFilter && match.team_name !== teamFilter) return false;
      if (competitionFilter && match.competition !== competitionFilter)
        return false;
      return true;
    }).sort((a, b) => {
      // Sort upcoming by date ascending, results by date descending
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
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Matches</h1>
          <p className="mt-1 text-sm text-gray-500">
            View upcoming fixtures and past results.
          </p>
        </div>
        {canAddMatch && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Match
          </Button>
        )}
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="w-full sm:w-48">
              <Select
                label="Team"
                options={TEAM_OPTIONS}
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                label="Competition"
                options={COMPETITION_OPTIONS}
                value={competitionFilter}
                onChange={(e) => setCompetitionFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming matches */}
      {upcomingMatches.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Upcoming
          </h2>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {upcomingMatches.map((match) => (
              <Link key={match.id} href={`/matches/${match.id}`}>
                <Card className="group cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="py-5">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1 space-y-3">
                        {/* Opponent name */}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-base font-semibold text-gray-900 group-hover:text-emerald-600">
                              vs {match.opponent}
                            </h3>
                            <Badge
                              variant={
                                match.home_or_away === 'home'
                                  ? 'success'
                                  : 'warning'
                              }
                            >
                              {match.home_or_away === 'home' ? 'Home' : 'Away'}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm font-medium text-emerald-600">
                            {match.team_name}
                          </p>
                        </div>

                        {/* Details row */}
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

                      {/* Competition badge */}
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

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Results
          </h2>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {results.map((match) => (
              <Link key={match.id} href={`/matches/${match.id}`}>
                <Card className="group cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="py-5">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1 space-y-3">
                        {/* Opponent name and score */}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-base font-semibold text-gray-900 group-hover:text-emerald-600">
                              vs {match.opponent}
                            </h3>
                            <Badge
                              variant={
                                match.home_or_away === 'home'
                                  ? 'success'
                                  : 'warning'
                              }
                            >
                              {match.home_or_away === 'home' ? 'Home' : 'Away'}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm font-medium text-emerald-600">
                            {match.team_name}
                          </p>
                        </div>

                        {/* Details row */}
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

                      {/* Score and result */}
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

      {/* Empty state */}
      {filteredMatches.length === 0 && (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Trophy className="mb-3 h-8 w-8 text-gray-300" />
              <p className="text-sm font-medium text-gray-900">
                No matches found
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters or add a new match.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
