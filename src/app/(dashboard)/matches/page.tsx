'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { useClubStore } from '@/stores/club-store';
import { subscribeClubMatches, matchesService } from '@/lib/firebase/services';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, formatTime } from '@/lib/utils';
import { Trophy, Plus, MapPin, Calendar, Loader2 } from 'lucide-react';
import type { Match } from '@/types/database';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isUpcoming(match: Match): boolean {
  return match.scoreHome === null && match.scoreAway === null;
}

function getScoreDisplay(match: Match): string {
  if (match.scoreHome === null || match.scoreAway === null) return '';
  return `${match.scoreHome} - ${match.scoreAway}`;
}

function getResultVariant(match: Match) {
  if (match.scoreHome === null || match.scoreAway === null)
    return 'default' as const;

  const ourScore =
    match.homeOrAway === 'home' ? match.scoreHome : match.scoreAway;
  const theirScore =
    match.homeOrAway === 'home' ? match.scoreAway : match.scoreHome;

  if (ourScore > theirScore) return 'success' as const;
  if (ourScore < theirScore) return 'danger' as const;
  return 'warning' as const;
}

function getResultLabel(match: Match): string {
  if (match.scoreHome === null || match.scoreAway === null) return '';

  const ourScore =
    match.homeOrAway === 'home' ? match.scoreHome : match.scoreAway;
  const theirScore =
    match.homeOrAway === 'home' ? match.scoreAway : match.scoreHome;

  if (ourScore > theirScore) return 'S';
  if (ourScore < theirScore) return 'N';
  return 'U';
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MatchesPage() {
  const { profile, isCoachOrAbove } = useAuthStore();
  const { currentClub, teams } = useClubStore();

  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form state
  const [formTeamId, setFormTeamId] = useState('');
  const [formOpponent, setFormOpponent] = useState('');
  const [formCompetition, setFormCompetition] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formHomeOrAway, setFormHomeOrAway] = useState<'home' | 'away'>('home');
  const [isSaving, setIsSaving] = useState(false);

  // Filters
  const [teamFilter, setTeamFilter] = useState('');
  const [competitionFilter, setCompetitionFilter] = useState('');

  const canAddMatch = isCoachOrAbove();

  // Subscribe to matches
  useEffect(() => {
    if (!currentClub) return;
    setIsLoading(true);
    const unsub = subscribeClubMatches(currentClub.id, (data) => {
      setMatches(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, [currentClub]);

  // Build filter options from store
  const TEAM_OPTIONS = useMemo(() => {
    const opts = [{ value: '', label: 'Alle Mannschaften' }];
    teams.forEach((t) => opts.push({ value: t.id, label: t.name }));
    return opts;
  }, [teams]);

  const COMPETITION_OPTIONS = useMemo(() => {
    const comps = new Set<string>();
    matches.forEach((m) => {
      if (m.competition) comps.add(m.competition);
    });
    const opts = [{ value: '', label: 'Alle Wettbewerbe' }];
    Array.from(comps)
      .sort()
      .forEach((c) => opts.push({ value: c, label: c }));
    return opts;
  }, [matches]);

  // Filter & sort
  const filteredMatches = useMemo(() => {
    return matches
      .filter((match) => {
        if (teamFilter && match.teamId !== teamFilter) return false;
        if (competitionFilter && match.competition !== competitionFilter)
          return false;
        return true;
      })
      .sort((a, b) => {
        const aUp = isUpcoming(a);
        const bUp = isUpcoming(b);
        if (aUp && bUp) return a.date.localeCompare(b.date);
        if (!aUp && !bUp) return b.date.localeCompare(a.date);
        // upcoming first
        if (aUp) return -1;
        return 1;
      });
  }, [matches, teamFilter, competitionFilter]);

  const upcomingMatches = filteredMatches.filter(isUpcoming);
  const results = filteredMatches.filter((m) => !isUpcoming(m));

  // Team name lookup
  const teamName = (teamId: string) =>
    teams.find((t) => t.id === teamId)?.name ?? '';

  // Create match handler
  const handleCreate = async () => {
    if (!currentClub || !profile || !formTeamId || !formOpponent || !formDate || !formTime)
      return;
    setIsSaving(true);
    try {
      await matchesService.create({
        clubId: currentClub.id,
        teamId: formTeamId,
        opponent: formOpponent,
        competition: formCompetition || null,
        date: formDate,
        time: formTime,
        location: formLocation || null,
        homeOrAway: formHomeOrAway,
        scoreHome: null,
        scoreAway: null,
        notes: null,
        createdBy: profile.id,
      });
      // Reset form
      setFormTeamId('');
      setFormOpponent('');
      setFormCompetition('');
      setFormDate('');
      setFormTime('');
      setFormLocation('');
      setFormHomeOrAway('home');
      setIsAddOpen(false);
    } catch (err) {
      console.error('Fehler beim Erstellen des Spiels:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seitenkopf */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Spiele</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kommende Begegnungen und vergangene Ergebnisse.
          </p>
        </div>
        {canAddMatch && (
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Spiel hinzufuegen
          </Button>
        )}
      </div>

      {/* Filterleiste */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="w-full sm:w-48">
              <Select
                label="Mannschaft"
                options={TEAM_OPTIONS}
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                label="Wettbewerb"
                options={COMPETITION_OPTIONS}
                value={competitionFilter}
                onChange={(e) => setCompetitionFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kommende Spiele */}
      {upcomingMatches.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Kommende Spiele
          </h2>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {upcomingMatches.map((match) => (
              <Link key={match.id} href={`/matches/${match.id}`}>
                <Card className="group cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="py-5">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1 space-y-3">
                        {/* Gegner */}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-base font-semibold text-gray-900 group-hover:text-emerald-600">
                              vs {match.opponent}
                            </h3>
                            <Badge
                              variant={
                                match.homeOrAway === 'home'
                                  ? 'success'
                                  : 'warning'
                              }
                            >
                              {match.homeOrAway === 'home' ? 'Heim' : 'Auswaerts'}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm font-medium text-emerald-600">
                            {teamName(match.teamId)}
                          </p>
                        </div>

                        {/* Details */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(match.date)} &middot;{' '}
                            {formatTime(match.time)}
                          </span>
                          {match.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {match.location}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Wettbewerb Badge */}
                      {match.competition && (
                        <div className="ml-4 flex flex-shrink-0 flex-col items-end">
                          <Badge variant="info">
                            <Trophy className="mr-1 h-3 w-3" />
                            {match.competition}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Ergebnisse */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Ergebnisse
          </h2>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {results.map((match) => (
              <Link key={match.id} href={`/matches/${match.id}`}>
                <Card className="group cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="py-5">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1 space-y-3">
                        {/* Gegner und Ergebnis */}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-base font-semibold text-gray-900 group-hover:text-emerald-600">
                              vs {match.opponent}
                            </h3>
                            <Badge
                              variant={
                                match.homeOrAway === 'home'
                                  ? 'success'
                                  : 'warning'
                              }
                            >
                              {match.homeOrAway === 'home' ? 'Heim' : 'Auswaerts'}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm font-medium text-emerald-600">
                            {teamName(match.teamId)}
                          </p>
                        </div>

                        {/* Details */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(match.date)}
                          </span>
                          {match.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {match.location}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Ergebnis */}
                      <div className="ml-4 flex flex-shrink-0 flex-col items-end gap-2">
                        {match.competition && (
                          <Badge variant="info">
                            <Trophy className="mr-1 h-3 w-3" />
                            {match.competition}
                          </Badge>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            {getScoreDisplay(match)}
                          </span>
                          <Badge variant={getResultVariant(match)}>
                            {getResultLabel(match)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Leerer Zustand */}
      {matches.length === 0 && (
        <Card>
          <CardContent>
            <EmptyState
              icon={Trophy}
              title="Keine Spiele vorhanden"
              description="Es wurden noch keine Spiele fuer diesen Verein erfasst."
              actionLabel={canAddMatch ? 'Spiel hinzufuegen' : undefined}
              onAction={canAddMatch ? () => setIsAddOpen(true) : undefined}
            />
          </CardContent>
        </Card>
      )}

      {/* Kein Treffer bei aktiven Filtern */}
      {matches.length > 0 && filteredMatches.length === 0 && (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Trophy className="mb-3 h-8 w-8 text-gray-300" />
              <p className="text-sm font-medium text-gray-900">
                Keine Spiele gefunden
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Passe die Filter an oder fuege ein neues Spiel hinzu.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal: Spiel hinzufuegen */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Spiel hinzufuegen"
        size="lg"
      >
        <div className="space-y-4">
          <Select
            label="Mannschaft *"
            options={[
              { value: '', label: 'Mannschaft waehlen...' },
              ...teams.map((t) => ({ value: t.id, label: t.name })),
            ]}
            value={formTeamId}
            onChange={(e) => setFormTeamId(e.target.value)}
          />

          <Input
            label="Gegner *"
            placeholder="z.B. FC Rapid Wien II"
            value={formOpponent}
            onChange={(e) => setFormOpponent(e.target.value)}
          />

          <Input
            label="Wettbewerb"
            placeholder="z.B. Wiener Liga"
            value={formCompetition}
            onChange={(e) => setFormCompetition(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Datum *"
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
            />
            <Input
              label="Anstosszeit *"
              type="time"
              value={formTime}
              onChange={(e) => setFormTime(e.target.value)}
            />
          </div>

          <Input
            label="Spielort"
            placeholder="z.B. Heimstadion"
            value={formLocation}
            onChange={(e) => setFormLocation(e.target.value)}
          />

          <Select
            label="Heim / Auswaerts"
            options={[
              { value: 'home', label: 'Heim' },
              { value: 'away', label: 'Auswaerts' },
            ]}
            value={formHomeOrAway}
            onChange={(e) =>
              setFormHomeOrAway(e.target.value as 'home' | 'away')
            }
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                isSaving || !formTeamId || !formOpponent || !formDate || !formTime
              }
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Speichern
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
