'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Subscribe to realtime changes on a Supabase table.
 * Calls onUpdate whenever an INSERT, UPDATE, or DELETE occurs.
 */
export function useRealtime(
  table: string,
  onUpdate: () => void,
  filter?: string
) {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          ...(filter ? { filter } : {}),
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, onUpdate]);
}
