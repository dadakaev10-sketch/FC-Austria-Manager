'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { formatDate, formatTime } from '@/lib/utils';
import { Dumbbell, Plus, MapPin, Clock, Users } from 'lucide-react';

// ---------------------------------------------------------------------------
// Mock data -- will be replaced with real Supabase data
// ---------------------------------------------------------------------------

const today = new Date();
const toISODate = (d: Date) => d.toISOString().split('T')[0];
const addDays = (d: Date, n: number) => {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
};

const MOCK_TRAININGS = [
  {
    id: 't1',
    team_id: '2',
    team_name: 'U12 Development',
    date: toISODate(today),
    start_time: '16:00:00',
    end_time: '17:30:00',
    location: 'Main Pitch A',
    focus: 'Passing & Movement',
    attendance_present: 14,
    attendance_total: 16,
  },
  {
    id: 't2',
    team_id: '3',
    team_name: 'U14 Academy',
    date: toISODate(today),
    start_time: '17:30:00',
    end_time: '19:00:00',
    location: 'Main Pitch A',
    focus: 'Tactical Positioning',
    attendance_present: 16,
    attendance_total: 18,
  },
  {
    id: 't3',
    team_id: '1',
    team_name: 'U10 Youth',
    date: toISODate(addDays(today, 1)),
    start_time: '15:00:00',
    end_time: '16:00:00',
    location: 'Training Ground B',
    focus: 'Ball Control Basics',
    attendance_present: 12,
    attendance_total: 14,
  },
  {
    id: 't4',
    team_id: '5',
    team_name: 'First Team',
    date: toISODate(addDays(today, 2)),
    start_time: '09:00:00',
    end_time: '11:00:00',
    location: 'Stadium Pitch',
    focus: 'Set Pieces',
    attendance_present: 20,
    attendance_total: 22,
  },
  {
    id: 't5',
    team_id: '4',
    team_name: 'U16 Junior',
    date: toISODate(addDays(today, 3)),
    start_time: '16:00:00',
    end_time: '17:30:00',
    location: 'Training Ground B',
    focus: 'Pressing & Counter-Attack',
    attendance_present: 18,
    attendance_total: 20,
  },
  {
    id: 't6',
    team_id: '2',
    team_name: 'U12 Development',
    date: toISODate(addDays(today, -2)),
    start_time: '16:00:00',
    end_time: '17:30:00',
    location: 'Main Pitch A',
    focus: 'Shooting Drills',
    attendance_present: 15,
    attendance_total: 16,
  },
  {
    id: 't7',
    team_id: '3',
    team_name: 'U14 Academy',
    date: toISODate(addDays(today, -5)),
    start_time: '17:30:00',
    end_time: '19:00:00',
    location: 'Main Pitch A',
    focus: 'Defensive Shape',
    attendance_present: 17,
    attendance_total: 18,
  },
  {
    id: 't8',
    team_id: '5',
    team_name: 'First Team',
    date: toISODate(addDays(today, -7)),
    start_time: '09:00:00',
    end_time: '11:00:00',
    location: 'Stadium Pitch',
    focus: 'Fitness & Conditioning',
    attendance_present: 19,
    attendance_total: 22,
  },
];

// ---------------------------------------------------------------------------
// Filter options
// ---------------------------------------------------------------------------

const TEAM_OPTIONS = [
  { value: '', label: 'All Teams' },
  { value: 'U10 Youth', label: 'U10 Youth' },
  { value: 'U12 Development', label: 'U12 Development' },
  { value: 'U14 Academy', label: 'U14 Academy' },
  { value: 'U16 Junior', label: 'U16 Junior' },
  { value: 'First Team', label: 'First Team' },
];

const DATE_RANGE_OPTIONS = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDateGroup(dateStr: string): 'today' | 'this_week' | 'past' {
  const d = new Date(dateStr);
  const now = new Date();

  const todayStr = toISODate(now);
  if (dateStr === todayStr) return 'today';

  // Check if date is within the current week (next 7 days) or upcoming
  const diffMs = d.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays > 0 && diffDays <= 7) return 'this_week';

  return 'past';
}

