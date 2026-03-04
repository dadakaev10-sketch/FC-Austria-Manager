'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { useClubStore } from '@/stores/club-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { CreateTeamModal } from '@/components/teams/create-team-modal';
import { Users, Plus, ChevronRight } from 'lucide-react';

// ---------------------------------------------------------------------------
// Mock data -- will be replaced with real Supabase data via useClubStore
// ---------------------------------------------------------------------------

const MOCK_TEAMS = [
  {
    id: '1',
    name: 'U10 Youth',
    category: 'U10',
    season: '2025/2026',
    coach: { full_name: 'Carlos Martinez' },
    playerCount: 14,
  },
  {
    id: '2',
    name: 'U12 Development',
    category: 'U12',
    season: '2025/2026',
    coach: { full_name: 'Sarah Johnson' },
    playerCount: 16,
  },
  {
    id: '3',
    name: 'U14 Academy',
    category: 'U14',
    season: '2025/2026',
    coach: { full_name: 'David Park' },
    playerCount: 18,
  },
  {
    id: '4',
    name: 'U16 Junior',
    category: 'U16',
    season: '2025/2026',
    coach: { full_name: 'Miguel Torres' },
    playerCount: 20,
  },
  {
    id: '5',
    name: 'First Team',
    category: 'First Team',
    season: '2025/2026',
    coach: { full_name: 'Roberto Silva' },
    playerCount: 22,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCategoryBadgeVariant(category: string) {
  switch (category) {
    case 'U10':
    case 'U12':
      return 'info' as const;
    case 'U14':
    case 'U16':
      return 'warning' as const;
    case 'First Team':
      return 'success' as const;
    default:
      return 'default' as const;
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TeamsPage() {
  const { hasRole } = useAuthStore();
  const { teams: storeTeams } = useClubStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Use store teams if available, otherwise fall back to mock data
  const teams = storeTeams.length > 0 ? storeTeams : null;
  const displayTeams = teams
    ? teams.map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        season: t.season,
        coach: t.coach ?? { full_name: 'Unassigned' },
        playerCount: t.players?.length ?? 0,
      }))
    : MOCK_TEAMS;

  const canCreateTeam = hasRole(['admin', 'club_manager']);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all teams in your club.
          </p>
        </div>
        {canCreateTeam && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        )}
      </div>

      {/* Teams grid */}
      {displayTeams.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displayTeams.map((team) => (
            <Link key={team.id} href={`/teams/${team.id}`}>
              <Card className="group cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="py-5">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-base font-semibold text-gray-900">
                          {team.name}
                        </h3>
                        <Badge variant={getCategoryBadgeVariant(team.category)}>
                          {team.category}
                        </Badge>
                      </div>

                      <p className="mt-1 text-sm text-gray-500">
                        Season {team.season}
                      </p>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                            <Users className="h-3.5 w-3.5 text-emerald-700" />
                          </div>
                          <span>{team.playerCount} players</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                            <span className="text-xs font-medium text-gray-600">C</span>
                          </div>
                          <span className="truncate">{team.coach.full_name}</span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-300 transition-colors group-hover:text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No teams yet"
          description="Get started by creating your first team. You can add players, assign coaches, and manage your squad."
          actionLabel={canCreateTeam ? 'Create Team' : undefined}
          onAction={canCreateTeam ? () => setIsCreateModalOpen(true) : undefined}
        />
      )}

      {/* Create team modal */}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
