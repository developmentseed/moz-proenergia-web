import { Dialog, Portal, CloseButton, Text } from '@chakra-ui/react';
import type { LegendLayer } from './types';

interface LayerInfoModalProps {
  layer: LegendLayer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LayerInfoModal({ layer, open, onOpenChange }: LayerInfoModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={({ open }) => onOpenChange(open)} placement="center">
      <Portal>
        <Dialog.Backdrop backdropFilter="blur(3px)" />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{layer.name}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              {layer.description ? (
                <Text fontSize="sm">{layer.description}</Text>
              ) : (
                <Text fontSize="sm" color="fg.muted" fontStyle="italic">
                  No description available.
                </Text>
              )}
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
