"use client";

import {
  Text,
  Flex,
  Image,
  Popover,
  IconButton,
  Portal,
} from "@chakra-ui/react";
import { LuCheck, LuMap } from "react-icons/lu";
import { controlZIndex } from "./control-constant";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Mapbox Static Images API — centered on Mozambique
const thumbnail = (styleId: string) =>
  `https://api.mapbox.com/styles/v1/${styleId}/static/36,-20,2,0/200x200@2x?access_token=${MAPBOX_TOKEN}`;

export interface BasemapOption {
  id: string;
  name: string;
  /** Mapbox style URL passed to mapStyle, or null for the local JSON basemap */
  styleUrl: string | null;
  thumbnailUrl: string;
}

export const BASEMAP_OPTIONS: BasemapOption[] = [
  {
    id: "light",
    name: "Light",
    styleUrl: null, // caller falls back to local basemap-style.json
    thumbnailUrl: thumbnail("mapbox/light-v11"),
  },
  {
    id: "satellite",
    name: "Satellite",
    styleUrl: "mapbox://styles/mapbox/satellite-v9",
    thumbnailUrl: thumbnail("mapbox/satellite-v9"),
  },
];

interface BasemapSelectorProps {
  currentBasemapId: string;
  onBasemapChange: (id: string) => void;
}

export const BasemapSelector = ({
  currentBasemapId,
  onBasemapChange,
}: BasemapSelectorProps) => {
  const current =
    BASEMAP_OPTIONS.find((o) => o.id === currentBasemapId) ??
    BASEMAP_OPTIONS[0];

  return (
    <Popover.Root positioning={{ placement: "top-start" }}>
      <Popover.Trigger asChild>
        <IconButton
          aria-label="Change basemap"
          position="absolute"
          bottom="9.75rem"
          left={2}
          size="xs"
          variant="surface"
          zIndex={controlZIndex}
          bg={`url(${current.thumbnailUrl})`}
          bgSize="cover"
          borderWidth="0"
          color={current.id === "satellite" ? "white" : "fg.muted"}
          _hover={{ opacity: 0.85 }}
        >
          <LuMap />
        </IconButton>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content maxW="10rem" zIndex={controlZIndex + 1}>
            <Popover.Body p={3}>
              <Text textStyle="allCapLabel" mb={3}>
                Basemap
              </Text>
              {BASEMAP_OPTIONS.map((option) => {
                const isActive = option.id === currentBasemapId;
                return (
                  <Flex
                    key={option.id}
                    gap={2}
                    cursor="pointer"
                    alignItems="center"
                    mb={2}
                    _last={{ mb: 0 }}
                    onClick={() => onBasemapChange(option.id)}
                  >
                    <Image
                      src={option.thumbnailUrl}
                      alt={option.name}
                      width="40px"
                      height="40px"
                      objectFit="cover"
                      overflow="hidden"
                      borderRadius="md"
                      border="2px solid"
                      borderColor={isActive ? "primary.solid" : "border"}
                    />
                    <Text
                      fontSize="sm"
                      fontFamily="body"
                      flex={1}
                      color={isActive ? "fg" : "fg.muted"}
                    >
                      {option.name}
                    </Text>
                    {isActive && <LuCheck size={12} />}
                  </Flex>
                );
              })}
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};
