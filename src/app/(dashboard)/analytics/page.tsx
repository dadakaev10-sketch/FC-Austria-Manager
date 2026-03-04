'use client';

import { useState, useEffect } from 'react';
import { useClubStore } from '@/stores/club-store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import {
  BarChart3,
  TrendingUp,
  Target,
  Users,
  Loader2,
  Trophy,
} from 'lucide-react';
import { subscribeClubMatches } from '@/lib/firebase/services';
import type { Match, Team } from '@/types/database';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ---------------------------------------------------------------------------
// Color palette
// ---------------------------------------------------------------------------

const COLORS = {
  emerald: '#10b981',
  blue: '#3b82f6',
  amber: '#f59e0b',
  red: '#ef4444',
  purple: '#8b5cf6',
};

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

const TABS = [
  { key: 'team-stats', label: 'Mannschaftsstatistiken', icon: BarChart3 },
  { key: 'player-stats', label: 'Spielerstatistiken', icon: Users },
] as const;

type TabKey = (typeof TABS)[number]['key'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface TeamStat {
  name: string;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

function computeTeamStats(teams: Team[], matches: Match[]): TeamStat[] {
  return teams.map((team) => {
    const teamMatches = matches.filter(
      (m) => m.teamId === team.id && m.scoreHome !== null && m.scoreAway !== null
    );

    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    for (const match of teamMatches) {
      const home = match.scoreHome!;
      const away = match.scoreAway!;

      if (match.homeOrAway === 'home') {
        goalsFor += home;
        goalsAgainst += away;
        if (home > away) wins++;
        else if (home === away) draws++;
        else losses++;
      } else {
        goalsFor += away;
        goalsAgainst += home;
        if (away > home) wins++;
        else if (home === away) draws++;
        else losses++;
      }
    }

    return {
      name: team.name,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
    };
  });
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AnalyticsPage() {
  const { currentClub, teams, players } = useClubStore();
  const [activeTab, setActiveTab] = useState<TabKey>('team-stats');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to matches for the current club
  useEffect(() => {
    if (!currentClub?.id) {
      setMatches([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeClubMatches(currentClub.id, (clubMatches) => {
      setMatches(clubMatches);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentClub?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Statistiken</h1>
        <p className="mt-1 text-sm text-gray-500">
          Leistungsanalysen fuer Mannschaften und Spieler.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'team-stats' && (
        <TeamStatsTab teams={teams} matches={matches} />
      )}
      {activeTab === 'player-stats' && (
        <PlayerStatsTab playersCount={players.length} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Team Stats Tab
// ---------------------------------------------------------------------------

function TeamStatsTab({
  teams,
  matches,
}: {
  teams: Team[];
  matches: Match[];
}) {
  const teamStats = computeTeamStats(teams, matches);
  const completedMatches = matches.filter(
    (m) => m.scoreHome !== null && m.scoreAway !== null
  );

  const totalGoals = teamStats.reduce((sum, t) => sum + t.goalsFor, 0);
  const totalMatches = completedMatches.length;
  const totalWins = teamStats.reduce((sum, t) => sum + t.wins, 0);

  if (teams.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Keine Mannschaften vorhanden"
        description="Erstelle zuerst Mannschaften, um Statistiken zu sehen."
      />
    );
  }

  if (completedMatches.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="Noch keine Spielergebnisse"
        description="Sobald Spiele mit Ergebnissen eingetragen sind, werden hier die Mannschaftsstatistiken angezeigt."
      />
    );
  }

  const goalsPerTeamData = teamStats
    .filter((t) => t.goalsFor > 0 || t.goalsAgainst > 0)
    .map((t) => ({
      name: t.name,
      goalsFor: t.goalsFor,
      goalsAgainst: t.goalsAgainst,
    }));

  return (
    <div className="space-y-6">
      {/* Summary stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Spiele gesamt</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {totalMatches}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-100 p-3 text-emerald-600">
              <Trophy className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Siege gesamt</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {totalWins}
              </p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Tore gesamt</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {totalGoals}
              </p>
            </div>
            <div className="rounded-lg bg-amber-100 p-3 text-amber-600">
              <Target className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Team comparison cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {teamStats.map((team) => {
          const total = team.wins + team.draws + team.losses;
          const winRate =
            total > 0 ? Math.round((team.wins / total) * 100) : 0;

          if (total === 0) return null;

          return (
            <Card key={team.name} className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">
                  {team.name}
                </h3>
                <Badge
                  variant={
                    winRate >= 60
                      ? 'success'
                      : winRate >= 40
                        ? 'warning'
                        : 'danger'
                  }
                >
                  {winRate}% Siegquote
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-emerald-50 px-3 py-2">
                  <p className="text-lg font-bold text-emerald-700">
                    {team.wins}
                  </p>
                  <p className="text-xs font-medium text-emerald-600">Siege</p>
                </div>
                <div className="rounded-lg bg-amber-50 px-3 py-2">
                  <p className="text-lg font-bold text-amber-700">
                    {team.draws}
                  </p>
                  <p className="text-xs font-medium text-amber-600">
                    Unentschieden
                  </p>
                </div>
                <div className="rounded-lg bg-red-50 px-3 py-2">
                  <p className="text-lg font-bold text-red-700">
                    {team.losses}
                  </p>
                  <p className="text-xs font-medium text-red-600">
                    Niederlagen
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-between border-t border-gray-100 pt-3 text-sm">
                <span className="text-gray-500">
                  Tore:{' '}
                  <span className="font-semibold text-gray-900">
                    {team.goalsFor}
                  </span>
                </span>
                <span className="text-gray-500">
                  Gegentore:{' '}
                  <span className="font-semibold text-gray-900">
                    {team.goalsAgainst}
                  </span>
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Goals per team bar chart */}
      {goalsPerTeamData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              Tore pro Mannschaft
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={goalsPerTeamData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar
                    dataKey="goalsFor"
                    name="Tore"
                    fill={COLORS.emerald}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="goalsAgainst"
                    name="Gegentore"
                    fill={COLORS.red}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Player Stats Tab (empty state -- needs match_events data)
// ---------------------------------------------------------------------------

function PlayerStatsTab({ playersCount }: { playersCount: number }) {
  if (playersCount === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Keine Spieler vorhanden"
        description="Erstelle zuerst Spieler, um Spielerstatistiken zu sehen."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Scorers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-600" />
            Torschuetzenliste
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Target}
            title="Noch keine Daten"
            description="Sobald Spielereignisse (Tore) in den Spielen eingetragen werden, erscheint hier die Torschuetzenliste."
          />
        </CardContent>
      </Card>

      {/* Top Assists */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Vorlagengeber
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={TrendingUp}
            title="Noch keine Daten"
            description="Sobald Spielereignisse (Vorlagen) in den Spielen eingetragen werden, erscheint hier die Vorlagenliste."
          />
        </CardContent>
      </Card>
    </div>
  );
}
