'use client';

import { useState, useMemo } from 'react';
import type { AttendanceStatus } from '@/types/database';
import { getAttendanceColor } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlayerEntry {
  id: string;
  name: string;
  jersey_number: number | null;
  photo_url: string | null;
}

interface AttendanceTrackerProps {
  trainingId: string;
  players: PlayerEntry[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'present', label: 'Present' },
  { value: 'late', label: 'Late' },
  { value: 'injured', label: 'Injured' },
  { value: 'absent', label: 'Absent' },
];

const STATUS_BADGE_VARIANT: Record<AttendanceStatus, 'success' | 'warning' | 'danger' | 'default'> = {
  present: 'success',
  late: 'warning',
  injured: 'danger',
  absent: 'default',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AttendanceTracker({ trainingId, players }: AttendanceTrackerProps) {
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(() => {
    // Initialise all players as "present" by default
    const initial: Record<string, AttendanceStatus> = {};
    players.forEach((p) => {
      initial[p.id] = 'present';
    });
    return initial;
  });

  function updateStatus(playerId: string, status: AttendanceStatus) {
    setAttendance((prev) => ({ ...prev, [playerId]: status }));
  }

  // Summary counts
  const summary = useMemo(() => {
    const counts: Record<AttendanceStatus, number> = {
      present: 0,
      late: 0,
      injured: 0,
      absent: 0,
    };
    Object.values(attendance).forEach((status) => {
      counts[status]++;
    });
    return counts;
  }, [attendance]);

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {players.map((player) => {
              const status = attendance[player.id];
              return (
                <tr
                  key={player.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  {/* Player info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={player.photo_url}
                        name={player.name}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">
                          {player.name}
                        </p>
                        {player.jersey_number != null && (
                          <p className="text-xs text-gray-500">
                            #{player.jersey_number}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Status selector */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${getAttendanceColor(status).split(' ')[0]}`}
                      />
                      <Select
                        options={STATUS_OPTIONS}
                        value={status}
                        onChange={(e) =>
                          updateStatus(player.id, e.target.value as AttendanceStatus)
                        }
                        className="w-32"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <span className="text-sm font-medium text-gray-700">Summary:</span>
        {(Object.keys(summary) as AttendanceStatus[]).map((status) => (
          <Badge key={status} variant={STATUS_BADGE_VARIANT[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}: {summary[status]}
          </Badge>
        ))}
        <span className="ml-auto text-sm text-gray-500">
          Total: {players.length}
        </span>
      </div>
    </div>
  );
}
