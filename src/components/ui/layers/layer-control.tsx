'use client';

import { useState } from "react";
import { type CheckboxCheckedChangeDetails, Box, Switch, IconButton, Text } from "@chakra-ui/react";
import { LuInfo } from "react-icons/lu";
import { MEDIA_URL_PREFIX } from "@/utils/api";
import { useAuth } from "@/utils/context/auth";
import { DownloadButton } from "@/components/chakra/download-button";
import { LayerInfoModal } from "@/components/map/layer-info-modal";
import { type Layer } from "@/app/types";
import { useTranslation } from "react-i18next";

interface LayerControlProps {
  layer: Layer;
  onChange: (param: { [x: string]: boolean; }) => void;
  selected: boolean;
}

export const LayerControl = ({ layer, onChange, selected }: LayerControlProps) => {
  const { t } = useTranslation();
  const [infoOpen, setInfoOpen] = useState(false);
  const layerLabel = t(`layer.${layer.id}.label`, { defaultValue: layer.label });
  const layerDescription = layer.description ? t(`layer.${layer.id}.description`, { defaultValue: layer.description }) : undefined;

  const onCheckedChange = (details: CheckboxCheckedChangeDetails) => {
    onChange({ [layer.id]: details.checked as boolean });
  };
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" py="0.5" px='4'>
        <Box display="flex" alignItems="center" gap="1">
          <Text fontSize="sm" fontFamily="body">{layerLabel}</Text>
          <IconButton
            aria-label="Layer info"
            size="2xs"
            variant="ghost"
            colorPalette="gray"
            onClick={() => setInfoOpen(true)}
          >
            <LuInfo />
          </IconButton>
        </Box>
        <Box display="flex" alignItems="center" gap="2">
          {layer.filePath && isAuthenticated && <DownloadButton url={`${MEDIA_URL_PREFIX}${layer.filePath}`} label={`Download ${layerLabel}`} />}
          <Switch.Root value={layer.id} onCheckedChange={onCheckedChange} checked={selected}>
            <Switch.HiddenInput />
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch.Root>
        </Box>
      </Box>

      <LayerInfoModal
        title={layerLabel}
        description={layerDescription}
        metadata={layer.metadata}
        open={infoOpen}
        onOpenChange={({ open }) => setInfoOpen(open)}
      />
    </>
  );
};
