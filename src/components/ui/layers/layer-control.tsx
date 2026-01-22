import { type CheckboxCheckedChangeDetails, Text, Box, Switch, IconButton, Button } from "@chakra-ui/react";
import { InfoTip } from "@/components/chakra/toggle-tip";
import { LuInfo, LuDownload } from "react-icons/lu";
import { type Layer } from "@/app/types";

interface LayerControlProps {
  layer: Layer;
  onChange: (param: { [x: string]: boolean; }) => void;
  selected: boolean;
}

export const LayerControl = ({ layer, onChange, selected }: LayerControlProps) => {
  const onCheckedChange = (details: CheckboxCheckedChangeDetails) => {
    onChange({ [layer.id]: details.checked as boolean });
  };

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" p="2" px='4'>
      <Box display="flex" alignItems="center" gap="1">
        <Text fontFamily="body">{layer.label}</Text>
        <InfoTip content="This is some additional information." />
      </Box>
      <Box display="flex" alignItems="center" gap="2">
        <IconButton
          aria-label="Download layer"
          variant="ghost"
          size="xs"
        >
          <LuDownload />
        </IconButton>
        <Switch.Root value={layer.id} onCheckedChange={onCheckedChange} checked={selected}>
          <Switch.HiddenInput />
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch.Root>
      </Box>
    </Box>
  );
};
