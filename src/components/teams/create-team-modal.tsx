'use client';

import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Option lists
// ---------------------------------------------------------------------------

const CATEGORY_OPTIONS = [
  { value: '', label: 'Select category' },
  { value: 'U8', label: 'U8' },
  { value: 'U10', label: 'U10' },
  { value: 'U12', label: 'U12' },
  { value: 'U14', label: 'U14' },
  { value: 'U16', label: 'U16' },
  { value: 'U18', label: 'U18' },
  { value: 'B Team', label: 'B Team' },
  { value: 'First Team', label: 'First Team' },
];

const SEASON_OPTIONS = [
  { value: '', label: 'Select season' },
  { value: '2025/2026', label: '2025/2026' },
  { value: '2026/2027', label: '2026/2027' },
];

// TODO: Replace with real coaches fetched from Supabase
// const { data: coaches } = await supabase
//   .from('profiles')
//   .select('id, full_name')
//   .eq('club_id', clubId)
//   .in('role', ['coach', 'assistant_coach']);
const MOCK_COACH_OPTIONS = [
  { value: '', label: 'Select coach' },
  { value: 'c1', label: 'Carlos Martinez' },
  { value: 'c2', label: 'Sarah Johnson' },
  { value: 'c3', label: 'David Park' },
  { value: 'c4', label: 'Miguel Torres' },
  { value: 'c5', label: 'Roberto Silva' },
  { value: 'c6', label: 'Marco Rossi' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CreateTeamModal({ isOpen, onClose }: CreateTeamModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [season, setSeason] = useState('');
  const [coachId, setCoachId] = useState('');
  const [assistantCoachId, setAssistantCoachId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setCategory('');
    setSeason('');
    setCoachId('');
    setAssistantCoachId('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !category || !season) return;

    setIsSubmitting(true);

    try {
      // TODO: Insert team into Supabase
      // const supabase = createClient();
      // const { data, error } = await supabase
      //   .from('teams')
      //   .insert({
      //     club_id: currentClub.id,
      //     name: name.trim(),
      //     category,
      //     season,
      //     coach_id: coachId || null,
      //     assistant_coach_id: assistantCoachId || null,
      //   })
      //   .select()
      //   .single();
      //
      // if (error) throw error;
      //
      // // Update club store with new team
      // const { teams } = useClubStore.getState();
      // useClubStore.getState().setTeams([...teams, data]);

      // Simulate network delay for now
      await new Promise((resolve) => setTimeout(resolve, 500));

      handleClose();
    } catch (error) {
      console.error('Failed to create team:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Team" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="team-name"
          label="Team Name"
          placeholder="e.g. U12 Development"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Select
          id="team-category"
          label="Category"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />

        <Select
          id="team-season"
          label="Season"
          options={SEASON_OPTIONS}
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          required
        />

        <Select
          id="team-coach"
          label="Head Coach"
          options={MOCK_COACH_OPTIONS}
          value={coachId}
          onChange={(e) => setCoachId(e.target.value)}
        />

        <Select
          id="team-assistant-coach"
          label="Assistant Coach"
          options={MOCK_COACH_OPTIONS}
          value={assistantCoachId}
          onChange={(e) => setAssistantCoachId(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !name.trim() || !category || !season}>
            {isSubmitting ? 'Creating...' : 'Create Team'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
