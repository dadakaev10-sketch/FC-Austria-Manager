'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { playersService } from '@/lib/firebase/services';

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
      await playersService.delete(player.id);
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
      title="Spieler loeschen"
      message={`Der Spieler "${player?.name}" und alle zugehoerigen Daten (Stats, Bewertungen, Anwesenheiten) werden unwiderruflich geloescht.`}
      confirmLabel="Spieler loeschen"
      isLoading={isLoading}
    />
  );
}
