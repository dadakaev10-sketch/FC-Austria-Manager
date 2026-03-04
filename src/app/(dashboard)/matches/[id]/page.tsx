'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { MatchEventItem } from '@/components/matches/match-event-item';
import { formatDate, formatTime } from '@/lib/utils';
import type { MatchEvent } from '@/types/database';
import {
  ArrowLeft,
  Trophy,
  MapPin,
  Calendar,
  Clock,
  Target,
  ArrowRightLeft,
  Users,
  Star,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Mock data -- will be replaced with real Supabase queries
// ---------------------------------------------------------------------------

const MOCK_MATCH_DETAIL: Record<
  string,
  {
    id: string;
    team_name: string;
    team_id: string;
    opponent: string;
    competition: string;
    date: string;
    time: string;
    location: string;
    home_or_away: 'home' | 'away';
    score_home: number | null;
    score_away: number | null;
    notes: string | null;
  }
> = {
  m7: {
    id: 'm7',
    team_name: 'First Team',
    team_id: '5',
    opponent: 'FC Adler',
    competition: 'Premier Division',
    date: '2026-02-25',
    time: '15:30:00',
    location: 'Home Stadium',
    home_or_away: 'home',
    score_home: 2,
    score_away: 1,
    notes: 'Great second-half comeback. Controlled possession throughout.',
  },
};

const DEFAULT_MATCH = {
  id: 'm7',
  team_name: 'First Team',
  team_id: '5',
  opponent: 'FC Adler',
  competition: 'Premier Division',
  date: '2026-02-25',
  time: '15:30:00',
  location: 'Home Stadium',
  home_or_away: 'home' as const,
  score_home: 2,
  score_away: 1,
  notes: 'Great second-half comeback. Controlled possession throughout.',
};

const MOCK_EVENTS: MatchEvent[] = [
  {
    id: 'e1',
    match_id: 'm7',
    player_id: 'p9',
    event_type: 'goal',
    minute: 23,
    details: 'header',
    created_at: '2026-02-25T16:00:00Z',
    player: { id: 'p9', team_id: '5', user_id: null, name: 'Mateo Rodriguez', date_of_birth: '2006-08-08', position: 'striker', preferred_foot: 'left', height: 178, weight: 72, jersey_number: 9, contact_email: null, contact_phone: null, parent_name: null, parent_email: null, parent_phone: null, photo_url: null, created_at: '', updated_at: '' },
  },
  {
    id: 'e2',
    match_id: 'm7',
    player_id: 'p10',
    event_type: 'assist',
    minute: 23,
    details: 'cross from the right',
    created_at: '2026-02-25T16:00:00Z',
    player: { id: 'p10', team_id: '5', user_id: null, name: 'Julian Torres', date_of_birth: '2006-05-25', position: 'attacking-midfielder', preferred_foot: 'right', height: 175, weight: 68, jersey_number: 10, contact_email: null, contact_phone: null, parent_name: null, parent_email: null, parent_phone: null, photo_url: null, created_at: '', updated_at: '' },
  },
  {
    id: 'e3',
    match_id: 'm7',
    player_id: 'p11',
    event_type: 'card',
    minute: 35,
    details: 'yellow',
    created_at: '2026-02-25T16:05:00Z',
    player: { id: 'p11', team_id: '5', user_id: null, name: 'Diego Navarro', date_of_birth: '2005-11-12', position: 'defender', preferred_foot: 'right', height: 182, weight: 76, jersey_number: 4, contact_email: null, contact_phone: null, parent_name: null, parent_email: null, parent_phone: null, photo_url: null, created_at: '', updated_at: '' },
  },
  {
    id: 'e4',
    match_id: 'm7',
    player_id: 'opp1',
    event_type: 'goal',
    minute: 41,
    details: 'free kick',
    created_at: '2026-02-25T16:11:00Z',
    player: { id: 'opp1', team_id: 'opp', user_id: null, name: 'Opponent #7', date_of_birth: '2005-01-01', position: 'midfielder', preferred_foot: 'right', height: null, weight: null, jersey_number: 7, contact_email: null, contact_phone: null, parent_name: null, parent_email: null, parent_phone: null, photo_url: null, created_at: '', updated_at: '' },
  },
  {
    id: 'e5',
    match_id: 'm7',
    player_id: 'p12',
    event_type: 'substitution',
    minute: 55,
    details: 'replaced by Carlos Vega',
    created_at: '2026-02-25T16:25:00Z',
    player: { id: 'p12', team_id: '5', user_id: null, name: 'Andres Ruiz', date_of_birth: '2006-03-14', position: 'midfielder', preferred_foot: 'both', height: 170, weight: 65, jersey_number: 8, contact_email: null, contact_phone: null, parent_name: null, parent_email: null, parent_phone: null, photo_url: null, created_at: '', updated_at: '' },
  },
  {
    id: 'e6',
    match_id: 'm7',
    player_id: 'p10',
    event_type: 'goal',
    minute: 68,
    details: 'penalty',
    created_at: '2026-02-25T16:38:00Z',
    player: { id: 'p10', team_id: '5', user_id: null, name: 'Julian Torres', date_of_birth: '2006-05-25', position: 'attacking-midfielder', preferred_foot: 'right', height: 175, weight: 68, jersey_number: 10, contact_email: null, contact_phone: null, parent_name: null, parent_email: null, parent_phone: null, photo_url: null, created_at: '', updated_at: '' },
  },
  {
    id: 'e7',
    match_id: 'm7',
    player_id: 'p13',
    event_type: 'card',
    minute: 78,
    details: 'yellow',
    created_at: '2026-02-25T16:48:00Z',
    player: { id: 'p13', team_id: '5', user_id: null, name: 'Pablo Mendez', date_of_birth: '2005-09-30', position: 'defensive-midfielder', preferred_foot: 'right', height: 180, weight: 74, jersey_number: 6, contact_email: null, contact_phone: null, parent_name: null, parent_email: null, parent_phone: null, photo_url: null, created_at: '', updated_at: '' },
  },
  {
    id: 'e8',
    match_id: 'm7',
    player_id: 'p9',
    event_type: 'substitution',
    minute: 85,
    details: 'replaced by Felix Hartmann',
    created_at: '2026-02-25T16:55:00Z',
    player: { id: 'p9', team_id: '5', user_id: null, name: 'Mateo Rodriguez', date_of_birth: '2006-08-08', position: 'striker', preferred_foot: 'left', height: 178, weight: 72, jersey_number: 9, contact_email: null, contact_phone: null, parent_name: null, parent_email: null, parent_phone: null, photo_url: null, created_at: '', updated_at: '' },
  },
];

const MOCK_PLAYER_RATINGS = [
  { player_name: 'Mateo Rodriguez', jersey: 9, speed: 8, technique: 7, passing: 6, shooting: 9, defense: 5, tactical: 7 },
  { player_name: 'Julian Torres', jersey: 10, speed: 7, technique: 9, passing: 8, shooting: 8, defense: 5, tactical: 8 },
  { player_name: 'Diego Navarro', jersey: 4, speed: 6, technique: 6, passing: 7, shooting: 4, defense: 8, tactical: 7 },
  { player_name: 'Andres Ruiz', jersey: 8, speed: 7, technique: 7, passing: 7, shooting: 6, defense: 6, tactical: 7 },
  { player_name: 'Pablo Mendez', jersey: 6, speed: 6, technique: 7, passing: 8, shooting: 5, defense: 8, tactical: 8 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRatingColor(value: number): string {
  if (value >= 8) return 'text-emerald-600 font-bold';
  if (value >= 6) return 'text-gray-900 font-medium';
  return 'text-gray-400 font-medium';
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = params.id as string;

  const match = MOCK_MATCH_DETAIL[matchId] || DEFAULT_MATCH;
  const events = MOCK_EVENTS.sort((a, b) => a.minute - b.minute);
  const hasScore = match.score_home !== null && match.score_away !== null;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/matches"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Matches
      </Link>

      {/* Match header */}
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center text-center">
            {/* Competition */}
            <Badge variant="info" className="mb-4">
              <Trophy className="mr-1 h-3 w-3" />
              {match.competition}
            </Badge>

            {/* Team vs Opponent with score */}
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <Avatar
                  name={match.home_or_away === 'home' ? match.team_name : match.opponent}
                  size="lg"
                  className="h-16 w-16 text-xl"
                />
                <span className="text-sm font-semibold text-gray-900">
                  {match.home_or_away === 'home' ? match.team_name : match.opponent}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1">
                {hasScore ? (
                  <span className="text-4xl font-bold text-gray-900">
                    {match.score_home} - {match.score_away}
                  </span>
                ) : (
                  <span className="text-2xl font-semibold text-gray-400">
                    vs
                  </span>
                )}
                {hasScore && (
                  <span className="text-xs font-medium uppercase text-gray-400">
                    Full Time
                  </span>
                )}
              </div>

              <div className="flex flex-col items-center gap-2">
                <Avatar
                  name={match.home_or_away === 'away' ? match.team_name : match.opponent}
                  size="lg"
                  className="h-16 w-16 text-xl"
                />
                <span className="text-sm font-semibold text-gray-900">
                  {match.home_or_away === 'away' ? match.team_name : match.opponent}
                </span>
              </div>
            </div>

            {/* Match meta */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(match.date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatTime(match.time)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {match.location}
              </span>
              <Badge variant={match.home_or_away === 'home' ? 'success' : 'warning'}>
                {match.home_or_away === 'home' ? 'Home' : 'Away'}
              </Badge>
            </div>

            {/* Notes */}
            {match.notes && (
              <p className="mt-4 max-w-lg text-sm text-gray-500 italic">
                {match.notes}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Match events timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-600" />
            Match Events
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {events.map((event) => (
              <MatchEventItem key={event.id} event={event} />
            ))}
          </div>
          {events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Star className="mb-2 h-6 w-6 text-gray-300" />
              <p className="text-sm text-gray-500">
                No events recorded for this match.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lineup placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            Lineup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              Lineup management coming soon
            </h3>
            <p className="max-w-sm text-sm text-gray-500">
              Formation view with starting eleven and substitutes will be
              available here in a future update.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Player ratings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-emerald-600" />
            Player Ratings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Player</th>
                  <th className="px-6 py-3">SPD</th>
                  <th className="px-6 py-3">TEC</th>
                  <th className="px-6 py-3">PAS</th>
                  <th className="px-6 py-3">SHO</th>
                  <th className="px-6 py-3">DEF</th>
                  <th className="px-6 py-3">TAC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_PLAYER_RATINGS.map((rating) => (
                  <tr
                    key={rating.jersey}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-3 font-semibold text-gray-400">
                      {rating.jersey}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={rating.player_name} size="sm" />
                        <span className="font-medium text-gray-900">
                          {rating.player_name}
                        </span>
                      </div>
                    </td>
                    <td className={`px-6 py-3 ${getRatingColor(rating.speed)}`}>
                      {rating.speed}
                    </td>
                    <td className={`px-6 py-3 ${getRatingColor(rating.technique)}`}>
                      {rating.technique}
                    </td>
                    <td className={`px-6 py-3 ${getRatingColor(rating.passing)}`}>
                      {rating.passing}
                    </td>
                    <td className={`px-6 py-3 ${getRatingColor(rating.shooting)}`}>
                      {rating.shooting}
                    </td>
                    <td className={`px-6 py-3 ${getRatingColor(rating.defense)}`}>
                      {rating.defense}
                    </td>
                    <td className={`px-6 py-3 ${getRatingColor(rating.tactical)}`}>
                      {rating.tactical}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
