'use client';

import { useState } from "react";
import { type CheckboxCheckedChangeDetails, Text, Box, Switch, IconButton } from "@chakra-ui/react";
import { LuInfo } from "react-icons/lu";
import { MEDIA_URL_PREFIX } from "@/utils/api";
import { DownloadButton } from "@/components/chakra/download-button";
import { LayerInfoModal } from "@/components/map/layer-info-modal";
import { type Layer } from "@/app/types";

interface LayerControlProps {
  layer: Layer;
  onChange: (param: { [x: string]: boolean; }) => void;
  selected: boolean;
}

export const LayerControl = ({ layer, onChange, selected }: LayerControlProps) => {
  const [infoOpen, setInfoOpen] = useState(false);

  const onCheckedChange = (details: CheckboxCheckedChangeDetails) => {
    onChange({ [layer.id]: details.checked as boolean });
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" py="0.5" px='4'>
        <Box display="flex" alignItems="center" gap="1">
          <Text fontSize="sm" fontFamily="body">{layer.label}</Text>
          {layer.description && (
            <IconButton
              aria-label="Layer info"
              size="2xs"
              variant="ghost"
              colorPalette="gray"
              onClick={() => setInfoOpen(true)}
            >
              <LuInfo />
            </IconButton>
          )}
        </Box>
        <Box display="flex" alignItems="center" gap="2">
          {layer.filePath && <DownloadButton url={`${MEDIA_URL_PREFIX}${layer.filePath}`} label={`Download ${layer.label}`} />}
          <Switch.Root value={layer.id} onCheckedChange={onCheckedChange} checked={selected}>
            <Switch.HiddenInput />
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch.Root>
        </Box>
      </Box>

      <LayerInfoModal
        layer={{ id: layer.id, name: layer.label, description: layer.description }}
        open={infoOpen}
        onOpenChange={setInfoOpen}
      />
    </>
  );
};
