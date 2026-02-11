import { type CheckboxCheckedChangeDetails, Text, Box, Switch } from "@chakra-ui/react";
import { InfoTip } from "@/components/chakra/toggle-tip";
import { DownloadButton } from "@/components/chakra/download-button";
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
    <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" py="0.5" px='4'>
      <Box display="flex" alignItems="center" gap="1">
        <Text fontSize="sm" fontFamily="body">{layer.label}</Text>
        <InfoTip content="This is some additional information." />
      </Box>
      <Box display="flex" alignItems="center" gap="2">

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
