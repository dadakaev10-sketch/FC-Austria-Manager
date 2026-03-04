'use client';

import { useState, useMemo } from 'react';
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
  getDay,
} from 'date-fns';
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
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CalendarEventItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  start_time: string;
  end_time: string | null;
  location: string | null;
  event_type: 'training' | 'match' | 'event';
  team_name: string;
}

// ---------------------------------------------------------------------------
// Mock data -- 15 events spread across the current month
// ---------------------------------------------------------------------------

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth(); // 0-indexed

function makeDate(day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const MOCK_EVENTS: CalendarEventItem[] = [
  {
    id: 'e1',
    title: 'U12 Passing & Movement',
    date: makeDate(2),
    start_time: '16:00',
    end_time: '17:30',
    location: 'Main Pitch A',
    event_type: 'training',
    team_name: 'U12 Development',
  },
  {
    id: 'e2',
    title: 'U14 vs FC Adler',
    date: makeDate(4),
    start_time: '10:00',
    end_time: '12:00',
    location: 'Home Stadium',
    event_type: 'match',
    team_name: 'U14 Academy',
  },
  {
    id: 'e3',
    title: 'U10 Ball Control Basics',
    date: makeDate(5),
    start_time: '15:00',
    end_time: '16:00',
    location: 'Training Ground B',
    event_type: 'training',
    team_name: 'U10 Youth',
  },
  {
    id: 'e4',
    title: 'Club Board Meeting',
    date: makeDate(6),
    start_time: '19:00',
    end_time: '21:00',
    location: 'Club House',
    event_type: 'event',
    team_name: 'Club-wide',
  },
  {
    id: 'e5',
    title: 'U12 Tactical Positioning',
    date: makeDate(8),
    start_time: '16:00',
    end_time: '17:30',
    location: 'Main Pitch A',
    event_type: 'training',
    team_name: 'U12 Development',
  },
  {
    id: 'e6',
    title: 'First Team vs SV Stern',
    date: makeDate(10),
    start_time: '15:30',
    end_time: '17:30',
    location: 'Home Stadium',
    event_type: 'match',
    team_name: 'First Team',
  },
  {
    id: 'e7',
    title: 'U16 Pressing & Counter-Attack',
    date: makeDate(12),
    start_time: '16:00',
    end_time: '17:30',
    location: 'Training Ground B',
    event_type: 'training',
    team_name: 'U16 Junior',
  },
  {
    id: 'e8',
    title: 'Parent Information Evening',
    date: makeDate(13),
    start_time: '18:00',
    end_time: '20:00',
    location: 'Club House',
    event_type: 'event',
    team_name: 'Club-wide',
  },
  {
    id: 'e9',
    title: 'U14 Defensive Shape',
    date: makeDate(15),
    start_time: '17:30',
    end_time: '19:00',
    location: 'Main Pitch A',
    event_type: 'training',
    team_name: 'U14 Academy',
  },
  {
    id: 'e10',
    title: 'U12 vs SC Falken',
    date: makeDate(17),
    start_time: '10:00',
    end_time: '12:00',
    location: 'Falken Sportpark',
    event_type: 'match',
    team_name: 'U12 Development',
  },
  {
    id: 'e11',
    title: 'First Team Fitness & Conditioning',
    date: makeDate(19),
    start_time: '09:00',
    end_time: '11:00',
    location: 'Stadium Pitch',
    event_type: 'training',
    team_name: 'First Team',
  },
  {
    id: 'e12',
    title: 'U10 vs TSV Blitz',
    date: makeDate(21),
    start_time: '09:00',
    end_time: '11:00',
    location: 'Blitz Arena',
    event_type: 'match',
    team_name: 'U10 Youth',
  },
  {
    id: 'e13',
    title: 'Fundraiser Gala',
    date: makeDate(22),
    start_time: '19:00',
    end_time: '23:00',
    location: 'Grand Hall',
    event_type: 'event',
    team_name: 'Club-wide',
  },
  {
    id: 'e14',
    title: 'U16 Set Pieces',
    date: makeDate(25),
    start_time: '16:00',
    end_time: '17:30',
    location: 'Main Pitch A',
    event_type: 'training',
    team_name: 'U16 Junior',
  },
  {
    id: 'e15',
    title: 'First Team vs FC Adler',
    date: makeDate(28),
    start_time: '15:30',
    end_time: '17:30',
    location: 'Home Stadium',
    event_type: 'match',
    team_name: 'First Team',
  },
];

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

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'week'>('month');

  // ---- Build calendar grid days ----
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentDate]);

  // ---- Build week view days ----
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  const displayDays = view === 'month' ? calendarDays : weekDays;

  // ---- Events lookup by date string ----
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEventItem[]> = {};
    MOCK_EVENTS.forEach((event) => {
      if (!map[event.date]) map[event.date] = [];
      map[event.date].push(event);
    });
    return map;
  }, []);

  // ---- Selected day events ----
  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, 'yyyy-MM-dd');
    return eventsByDate[key] || [];
  }, [selectedDate, eventsByDate]);

  // ---- Navigation handlers ----
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

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="mt-1 text-sm text-gray-500">
          View trainings, matches, and events across all teams.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="ml-2 text-lg font-semibold text-gray-900">
            {view === 'month'
              ? format(currentDate, 'MMMM yyyy')
              : `${format(weekDays[0], 'MMM d')} - ${format(weekDays[6], 'MMM d, yyyy')}`}
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
            Month
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
            Week
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <span className="h-3 w-3 rounded-full bg-emerald-500" />
          Training
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <span className="h-3 w-3 rounded-full bg-blue-500" />
          Match
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <span className="h-3 w-3 rounded-full bg-amber-500" />
          Event
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Calendar grid */}
        <div className="xl:col-span-2">
          <Card>
            <CardContent className="p-4">
              {/* Weekday headers */}
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

              {/* Day cells */}
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

                      {/* Event dots / chips */}
                      <div className="mt-1 flex w-full flex-col gap-0.5">
                        {dayEvents.slice(0, view === 'week' ? 5 : 2).map((event) => {
                          const colors = EVENT_COLORS[event.event_type];
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
                            +{dayEvents.length - (view === 'week' ? 5 : 2)} more
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

        {/* Selected day detail panel */}
        <div className="xl:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-5 w-5 text-emerald-600" />
                {selectedDate
                  ? format(selectedDate, 'EEEE, MMMM d, yyyy')
                  : 'Select a day'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedDate ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarDays className="mb-3 h-8 w-8 text-gray-300" />
                  <p className="text-sm text-gray-500">
                    Click on a day in the calendar to see its events.
                  </p>
                </div>
              ) : selectedDayEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="mb-3 h-8 w-8 text-gray-300" />
                  <p className="text-sm font-medium text-gray-900">
                    No events scheduled
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    This day has no trainings, matches, or events.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayEvents.map((event) => {
                    const Icon = getEventIcon(event.event_type);
                    const colors = EVENT_COLORS[event.event_type];

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
                              event.event_type === 'training' &&
                                'bg-emerald-100 text-emerald-600',
                              event.event_type === 'match' &&
                                'bg-blue-100 text-blue-600',
                              event.event_type === 'event' &&
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
                                  {event.start_time}
                                  {event.end_time && ` - ${event.end_time}`}
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
                              <Badge variant={getEventBadgeVariant(event.event_type)}>
                                {event.event_type.charAt(0).toUpperCase() +
                                  event.event_type.slice(1)}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {event.team_name}
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
