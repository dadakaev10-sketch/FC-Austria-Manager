'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PlayerStatsBar } from '@/components/players/player-stats-bar';
import { EditPlayerModal } from '@/components/players/edit-player-modal';
import { DeletePlayerDialog } from '@/components/players/delete-player-dialog';
import { EditPlayerStatsModal } from '@/components/players/edit-player-stats-modal';
import { useAuthStore } from '@/stores/auth-store';
import { fetchPlayerDetail, fetchPlayerRatings } from '@/lib/supabase/players';
import { isDemoMode } from '@/lib/demo-data';
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
  Pencil,
  Trash2,
  Loader2,
} from 'lucide-react';

export default function PlayerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playerId = params.id as string;
  const { hasRole } = useAuthStore();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [player, setPlayer] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ratings, setRatings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const canManage = hasRole(['admin', 'club_manager', 'coach']);

  const loadData = async () => {
    if (isDemoMode()) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const [playerRes, ratingsRes] = await Promise.all([
      fetchPlayerDetail(playerId),
      fetchPlayerRatings(playerId),
    ]);
    if (playerRes.data) setPlayer(playerRes.data);
    if (ratingsRes.data) setRatings(ratingsRes.data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [playerId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="space-y-4">
        <Link href="/players" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Zurück zu Spieler
        </Link>
        <div className="py-20 text-center">
          <h2 className="text-lg font-semibold text-gray-900">Spieler nicht gefunden</h2>
          <p className="mt-1 text-sm text-gray-500">Dieser Spieler existiert nicht oder wurde gelöscht.</p>
        </div>
      </div>
    );
  }

  // Extract stats (Supabase returns array for one-to-many, even if unique)
  const stats = Array.isArray(player.stats) ? player.stats[0] ?? null : player.stats ?? null;
  const teamName = player.team?.name || '-';

  const statEntries = stats
    ? [
        { label: 'Schnelligkeit', value: stats.speed },
        { label: 'Ausdauer', value: stats.stamina },
        { label: 'Technik', value: stats.technique },
        { label: 'Passspiel', value: stats.passing },
        { label: 'Schuss', value: stats.shooting },
        { label: 'Dribbling', value: stats.dribbling },
        { label: 'Verteidigung', value: stats.defense },
        { label: 'Taktik', value: stats.tactical_understanding },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/players" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" />
        Zurück zu Spieler
      </Link>

      {/* Player profile card */}
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="flex flex-col items-center sm:items-start">
              <Avatar src={player.photo_url} name={player.name} size="lg" className="h-24 w-24 text-2xl" />
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">{player.name}</h1>
                    {player.position && (
                      <Badge variant="info">{getPositionAbbreviation(player.position)}</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{teamName}</p>
                </div>

                {canManage && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Bearbeiten
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setIsDeleteOpen(true)}>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Löschen
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
                {player.jersey_number != null && (
                  <div className="flex items-center gap-2 text-sm">
                    <Shirt className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Trikot</span>
                    <span className="font-semibold text-gray-900">#{player.jersey_number}</span>
                  </div>
                )}
                {player.date_of_birth && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Alter</span>
                    <span className="font-semibold text-gray-900">{calculateAge(player.date_of_birth)}</span>
                  </div>
                )}
                {player.height && (
                  <div className="flex items-center gap-2 text-sm">
                    <Ruler className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Größe</span>
                    <span className="font-semibold text-gray-900">{player.height} cm</span>
                  </div>
                )}
                {player.weight && (
                  <div className="flex items-center gap-2 text-sm">
                    <Weight className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Gewicht</span>
                    <span className="font-semibold text-gray-900">{player.weight} kg</span>
                  </div>
                )}
                {player.preferred_foot && (
                  <div className="flex items-center gap-2 text-sm">
                    <Footprints className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Fuß</span>
                    <span className="font-semibold capitalize text-gray-900">{player.preferred_foot}</span>
                  </div>
                )}
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
                    <span className="font-medium text-gray-500">Eltern:</span>{' '}
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              Spieler-Attribute
            </CardTitle>
            {canManage && (
              <Button variant="outline" size="sm" onClick={() => setIsStatsOpen(true)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Stats bearbeiten
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {statEntries.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {statEntries.map((stat) => (
                <PlayerStatsBar key={stat.label} label={stat.label} value={stat.value} />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">
              Noch keine Stats vorhanden. Klicke auf &quot;Stats bearbeiten&quot; um zu beginnen.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Ratings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Bewertungen
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {ratings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-3">Datum</th>
                    <th className="px-6 py-3">Kontext</th>
                    <th className="px-6 py-3">Notiz</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ratings.map((rating) => (
                    <tr key={rating.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">
                        {formatDate(rating.created_at)}
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant={rating.context_type === 'match' ? 'info' : 'success'}>
                          {rating.context_type === 'match' ? 'Spiel' : 'Training'}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {rating.overall_notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">
              Noch keine Bewertungen vorhanden.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <EditPlayerModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        player={player}
        onSuccess={loadData}
      />
      <DeletePlayerDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        player={player ? { id: player.id, name: player.name } : null}
        onSuccess={() => router.push('/players')}
      />
      <EditPlayerStatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        playerId={playerId}
        currentStats={stats}
        onSuccess={loadData}
      />
    </div>
  );
}
