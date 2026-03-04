'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useClubStore } from '@/stores/club-store';
import { teamsService } from '@/lib/firebase/services';
import type { Team, TeamCategory } from '@/types/database';

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  onSuccess?: () => void;
}

const CATEGORY_OPTIONS = [
  { value: '', label: 'Kategorie waehlen' },
  { value: 'U8', label: 'U8' },
  { value: 'U10', label: 'U10' },
  { value: 'U12', label: 'U12' },
  { value: 'U14', label: 'U14' },
  { value: 'U15', label: 'U15' },
  { value: 'U17', label: 'U17' },
  { value: 'U19', label: 'U19' },
  { value: 'U21', label: 'U21' },
  { value: 'Kampfmannschaft', label: 'Kampfmannschaft' },
  { value: 'Reserve', label: 'Reserve' },
];

const SEASON_OPTIONS = [
  { value: '', label: 'Saison waehlen' },
  { value: '2025/2026', label: '2025/2026' },
  { value: '2026/2027', label: '2026/2027' },
];

export function EditTeamModal({ isOpen, onClose, team, onSuccess }: EditTeamModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [season, setSeason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill form when team changes
  useEffect(() => {
    if (team) {
      setName(team.name || '');
      setCategory(team.category || '');
      setSeason(team.season || '');
    }
  }, [team]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!team || !name.trim() || !category || !season) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await teamsService.update(team.id, {
        name: name.trim(),
        category: category as TeamCategory,
        season,
      });

      // Real-time listener will update the store
      useClubStore.getState().updateTeam(team.id, {
        name: name.trim(),
        category: category as TeamCategory,
        season,
      });

      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Team konnte nicht aktualisiert werden');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Team bearbeiten" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Input
          id="edit-team-name"
          label="Teamname"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Select
          id="edit-team-category"
          label="Kategorie"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />

        <Select
          id="edit-team-season"
          label="Saison"
          options={SEASON_OPTIONS}
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          required
        />

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={isSubmitting || !name.trim() || !category || !season}>
            {isSubmitting ? 'Wird gespeichert...' : 'Speichern'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
