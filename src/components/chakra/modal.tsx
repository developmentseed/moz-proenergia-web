import { type ReactNode } from 'react';
import { CloseButton, Button, Dialog, Portal } from '@chakra-ui/react';
import { type NavigationItem } from '../layout/header';

type ModalProps = {
  item: NavigationItem;
  modalTitle: string;
  isOpen: boolean;
  modalContent?: ReactNode
}

const Modal = ({ item, modalTitle, isOpen, setIsModalOpen, modalContent }: ModalProps) => {

  return <Dialog.Root open={isOpen} onOpenChange={(e) => setIsModalOpen(e.open)}>
    <Dialog.Trigger asChild>
      <Button
        padding={0}
        variant="plain"
        fontSize="sm"
        fontWeight="medium"
        color="fg.muted"
      >
        {item.label}
      </Button>
    </Dialog.Trigger>
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>{modalTitle} </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            {modalContent}
          </Dialog.Body>
          <Dialog.Footer>
            {/* <Dialog.ActionTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </Dialog.ActionTrigger>
            <Button>Save</Button> */}
          </Dialog.Footer>
          <Dialog.CloseTrigger asChild>
            <CloseButton size="sm" />
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root>;
};

export default Modal;