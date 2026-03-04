'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { upsertPlayerStats } from '@/lib/supabase/players';
import type { PlayerStats } from '@/types/database';

interface EditPlayerStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: string;
  currentStats: PlayerStats | null;
  onSuccess?: () => void;
}

const STAT_LABELS: { key: keyof Omit<PlayerStats, 'id' | 'player_id' | 'updated_at'>; label: string }[] = [
  { key: 'speed', label: 'Schnelligkeit' },
  { key: 'stamina', label: 'Ausdauer' },
  { key: 'technique', label: 'Technik' },
  { key: 'passing', label: 'Passspiel' },
  { key: 'shooting', label: 'Schuss' },
  { key: 'dribbling', label: 'Dribbling' },
  { key: 'defense', label: 'Verteidigung' },
  { key: 'tactical_understanding', label: 'Taktik' },
];

export function EditPlayerStatsModal({
  isOpen,
  onClose,
  playerId,
  currentStats,
  onSuccess,
}: EditPlayerStatsModalProps) {
  const [stats, setStats] = useState({
    speed: 50,
    stamina: 50,
    technique: 50,
    passing: 50,
    shooting: 50,
    dribbling: 50,
    defense: 50,
    tactical_understanding: 50,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill from currentStats when opening
  useEffect(() => {
    if (currentStats) {
      setStats({
        speed: currentStats.speed ?? 50,
        stamina: currentStats.stamina ?? 50,
        technique: currentStats.technique ?? 50,
        passing: currentStats.passing ?? 50,
        shooting: currentStats.shooting ?? 50,
        dribbling: currentStats.dribbling ?? 50,
        defense: currentStats.defense ?? 50,
        tactical_understanding: currentStats.tactical_understanding ?? 50,
      });
    } else {
      setStats({
        speed: 50, stamina: 50, technique: 50, passing: 50,
        shooting: 50, dribbling: 50, defense: 50, tactical_understanding: 50,
      });
    }
  }, [currentStats, isOpen]);

  const handleStat = (key: string, value: number) => {
    setStats((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: dbError } = await upsertPlayerStats(playerId, stats);
      if (dbError) throw dbError;

      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Stats konnten nicht gespeichert werden');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate average
  const values = Object.values(stats);
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Spieler-Attribute bearbeiten" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Average indicator */}
        <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-3">
          <span className="text-sm font-medium text-emerald-700">Durchschnitt</span>
          <span className="text-lg font-bold text-emerald-700">{avg}/100</span>
        </div>

        {/* Stat sliders in 2-column grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {STAT_LABELS.map(({ key, label }) => (
            <Slider
              key={key}
              id={`stat-${key}`}
              label={label}
              value={stats[key]}
              min={1}
              max={100}
              onChange={(val) => handleStat(key, val)}
            />
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Wird gespeichert...' : 'Stats speichern'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
