'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Avatar } from '@/components/ui/avatar';
import { calculateAge, getPositionAbbreviation } from '@/lib/utils';
import { UserPlus, Search, Filter } from 'lucide-react';

// ---------------------------------------------------------------------------
// Mock data -- will be replaced with real Supabase data
// ---------------------------------------------------------------------------

const MOCK_PLAYERS = [
  {
    id: 'p1',
    name: 'Lucas Fernandez',
    team: 'U12 Development',
    team_id: '2',
    position: 'goalkeeper',
    jersey_number: 1,
    date_of_birth: '2014-03-15',
    photo_url: null,
  },
  {
    id: 'p2',
    name: 'Daniel Kim',
    team: 'U12 Development',
    team_id: '2',
    position: 'right-back',
    jersey_number: 2,
    date_of_birth: '2014-07-22',
    photo_url: null,
  },
  {
    id: 'p3',
    name: 'Oliver Smith',
    team: 'U12 Development',
    team_id: '2',
    position: 'center-back',
    jersey_number: 3,
    date_of_birth: '2014-01-10',
    photo_url: null,
  },
  {
    id: 'p4',
    name: 'Noah Garcia',
    team: 'U14 Academy',
    team_id: '3',
    position: 'center-back',
    jersey_number: 4,
    date_of_birth: '2012-09-05',
    photo_url: null,
  },
  {
    id: 'p5',
    name: 'Liam Nguyen',
    team: 'U14 Academy',
    team_id: '3',
    position: 'left-back',
    jersey_number: 5,
    date_of_birth: '2012-11-30',
    photo_url: null,
  },
  {
    id: 'p6',
    name: 'Ethan Brown',
    team: 'U10 Youth',
    team_id: '1',
    position: 'defensive-midfielder',
    jersey_number: 6,
    date_of_birth: '2016-04-18',
    photo_url: null,
  },
  {
    id: 'p7',
    name: 'Alexander Wilson',
    team: 'U16 Junior',
    team_id: '4',
    position: 'right-winger',
    jersey_number: 7,
    date_of_birth: '2010-06-12',
    photo_url: null,
  },
  {
    id: 'p8',
    name: 'Sebastian Lee',
    team: 'U16 Junior',
    team_id: '4',
    position: 'central-midfielder',
    jersey_number: 8,
    date_of_birth: '2010-02-28',
    photo_url: null,
  },
  {
    id: 'p9',
    name: 'Mateo Rodriguez',
    team: 'First Team',
    team_id: '5',
    position: 'striker',
    jersey_number: 9,
    date_of_birth: '2006-08-08',
    photo_url: null,
  },
  {
    id: 'p10',
    name: 'Julian Torres',
    team: 'First Team',
    team_id: '5',
    position: 'attacking-midfielder',
    jersey_number: 10,
    date_of_birth: '2006-05-25',
    photo_url: null,
  },
  {
    id: 'p11',
    name: 'Hugo Martinez',
    team: 'U10 Youth',
    team_id: '1',
    position: 'left-winger',
    jersey_number: 11,
    date_of_birth: '2016-12-01',
    photo_url: null,
  },
  {
    id: 'p12',
    name: 'Benjamin Clarke',
    team: 'U14 Academy',
    team_id: '3',
    position: 'goalkeeper',
    jersey_number: 12,
    date_of_birth: '2012-10-14',
    photo_url: null,
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

const POSITION_OPTIONS = [
  { value: '', label: 'All Positions' },
  { value: 'goalkeeper', label: 'Goalkeeper' },
  { value: 'defender', label: 'Defender' },
  { value: 'midfielder', label: 'Midfielder' },
  { value: 'forward', label: 'Forward' },
];

// Map detailed positions to general categories for filtering
function getPositionCategory(position: string): string {
  const defenderPositions = ['center-back', 'left-back', 'right-back', 'defender'];
  const midfielderPositions = [
    'defensive-midfielder',
    'central-midfielder',
    'attacking-midfielder',
    'midfielder',
  ];
  const forwardPositions = ['left-winger', 'right-winger', 'striker', 'forward'];

  if (position === 'goalkeeper') return 'goalkeeper';
  if (defenderPositions.includes(position)) return 'defender';
  if (midfielderPositions.includes(position)) return 'midfielder';
  if (forwardPositions.includes(position)) return 'forward';
  return position;
}

function getPositionBadgeVariant(position: string) {
  switch (getPositionCategory(position)) {
    case 'goalkeeper':
      return 'warning' as const;
    case 'defender':
      return 'info' as const;
    case 'midfielder':
      return 'success' as const;
    case 'forward':
      return 'danger' as const;
    default:
      return 'default' as const;
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PlayersPage() {
  const { isCoachOrAbove } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');

  const canAddPlayer = isCoachOrAbove();

  const filteredPlayers = useMemo(() => {
    return MOCK_PLAYERS.filter((player) => {
      // Search filter
      if (
        searchQuery &&
        !player.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Team filter
      if (teamFilter && player.team !== teamFilter) {
        return false;
      }

      // Position filter
      if (positionFilter && getPositionCategory(player.position) !== positionFilter) {
        return false;
      }

      return true;
    });
  }, [searchQuery, teamFilter, positionFilter]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Players</h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse and manage all players in your club.
          </p>
        </div>
        {canAddPlayer && (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Player
          </Button>
        )}
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-400 sm:hidden">
              <Filter className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Filters
              </span>
            </div>
            <div className="w-full sm:w-48">
              <Select
                options={TEAM_OPTIONS}
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                options={POSITION_OPTIONS}
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Players table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Player</th>
                  <th className="px-6 py-3">Team</th>
                  <th className="px-6 py-3">Position</th>
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPlayers.map((player) => (
                  <tr
                    key={player.id}
                    className="group transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-3">
                      <Link
                        href={`/players/${player.id}`}
                        className="flex items-center gap-3"
                      >
                        <Avatar
                          src={player.photo_url}
                          name={player.name}
                          size="sm"
                        />
                        <span className="font-medium text-gray-900 group-hover:text-emerald-600">
                          {player.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{player.team}</td>
                    <td className="px-6 py-3">
                      <Badge variant={getPositionBadgeVariant(player.position)}>
                        {getPositionAbbreviation(player.position)}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 font-semibold text-gray-900">
                      {player.jersey_number}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {calculateAge(player.date_of_birth)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPlayers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="mb-3 h-8 w-8 text-gray-300" />
                <p className="text-sm font-medium text-gray-900">
                  No players found
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
