'use client';

import { useAuthStore } from '@/stores/auth-store';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Dumbbell,
  Trophy,
  TrendingUp,
  Calendar,
  MapPin,
  Clock,
  Megaphone,
} from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Mock / placeholder data
// These will be replaced with real Supabase queries once the backend is wired.
// ---------------------------------------------------------------------------

// TODO: Fetch total player count from supabase
// const { count } = await supabase
//   .from('players')
//   .select('*', { count: 'exact', head: true })
//   .in('team_id', teamIds);
const MOCK_TOTAL_PLAYERS = 42;

// TODO: Fetch upcoming trainings count
// const { count } = await supabase
//   .from('trainings')
//   .select('*', { count: 'exact', head: true })
//   .gte('date', today)
//   .in('team_id', teamIds);
const MOCK_UPCOMING_TRAININGS = 8;

// TODO: Fetch upcoming matches count
// const { count } = await supabase
//   .from('matches')
//   .select('*', { count: 'exact', head: true })
//   .gte('date', today)
//   .in('team_id', teamIds);
const MOCK_UPCOMING_MATCHES = 3;

// TODO: Calculate attendance rate from training_attendance table
// const { data: attendance } = await supabase
//   .from('training_attendance')
//   .select('status')
//   .in('training_id', recentTrainingIds);
// const rate = (present / total) * 100;
const MOCK_ATTENDANCE_RATE = 87;

// TODO: Fetch next training session
// const { data: nextTraining } = await supabase
//   .from('trainings')
//   .select('*, team:teams(name)')
//   .gte('date', today)
//   .order('date', { ascending: true })
//   .order('start_time', { ascending: true })
//   .limit(1)
//   .single();
const MOCK_NEXT_TRAINING = {
  id: '1',
  date: '2026-03-04',
  start_time: '17:00',
  end_time: '18:30',
  location: 'Training Ground A',
  focus: 'Tactical positioning & pressing',
  team: { name: 'U12' },
};

// TODO: Fetch upcoming matches
// const { data: upcomingMatches } = await supabase
//   .from('matches')
//   .select('*, team:teams(name)')
//   .gte('date', today)
//   .order('date', { ascending: true })
//   .limit(3);
const MOCK_UPCOMING_MATCHES_LIST = [
  {
    id: '1',
    date: '2026-03-07',
    time: '15:00',
    opponent: 'FC United',
    home_or_away: 'home' as const,
    competition: 'League',
    team: { name: 'U12' },
  },
  {
    id: '2',
    date: '2026-03-14',
    time: '10:30',
    opponent: 'SC Eagles',
    home_or_away: 'away' as const,
    competition: 'Cup',
    team: { name: 'U14' },
  },
  {
    id: '3',
    date: '2026-03-21',
    time: '14:00',
    opponent: 'Athletic Stars',
    home_or_away: 'home' as const,
    competition: 'League',
    team: { name: 'U12' },
  },
];

// TODO: Fetch recent announcements
// const { data: announcements } = await supabase
//   .from('announcements')
//   .select('*, author:profiles(full_name)')
//   .eq('club_id', clubId)
//   .order('created_at', { ascending: false })
//   .limit(4);
const MOCK_ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'Training schedule updated for March',
    announcement_type: 'general' as const,
    created_at: '2026-03-03T10:00:00Z',
    author: { full_name: 'Coach Martinez' },
  },
  {
    id: '2',
    title: 'Match day kits available for pickup',
    announcement_type: 'general' as const,
    created_at: '2026-03-02T14:30:00Z',
    author: { full_name: 'Club Admin' },
  },
  {
    id: '3',
    title: 'Reminder: U12 training tomorrow at 5 PM',
    announcement_type: 'training_reminder' as const,
    created_at: '2026-03-01T09:00:00Z',
    author: { full_name: 'Coach Martinez' },
  },
  {
    id: '4',
    title: 'Saturday match vs FC United - please confirm availability',
    announcement_type: 'match_reminder' as const,
    created_at: '2026-02-28T16:00:00Z',
    author: { full_name: 'Coach Martinez' },
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAnnouncementBadgeVariant(type: string) {
  switch (type) {
    case 'training_reminder':
      return 'info' as const;
    case 'match_reminder':
      return 'warning' as const;
    case 'parent_message':
      return 'success' as const;
    default:
      return 'default' as const;
  }
}

function formatAnnouncementType(type: string) {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { profile } = useAuthStore();

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Coach';

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {firstName}. Here is what is happening today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Players"
          value={MOCK_TOTAL_PLAYERS}
          change="+3 this month"
          changeType="positive"
          icon={Users}
          iconColor="text-blue-600 bg-blue-100"
        />
        <StatCard
          title="Upcoming Trainings"
          value={MOCK_UPCOMING_TRAININGS}
          change="Next 7 days"
          changeType="neutral"
          icon={Dumbbell}
          iconColor="text-emerald-600 bg-emerald-100"
        />
        <StatCard
          title="Upcoming Matches"
          value={MOCK_UPCOMING_MATCHES}
          change="Next 30 days"
          changeType="neutral"
          icon={Trophy}
          iconColor="text-amber-600 bg-amber-100"
        />
        <StatCard
          title="Attendance Rate"
          value={`${MOCK_ATTENDANCE_RATE}%`}
          change="+2% vs last month"
          changeType="positive"
          icon={TrendingUp}
          iconColor="text-purple-600 bg-purple-100"
        />
      </div>

      {/* Two-column layout: training + matches */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's Training */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-emerald-600" />
              Today&apos;s Training
            </CardTitle>
          </CardHeader>
          <CardContent>
            {MOCK_NEXT_TRAINING ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {MOCK_NEXT_TRAINING.focus}
                    </p>
                    <Badge variant="info" className="mt-1">
                      {MOCK_NEXT_TRAINING.team.name}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>
                      {formatTime(MOCK_NEXT_TRAINING.start_time)} &ndash;{' '}
                      {formatTime(MOCK_NEXT_TRAINING.end_time)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{MOCK_NEXT_TRAINING.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{formatDate(MOCK_NEXT_TRAINING.date)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <Dumbbell className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">
                  No training sessions scheduled for today.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Matches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-600" />
              Upcoming Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {MOCK_UPCOMING_MATCHES_LIST.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {MOCK_UPCOMING_MATCHES_LIST.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">
                        vs {match.opponent}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatDate(match.date)}</span>
                        <span>&middot;</span>
                        <span>{formatTime(match.time)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="info">{match.team.name}</Badge>
                      <Badge
                        variant={
                          match.home_or_away === 'home' ? 'success' : 'warning'
                        }
                      >
                        {match.home_or_away === 'home' ? 'Home' : 'Away'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Trophy className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">
                  No upcoming matches scheduled.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity / Announcements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-gray-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {MOCK_ANNOUNCEMENTS.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {MOCK_ANNOUNCEMENTS.map((announcement) => (
                <div
                  key={announcement.id}
                  className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">
                      {announcement.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {announcement.author.full_name} &middot;{' '}
                      {formatDate(announcement.created_at)}
                    </p>
                  </div>
                  <Badge
                    variant={getAnnouncementBadgeVariant(
                      announcement.announcement_type
                    )}
                  >
                    {formatAnnouncementType(announcement.announcement_type)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Megaphone className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">
                No recent announcements.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
