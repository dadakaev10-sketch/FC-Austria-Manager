'use client';

import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useClubStore } from '@/stores/club-store';
import { playersService, playerTeamsService } from '@/lib/firebase/services';
import { isDemoMode } from '@/lib/demo-data';

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId?: string;
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

export function AddPlayerModal({ isOpen, onClose, teamId, onSuccess }: AddPlayerModalProps) {
  const { teams, currentClub } = useClubStore();

  const [name, setName] = useState('');
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>(teamId ? [teamId] : []);
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

  const resetForm = () => {
    setName('');
    setSelectedTeamIds(teamId ? [teamId] : []);
    setDateOfBirth('');
    setPosition('');
    setPreferredFoot('');
    setJerseyNumber('');
    setHeight('');
    setWeight('');
    setContactEmail('');
    setContactPhone('');
    setParentName('');
    setParentEmail('');
    setParentPhone('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleTeam = (tId: string) => {
    setSelectedTeamIds((prev) =>
      prev.includes(tId) ? prev.filter((id) => id !== tId) : [...prev, tId]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedTeamIds.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const clubId = currentClub?.id;
      if (!clubId) throw new Error('Kein Verein ausgewaehlt');

      if (isDemoMode()) {
        const demoPlayerId = `demo-player-${Date.now()}`;
        const demoPlayer = {
          id: demoPlayerId,
          clubId,
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
          photoUrl: null,
          createdAt: new Date().toISOString(),
        };
        useClubStore.getState().addPlayer(demoPlayer);

        // Create PlayerTeam entries for each selected team
        for (const tId of selectedTeamIds) {
          useClubStore.getState().addPlayerTeam({
            id: `demo-pt-${Date.now()}-${tId}`,
            playerId: demoPlayerId,
            teamId: tId,
            assignedAt: new Date().toISOString(),
          });
        }

        handleClose();
        onSuccess?.();
        return;
      }

      // Create the player in Firestore
      const playerId = await playersService.create({
        clubId,
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
        photoUrl: null,
      });

      // Create PlayerTeam entries for each selected team
      for (const tId of selectedTeamIds) {
        await playerTeamsService.create({
          playerId,
          teamId: tId,
          assignedAt: new Date().toISOString(),
        });
      }

      handleClose();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Spieler konnte nicht hinzugefuegt werden');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Spieler hinzufuegen" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="player-name"
            label="Name *"
            placeholder="Max Hofer"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            id="player-dob"
            label="Geburtsdatum"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
          <Select
            id="player-position"
            label="Position"
            options={POSITION_OPTIONS}
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
          <Select
            id="player-foot"
            label="Bevorzugter Fuss"
            options={FOOT_OPTIONS}
            value={preferredFoot}
            onChange={(e) => setPreferredFoot(e.target.value)}
          />
          <Input
            id="player-jersey"
            label="Trikotnummer"
            type="number"
            min={1}
            max={99}
            placeholder="z.B. 10"
            value={jerseyNumber}
            onChange={(e) => setJerseyNumber(e.target.value)}
          />
          <Input
            id="player-height"
            label="Groesse (cm)"
            type="number"
            placeholder="z.B. 165"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
          <Input
            id="player-weight"
            label="Gewicht (kg)"
            type="number"
            placeholder="z.B. 55"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>

        {/* Team Assignment (multi-select via checkboxes) */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Teams zuweisen *</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {teams.map((t) => (
              <label
                key={t.id}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  selectedTeamIds.includes(t.id)
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedTeamIds.includes(t.id)}
                  onChange={() => toggleTeam(t.id)}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="truncate">{t.name} ({t.category})</span>
              </label>
            ))}
          </div>
          {teams.length === 0 && (
            <p className="mt-1 text-sm text-gray-400">
              Erstelle zuerst ein Team, bevor du Spieler hinzufuegst.
            </p>
          )}
        </div>

        {/* Contact */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Kontakt Spieler</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="player-email"
              label="E-Mail"
              type="email"
              placeholder="spieler@example.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
            <Input
              id="player-phone"
              label="Telefon"
              type="tel"
              placeholder="+43 660 ..."
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Parent/Guardian */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Eltern / Erziehungsberechtigte</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="parent-name"
              label="Name"
              placeholder="Name des Elternteils"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
            />
            <Input
              id="parent-email"
              label="E-Mail"
              type="email"
              placeholder="eltern@example.com"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
            />
            <Input
              id="parent-phone"
              label="Telefon"
              type="tel"
              placeholder="+43 660 ..."
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={isSubmitting || !name.trim() || selectedTeamIds.length === 0}>
            {isSubmitting ? 'Wird hinzugefuegt...' : 'Spieler hinzufuegen'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
