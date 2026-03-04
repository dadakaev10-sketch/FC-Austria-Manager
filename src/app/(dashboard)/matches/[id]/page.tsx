'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { useClubStore } from '@/stores/club-store';
import {
  matchesService,
  matchEventsService,
  subscribeMatchEvents,
} from '@/lib/firebase/services';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { MatchEventItem } from '@/components/matches/match-event-item';
import { formatDate, formatTime } from '@/lib/utils';
import type { Match, MatchEvent } from '@/types/database';
import {
  ArrowLeft,
  Trophy,
  MapPin,
  Calendar,
  Clock,
  Target,
  Users,
  Star,
  Plus,
  Loader2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = params.id as string;

  const { profile, isCoachOrAbove } = useAuthStore();
  const { teams, players } = useClubStore();

  const [match, setMatch] = useState<Match | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Score editing
  const [isEditingScore, setIsEditingScore] = useState(false);
  const [scoreHome, setScoreHome] = useState('');
  const [scoreAway, setScoreAway] = useState('');
  const [isSavingScore, setIsSavingScore] = useState(false);

  // Add event modal
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [eventPlayerId, setEventPlayerId] = useState('');
  const [eventType, setEventType] = useState<'goal' | 'assist' | 'card' | 'substitution'>('goal');
  const [eventMinute, setEventMinute] = useState('');
  const [eventDetails, setEventDetails] = useState('');
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  const canEdit = isCoachOrAbove();

  // Fetch match data
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    matchesService.getById(matchId).then((data) => {
      if (!cancelled) {
        setMatch(data);
        setIsLoading(false);
        if (data) {
          setScoreHome(data.scoreHome !== null ? String(data.scoreHome) : '');
          setScoreAway(data.scoreAway !== null ? String(data.scoreAway) : '');
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [matchId]);

  // Subscribe to match events
  useEffect(() => {
    setEventsLoading(true);
    const unsub = subscribeMatchEvents(matchId, (data) => {
      // Enrich events with player data from the store
      const enriched = data.map((evt) => ({
        ...evt,
        player: players.find((p) => p.id === evt.playerId) ?? undefined,
      }));
      setEvents(enriched);
      setEventsLoading(false);
    });
    return () => unsub();
  }, [matchId, players]);

  // Team name lookup
  const getTeamName = (teamId: string) =>
    teams.find((t) => t.id === teamId)?.name ?? '';

  // Save score
  const handleSaveScore = async () => {
    if (!match) return;
    setIsSavingScore(true);
    try {
      const homeVal = scoreHome !== '' ? Number(scoreHome) : null;
      const awayVal = scoreAway !== '' ? Number(scoreAway) : null;
      await matchesService.update(match.id, {
        scoreHome: homeVal,
        scoreAway: awayVal,
      });
      setMatch({ ...match, scoreHome: homeVal, scoreAway: awayVal });
      setIsEditingScore(false);
    } catch (err) {
      console.error('Fehler beim Speichern des Ergebnisses:', err);
    } finally {
      setIsSavingScore(false);
    }
  };

  // Add event
  const handleAddEvent = async () => {
    if (!eventPlayerId || !eventMinute) return;
    setIsSavingEvent(true);
    try {
      await matchEventsService.create({
        matchId,
        playerId: eventPlayerId,
        eventType,
        minute: Number(eventMinute),
        details: eventDetails || null,
      });
      // Reset form
      setEventPlayerId('');
      setEventType('goal');
      setEventMinute('');
      setEventDetails('');
      setIsAddEventOpen(false);
    } catch (err) {
      console.error('Fehler beim Erstellen des Ereignisses:', err);
    } finally {
      setIsSavingEvent(false);
    }
  };

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Not found
  if (!match) {
    return (
      <div className="space-y-6">
        <Link
          href="/matches"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurueck zu Spiele
        </Link>
        <Card>
          <CardContent>
            <EmptyState
              icon={Trophy}
              title="Spiel nicht gefunden"
              description="Das angeforderte Spiel konnte nicht gefunden werden."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasScore = match.scoreHome !== null && match.scoreAway !== null;
  const matchTeamName = getTeamName(match.teamId);
  const sortedEvents = [...events].sort((a, b) => a.minute - b.minute);

  // Build player options for the event form
  const playerOptions = [
    { value: '', label: 'Spieler waehlen...' },
    ...players.map((p) => ({ value: p.id, label: p.name })),
  ];

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
            {match.competition && (
              <Badge variant="info" className="mb-4">
                <Trophy className="mr-1 h-3 w-3" />
                {match.competition}
              </Badge>
            )}

            {/* Team vs Gegner mit Ergebnis */}
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <Avatar
                  name={
                    match.homeOrAway === 'home'
                      ? matchTeamName
                      : match.opponent
                  }
                  size="lg"
                  className="h-16 w-16 text-xl"
                />
                <span className="text-sm font-semibold text-gray-900">
                  {match.homeOrAway === 'home'
                    ? matchTeamName
                    : match.opponent}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1">
                {isEditingScore ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      className="w-16 text-center text-lg font-bold"
                      value={scoreHome}
                      onChange={(e) => setScoreHome(e.target.value)}
                    />
                    <span className="text-xl font-bold text-gray-400">-</span>
                    <Input
                      type="number"
                      min="0"
                      className="w-16 text-center text-lg font-bold"
                      value={scoreAway}
                      onChange={(e) => setScoreAway(e.target.value)}
                    />
                  </div>
                ) : hasScore ? (
                  <span className="text-4xl font-bold text-gray-900">
                    {match.scoreHome} - {match.scoreAway}
                  </span>
                ) : (
                  <span className="text-2xl font-semibold text-gray-400">
                    vs
                  </span>
                )}
                {hasScore && !isEditingScore && (
                  <span className="text-xs font-medium uppercase text-gray-400">
                    Endstand
                  </span>
                )}
                {canEdit && (
                  <div className="mt-2 flex gap-2">
                    {isEditingScore ? (
                      <>
                        <Button
                          size="sm"
                          onClick={handleSaveScore}
                          disabled={isSavingScore}
                        >
                          {isSavingScore && (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          )}
                          Speichern
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsEditingScore(false);
                            setScoreHome(
                              match.scoreHome !== null
                                ? String(match.scoreHome)
                                : ''
                            );
                            setScoreAway(
                              match.scoreAway !== null
                                ? String(match.scoreAway)
                                : ''
                            );
                          }}
                        >
                          Abbrechen
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingScore(true)}
                      >
                        Ergebnis bearbeiten
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-2">
                <Avatar
                  name={
                    match.homeOrAway === 'away'
                      ? matchTeamName
                      : match.opponent
                  }
                  size="lg"
                  className="h-16 w-16 text-xl"
                />
                <span className="text-sm font-semibold text-gray-900">
                  {match.homeOrAway === 'away'
                    ? matchTeamName
                    : match.opponent}
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
              {match.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {match.location}
                </span>
              )}
              <Badge
                variant={match.homeOrAway === 'home' ? 'success' : 'warning'}
              >
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-600" />
              Spielereignisse
            </CardTitle>
            {canEdit && (
              <Button size="sm" onClick={() => setIsAddEventOpen(true)}>
                <Plus className="mr-1 h-4 w-4" />
                Ereignis
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {eventsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : sortedEvents.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {sortedEvents.map((event) => (
                <MatchEventItem key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Star className="mb-2 h-6 w-6 text-gray-300" />
              <p className="text-sm text-gray-500">
                Keine Ereignisse fuer dieses Spiel erfasst.
              </p>
              {canEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => setIsAddEventOpen(true)}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Ereignis hinzufuegen
                </Button>
              )}
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
              Formationsansicht mit Startelf und Ersatzspielern wird hier in
              einem zukuenftigen Update verfuegbar sein.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modal: Ereignis hinzufuegen */}
      <Modal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        title="Spielereignis hinzufuegen"
      >
        <div className="space-y-4">
          <Select
            label="Spieler *"
            options={playerOptions}
            value={eventPlayerId}
            onChange={(e) => setEventPlayerId(e.target.value)}
          />

          <Select
            label="Ereignistyp *"
            options={[
              { value: 'goal', label: 'Tor' },
              { value: 'assist', label: 'Vorlage' },
              { value: 'card', label: 'Karte' },
              { value: 'substitution', label: 'Auswechslung' },
            ]}
            value={eventType}
            onChange={(e) =>
              setEventType(
                e.target.value as 'goal' | 'assist' | 'card' | 'substitution'
              )
            }
          />

          <Input
            label="Minute *"
            type="number"
            min="0"
            max="120"
            placeholder="z.B. 23"
            value={eventMinute}
            onChange={(e) => setEventMinute(e.target.value)}
          />

          <Input
            label="Details"
            placeholder={
              eventType === 'goal'
                ? 'z.B. Kopfball, Elfmeter'
                : eventType === 'card'
                  ? 'z.B. yellow, red'
                  : eventType === 'substitution'
                    ? 'z.B. ersetzt durch Max Mustermann'
                    : 'z.B. Flanke von rechts'
            }
            value={eventDetails}
            onChange={(e) => setEventDetails(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsAddEventOpen(false)}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleAddEvent}
              disabled={isSavingEvent || !eventPlayerId || !eventMinute}
            >
              {isSavingEvent && (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              )}
              Speichern
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
