'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Target, Users } from 'lucide-react';
import type { PieLabelRenderProps } from 'recharts';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
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

const PIE_COLORS = [
  COLORS.emerald,
  COLORS.blue,
  COLORS.amber,
  COLORS.red,
  COLORS.purple,
];

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

const TABS = [
  { key: 'player-stats', label: 'Player Stats', icon: Users },
  { key: 'team-stats', label: 'Team Stats', icon: BarChart3 },
  { key: 'training-analysis', label: 'Training Analysis', icon: Target },
] as const;

type TabKey = (typeof TABS)[number]['key'];

// ---------------------------------------------------------------------------
// Mock data - Player Stats
// ---------------------------------------------------------------------------

const MOCK_TOP_SCORERS = [
  { rank: 1, name: 'Mateo Rodriguez', team: 'First Team', goals: 14 },
  { rank: 2, name: 'Alexander Wilson', team: 'U16 Junior', goals: 12 },
  { rank: 3, name: 'Julian Torres', team: 'First Team', goals: 11 },
  { rank: 4, name: 'Sebastian Lee', team: 'U16 Junior', goals: 9 },
  { rank: 5, name: 'Hugo Martinez', team: 'U10 Youth', goals: 8 },
  { rank: 6, name: 'Noah Garcia', team: 'U14 Academy', goals: 7 },
  { rank: 7, name: 'Liam Nguyen', team: 'U14 Academy', goals: 6 },
  { rank: 8, name: 'Oliver Smith', team: 'U12 Development', goals: 5 },
  { rank: 9, name: 'Daniel Kim', team: 'U12 Development', goals: 4 },
  { rank: 10, name: 'Ethan Brown', team: 'U10 Youth', goals: 3 },
];

const MOCK_TOP_ASSISTS = [
  { rank: 1, name: 'Julian Torres', team: 'First Team', assists: 11 },
  { rank: 2, name: 'Sebastian Lee', team: 'U16 Junior', assists: 9 },
  { rank: 3, name: 'Liam Nguyen', team: 'U14 Academy', assists: 8 },
  { rank: 4, name: 'Mateo Rodriguez', team: 'First Team', assists: 7 },
  { rank: 5, name: 'Hugo Martinez', team: 'U10 Youth', assists: 6 },
  { rank: 6, name: 'Alexander Wilson', team: 'U16 Junior', assists: 6 },
  { rank: 7, name: 'Oliver Smith', team: 'U12 Development', assists: 5 },
  { rank: 8, name: 'Daniel Kim', team: 'U12 Development', assists: 4 },
  { rank: 9, name: 'Noah Garcia', team: 'U14 Academy', assists: 3 },
  { rank: 10, name: 'Ethan Brown', team: 'U10 Youth', assists: 2 },
];

const MOCK_ATTENDANCE_RANKING = [
  { rank: 1, name: 'Oliver Smith', team: 'U12 Development', attendance: 98 },
  { rank: 2, name: 'Daniel Kim', team: 'U12 Development', attendance: 97 },
  { rank: 3, name: 'Mateo Rodriguez', team: 'First Team', attendance: 96 },
  { rank: 4, name: 'Julian Torres', team: 'First Team', attendance: 95 },
  { rank: 5, name: 'Noah Garcia', team: 'U14 Academy', attendance: 93 },
  { rank: 6, name: 'Sebastian Lee', team: 'U16 Junior', attendance: 92 },
  { rank: 7, name: 'Hugo Martinez', team: 'U10 Youth', attendance: 91 },
  { rank: 8, name: 'Liam Nguyen', team: 'U14 Academy', attendance: 90 },
  { rank: 9, name: 'Alexander Wilson', team: 'U16 Junior', attendance: 88 },
  { rank: 10, name: 'Ethan Brown', team: 'U10 Youth', attendance: 86 },
];

// ---------------------------------------------------------------------------
// Mock data - Team Stats
// ---------------------------------------------------------------------------

