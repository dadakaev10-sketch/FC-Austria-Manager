'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useClubStore } from '@/stores/club-store';
import { updatePlayerInDb } from '@/lib/supabase/players';
import type { Player } from '@/types/database';

interface EditPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  onSuccess?: () => void;
}

const POSITION_OPTIONS = [
  { value: '', label: 'Position wählen' },
  { value: 'goalkeeper', label: 'Torwart' },
  { value: 'center-back', label: 'Innenverteidiger' },
  { value: 'left-back', label: 'Linker Verteidiger' },
  { value: 'right-back', label: 'Rechter Verteidiger' },
  { value: 'defensive-midfielder', label: 'Defensives Mittelfeld' },
  { value: 'central-midfielder', label: 'Zentrales Mittelfeld' },
  { value: 'attacking-midfielder', label: 'Offensives Mittelfeld' },
  { value: 'left-winger', label: 'Linksaußen' },
  { value: 'right-winger', label: 'Rechtsaußen' },
  { value: 'striker', label: 'Stürmer' },
];

const FOOT_OPTIONS = [
  { value: '', label: 'Fuß wählen' },
  { value: 'right', label: 'Rechts' },
  { value: 'left', label: 'Links' },
  { value: 'both', label: 'Beidfüßig' },
];

export function EditPlayerModal({ isOpen, onClose, player, onSuccess }: EditPlayerModalProps) {
  const { teams } = useClubStore();

  const [name, setName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [position, setPosition] = useState('');
  const [preferredFoot, setPreferredFoot] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const teamOptions = [
    { value: '', label: 'Team wählen' },
    ...teams.map((t) => ({ value: t.id, label: `${t.name} (${t.category})` })),
  ];

  // Pre-fill form when player changes
  useEffect(() => {
    if (player) {
      setName(player.name || '');
      setSelectedTeamId(player.team_id || '');
      setDateOfBirth(player.date_of_birth || '');
      setPosition(player.position || '');
      setPreferredFoot(player.preferred_foot || '');
      setJerseyNumber(player.jersey_number?.toString() || '');
      setHeight(player.height?.toString() || '');
      setWeight(player.weight?.toString() || '');
      setContactEmail(player.contact_email || '');
      setContactPhone(player.contact_phone || '');
      setParentName(player.parent_name || '');
      setParentEmail(player.parent_email || '');
      setParentPhone(player.parent_phone || '');
      setError(null);
    }
  }, [player]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!player || !name.trim() || !selectedTeamId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: dbError } = await updatePlayerInDb(player.id, {
        team_id: selectedTeamId,
        name: name.trim(),
        date_of_birth: dateOfBirth || null,
        position: position || null,
        preferred_foot: (preferredFoot as 'left' | 'right' | 'both') || null,
        jersey_number: jerseyNumber ? parseInt(jerseyNumber) : null,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        contact_email: contactEmail.trim() || null,
        contact_phone: contactPhone.trim() || null,
        parent_name: parentName.trim() || null,
        parent_email: parentEmail.trim() || null,
        parent_phone: parentPhone.trim() || null,
      });

      if (dbError) throw dbError;

      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Spieler konnte nicht aktualisiert werden');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Spieler bearbeiten" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input id="edit-name" label="Name *" value={name} onChange={(e) => setName(e.target.value)} required />
          <Select id="edit-team" label="Team *" options={teamOptions} value={selectedTeamId} onChange={(e) => setSelectedTeamId(e.target.value)} required />
          <Input id="edit-dob" label="Geburtsdatum" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
          <Select id="edit-position" label="Position" options={POSITION_OPTIONS} value={position} onChange={(e) => setPosition(e.target.value)} />
          <Select id="edit-foot" label="Bevorzugter Fuß" options={FOOT_OPTIONS} value={preferredFoot} onChange={(e) => setPreferredFoot(e.target.value)} />
          <Input id="edit-jersey" label="Trikotnummer" type="number" min={1} max={99} value={jerseyNumber} onChange={(e) => setJerseyNumber(e.target.value)} />
          <Input id="edit-height" label="Größe (cm)" type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
          <Input id="edit-weight" label="Gewicht (kg)" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Kontakt Spieler</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input id="edit-email" label="E-Mail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            <Input id="edit-phone" label="Telefon" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Eltern / Erziehungsberechtigte</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input id="edit-parent-name" label="Name" value={parentName} onChange={(e) => setParentName(e.target.value)} />
            <Input id="edit-parent-email" label="E-Mail" type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} />
            <Input id="edit-parent-phone" label="Telefon" type="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Abbrechen</Button>
          <Button type="submit" disabled={isSubmitting || !name.trim() || !selectedTeamId}>
            {isSubmitting ? 'Wird gespeichert...' : 'Speichern'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
