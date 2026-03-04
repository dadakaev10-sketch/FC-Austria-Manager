'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { getPositionAbbreviation, calculateAge } from '@/lib/utils';
import {
  ArrowLeft,
  Users,
  Dumbbell,
  Trophy,
  Mail,
  Phone,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Mock data -- will be replaced with real Supabase queries
// ---------------------------------------------------------------------------

const MOCK_TEAM = {
  id: '2',
  name: 'U12 Development',
  category: 'U12',
  season: '2025/2026',
};

const MOCK_COACH = {
  id: 'c1',
  full_name: 'Sarah Johnson',
  email: 'sarah.johnson@club.com',
  phone: '+1 555-100-2000',
  avatar_url: null,
  role: 'coach' as const,
};

const MOCK_ASSISTANT_COACH = {
  id: 'c2',
  full_name: 'Marco Rossi',
  email: 'marco.rossi@club.com',
  phone: '+1 555-100-3000',
  avatar_url: null,
  role: 'assistant_coach' as const,
};

const MOCK_PLAYERS = [
  { id: 'p1',  jersey_number: 1,  name: 'Lucas Fernandez',    position: 'goalkeeper',          date_of_birth: '2014-03-15', preferred_foot: 'right' as const },
  { id: 'p2',  jersey_number: 2,  name: 'Daniel Kim',         position: 'right-back',          date_of_birth: '2014-07-22', preferred_foot: 'right' as const },
  { id: 'p3',  jersey_number: 3,  name: 'Oliver Smith',       position: 'center-back',         date_of_birth: '2014-01-10', preferred_foot: 'left' as const },
  { id: 'p4',  jersey_number: 4,  name: 'Noah Garcia',        position: 'center-back',         date_of_birth: '2014-09-05', preferred_foot: 'right' as const },
  { id: 'p5',  jersey_number: 5,  name: 'Liam Nguyen',        position: 'left-back',           date_of_birth: '2014-11-30', preferred_foot: 'left' as const },
  { id: 'p6',  jersey_number: 6,  name: 'Ethan Brown',        position: 'defensive-midfielder', date_of_birth: '2014-04-18', preferred_foot: 'right' as const },
  { id: 'p7',  jersey_number: 7,  name: 'Alexander Wilson',   position: 'right-winger',        date_of_birth: '2014-06-12', preferred_foot: 'right' as const },
  { id: 'p8',  jersey_number: 8,  name: 'Sebastian Lee',      position: 'central-midfielder',  date_of_birth: '2014-02-28', preferred_foot: 'both' as const },
  { id: 'p9',  jersey_number: 9,  name: 'Mateo Rodriguez',    position: 'striker',             date_of_birth: '2014-08-08', preferred_foot: 'left' as const },
  { id: 'p10', jersey_number: 10, name: 'Julian Torres',      position: 'attacking-midfielder', date_of_birth: '2014-05-25', preferred_foot: 'right' as const },
  { id: 'p11', jersey_number: 11, name: 'Hugo Martinez',      position: 'left-winger',         date_of_birth: '2014-12-01', preferred_foot: 'left' as const },
  { id: 'p12', jersey_number: 12, name: 'Benjamin Clarke',    position: 'goalkeeper',          date_of_birth: '2014-10-14', preferred_foot: 'right' as const },
  { id: 'p13', jersey_number: 14, name: 'Samuel Eriksson',    position: 'defender',            date_of_birth: '2014-03-03', preferred_foot: 'right' as const },
  { id: 'p14', jersey_number: 16, name: 'Henry Dubois',       position: 'midfielder',          date_of_birth: '2014-07-19', preferred_foot: 'both' as const },
  { id: 'p15', jersey_number: 20, name: 'William Tanaka',     position: 'forward',             date_of_birth: '2014-01-27', preferred_foot: 'right' as const },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = 'roster' | 'trainings' | 'matches';

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.id as string;
  const [activeTab, setActiveTab] = useState<Tab>('roster');

  // TODO: Fetch team data from Supabase using teamId
  // const { data: team } = await supabase.from('teams').select('*, coach:profiles!coach_id(*), assistant_coach:profiles!assistant_coach_id(*)').eq('id', teamId).single();
  const team = MOCK_TEAM;
  const coach = MOCK_COACH;
  const assistantCoach = MOCK_ASSISTANT_COACH;
  const players = MOCK_PLAYERS;

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'roster', label: 'Roster', icon: Users },
    { key: 'trainings', label: 'Trainings', icon: Dumbbell },
    { key: 'matches', label: 'Matches', icon: Trophy },
  ];

  return (
    <div className="space-y-6">
      {/* Back link + header */}
      <div>
        <Link
          href="/teams"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Teams
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
          <Badge variant="info">{team.category}</Badge>
          <span className="text-sm text-gray-500">Season {team.season}</span>
        </div>
      </div>

      {/* Coach cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Head Coach */}
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <Avatar name={coach.full_name} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Head Coach
              </p>
              <p className="truncate text-base font-semibold text-gray-900">
                {coach.full_name}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {coach.email}
                </span>
                {coach.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {coach.phone}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assistant Coach */}
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <Avatar name={assistantCoach.full_name} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Assistant Coach
              </p>
              <p className="truncate text-base font-semibold text-gray-900">
                {assistantCoach.full_name}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {assistantCoach.email}
                </span>
                {assistantCoach.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {assistantCoach.phone}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                activeTab === key
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'roster' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              Squad ({players.length} players)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-3">#</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Position</th>
                    <th className="px-6 py-3">Age</th>
                    <th className="px-6 py-3">Foot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {players.map((player) => (
                    <tr
                      key={player.id}
                      className="group transition-colors hover:bg-gray-50"
                    >
                      <td className="px-6 py-3 font-semibold text-gray-900">
                        {player.jersey_number}
                      </td>
                      <td className="px-6 py-3">
                        <Link
                          href={`/players/${player.id}`}
                          className="font-medium text-gray-900 group-hover:text-emerald-600"
                        >
                          {player.name}
                        </Link>
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant="default">
                          {getPositionAbbreviation(player.position)}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {calculateAge(player.date_of_birth)}
                      </td>
                      <td className="px-6 py-3 capitalize text-gray-600">
                        {player.preferred_foot}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'trainings' && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-4">
                <Dumbbell className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-gray-900">
                Training Sessions
              </h3>
              <p className="max-w-sm text-sm text-gray-500">
                Training sessions for this team will appear here. This feature
                is coming soon.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'matches' && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-4">
                <Trophy className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-gray-900">
                Match History
              </h3>
              <p className="max-w-sm text-sm text-gray-500">
                Upcoming and past matches for this team will appear here. This
                feature is coming soon.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
