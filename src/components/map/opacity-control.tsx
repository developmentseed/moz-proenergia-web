import { Popover, Portal, Slider, Box, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { popoverZIndex } from './control-constant';

interface OpacityControlProps {
  value: number; // 0–100
  onValueChange: (value: number) => void;
  children: ReactNode;
}

export function OpacityControl({ value, onValueChange, children }: OpacityControlProps) {
  return (
    <Popover.Root positioning={{ placement: 'top' }}>
      <Popover.Trigger asChild>
        {children}
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content width="160px" p={3} zIndex={popoverZIndex}>
            <Box mb={2}>
              <Text fontSize="xs" color="fg.muted">
                Opacity: {value}%
              </Text>
            </Box>
            <Slider.Root
              value={[value]}
              min={0}
              max={100}
              onValueChange={(details) => onValueChange(details.value[0])}
            >
              <Slider.Control>
                <Slider.Track>
                  <Slider.Range />
                </Slider.Track>
                <Slider.Thumbs />
              </Slider.Control>
            </Slider.Root>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