const MOCK_TEAM_STATS = [
  {
    name: 'First Team',
    wins: 12,
    draws: 4,
    losses: 2,
    goalsFor: 38,
    goalsAgainst: 14,
  },
  {
    name: 'U16 Junior',
    wins: 10,
    draws: 3,
    losses: 5,
    goalsFor: 31,
    goalsAgainst: 20,
  },
  {
    name: 'U14 Academy',
    wins: 8,
    draws: 5,
    losses: 3,
    goalsFor: 26,
    goalsAgainst: 15,
  },
  {
    name: 'U12 Development',
    wins: 7,
    draws: 4,
    losses: 4,
    goalsFor: 22,
    goalsAgainst: 18,
  },
  {
    name: 'U10 Youth',
    wins: 6,
    draws: 6,
    losses: 3,
    goalsFor: 19,
    goalsAgainst: 12,
  },
];

const MOCK_GOALS_PER_TEAM = MOCK_TEAM_STATS.map((t) => ({
  name: t.name,
  goalsFor: t.goalsFor,
  goalsAgainst: t.goalsAgainst,
}));

// ---------------------------------------------------------------------------
// Mock data - Training Analysis
// ---------------------------------------------------------------------------

const MOCK_ATTENDANCE_TREND = [
  { week: 'Week 1', attendance: 82 },
  { week: 'Week 2', attendance: 85 },
  { week: 'Week 3', attendance: 79 },
  { week: 'Week 4', attendance: 88 },
  { week: 'Week 5', attendance: 91 },
  { week: 'Week 6', attendance: 87 },
  { week: 'Week 7', attendance: 93 },
  { week: 'Week 8', attendance: 90 },
];