function isWithinDateRange(dateStr: string, range: string): boolean {
  if (range === 'all') return true;

  const d = new Date(dateStr);
  const now = new Date();

  if (range === 'week') {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return d >= weekStart && d <= weekEnd;
  }

  if (range === 'month') {
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }

  return true;
}

function getGroupLabel(group: 'today' | 'this_week' | 'past'): string {
  switch (group) {
    case 'today':
      return 'Today';
    case 'this_week':
      return 'This Week';
    case 'past':
      return 'Past';
  }
}

function getAttendanceVariant(present: number, total: number) {
  const ratio = present / total;
  if (ratio >= 0.9) return 'success' as const;
  if (ratio >= 0.7) return 'warning' as const;
  return 'danger' as const;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TrainingsPage() {
  const { isCoachOrAbove } = useAuthStore();
  const [teamFilter, setTeamFilter] = useState('');
  const [dateRange, setDateRange] = useState('all');

  const canCreateTraining = isCoachOrAbove();

  const filteredTrainings = useMemo(() => {
    return MOCK_TRAININGS.filter((training) => {
      if (teamFilter && training.team_name !== teamFilter) return false;
      if (!isWithinDateRange(training.date, dateRange)) return false;
      return true;
    }).sort((a, b) => {
      // Sort by date descending, then by start_time descending
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.start_time.localeCompare(a.start_time);
    });
  }, [teamFilter, dateRange]);

  // Group trainings by date group
  const grouped = useMemo(() => {
    const groups: Record<'today' | 'this_week' | 'past', typeof filteredTrainings> = {
      today: [],
      this_week: [],
      past: [],
    };

    filteredTrainings.forEach((training) => {
      const group = getDateGroup(training.date);
      groups[group].push(training);
    });

    return groups;
  }, [filteredTrainings]);

  const groupOrder: ('today' | 'this_week' | 'past')[] = ['today', 'this_week', 'past'];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trainings</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage training sessions across all teams.
          </p>
        </div>
        {canCreateTraining && (
          <Link href="/trainings/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Training
            </Button>
          </Link>
        )}
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="w-full sm:w-48">
              <Select
                label="Team"
                options={TEAM_OPTIONS}
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                label="Date Range"
                options={DATE_RANGE_OPTIONS}
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training sessions grouped by date */}
      {filteredTrainings.length === 0 ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Dumbbell className="mb-3 h-8 w-8 text-gray-300" />
              <p className="text-sm font-medium text-gray-900">
                No training sessions found
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters or create a new training session.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        groupOrder.map((group) => {
          const trainings = grouped[group];
          if (trainings.length === 0) return null;

          return (
            <div key={group} className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                {getGroupLabel(group)}
              </h2>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {trainings.map((training) => (
                  <Link key={training.id} href={`/trainings/${training.id}`}>
                    <Card className="group cursor-pointer transition-shadow hover:shadow-md">
                      <CardContent className="py-5">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1 space-y-3">
                            {/* Focus area & team */}
                            <div>
                              <div className="flex items-center gap-2">
                                <Dumbbell className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                                <h3 className="truncate text-base font-semibold text-gray-900 group-hover:text-emerald-600">
                                  {training.focus}
                                </h3>
                              </div>
                              <p className="mt-1 text-sm font-medium text-emerald-600">
                                {training.team_name}
                              </p>
                            </div>

                            {/* Details row */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {formatDate(training.date)} &middot;{' '}
                                {formatTime(training.start_time)} -{' '}
                                {formatTime(training.end_time)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {training.location}
                              </span>
                            </div>
                          </div>

                          {/* Attendance badge */}
                          <div className="ml-4 flex flex-shrink-0 flex-col items-end gap-1">
                            <Badge
                              variant={getAttendanceVariant(
                                training.attendance_present,
                                training.attendance_total
                              )}
                            >
                              <Users className="mr-1 h-3 w-3" />
                              {training.attendance_present}/
                              {training.attendance_total} present
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
