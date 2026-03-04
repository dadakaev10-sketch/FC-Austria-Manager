'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useClubStore } from '@/stores/club-store';
import { trainingsService } from '@/lib/firebase/services';
import type { Training } from '@/types/database';

interface EditTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  training: Training | null;
  onSuccess?: () => void;
}

export function EditTrainingModal({ isOpen, onClose, training, onSuccess }: EditTrainingModalProps) {
  const { teams } = useClubStore();

  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [focus, setFocus] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const teamOptions = [
    { value: '', label: 'Mannschaft waehlen' },
    ...teams.map((t) => ({ value: t.id, label: `${t.name} (${t.category})` })),
  ];

  // Pre-fill when training changes
  useEffect(() => {
    if (training) {
      setSelectedTeamId(training.teamId || '');
      setDate(training.date || '');
      setStartTime(training.startTime || '');
      setEndTime(training.endTime || '');
      setLocation(training.location || '');
      setFocus(training.focus || '');
      setNotes(training.notes || '');
      setError(null);
    }
  }, [training]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!training || !selectedTeamId || !date || !startTime) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await trainingsService.update(training.id, {
        teamId: selectedTeamId,
        date,
        startTime,
        endTime: endTime || '',
        location: location.trim() || '',
        focus: focus.trim() || '',
        notes: notes.trim() || null,
      });

      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Training konnte nicht aktualisiert werden');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Training bearbeiten" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Select
          id="edit-training-team"
          label="Mannschaft *"
          options={teamOptions}
          value={selectedTeamId}
          onChange={(e) => setSelectedTeamId(e.target.value)}
          required
        />

        <Input
          id="edit-training-date"
          label="Datum *"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="edit-training-start"
            label="Startzeit *"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
          <Input
            id="edit-training-end"
            label="Endzeit"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <Input
          id="edit-training-location"
          label="Ort"
          placeholder="z.B. Hauptplatz A"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <Input
          id="edit-training-focus"
          label="Schwerpunkt"
          placeholder="z.B. Passspiel, Taktik, Kondition"
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
        />

        <div className="space-y-1">
          <label htmlFor="edit-training-notes" className="block text-sm font-medium text-gray-700">
            Notizen
          </label>
          <textarea
            id="edit-training-notes"
            rows={3}
            placeholder="Zusaetzliche Hinweise zum Training..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={isSubmitting || !selectedTeamId || !date || !startTime}>
            {isSubmitting ? 'Wird gespeichert...' : 'Speichern'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
