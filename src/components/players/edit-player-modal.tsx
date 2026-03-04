'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useClubStore } from '@/stores/club-store';
import { playersService } from '@/lib/firebase/services';
import type { Player } from '@/types/database';

interface EditPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  onSuccess?: () => void;
}

const POSITION_OPTIONS = [
  { value: '', label: 'Position waehlen' },
  { value: 'goalkeeper', label: 'Torwart' },
  { value: 'center-back', label: 'Innenverteidiger' },
  { value: 'left-back', label: 'Linker Verteidiger' },
  { value: 'right-back', label: 'Rechter Verteidiger' },
  { value: 'defensive-midfielder', label: 'Defensives Mittelfeld' },
  { value: 'central-midfielder', label: 'Zentrales Mittelfeld' },
  { value: 'attacking-midfielder', label: 'Offensives Mittelfeld' },
  { value: 'left-winger', label: 'Linksaussen' },
  { value: 'right-winger', label: 'Rechtsaussen' },
  { value: 'striker', label: 'Stuermer' },
];

const FOOT_OPTIONS = [
  { value: '', label: 'Fuss waehlen' },
  { value: 'right', label: 'Rechts' },
  { value: 'left', label: 'Links' },
  { value: 'both', label: 'Beidfuessig' },
];

export function EditPlayerModal({ isOpen, onClose, player, onSuccess }: EditPlayerModalProps) {
  const [name, setName] = useState('');
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

  // Pre-fill form when player changes
  useEffect(() => {
    if (player) {
      setName(player.name || '');
      setDateOfBirth(player.dateOfBirth || '');
      setPosition(player.position || '');
      setPreferredFoot(player.preferredFoot || '');
      setJerseyNumber(player.jerseyNumber?.toString() || '');
      setHeight(player.height?.toString() || '');
      setWeight(player.weight?.toString() || '');
      setContactEmail(player.contactEmail || '');
      setContactPhone(player.contactPhone || '');
      setParentName(player.parentName || '');
      setParentEmail(player.parentEmail || '');
      setParentPhone(player.parentPhone || '');
      setError(null);
    }
  }, [player]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!player || !name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await playersService.update(player.id, {
        name: name.trim(),
        dateOfBirth: dateOfBirth || null,
        position: position || null,
        preferredFoot: (preferredFoot as 'left' | 'right' | 'both') || null,
        jerseyNumber: jerseyNumber ? parseInt(jerseyNumber) : null,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        contactEmail: contactEmail.trim() || null,
        contactPhone: contactPhone.trim() || null,
        parentName: parentName.trim() || null,
        parentEmail: parentEmail.trim() || null,
        parentPhone: parentPhone.trim() || null,
      });

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
          <Input id="edit-dob" label="Geburtsdatum" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
          <Select id="edit-position" label="Position" options={POSITION_OPTIONS} value={position} onChange={(e) => setPosition(e.target.value)} />
          <Select id="edit-foot" label="Bevorzugter Fuss" options={FOOT_OPTIONS} value={preferredFoot} onChange={(e) => setPreferredFoot(e.target.value)} />
          <Input id="edit-jersey" label="Trikotnummer" type="number" min={1} max={99} value={jerseyNumber} onChange={(e) => setJerseyNumber(e.target.value)} />
          <Input id="edit-height" label="Groesse (cm)" type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
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
          <Button type="submit" disabled={isSubmitting || !name.trim()}>
            {isSubmitting ? 'Wird gespeichert...' : 'Speichern'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
