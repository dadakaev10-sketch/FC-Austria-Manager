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
// Mock-Daten -- werden spaeter durch Firestore-Abfragen ersetzt
// ---------------------------------------------------------------------------

const MOCK_MATCH_DETAIL: Record<
  string,
  {
    id: string;
    teamName: string;
    teamId: string;
    opponent: string;
    competition: string;
    date: string;
    time: string;
    location: string;
    homeOrAway: 'home' | 'away';
    scoreHome: number | null;
    scoreAway: number | null;
    notes: string | null;
  }
> = {
  m7: {
    id: 'm7',
    teamName: 'Kampfmannschaft',
    teamId: '5',
    opponent: 'FC Rapid Wien II',
    competition: 'Regionalliga Ost',
    date: '2026-02-25',
    time: '15:30:00',
    location: 'Heimstadion',
    homeOrAway: 'home',
    scoreHome: 2,
    scoreAway: 1,
    notes: 'Starke zweite Halbzeit. Gute Ballkontrolle durchgehend.',
  },
};

const DEFAULT_MATCH = {
  id: 'm7',
  teamName: 'Kampfmannschaft',
  teamId: '5',
  opponent: 'FC Rapid Wien II',
  competition: 'Regionalliga Ost',
  date: '2026-02-25',
  time: '15:30:00',
  location: 'Heimstadion',
  homeOrAway: 'home' as const,
  scoreHome: 2,
  scoreAway: 1,
  notes: 'Starke zweite Halbzeit. Gute Ballkontrolle durchgehend.',
};

const MOCK_EVENTS: MatchEvent[] = [
  {
    id: 'e1',
    matchId: 'm7',
    playerId: 'p9',
    eventType: 'goal',
    minute: 23,
    details: 'Kopfball',
    createdAt: '2026-02-25T16:00:00Z',
    player: { id: 'p9', clubId: '1', name: 'Lukas Gruber', dateOfBirth: '2006-08-08', position: 'striker', preferredFoot: 'left', height: 178, weight: 72, jerseyNumber: 9, contactEmail: null, contactPhone: null, parentName: null, parentEmail: null, parentPhone: null, photoUrl: null, createdAt: '' },
  },
  {
    id: 'e2',
    matchId: 'm7',
    playerId: 'p10',
    eventType: 'assist',
    minute: 23,
    details: 'Flanke von rechts',
    createdAt: '2026-02-25T16:00:00Z',
    player: { id: 'p10', clubId: '1', name: 'Maximilian Bauer', dateOfBirth: '2006-05-25', position: 'attacking-midfielder', preferredFoot: 'right', height: 175, weight: 68, jerseyNumber: 10, contactEmail: null, contactPhone: null, parentName: null, parentEmail: null, parentPhone: null, photoUrl: null, createdAt: '' },
  },
  {
    id: 'e3',
    matchId: 'm7',
    playerId: 'p11',
    eventType: 'card',
    minute: 35,
    details: 'yellow',
    createdAt: '2026-02-25T16:05:00Z',
    player: { id: 'p11', clubId: '1', name: 'Felix Steiner', dateOfBirth: '2005-11-12', position: 'defender', preferredFoot: 'right', height: 182, weight: 76, jerseyNumber: 4, contactEmail: null, contactPhone: null, parentName: null, parentEmail: null, parentPhone: null, photoUrl: null, createdAt: '' },
  },
  {
    id: 'e4',
    matchId: 'm7',
    playerId: 'opp1',
    eventType: 'goal',
    minute: 41,
    details: 'Freistoss',
    createdAt: '2026-02-25T16:11:00Z',
    player: { id: 'opp1', clubId: 'opp', name: 'Gegner #7', dateOfBirth: '2005-01-01', position: 'midfielder', preferredFoot: 'right', height: null, weight: null, jerseyNumber: 7, contactEmail: null, contactPhone: null, parentName: null, parentEmail: null, parentPhone: null, photoUrl: null, createdAt: '' },
  },
  {
    id: 'e5',
    matchId: 'm7',
    playerId: 'p12',
    eventType: 'substitution',
    minute: 55,
    details: 'ersetzt durch David Huber',
    createdAt: '2026-02-25T16:25:00Z',
    player: { id: 'p12', clubId: '1', name: 'Elias Wagner', dateOfBirth: '2006-03-14', position: 'midfielder', preferredFoot: 'both', height: 170, weight: 65, jerseyNumber: 8, contactEmail: null, contactPhone: null, parentName: null, parentEmail: null, parentPhone: null, photoUrl: null, createdAt: '' },
  },
  {
    id: 'e6',
    matchId: 'm7',
    playerId: 'p10',
    eventType: 'goal',
    minute: 68,
    details: 'Elfmeter',
    createdAt: '2026-02-25T16:38:00Z',
    player: { id: 'p10', clubId: '1', name: 'Maximilian Bauer', dateOfBirth: '2006-05-25', position: 'attacking-midfielder', preferredFoot: 'right', height: 175, weight: 68, jerseyNumber: 10, contactEmail: null, contactPhone: null, parentName: null, parentEmail: null, parentPhone: null, photoUrl: null, createdAt: '' },
  },
  {
    id: 'e7',
    matchId: 'm7',
    playerId: 'p13',
    eventType: 'card',
    minute: 78,
    details: 'yellow',
    createdAt: '2026-02-25T16:48:00Z',
    player: { id: 'p13', clubId: '1', name: 'Noah Berger', dateOfBirth: '2005-09-30', position: 'defensive-midfielder', preferredFoot: 'right', height: 180, weight: 74, jerseyNumber: 6, contactEmail: null, contactPhone: null, parentName: null, parentEmail: null, parentPhone: null, photoUrl: null, createdAt: '' },
  },
  {
    id: 'e8',
    matchId: 'm7',
    playerId: 'p9',
    eventType: 'substitution',
    minute: 85,
    details: 'ersetzt durch Simon Pichler',
    createdAt: '2026-02-25T16:55:00Z',
    player: { id: 'p9', clubId: '1', name: 'Lukas Gruber', dateOfBirth: '2006-08-08', position: 'striker', preferredFoot: 'left', height: 178, weight: 72, jerseyNumber: 9, contactEmail: null, contactPhone: null, parentName: null, parentEmail: null, parentPhone: null, photoUrl: null, createdAt: '' },
  },
];

