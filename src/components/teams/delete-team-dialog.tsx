'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useClubStore } from '@/stores/club-store';
import { teamsService } from '@/lib/firebase/services';

interface DeleteTeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: { id: string; name: string } | null;
  onSuccess?: () => void;
}

export function DeleteTeamDialog({ isOpen, onClose, team, onSuccess }: DeleteTeamDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!team) return;
    setIsLoading(true);

    try {
      await teamsService.delete(team.id);
      useClubStore.getState().removeTeam(team.id);
      onClose();
      onSuccess?.();
    } catch (err) {
      console.error('Failed to delete team:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Team loeschen"
      message={`Das Team "${team?.name}" und alle zugehoerigen Daten werden unwiderruflich geloescht.`}
      confirmLabel="Team loeschen"
      isLoading={isLoading}
    />
  );
}
