'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { useClubStore } from '@/stores/club-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, formatTime } from '@/lib/utils';
import { isDemoMode } from '@/lib/demo-data';
import { trainingsService } from '@/lib/firebase/services';
import { where } from 'firebase/firestore';
import { CreateTrainingModal } from '@/components/trainings/create-training-modal';
import { EditTrainingModal } from '@/components/trainings/edit-training-modal';
import { DeleteTrainingDialog } from '@/components/trainings/delete-training-dialog';
import { Dumbbell, Plus, MapPin, Clock, Users, Pencil, Trash2, Loader2 } from 'lucide-react';
import type { Training } from '@/types/database';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const toISODate = (d: Date) => d.toISOString().split('T')[0];

function getDateGroup(dateStr: string): 'today' | 'this_week' | 'past' {
  const today = toISODate(new Date());
  if (dateStr === today) return 'today';

  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays > 0 && diffDays <= 7) return 'this_week';
  return 'past';
}

function getGroupLabel(group: 'today' | 'this_week' | 'past'): string {
  switch (group) {
    case 'today':
      return 'Heute';
    case 'this_week':
      return 'Diese Woche';
    case 'past':
      return 'Vergangen';
  }
}

function isWithinDateRange(dateStr: string, range: string): boolean {
  if (range === 'all') return true;

  const d = new Date(dateStr);
  const now = new Date();

  if (range === 'week') {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return d >= weekStart && d <= weekEnd;
  }

  if (range === 'month') {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }

  return true;
}

// ---------------------------------------------------------------------------
// Date Range Options
// ---------------------------------------------------------------------------

const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'Alle' },
  { value: 'week', label: 'Diese Woche' },
  { value: 'month', label: 'Dieser Monat' },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TrainingsPage() {
  const { isCoachOrAbove } = useAuthStore();
  const { teams } = useClubStore();

  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teamFilter, setTeamFilter] = useState('');
  const [dateRange, setDateRange] = useState('all');

  // Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTraining, setEditTraining] = useState<Training | null>(null);
  const [deleteTraining, setDeleteTraining] = useState<{ id: string; focus: string | null } | null>(null);

  const canManage = isCoachOrAbove();

  const teamOptions = [
    { value: '', label: 'Alle Mannschaften' },
    ...teams.map((t) => ({ value: t.id, label: `${t.name} (${t.category})` })),
  ];

  // Subscribe to trainings from Firestore
  useEffect(() => {
    if (isDemoMode()) {
      setIsLoading(false);
      return;
    }

    const teamIds = teams.map((t) => t.id);
    if (teamIds.length === 0) {
      setIsLoading(false);
      return;
    }

    // Subscribe to trainings for all teams in this club
    const chunks = teamIds.slice(0, 30); // Firestore 'in' limit
    const unsub = trainingsService.subscribeCustom(
      (data) => {
        setTrainings(data);
        setIsLoading(false);
      },
      [where('teamId', 'in', chunks)]
    );

    return () => unsub();
  }, [teams]);

  // Build display list
  const displayTrainings = useMemo(() => {
    return trainings
      .map((t) => {
        const team = teams.find((tm) => tm.id === t.teamId);
        return {
          id: t.id,
          teamId: t.teamId,
          teamName: team?.name ?? '-',
          teamCategory: team?.category ?? '',
          date: t.date,
          startTime: t.startTime,
          endTime: t.endTime,
          location: t.location,
          focus: t.focus,
          notes: t.notes,
          _raw: t,
        };
      })
      .filter((t) => {
        if (teamFilter && t.teamId !== teamFilter) return false;
        if (!isWithinDateRange(t.date, dateRange)) return false;
        return true;
      })
      .sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return b.startTime.localeCompare(a.startTime);
      });
  }, [trainings, teams, teamFilter, dateRange]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<'today' | 'this_week' | 'past', typeof displayTrainings> = {
      today: [],
      this_week: [],
      past: [],
    };
    displayTrainings.forEach((t) => {
      const group = getDateGroup(t.date);
      groups[group].push(t);
    });
    return groups;
  }, [displayTrainings]);

  const groupOrder: ('today' | 'this_week' | 'past')[] = ['today', 'this_week', 'past'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trainingseinheiten</h1>
          <p className="mt-1 text-sm text-gray-500">
            Alle Trainingseinheiten deines Vereins verwalten.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Training erstellen
          </Button>
        )}
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="w-full sm:w-56">
              <Select
                label="Mannschaft"
                options={teamOptions}
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                label="Zeitraum"
                options={DATE_RANGE_OPTIONS}
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training list */}
      {displayTrainings.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Keine Trainingseinheiten gefunden"
          description="Passe die Filter an oder erstelle ein neues Training."
          actionLabel={canManage ? 'Training erstellen' : undefined}
          onAction={canManage ? () => setIsCreateOpen(true) : undefined}
        />
      ) : (
        groupOrder.map((group) => {
          const items = grouped[group];
          if (items.length === 0) return null;

          return (
            <div key={group} className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                {getGroupLabel(group)}
              </h2>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {items.map((training) => (
                  <div key={training.id} className="group relative">
                    <Link href={`/trainings/${training.id}`}>
                      <Card className="cursor-pointer transition-shadow hover:shadow-md">
                        <CardContent className="py-5">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1 space-y-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Dumbbell className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                                  <h3 className="truncate text-base font-semibold text-gray-900 group-hover:text-emerald-600">
                                    {training.focus || 'Training'}
                                  </h3>
                                </div>
                                <p className="mt-1 text-sm font-medium text-emerald-600">
                                  {training.teamName}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {formatDate(training.date)} &middot; {formatTime(training.startTime)}
                                  {training.endTime && ` - ${formatTime(training.endTime)}`}
                                </span>
                                {training.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {training.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>

                    {/* Edit / Delete overlay */}
                    {canManage && (
                      <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setEditTraining(training._raw);
                          }}
                          className="rounded-md bg-white p-1.5 text-gray-400 shadow-sm ring-1 ring-gray-200 hover:text-emerald-600"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setDeleteTraining({ id: training.id, focus: training.focus });
                          }}
                          className="rounded-md bg-white p-1.5 text-gray-400 shadow-sm ring-1 ring-gray-200 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* Modals */}
      <CreateTrainingModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      <EditTrainingModal
        isOpen={!!editTraining}
        onClose={() => setEditTraining(null)}
        training={editTraining}
      />
      <DeleteTrainingDialog
        isOpen={!!deleteTraining}
        onClose={() => setDeleteTraining(null)}
        training={deleteTraining}
      />
    </div>
  );
}