const MOCK_PLAYER_RATINGS = [
  { playerName: 'Lukas Gruber', jersey: 9, speed: 8, technique: 7, passing: 6, shooting: 9, defense: 5, tactical: 7 },
  { playerName: 'Maximilian Bauer', jersey: 10, speed: 7, technique: 9, passing: 8, shooting: 8, defense: 5, tactical: 8 },
  { playerName: 'Felix Steiner', jersey: 4, speed: 6, technique: 6, passing: 7, shooting: 4, defense: 8, tactical: 7 },
  { playerName: 'Elias Wagner', jersey: 8, speed: 7, technique: 7, passing: 7, shooting: 6, defense: 6, tactical: 7 },
  { playerName: 'Noah Berger', jersey: 6, speed: 6, technique: 7, passing: 8, shooting: 5, defense: 8, tactical: 8 },
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
  const hasScore = match.scoreHome !== null && match.scoreAway !== null;

  return (
    <div className="space-y-6">
      {/* Zurueck-Link */}
      <Link
        href="/matches"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurueck zu Spiele
      </Link>

      {/* Spielkopf */}
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center text-center">
            {/* Wettbewerb */}
            <Badge variant="info" className="mb-4">
              <Trophy className="mr-1 h-3 w-3" />
              {match.competition}
            </Badge>

            {/* Team vs Gegner mit Ergebnis */}
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <Avatar
                  name={match.homeOrAway === 'home' ? match.teamName : match.opponent}
                  size="lg"
                  className="h-16 w-16 text-xl"
                />
                <span className="text-sm font-semibold text-gray-900">
                  {match.homeOrAway === 'home' ? match.teamName : match.opponent}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1">
                {hasScore ? (
                  <span className="text-4xl font-bold text-gray-900">
                    {match.scoreHome} - {match.scoreAway}
                  </span>
                ) : (
                  <span className="text-2xl font-semibold text-gray-400">
                    vs
                  </span>
                )}
                {hasScore && (
                  <span className="text-xs font-medium uppercase text-gray-400">
                    Endstand
                  </span>
                )}
              </div>

              <div className="flex flex-col items-center gap-2">
                <Avatar
                  name={match.homeOrAway === 'away' ? match.teamName : match.opponent}
                  size="lg"
                  className="h-16 w-16 text-xl"
                />
                <span className="text-sm font-semibold text-gray-900">
                  {match.homeOrAway === 'away' ? match.teamName : match.opponent}
                </span>
              </div>
            </div>

            {/* Spiel-Metadaten */}
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
              <Badge variant={match.homeOrAway === 'home' ? 'success' : 'warning'}>
                {match.homeOrAway === 'home' ? 'Heim' : 'Auswaerts'}
              </Badge>
            </div>

            {/* Notizen */}
            {match.notes && (
              <p className="mt-4 max-w-lg text-sm text-gray-500 italic">
                {match.notes}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Spielereignisse */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-600" />
            Spielereignisse
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
                Keine Ereignisse fuer dieses Spiel erfasst.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Aufstellung Platzhalter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            Aufstellung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              Aufstellungsverwaltung kommt bald
            </h3>
            <p className="max-w-sm text-sm text-gray-500">
              Formationsansicht mit Startelf und Ersatzspielern wird hier
              in einem zukuenftigen Update verfuegbar sein.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Spielerbewertungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-emerald-600" />
            Spielerbewertungen
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Spieler</th>
                  <th className="px-6 py-3">SCH</th>
                  <th className="px-6 py-3">TEC</th>
                  <th className="px-6 py-3">PAS</th>
                  <th className="px-6 py-3">TOR</th>
                  <th className="px-6 py-3">DEF</th>
                  <th className="px-6 py-3">TAK</th>
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
                        <Avatar name={rating.playerName} size="sm" />
                        <span className="font-medium text-gray-900">
                          {rating.playerName}
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
