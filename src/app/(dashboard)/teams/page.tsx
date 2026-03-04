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
import { EditTeamModal } from '@/components/teams/edit-team-modal';
import { DeleteTeamDialog } from '@/components/teams/delete-team-dialog';
import { Users, Plus, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import type { Team } from '@/types/database';

function getCategoryBadgeVariant(category: string) {
  switch (category) {
    case 'U8':
    case 'U10':
    case 'U12':
      return 'info' as const;
    case 'U14':
    case 'U16':
    case 'U18':
      return 'warning' as const;
    case 'First Team':
    case 'B Team':
      return 'success' as const;
    default:
      return 'default' as const;
  }
}

export default function TeamsPage() {
  const { hasRole } = useAuthStore();
  const { teams } = useClubStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [deleteTeam, setDeleteTeam] = useState<{ id: string; name: string } | null>(null);

  const canManage = hasRole(['admin', 'club_manager']);

  // Map teams to display data (handle Supabase join shape)
  const displayTeams = teams.map((t) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = t as any;
    return {
      id: t.id,
      name: t.name,
      category: t.category,
      season: t.season,
      coachName: raw.coach?.full_name ?? 'Nicht zugewiesen',
      playerCount: Array.isArray(raw.players) ? raw.players.length : 0,
      _raw: t,
    };
  });

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mannschaften</h1>
          <p className="mt-1 text-sm text-gray-500">
            Alle Teams deines Vereins verwalten.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Team erstellen
          </Button>
        )}
      </div>

      {/* Teams grid */}
      {displayTeams.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displayTeams.map((team) => (
            <div key={team.id} className="group relative">
              <Link href={`/teams/${team.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
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
                          Saison {team.season}
                        </p>

                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                              <Users className="h-3.5 w-3.5 text-emerald-700" />
                            </div>
                            <span>{team.playerCount} Spieler</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                              <span className="text-xs font-medium text-gray-600">T</span>
                            </div>
                            <span className="truncate">{team.coachName}</span>
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-300 transition-colors group-hover:text-emerald-600" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Edit / Delete buttons (overlay on hover) */}
              {canManage && (
                <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditTeam(team._raw);
                    }}
                    className="rounded-lg bg-white p-1.5 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
                    title="Team bearbeiten"
                  >
                    <Pencil className="h-3.5 w-3.5 text-gray-500" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeleteTeam({ id: team.id, name: team.name });
                    }}
                    className="rounded-lg bg-white p-1.5 shadow-sm ring-1 ring-gray-200 hover:bg-red-50"
                    title="Team löschen"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="Noch keine Teams"
          description="Erstelle dein erstes Team, um Spieler hinzuzufügen und deine Mannschaft zu verwalten."
          actionLabel={canManage ? 'Team erstellen' : undefined}
          onAction={canManage ? () => setIsCreateModalOpen(true) : undefined}
        />
      )}

      {/* Modals */}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <EditTeamModal
        isOpen={!!editTeam}
        onClose={() => setEditTeam(null)}
        team={editTeam}
      />
      <DeleteTeamDialog
        isOpen={!!deleteTeam}
        onClose={() => setDeleteTeam(null)}
        team={deleteTeam}
      />
    </div>
  );
}
