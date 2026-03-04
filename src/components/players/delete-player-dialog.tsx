'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { deletePlayerInDb } from '@/lib/supabase/players';

interface DeletePlayerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  player: { id: string; name: string } | null;
  onSuccess?: () => void;
}

export function DeletePlayerDialog({ isOpen, onClose, player, onSuccess }: DeletePlayerDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!player) return;
    setIsLoading(true);

    try {
      const { error } = await deletePlayerInDb(player.id);
      if (error) throw error;

      onClose();
      onSuccess?.();
    } catch (err) {
      console.error('Failed to delete player:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Spieler löschen"
      message={`Der Spieler „${player?.name}" und alle zugehörigen Daten (Stats, Bewertungen, Anwesenheiten) werden unwiderruflich gelöscht.`}
      confirmLabel="Spieler löschen"
      isLoading={isLoading}
    />
  );
}
