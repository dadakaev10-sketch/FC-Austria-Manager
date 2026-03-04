'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { useClubStore } from '@/stores/club-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { AddPlayerModal } from '@/components/players/add-player-modal';
import { EditPlayerModal } from '@/components/players/edit-player-modal';
import { DeletePlayerDialog } from '@/components/players/delete-player-dialog';
import { fetchClubPlayers } from '@/lib/supabase/players';
import { isDemoMode } from '@/lib/demo-data';
import { calculateAge, getPositionAbbreviation } from '@/lib/utils';
import { UserPlus, Search, Filter, Pencil, Trash2, Loader2 } from 'lucide-react';
import type { Player } from '@/types/database';

// Map positions to general categories for filtering
function getPositionCategory(position: string): string {
  const defenders = ['center-back', 'left-back', 'right-back', 'defender'];
  const midfielders = ['defensive-midfielder', 'central-midfielder', 'attacking-midfielder', 'midfielder'];
  const forwards = ['left-winger', 'right-winger', 'striker', 'forward'];
  if (position === 'goalkeeper') return 'goalkeeper';
  if (defenders.includes(position)) return 'defender';
  if (midfielders.includes(position)) return 'midfielder';
  if (forwards.includes(position)) return 'forward';
  return position;
}

function getPositionBadgeVariant(position: string) {
  switch (getPositionCategory(position)) {
    case 'goalkeeper': return 'warning' as const;
    case 'defender': return 'info' as const;
    case 'midfielder': return 'success' as const;
    case 'forward': return 'danger' as const;
    default: return 'default' as const;
  }
}

const POSITION_OPTIONS = [
  { value: '', label: 'Alle Positionen' },
  { value: 'goalkeeper', label: 'Torwart' },
  { value: 'defender', label: 'Verteidiger' },
  { value: 'midfielder', label: 'Mittelfeld' },
  { value: 'forward', label: 'Sturm' },
];

export default function PlayersPage() {
  const { hasRole } = useAuthStore();
  const { currentClub, teams } = useClubStore();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [players, setPlayers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [deletePlayer, setDeletePlayer] = useState<{ id: string; name: string } | null>(null);

  const canManage = hasRole(['admin', 'club_manager', 'coach']);

  // Build team filter options dynamically
  const teamOptions = useMemo(
    () => [
      { value: '', label: 'Alle Teams' },
      ...teams.map((t) => ({ value: t.name, label: t.name })),
    ],
    [teams]
  );

  // Fetch players
  const loadPlayers = async () => {
    if (!currentClub?.id || isDemoMode()) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const { data } = await fetchClubPlayers(currentClub.id);
    if (data) setPlayers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadPlayers();
  }, [currentClub?.id]);

  // Filter players
  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const teamName = (p as any).team?.name || '';
      if (teamFilter && teamName !== teamFilter) return false;
      if (positionFilter && p.position && getPositionCategory(p.position) !== positionFilter) return false;
      return true;
    });
  }, [players, searchQuery, teamFilter, positionFilter]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Spieler</h1>
          <p className="mt-1 text-sm text-gray-500">
            Alle Spieler deines Vereins verwalten.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setIsAddOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Spieler hinzufügen
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
                  placeholder="Spieler suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-400 sm:hidden">
              <Filter className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Filter</span>
            </div>
            <div className="w-full sm:w-48">
              <Select options={teamOptions} value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} />
            </div>
            <div className="w-full sm:w-48">
              <Select options={POSITION_OPTIONS} value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Players table */}
      {players.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-3">Spieler</th>
                    <th className="px-6 py-3">Team</th>
                    <th className="px-6 py-3">Position</th>
                    <th className="px-6 py-3">#</th>
                    <th className="px-6 py-3">Alter</th>
                    {canManage && <th className="px-6 py-3 text-right">Aktionen</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPlayers.map((player) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const teamName = (player as any).team?.name || '-';
                    return (
                      <tr key={player.id} className="group transition-colors hover:bg-gray-50">
                        <td className="px-6 py-3">
                          <Link href={`/players/${player.id}`} className="flex items-center gap-3">
                            <Avatar src={player.photo_url} name={player.name} size="sm" />
                            <span className="font-medium text-gray-900 group-hover:text-emerald-600">
                              {player.name}
                            </span>
                          </Link>
                        </td>
                        <td className="px-6 py-3 text-gray-600">{teamName}</td>
                        <td className="px-6 py-3">
                          {player.position ? (
                            <Badge variant={getPositionBadgeVariant(player.position)}>
                              {getPositionAbbreviation(player.position)}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-3 font-semibold text-gray-900">
                          {player.jersey_number ?? '-'}
                        </td>
                        <td className="px-6 py-3 text-gray-600">
                          {player.date_of_birth ? calculateAge(player.date_of_birth) : '-'}
                        </td>
                        {canManage && (
                          <td className="px-6 py-3 text-right">
                            <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                onClick={() => setEditPlayer(player)}
                                className="rounded-lg p-1.5 hover:bg-gray-100"
                                title="Bearbeiten"
                              >
                                <Pencil className="h-3.5 w-3.5 text-gray-500" />
                              </button>
                              <button
                                onClick={() => setDeletePlayer({ id: player.id, name: player.name })}
                                className="rounded-lg p-1.5 hover:bg-red-50"
                                title="Löschen"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredPlayers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="mb-3 h-8 w-8 text-gray-300" />
                  <p className="text-sm font-medium text-gray-900">Keine Spieler gefunden</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Versuche andere Such- oder Filterkriterien.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={UserPlus}
          title="Noch keine Spieler"
          description="Füge deinen ersten Spieler hinzu, um mit der Verwaltung zu beginnen."
          actionLabel={canManage ? 'Spieler hinzufügen' : undefined}
          onAction={canManage ? () => setIsAddOpen(true) : undefined}
        />
      )}

      {/* Modals */}
      <AddPlayerModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={loadPlayers}
      />
      <EditPlayerModal
        isOpen={!!editPlayer}
        onClose={() => setEditPlayer(null)}
        player={editPlayer}
        onSuccess={loadPlayers}
      />
      <DeletePlayerDialog
        isOpen={!!deletePlayer}
        onClose={() => setDeletePlayer(null)}
        player={deletePlayer}
        onSuccess={loadPlayers}
      />
    </div>
  );
}