const MOCK_FOCUS_DISTRIBUTION = [
  { name: 'Tactical', count: 12 },
  { name: 'Technical', count: 10 },
  { name: 'Physical', count: 8 },
  { name: 'Set Pieces', count: 5 },
  { name: 'Match Prep', count: 6 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRankBadgeVariant(rank: number) {
  if (rank === 1) return 'success' as const;
  if (rank === 2) return 'info' as const;
  if (rank === 3) return 'warning' as const;
  return 'default' as const;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('player-stats');

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Performance insights across players, teams, and training sessions.
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
      {activeTab === 'player-stats' && <PlayerStatsTab />}
      {activeTab === 'team-stats' && <TeamStatsTab />}
      {activeTab === 'training-analysis' && <TrainingAnalysisTab />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Player Stats Tab
// ---------------------------------------------------------------------------

function PlayerStatsTab() {
  return (
    <div className="space-y-6">
      {/* Summary stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Goals</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {MOCK_TOP_SCORERS.reduce((sum, p) => sum + p.goals, 0)}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-100 p-3 text-emerald-600">
              <Target className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Assists</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {MOCK_TOP_ASSISTS.reduce((sum, p) => sum + p.assists, 0)}
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
              <p className="text-sm font-medium text-gray-500">
                Avg Attendance
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {Math.round(
                  MOCK_ATTENDANCE_RANKING.reduce(
                    (sum, p) => sum + p.attendance,
                    0
                  ) / MOCK_ATTENDANCE_RANKING.length
                )}
                %
              </p>
            </div>
            <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Top Scorers & Top Assists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Scorers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-600" />
              Top Scorers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-3">Rank</th>
                    <th className="px-6 py-3">Player</th>
                    <th className="px-6 py-3">Team</th>
                    <th className="px-6 py-3 text-right">Goals</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {MOCK_TOP_SCORERS.map((player) => (
                    <tr
                      key={player.rank}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="px-6 py-3">
                        <Badge variant={getRankBadgeVariant(player.rank)}>
                          #{player.rank}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-900">
                        {player.name}
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {player.team}
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-gray-900">
                        {player.goals}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Top Assists */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Top Assists
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-3">Rank</th>
                    <th className="px-6 py-3">Player</th>
                    <th className="px-6 py-3">Team</th>
                    <th className="px-6 py-3 text-right">Assists</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {MOCK_TOP_ASSISTS.map((player) => (
                    <tr
                      key={player.rank}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="px-6 py-3">
                        <Badge variant={getRankBadgeVariant(player.rank)}>
                          #{player.rank}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-900">
                        {player.name}
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {player.team}
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-gray-900">
                        {player.assists}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Player Attendance Ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Player Attendance Ranking
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Rank</th>
                  <th className="px-6 py-3">Player</th>
                  <th className="px-6 py-3">Team</th>
                  <th className="px-6 py-3 text-right">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_ATTENDANCE_RANKING.map((player) => (
                  <tr
                    key={player.rank}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-3">
                      <Badge variant={getRankBadgeVariant(player.rank)}>
                        #{player.rank}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {player.name}
                    </td>
                    <td className="px-6 py-3 text-gray-600">{player.team}</td>
                    <td className="px-6 py-3 text-right">
                      <span
                        className={`font-semibold ${
                          player.attendance >= 95
                            ? 'text-emerald-600'
                            : player.attendance >= 90
                              ? 'text-blue-600'
                              : player.attendance >= 85
                                ? 'text-amber-600'
                                : 'text-red-600'
                        }`}
                      >
                        {player.attendance}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Team Stats Tab
// ---------------------------------------------------------------------------

function TeamStatsTab() {
  return (
    <div className="space-y-6">
      {/* Team comparison cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_TEAM_STATS.map((team) => {
          const totalMatches = team.wins + team.draws + team.losses;
          const winRate =
            totalMatches > 0
              ? Math.round((team.wins / totalMatches) * 100)
              : 0;
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
                  {winRate}% win rate
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-emerald-50 px-3 py-2">
                  <p className="text-lg font-bold text-emerald-700">
                    {team.wins}
                  </p>
                  <p className="text-xs font-medium text-emerald-600">Wins</p>
                </div>
                <div className="rounded-lg bg-amber-50 px-3 py-2">
                  <p className="text-lg font-bold text-amber-700">
                    {team.draws}
                  </p>
                  <p className="text-xs font-medium text-amber-600">Draws</p>
                </div>
                <div className="rounded-lg bg-red-50 px-3 py-2">
                  <p className="text-lg font-bold text-red-700">
                    {team.losses}
                  </p>
                  <p className="text-xs font-medium text-red-600">Losses</p>
                </div>
              </div>
              <div className="mt-4 flex justify-between border-t border-gray-100 pt-3 text-sm">
                <span className="text-gray-500">
                  Goals For:{' '}
                  <span className="font-semibold text-gray-900">
                    {team.goalsFor}
                  </span>
                </span>
                <span className="text-gray-500">
                  Goals Against:{' '}
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
            Goals Per Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={MOCK_GOALS_PER_TEAM}
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
                  name="Goals For"
                  fill={COLORS.emerald}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="goalsAgainst"
                  name="Goals Against"
                  fill={COLORS.red}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Training Analysis Tab
// ---------------------------------------------------------------------------

function TrainingAnalysisTab() {
  return (
    <div className="space-y-6">
      {/* Attendance Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Attendance Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={MOCK_ATTENDANCE_TREND}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  domain={[70, 100]}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value) => [`${value}%`, 'Attendance']}
                />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke={COLORS.blue}
                  strokeWidth={2}
                  dot={{ r: 4, fill: COLORS.blue, strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: COLORS.blue }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Focus Area Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-600" />
              Focus Area Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_FOCUS_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="name"
                    label={(props: PieLabelRenderProps) => {
                      const name = String(props.name ?? '');
                      const percent = Number(props.percent ?? 0);
                      return `${name} ${(percent * 100).toFixed(0)}%`;
                    }}
                    labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                  >
                    {MOCK_FOCUS_DISTRIBUTION.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value) => [
                      `${value} sessions`,
                      'Count',
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Focus breakdown list */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Training Sessions by Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_FOCUS_DISTRIBUTION.map((focus, index) => {
                const total = MOCK_FOCUS_DISTRIBUTION.reduce(
                  (sum, f) => sum + f.count,
                  0
                );
                const percentage = Math.round((focus.count / total) * 100);
                return (
                  <div key={focus.name}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {focus.name}
                      </span>
                      <span className="text-gray-500">
                        {focus.count} sessions ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor:
                            PIE_COLORS[index % PIE_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
