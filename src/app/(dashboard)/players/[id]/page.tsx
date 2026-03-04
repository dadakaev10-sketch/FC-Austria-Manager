'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PlayerStatsBar } from '@/components/players/player-stats-bar';
import { calculateAge, getPositionAbbreviation, formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  Mail,
  Phone,
  Ruler,
  Weight,
  Footprints,
  Shirt,
  Calendar,
  BarChart3,
  TrendingUp,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Mock data -- will be replaced with real Supabase queries
// ---------------------------------------------------------------------------

const MOCK_PLAYERS: Record<
  string,
  {
    id: string;
    name: string;
    team: string;
    team_id: string;
    position: string;
    jersey_number: number;
    date_of_birth: string;
    photo_url: string | null;
    height: number | null;
    weight: number | null;
    preferred_foot: 'left' | 'right' | 'both';
    contact_email: string | null;
    contact_phone: string | null;
    parent_name: string | null;
    parent_email: string | null;
    parent_phone: string | null;
    stats: {
      speed: number;
      stamina: number;
      technique: number;
      passing: number;
      shooting: number;
      dribbling: number;
      defense: number;
      tactical_understanding: number;
    };
  }
> = {
  p1: {
    id: 'p1',
    name: 'Lucas Fernandez',
    team: 'U12 Development',
    team_id: '2',
    position: 'goalkeeper',
    jersey_number: 1,
    date_of_birth: '2014-03-15',
    photo_url: null,
    height: 152,
    weight: 42,
    preferred_foot: 'right',
    contact_email: 'lucas.f@email.com',
    contact_phone: '+1 555-201-0001',
    parent_name: 'Maria Fernandez',
    parent_email: 'maria.fernandez@email.com',
    parent_phone: '+1 555-201-0010',
    stats: {
      speed: 62,
      stamina: 70,
      technique: 68,
      passing: 55,
      shooting: 30,
      dribbling: 40,
      defense: 75,
      tactical_understanding: 72,
    },
  },
  p2: {
    id: 'p2',
    name: 'Daniel Kim',
    team: 'U12 Development',
    team_id: '2',
    position: 'right-back',
    jersey_number: 2,
    date_of_birth: '2014-07-22',
    photo_url: null,
    height: 148,
    weight: 39,
    preferred_foot: 'right',
    contact_email: 'daniel.k@email.com',
    contact_phone: '+1 555-201-0002',
    parent_name: 'Jun Kim',
    parent_email: 'jun.kim@email.com',
    parent_phone: '+1 555-201-0020',
    stats: {
      speed: 78,
      stamina: 75,
      technique: 60,
      passing: 62,
      shooting: 35,
      dribbling: 55,
      defense: 72,
      tactical_understanding: 65,
    },
  },
  p9: {
    id: 'p9',
    name: 'Mateo Rodriguez',
    team: 'First Team',
    team_id: '5',
    position: 'striker',
    jersey_number: 9,
    date_of_birth: '2006-08-08',
    photo_url: null,
    height: 178,
    weight: 72,
    preferred_foot: 'left',
    contact_email: 'mateo.r@email.com',
    contact_phone: '+1 555-201-0009',
    parent_name: null,
    parent_email: null,
    parent_phone: null,
    stats: {
      speed: 85,
      stamina: 78,
      technique: 82,
      passing: 70,
      shooting: 88,
      dribbling: 80,
      defense: 35,
      tactical_understanding: 75,
    },
  },
  p10: {
    id: 'p10',
    name: 'Julian Torres',
    team: 'First Team',
    team_id: '5',
    position: 'attacking-midfielder',
    jersey_number: 10,
    date_of_birth: '2006-05-25',
    photo_url: null,
    height: 175,
    weight: 68,
    preferred_foot: 'right',
    contact_email: 'julian.t@email.com',
    contact_phone: '+1 555-201-0010',
    parent_name: null,
    parent_email: null,
    parent_phone: null,
    stats: {
      speed: 76,
      stamina: 72,
      technique: 90,
      passing: 88,
      shooting: 75,
      dribbling: 85,
      defense: 40,
      tactical_understanding: 82,
    },
  },
};

// Default player for unknown IDs
const DEFAULT_PLAYER = {
  id: 'p1',
  name: 'Lucas Fernandez',
  team: 'U12 Development',
  team_id: '2',
  position: 'goalkeeper',
  jersey_number: 1,
  date_of_birth: '2014-03-15',
  photo_url: null,
  height: 152,
  weight: 42,
  preferred_foot: 'right' as const,
  contact_email: 'lucas.f@email.com',
  contact_phone: '+1 555-201-0001',
  parent_name: 'Maria Fernandez',
  parent_email: 'maria.fernandez@email.com',
  parent_phone: '+1 555-201-0010',
  stats: {
    speed: 62,
    stamina: 70,
    technique: 68,
    passing: 55,
    shooting: 30,
    dribbling: 40,
    defense: 75,
    tactical_understanding: 72,
  },
};

const MOCK_RATINGS = [
  {
    id: 'r1',
    date: '2026-02-28',
    context_type: 'match' as const,
    context_label: 'vs FC Adler',
    speed: 7,
    technique: 8,
    passing: 6,
    shooting: 5,
    defense: 8,
    tactical_awareness: 7,
  },
  {
    id: 'r2',
    date: '2026-02-25',
    context_type: 'training' as const,
    context_label: 'Passing drill session',
    speed: 6,
    technique: 7,
    passing: 7,
    shooting: 4,
    defense: 7,
    tactical_awareness: 7,
  },
  {
    id: 'r3',
    date: '2026-02-21',
    context_type: 'match' as const,
    context_label: 'vs SC Falken',
    speed: 7,
    technique: 7,
    passing: 6,
    shooting: 6,
    defense: 9,
    tactical_awareness: 8,
  },
  {
    id: 'r4',
    date: '2026-02-18',
    context_type: 'training' as const,
    context_label: 'Fitness assessment',
    speed: 7,
    technique: 7,
    passing: 6,
    shooting: 5,
    defense: 8,
    tactical_awareness: 7,
  },
  {
    id: 'r5',
    date: '2026-02-14',
    context_type: 'match' as const,
    context_label: 'vs SV Stern',
    speed: 6,
    technique: 8,
    passing: 7,
    shooting: 5,
    defense: 7,
    tactical_awareness: 6,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getContextBadgeVariant(contextType: 'training' | 'match') {
  return contextType === 'match' ? ('info' as const) : ('success' as const);
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PlayerDetailPage() {
  const params = useParams();
  const playerId = params.id as string;

  // TODO: Fetch player data from Supabase using playerId
  const player = MOCK_PLAYERS[playerId] || DEFAULT_PLAYER;

  const statEntries = [
    { label: 'Speed', value: player.stats.speed },
    { label: 'Stamina', value: player.stats.stamina },
    { label: 'Technique', value: player.stats.technique },
    { label: 'Passing', value: player.stats.passing },
    { label: 'Shooting', value: player.stats.shooting },
    { label: 'Dribbling', value: player.stats.dribbling },
    { label: 'Defense', value: player.stats.defense },
    { label: 'Tactical Understanding', value: player.stats.tactical_understanding },
  ];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/players"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Players
      </Link>

      {/* Player profile card */}
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col gap-6 sm:flex-row">
            {/* Photo & basic info */}
            <div className="flex flex-col items-center sm:items-start">
              <Avatar
                src={player.photo_url}
                name={player.name}
                size="lg"
                className="h-24 w-24 text-2xl"
              />
            </div>

            {/* Details */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {player.name}
                  </h1>
                  <Badge variant="info">
                    {getPositionAbbreviation(player.position)}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-gray-500">{player.team}</p>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
                <div className="flex items-center gap-2 text-sm">
                  <Shirt className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Jersey</span>
                  <span className="font-semibold text-gray-900">
                    #{player.jersey_number}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Age</span>
                  <span className="font-semibold text-gray-900">
                    {calculateAge(player.date_of_birth)}
                  </span>
                </div>

                {player.height && (
                  <div className="flex items-center gap-2 text-sm">
                    <Ruler className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Height</span>
                    <span className="font-semibold text-gray-900">
                      {player.height} cm
                    </span>
                  </div>
                )}

                {player.weight && (
                  <div className="flex items-center gap-2 text-sm">
                    <Weight className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Weight</span>
                    <span className="font-semibold text-gray-900">
                      {player.weight} kg
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Footprints className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Foot</span>
                  <span className="font-semibold capitalize text-gray-900">
                    {player.preferred_foot}
                  </span>
                </div>
              </div>

              {/* Contact info */}
              <div className="border-t border-gray-100 pt-3">
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  {player.contact_email && (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {player.contact_email}
                    </span>
                  )}
                  {player.contact_phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {player.contact_phone}
                    </span>
                  )}
                </div>

                {player.parent_name && (
                  <div className="mt-2 text-sm text-gray-400">
                    <span className="font-medium text-gray-500">
                      Parent/Guardian:
                    </span>{' '}
                    {player.parent_name}
                    {player.parent_email && ` - ${player.parent_email}`}
                    {player.parent_phone && ` - ${player.parent_phone}`}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player Attributes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
            Player Attributes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {statEntries.map((stat) => (
              <PlayerStatsBar
                key={stat.label}
                label={stat.label}
                value={stat.value}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Ratings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Performance Ratings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Context</th>
                  <th className="px-6 py-3">SPD</th>
                  <th className="px-6 py-3">TEC</th>
                  <th className="px-6 py-3">PAS</th>
                  <th className="px-6 py-3">SHO</th>
                  <th className="px-6 py-3">DEF</th>
                  <th className="px-6 py-3">TAC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_RATINGS.map((rating) => (
                  <tr
                    key={rating.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-3 text-gray-600">
                      {formatDate(rating.date)}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={getContextBadgeVariant(rating.context_type)}
                        >
                          {rating.context_type === 'match'
                            ? 'Match'
                            : 'Training'}
                        </Badge>
                        <span className="text-gray-600">
                          {rating.context_label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {rating.speed}
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {rating.technique}
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {rating.passing}
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {rating.shooting}
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {rating.defense}
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {rating.tactical_awareness}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Development Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Development</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-4">
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              Player development chart coming soon
            </h3>
            <p className="max-w-sm text-sm text-gray-500">
              A visual chart showing the player&apos;s progress over time will
              be available here once Recharts integration is complete.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
