"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      backdrop="blur"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      isDismissable={!isLoading}
      hideCloseButton={isLoading}
    >
      <ModalContent>
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-danger-100"
                  aria-hidden="true"
                >
                  <AlertTriangle className="w-4 h-4 text-danger" />
                </div>
                <span id="confirm-dialog-title">{title}</span>
              </div>
            </ModalHeader>
            <ModalBody>
              <p
                id="confirm-dialog-description"
                className="text-default-600"
              >
                {message}
              </p>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onPress={onCloseModal}
                isDisabled={isLoading}
              >
                {cancelLabel}
              </Button>
              <Button
                color="danger"
                onPress={handleConfirm}
                isLoading={isLoading}
                aria-label={`${confirmLabel} - this action cannot be undone`}
              >
                {confirmLabel}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
