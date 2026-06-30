import {
  Popover as ChakraPopover,
  IconButton,
  type IconButtonProps,
  Portal,
} from "@chakra-ui/react";
import { zIndex } from "@/components/ui/constant";
import * as React from "react";
import { LuInfo } from "react-icons/lu";
export interface ToggleTipProps extends ChakraPopover.RootProps {
  showArrow?: boolean
  portalled?: boolean
  portalRef?: React.RefObject<HTMLElement | null>
  content?: React.ReactNode
  contentProps?: ChakraPopover.ContentProps
}

export const ToggleTip = React.forwardRef<HTMLDivElement, ToggleTipProps>(
  function ToggleTip(props, ref) {
    const {
      showArrow,
      children,
      portalled = true,
      content,
      contentProps,
      portalRef,
      ...rest
    } = props;

    return (
      <ChakraPopover.Root
        {...rest}
        positioning={{ ...rest.positioning, gutter: 4 }}
      >
        <ChakraPopover.Trigger asChild>{children}</ChakraPopover.Trigger>
        <Portal disabled={!portalled} container={portalRef}>
          <ChakraPopover.Positioner>
            <ChakraPopover.Content
              width="auto"
              maxW={{ base: "calc(100dvw - 1rem)", sm: "xs" }}
              px="2"
              py="1"
              textStyle="xs"
              rounded="sm"
              zIndex={zIndex.toggleTip}
              ref={ref}
              {...contentProps}
            >
              {showArrow && (
                <ChakraPopover.Arrow>
                  <ChakraPopover.ArrowTip />
                </ChakraPopover.Arrow>
              )}
              {content}
            </ChakraPopover.Content>
          </ChakraPopover.Positioner>
        </Portal>
      </ChakraPopover.Root>
    );
  },
);

export interface InfoTipProps extends Partial<ToggleTipProps> {
  buttonProps?: IconButtonProps | undefined
}

export const InfoTip = (props: InfoTipProps) => {
    const { children, buttonProps, ...rest } = props;
    return (
      <ToggleTip content={children} {...rest} >
        <IconButton
          variant="ghost"
          aria-label="info"
          size="2xs"
          colorPalette="gray"
          {...buttonProps}
        >
          <LuInfo />
        </IconButton>
      </ToggleTip>
    );
  };
