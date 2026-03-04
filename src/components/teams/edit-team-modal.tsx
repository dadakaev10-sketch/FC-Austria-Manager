'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useClubStore } from '@/stores/club-store';
import { updateTeamInDb, fetchClubStaff } from '@/lib/supabase/teams';
import type { Team } from '@/types/database';

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  onSuccess?: () => void;
}

const CATEGORY_OPTIONS = [
  { value: '', label: 'Kategorie wählen' },
  { value: 'U8', label: 'U8' },
  { value: 'U10', label: 'U10' },
  { value: 'U12', label: 'U12' },
  { value: 'U14', label: 'U14' },
  { value: 'U16', label: 'U16' },
  { value: 'U18', label: 'U18' },
  { value: 'B Team', label: 'B Team' },
  { value: 'First Team', label: 'Erste Mannschaft' },
];

const SEASON_OPTIONS = [
  { value: '', label: 'Saison wählen' },
  { value: '2025/2026', label: '2025/2026' },
  { value: '2026/2027', label: '2026/2027' },
];

export function EditTeamModal({ isOpen, onClose, team, onSuccess }: EditTeamModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [season, setSeason] = useState('');
  const [coachId, setCoachId] = useState('');
  const [assistantCoachId, setAssistantCoachId] = useState('');
  const [staffOptions, setStaffOptions] = useState<{ value: string; label: string }[]>([
    { value: '', label: 'Trainer wählen' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill form when team changes
  useEffect(() => {
    if (team) {
      setName(team.name || '');
      setCategory(team.category || '');
      setSeason(team.season || '');
      setCoachId(team.coach_id || '');
      setAssistantCoachId(team.assistant_coach_id || '');
    }
  }, [team]);

  // Fetch staff when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const clubId = useClubStore.getState().currentClub?.id;
    if (!clubId) return;

    fetchClubStaff(clubId).then(({ data }) => {
      if (data) {
        setStaffOptions([
          { value: '', label: 'Kein Trainer' },
          ...data.map((p) => ({ value: p.id, label: p.full_name })),
        ]);
      }
    });
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!team || !name.trim() || !category || !season) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error: dbError } = await updateTeamInDb(team.id, {
        name: name.trim(),
        category,
        season,
        coach_id: coachId || null,
        assistant_coach_id: assistantCoachId || null,
      });

      if (dbError) throw dbError;
      if (data) {
        useClubStore.getState().updateTeam(team.id, data);
      }

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

        <Select
          id="edit-team-coach"
          label="Cheftrainer"
          options={staffOptions}
          value={coachId}
          onChange={(e) => setCoachId(e.target.value)}
        />

        <Select
          id="edit-team-assistant-coach"
          label="Co-Trainer"
          options={staffOptions}
          value={assistantCoachId}
          onChange={(e) => setAssistantCoachId(e.target.value)}
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
