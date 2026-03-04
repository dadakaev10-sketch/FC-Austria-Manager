'use client';

import { Badge } from '@/components/ui/badge';
import type { MatchEvent } from '@/types/database';
import { Target, Star, Square, ArrowRightLeft } from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getEventIcon(eventType: MatchEvent['event_type'], details: string | null) {
  switch (eventType) {
    case 'goal':
      return <Target className="h-4 w-4 text-green-600" />;
    case 'assist':
      return <Star className="h-4 w-4 text-blue-600" />;
    case 'card': {
      const isRed = details === 'red' || details === 'yellow_red';
      return (
        <Square
          className={`h-4 w-4 ${isRed ? 'fill-red-500 text-red-500' : 'fill-yellow-400 text-yellow-400'}`}
        />
      );
    }
    case 'substitution':
      return <ArrowRightLeft className="h-4 w-4 text-gray-500" />;
    default:
      return null;
  }
}

function getEventLabel(eventType: MatchEvent['event_type']): string {
  switch (eventType) {
    case 'goal':
      return 'Goal';
    case 'assist':
      return 'Assist';
    case 'card':
      return 'Card';
    case 'substitution':
      return 'Substitution';
    default:
      return eventType;
  }
}

function getEventBadgeVariant(eventType: MatchEvent['event_type'], details: string | null) {
  switch (eventType) {
    case 'goal':
      return 'success' as const;
    case 'assist':
      return 'info' as const;
    case 'card':
      return details === 'red' || details === 'yellow_red'
        ? ('danger' as const)
        : ('warning' as const);
    case 'substitution':
      return 'default' as const;
    default:
      return 'default' as const;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface MatchEventItemProps {
  event: MatchEvent;
}

export function MatchEventItem({ event }: MatchEventItemProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-gray-50">
      {/* Minute badge */}
      <Badge variant="default" className="min-w-[48px] justify-center font-mono">
        {event.minute}&apos;
      </Badge>

      {/* Event icon */}
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
        {getEventIcon(event.event_type, event.details)}
      </div>

      {/* Event details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">
            {event.player?.name ?? 'Unknown Player'}
          </span>
          <Badge variant={getEventBadgeVariant(event.event_type, event.details)}>
            {getEventLabel(event.event_type)}
          </Badge>
        </div>
        {event.details && (
          <p className="mt-0.5 text-xs capitalize text-gray-500">{event.details}</p>
        )}
      </div>
    </div>
  );
}
