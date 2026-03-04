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
import { de } from 'date-fns/locale';
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
// Mock-Daten -- 15 Termine ueber den aktuellen Monat verteilt
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
    title: 'U15 Passspiel & Bewegung',
    date: makeDate(2),
    startTime: '16:00',
    endTime: '17:30',
    location: 'Trainingsplatz A',
    eventType: 'training',
    teamName: 'U15',
  },
  {
    id: 'e2',
    title: 'U17 vs FC Rapid Wien II',
    date: makeDate(4),
    startTime: '10:00',
    endTime: '12:00',
    location: 'Heimstadion',
    eventType: 'match',
    teamName: 'U17',
  },
  {
    id: 'e3',
    title: 'U12 Ballkontrolle Grundlagen',
    date: makeDate(5),
    startTime: '15:00',
    endTime: '16:00',
    location: 'Trainingsplatz B',
    eventType: 'training',
    teamName: 'U12',
  },
  {
    id: 'e4',
    title: 'Vereinsvorstandssitzung',
    date: makeDate(6),
    startTime: '19:00',
    endTime: '21:00',
    location: 'Vereinshaus',
    eventType: 'event',
    teamName: 'Vereinsweit',
  },
  {
    id: 'e5',
    title: 'U15 Taktische Positionierung',
    date: makeDate(8),
    startTime: '16:00',
    endTime: '17:30',
    location: 'Trainingsplatz A',
    eventType: 'training',
    teamName: 'U15',
  },
  {
    id: 'e6',
    title: 'Kampfmannschaft vs SV Mattersburg',
    date: makeDate(10),
    startTime: '15:30',
    endTime: '17:30',
    location: 'Heimstadion',
    eventType: 'match',
    teamName: 'Kampfmannschaft',
  },
  {
    id: 'e7',
    title: 'U19 Pressing & Konter',
    date: makeDate(12),
    startTime: '16:00',
    endTime: '17:30',
    location: 'Trainingsplatz B',
    eventType: 'training',
    teamName: 'U19',
  },
  {
    id: 'e8',
    title: 'Elterninformationsabend',
    date: makeDate(13),
    startTime: '18:00',
    endTime: '20:00',
    location: 'Vereinshaus',
    eventType: 'event',
    teamName: 'Vereinsweit',
  },
  {
    id: 'e9',
    title: 'U17 Defensivformation',
    date: makeDate(15),
    startTime: '17:30',
    endTime: '19:00',
    location: 'Trainingsplatz A',
    eventType: 'training',
    teamName: 'U17',
  },
  {
    id: 'e10',
    title: 'U15 vs SC Admira Jugend',
    date: makeDate(17),
    startTime: '10:00',
    endTime: '12:00',
    location: 'Admira Sportpark',
    eventType: 'match',
    teamName: 'U15',
  },
  {
    id: 'e11',
    title: 'Kampfmannschaft Fitness & Kondition',
    date: makeDate(19),
    startTime: '09:00',
    endTime: '11:00',
    location: 'Stadionplatz',
    eventType: 'training',
    teamName: 'Kampfmannschaft',
  },
  {
    id: 'e12',
    title: 'U12 vs SK Sturm Graz Jugend',
    date: makeDate(21),
    startTime: '09:00',
    endTime: '11:00',
    location: 'Sturm Arena',
    eventType: 'match',
    teamName: 'U12',
  },
  {
    id: 'e13',
    title: 'Benefiz-Gala',
    date: makeDate(22),
    startTime: '19:00',
    endTime: '23:00',
    location: 'Festsaal',
    eventType: 'event',
    teamName: 'Vereinsweit',
  },
  {
    id: 'e14',
    title: 'U19 Standards',
    date: makeDate(25),
    startTime: '16:00',
    endTime: '17:30',
    location: 'Trainingsplatz A',
    eventType: 'training',
    teamName: 'U19',
  },
  {
    id: 'e15',
    title: 'Kampfmannschaft vs FC Rapid Wien II',
    date: makeDate(28),
    startTime: '15:30',
    endTime: '17:30',
    location: 'Heimstadion',
    eventType: 'match',
    teamName: 'Kampfmannschaft',
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'week'>('month');

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
    MOCK_EVENTS.forEach((event) => {
      if (!map[event.date]) map[event.date] = [];
      map[event.date].push(event);
    });
    return map;
  }, []);

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
