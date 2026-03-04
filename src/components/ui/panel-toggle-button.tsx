import { Box, IconButton } from "@chakra-ui/react";
import {
  LuPanelLeftOpen,
  LuPanelLeftClose,
  LuPanelRightOpen,
  LuPanelRightClose,
} from "react-icons/lu";
import { Tooltip } from "./tooltip";

interface PanelToggleButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  side: "left" | "right";
  label: string;
  panelWidth: number;
  animationTime: string;
}

export const PanelToggleButton = ({
  isOpen,
  onToggle,
  side,
  label,
  panelWidth,
  animationTime,
}: PanelToggleButtonProps) => {
  const tooltipText = isOpen ? `Collapse ${label}` : `Expand ${label}`;

  const OpenIcon = side === "left" ? LuPanelLeftOpen : LuPanelRightOpen;
  const CloseIcon = side === "left" ? LuPanelLeftClose : LuPanelRightClose;

  return (
    <Box
      position="absolute"
      {...(side === "left"
        ? { left: isOpen ? `calc(${panelWidth}px - 1px)` : 0 }
        : { right: isOpen ? `calc(${panelWidth}px - 1px)` : 0 })}
      top="8"
      transform="translateY(-50%)"
      zIndex={1000}
      transition={`${side} ${animationTime} ease`}
    >
      <Tooltip content={tooltipText}>
        <IconButton
          aria-label={tooltipText}
          onClick={onToggle}
          variant="solid"
          size="sm"
          bg="panelBg"
          border="1px solid"
          borderColor="panelBorder"
          {...(side === "left"
            ? { borderLeft: "none", borderLeftRadius: 0 }
            : { borderRight: "none", borderRightRadius: 0 })}
        >
          {isOpen ? (
            <CloseIcon stroke="gray" />
          ) : (
            <OpenIcon stroke="gray" />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
};
