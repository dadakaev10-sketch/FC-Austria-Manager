'use client';

import { Modal } from './modal';
import { Button } from './button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Löschen',
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <p className="text-center text-sm text-gray-600">{message}</p>
      </div>
      <div className="mt-6 flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onClose}
          disabled={isLoading}
        >
          Abbrechen
        </Button>
        <Button
          variant="danger"
          className="flex-1"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Wird gelöscht...' : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
