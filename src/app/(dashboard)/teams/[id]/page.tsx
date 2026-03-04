'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth-store';
import { useClubStore } from '@/stores/club-store';
import { EditTeamModal } from '@/components/teams/edit-team-modal';
import { DeleteTeamDialog } from '@/components/teams/delete-team-dialog';
import { teamsService, playersService } from '@/lib/firebase/services';
import { isDemoMode } from '@/lib/demo-data';
import { getPositionAbbreviation, calculateAge } from '@/lib/utils';
import type { Team, Player } from '@/types/database';
import {
  ArrowLeft,
  Users,
  Dumbbell,
  Trophy,
  Pencil,
  Trash2,
  Plus,
  Loader2,
} from 'lucide-react';

type Tab = 'roster' | 'trainings' | 'matches';

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;
  const { hasRole } = useAuthStore();
  const { teams, playerTeams } = useClubStore();

  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('roster');

  // Modals
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const canManage = hasRole(['admin', 'manager']);

  // Fetch data
  useEffect(() => {
    if (isDemoMode()) {
      // In demo mode, use store data
      const demoTeam = teams.find((t) => t.id === teamId) || null;
      setTeam(demoTeam);
      setIsLoading(false);
      return;
    }

    async function load() {
      setIsLoading(true);
      const teamData = await teamsService.getById(teamId);
      if (teamData) setTeam(teamData);

      // Get players assigned to this team via playerTeams
      const assignedPlayerIds = playerTeams
        .filter((pt) => pt.teamId === teamId)
        .map((pt) => pt.playerId);

      if (assignedPlayerIds.length > 0) {
        const playerPromises = assignedPlayerIds.map((id) => playersService.getById(id));
        const playerResults = await Promise.all(playerPromises);
        setPlayers(playerResults.filter(Boolean) as Player[]);
      }

      setIsLoading(false);
    }
    load();
  }, [teamId, playerTeams, teams]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="space-y-4">
        <Link
          href="/teams"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurueck zu Teams
        </Link>
        <div className="py-20 text-center">
          <h2 className="text-lg font-semibold text-gray-900">Team nicht gefunden</h2>
          <p className="mt-1 text-sm text-gray-500">Dieses Team existiert nicht oder wurde geloescht.</p>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'roster', label: 'Kader', icon: Users },
    { key: 'trainings', label: 'Trainings', icon: Dumbbell },
    { key: 'matches', label: 'Spiele', icon: Trophy },
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
          Zurueck zu Teams
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
            <Badge variant="info">{team.category}</Badge>
            <span className="text-sm text-gray-500">Saison {team.season}</span>
          </div>

          {canManage && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Bearbeiten
              </Button>
              <Button variant="danger" size="sm" onClick={() => setIsDeleteOpen(true)}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Loeschen
              </Button>
            </div>
          )}
        </div>
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
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                Kader ({players.length} Spieler)
              </CardTitle>
              {canManage && (
                <Link href="/players">
                  <Button size="sm">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Spieler hinzufuegen
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {players.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-medium uppercase tracking-wider text-gray-500">
                      <th className="px-6 py-3">#</th>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Position</th>
                      <th className="px-6 py-3">Alter</th>
                      <th className="px-6 py-3">Fuss</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {players.map((player) => (
                      <tr
                        key={player.id}
                        className="group transition-colors hover:bg-gray-50"
                      >
                        <td className="px-6 py-3 font-semibold text-gray-900">
                          {player.jerseyNumber ?? '-'}
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
                          {player.position ? (
                            <Badge variant="default">
                              {getPositionAbbreviation(player.position)}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-gray-600">
                          {player.dateOfBirth ? calculateAge(player.dateOfBirth) : '-'}
                        </td>
                        <td className="px-6 py-3 capitalize text-gray-600">
                          {player.preferredFoot ?? '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Users className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">
                  Noch keine Spieler in diesem Team.
                </p>
              </div>
            )}
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
                Trainingseinheiten
              </h3>
              <p className="max-w-sm text-sm text-gray-500">
                Trainingseinheiten fuer dieses Team werden hier angezeigt.
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
                Spielhistorie
              </h3>
              <p className="max-w-sm text-sm text-gray-500">
                Kommende und vergangene Spiele fuer dieses Team werden hier angezeigt.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <EditTeamModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        team={team}
        onSuccess={async () => {
          const data = await teamsService.getById(teamId);
          if (data) setTeam(data);
        }}
      />
      <DeleteTeamDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        team={team ? { id: team.id, name: team.name } : null}
        onSuccess={() => router.push('/teams')}
      />
    </div>
  );
}
