import { type ReactNode } from 'react';
import { CloseButton, Dialog, Portal, createOverlay } from '@chakra-ui/react';

type ModalDialogProps = {
  modalTitle: string;
  modalContent?: ReactNode;
  open?: boolean;
  onOpenChange?: (details: { open: boolean }) => void;
  onExitComplete?: () => void;
}

export function ModalDialog({ modalTitle, modalContent, open, onOpenChange, onExitComplete }: ModalDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} onExitComplete={onExitComplete} placement="center">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{modalTitle}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              {modalContent}
            </Dialog.Body>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

type ModalProps = {
  modalTitle: string;
  modalContent?: ReactNode;
  open?: boolean; // not needed when used imperatively (Modal.open)
  onOpenChange?: (details: { open: boolean }) => void;
  onExitComplete?: () => void;
}

const Modal = createOverlay<ModalProps>((props) => {
  return (
    <ModalDialog {...props} />
  );
});

export default Modal;
