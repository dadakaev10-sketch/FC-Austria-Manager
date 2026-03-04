'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { useClubStore } from '@/stores/club-store';
import {
  subscribeClubTrainings,
  subscribeClubMatches,
  subscribeClubCalendarEvents,
} from '@/lib/firebase/services';
import type { Training, Match, CalendarEvent } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Trophy,
  Calendar,
  MapPin,
  Clock,
  Loader2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Typen
// ---------------------------------------------------------------------------

interface CalendarEventItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string | null;
  location: string | null;
  eventType: 'training' | 'match' | 'event';
  teamName: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EVENT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  training: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  match: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  event: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
};

function getEventBadgeVariant(type: string) {
  switch (type) {
    case 'training':
      return 'success' as const;
    case 'match':
      return 'info' as const;
    case 'event':
      return 'warning' as const;
    default:
      return 'default' as const;
  }
}

function getEventIcon(type: string) {
  switch (type) {
    case 'training':
      return Dumbbell;
    case 'match':
      return Trophy;
    default:
      return Calendar;
  }
}

function getEventTypeLabel(type: string) {
  switch (type) {
    case 'training':
      return 'Training';
    case 'match':
      return 'Spiel';
    case 'event':
      return 'Veranstaltung';
    default:
      return type;
  }
}

const WEEKDAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CalendarPage() {
  const { currentClub, teams } = useClubStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'week'>('month');

  // Firestore state
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to Firestore collections
  useEffect(() => {
    if (!currentClub?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let trainingsLoaded = false;
    let matchesLoaded = false;
    let calendarEventsLoaded = false;

    function checkAllLoaded() {
      if (trainingsLoaded && matchesLoaded && calendarEventsLoaded) {
        setIsLoading(false);
      }
    }

    const unsubTrainings = subscribeClubTrainings(currentClub.id, (data) => {
      setTrainings(data);
      trainingsLoaded = true;
      checkAllLoaded();
    });

    const unsubMatches = subscribeClubMatches(currentClub.id, (data) => {
      setMatches(data);
      matchesLoaded = true;
      checkAllLoaded();
    });

    const unsubCalendarEvents = subscribeClubCalendarEvents(currentClub.id, (data) => {
      setCalendarEvents(data);
      calendarEventsLoaded = true;
      checkAllLoaded();
    });

    return () => {
      unsubTrainings();
      unsubMatches();
      unsubCalendarEvents();
    };
  }, [currentClub?.id]);

  // Merge all data sources into unified CalendarEventItem[]
  const mergedEvents = useMemo<CalendarEventItem[]>(() => {
    const items: CalendarEventItem[] = [];

    // Trainings
    trainings.forEach((t) => {
      const teamName = teams.find((tm) => tm.id === t.teamId)?.name || t.teamId;
      items.push({
        id: t.id,
        title: teamName + ' ' + t.focus,
        date: t.date,
        startTime: t.startTime,
        endTime: t.endTime,
        location: t.location,
        eventType: 'training',
        teamName,
      });
    });

    // Matches
    matches.forEach((m) => {
      const teamName = teams.find((tm) => tm.id === m.teamId)?.name || m.teamId;
      items.push({
        id: m.id,
        title: teamName + ' vs ' + m.opponent,
        date: m.date,
        startTime: m.time,
        endTime: null,
        location: m.location,
        eventType: 'match',
        teamName,
      });
    });

    // Calendar events
    calendarEvents.forEach((ce) => {
      items.push({
        id: ce.id,
        title: ce.title,
        date: ce.date,
        startTime: ce.startTime,
        endTime: ce.endTime,
        location: ce.location,
        eventType: ce.eventType,
        teamName: ce.teamId
          ? teams.find((tm) => tm.id === ce.teamId)?.name || 'Vereinsweit'
          : 'Vereinsweit',
      });
    });

    return items;
  }, [trainings, matches, calendarEvents, teams]);

  // ---- Kalenderraster-Tage erstellen ----
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentDate]);

  // ---- Wochenansicht-Tage erstellen ----
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  const displayDays = view === 'month' ? calendarDays : weekDays;

  // ---- Termine nach Datum gruppieren ----
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEventItem[]> = {};
    mergedEvents.forEach((event) => {
      if (!map[event.date]) map[event.date] = [];
      map[event.date].push(event);
    });
    return map;
  }, [mergedEvents]);

  // ---- Termine fuer ausgewaehlten Tag ----
  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, 'yyyy-MM-dd');
    return eventsByDate[key] || [];
  }, [selectedDate, eventsByDate]);

  // ---- Navigation ----
  function goToPrevious() {
    if (view === 'month') {
      setCurrentDate((prev) => subMonths(prev, 1));
    } else {
      setCurrentDate((prev) => {
        const d = new Date(prev);
        d.setDate(d.getDate() - 7);
        return d;
      });
    }
  }

  function goToNext() {
    if (view === 'month') {
      setCurrentDate((prev) => addMonths(prev, 1));
    } else {
      setCurrentDate((prev) => {
        const d = new Date(prev);
        d.setDate(d.getDate() + 7);
        return d;
      });
    }
  }

  function goToToday() {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  }

  // ---- Loading state ----
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kalender</h1>
        <p className="mt-1 text-sm text-gray-500">
          Trainings, Spiele und Veranstaltungen aller Mannschaften im Ueberblick.
        </p>
      </div>

      {/* Werkzeugleiste */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Heute
          </Button>
          <Button variant="outline" size="sm" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="ml-2 text-lg font-semibold text-gray-900">
            {view === 'month'
              ? format(currentDate, 'MMMM yyyy', { locale: de })
              : `${format(weekDays[0], 'dd. MMM', { locale: de })} - ${format(weekDays[6], 'dd. MMM yyyy', { locale: de })}`}
          </h2>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
          <button
            onClick={() => setView('month')}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              view === 'month'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            Monat
          </button>
          <button
            onClick={() => setView('week')}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              view === 'week'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            Woche
          </button>
        </div>
      </div>

      {/* Legende */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <span className="h-3 w-3 rounded-full bg-emerald-500" />
          Training
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <span className="h-3 w-3 rounded-full bg-blue-500" />
          Spiel
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <span className="h-3 w-3 rounded-full bg-amber-500" />
          Veranstaltung
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Kalenderraster */}
        <div className="xl:col-span-2">
          <Card>
            <CardContent className="p-4">
              {/* Wochentag-Header */}
              <div className="grid grid-cols-7 gap-px">
                {WEEKDAY_LABELS.map((day) => (
                  <div
                    key={day}
                    className="py-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Tageszellen */}
              <div className="grid grid-cols-7 gap-px rounded-lg border border-gray-200 bg-gray-200">
                {displayDays.map((day) => {
                  const dateKey = format(day, 'yyyy-MM-dd');
                  const dayEvents = eventsByDate[dateKey] || [];
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                  const isTodayDate = isToday(day);

                  return (
                    <button
                      key={dateKey}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        'flex min-h-[80px] flex-col items-start bg-white p-1.5 text-left transition-colors hover:bg-gray-50 sm:min-h-[100px] sm:p-2',
                        !isCurrentMonth && view === 'month' && 'bg-gray-50 text-gray-400',
                        isSelected && 'ring-2 ring-inset ring-emerald-500'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium sm:h-7 sm:w-7 sm:text-sm',
                          isTodayDate && 'bg-emerald-600 text-white',
                          !isTodayDate && isCurrentMonth && 'text-gray-900',
                          !isTodayDate && !isCurrentMonth && 'text-gray-400'
                        )}
                      >
                        {format(day, 'd')}
                      </span>

                      {/* Termin-Chips */}
                      <div className="mt-1 flex w-full flex-col gap-0.5">
                        {dayEvents.slice(0, view === 'week' ? 5 : 2).map((event) => {
                          const colors = EVENT_COLORS[event.eventType];
                          return (
                            <div
                              key={event.id}
                              className={cn(
                                'truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight sm:text-xs',
                                colors.bg,
                                colors.text
                              )}
                            >
                              {event.title}
                            </div>
                          );
                        })}
                        {dayEvents.length > (view === 'week' ? 5 : 2) && (
                          <span className="px-1 text-[10px] font-medium text-gray-500">
                            +{dayEvents.length - (view === 'week' ? 5 : 2)} weitere
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detail-Panel fuer ausgewaehlten Tag */}
        <div className="xl:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-5 w-5 text-emerald-600" />
                {selectedDate
                  ? format(selectedDate, 'EEEE, d. MMMM yyyy', { locale: de })
                  : 'Tag auswaehlen'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedDate ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarDays className="mb-3 h-8 w-8 text-gray-300" />
                  <p className="text-sm text-gray-500">
                    Klicke auf einen Tag im Kalender, um seine Termine zu sehen.
                  </p>
                </div>
              ) : selectedDayEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="mb-3 h-8 w-8 text-gray-300" />
                  <p className="text-sm font-medium text-gray-900">
                    Keine Termine geplant
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    An diesem Tag sind keine Trainings, Spiele oder Veranstaltungen geplant.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayEvents.map((event) => {
                    const Icon = getEventIcon(event.eventType);
                    const colors = EVENT_COLORS[event.eventType];

                    return (
                      <div
                        key={event.id}
                        className={cn(
                          'rounded-lg border p-3',
                          colors.bg,
                          'border-transparent'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
                              event.eventType === 'training' &&
                                'bg-emerald-100 text-emerald-600',
                              event.eventType === 'match' &&
                                'bg-blue-100 text-blue-600',
                              event.eventType === 'event' &&
                                'bg-amber-100 text-amber-600'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={cn('text-sm font-semibold', colors.text)}>
                              {event.title}
                            </p>
                            <div className="mt-1.5 space-y-1">
                              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <Clock className="h-3 w-3 flex-shrink-0" />
                                <span>
                                  {event.startTime}
                                  {event.endTime && ` - ${event.endTime}`}
                                </span>
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <Badge variant={getEventBadgeVariant(event.eventType)}>
                                {getEventTypeLabel(event.eventType)}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {event.teamName}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
