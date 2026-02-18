import { type ReactNode } from 'react';
import { CloseButton, Button, Dialog, Portal, createOverlay } from '@chakra-ui/react';

type ModalProps = {
  modalTitle: string;
  modalContent?: ReactNode
}

const Modal = createOverlay<ModalProps>((props) => {
  const { modalTitle, modalContent, open, onOpenChange, onExitComplete } = props;

  return <Dialog.Root open={open} onOpenChange={onOpenChange} onExitComplete={onExitComplete}>
    {/* <Dialog.Trigger asChild>
      <Button
        padding={0}
        variant="plain"
        fontSize="sm"
        fontWeight="medium"
        color="fg.muted"
      >
        {item.label}
      </Button>
    </Dialog.Trigger> */}
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
})

export default Modal;