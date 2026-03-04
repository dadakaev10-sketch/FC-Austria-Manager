'use client';

import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useClubStore } from '@/stores/club-store';
import { teamsService } from '@/lib/firebase/services';
import { isDemoMode } from '@/lib/demo-data';
import type { TeamCategory } from '@/types/database';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export function CreateTeamModal({ isOpen, onClose, onSuccess }: CreateTeamModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [season, setSeason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setCategory('');
    setSeason('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category || !season) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const clubId = useClubStore.getState().currentClub?.id;
      if (!clubId) throw new Error('Kein Verein ausgewaehlt');

      if (isDemoMode()) {
        // In demo mode, just add to store directly
        const demoTeam = {
          id: `demo-team-${Date.now()}`,
          clubId,
          name: name.trim(),
          category: category as TeamCategory,
          season,
          coachId: null,
          assistantCoachId: null,
          createdAt: new Date().toISOString(),
        };
        useClubStore.getState().addTeam(demoTeam);
        handleClose();
        onSuccess?.();
        return;
      }

      // Create in Firestore (real-time listener will update the store)
      await teamsService.create({
        clubId,
        name: name.trim(),
        category: category as TeamCategory,
        season,
        coachId: null,
        assistantCoachId: null,
        createdAt: new Date().toISOString(),
      });

      handleClose();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Team konnte nicht erstellt werden');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Team erstellen" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Input
          id="team-name"
          label="Teamname"
          placeholder="z.B. U15 Jugend"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Select
          id="team-category"
          label="Kategorie"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />

        <Select
          id="team-season"
          label="Saison"
          options={SEASON_OPTIONS}
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          required
        />

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={isSubmitting || !name.trim() || !category || !season}>
            {isSubmitting ? 'Wird erstellt...' : 'Team erstellen'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
