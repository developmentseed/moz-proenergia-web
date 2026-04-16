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
import { zIndex } from "@/components/ui/constant";
import { BASE_PATH } from "@/config/website";
import type { StyleSpecification } from "maplibre-gl";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Mapbox Static Images API — centered on Mozambique
const thumbnail = (styleId: string) =>
  `https://api.mapbox.com/styles/v1/${styleId}/static/36,-20,2,0/200x200@2x?access_token=${MAPBOX_TOKEN}`;

const BING_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    bing: {
      type: "raster",
      scheme: "xyz",
      tiles: [
        "https://ecn.t0.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587&mkt=en-gb&n=z",
        "https://ecn.t1.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587&mkt=en-gb&n=z",
        "https://ecn.t2.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587&mkt=en-gb&n=z",
        "https://ecn.t3.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587&mkt=en-gb&n=z",
      ],
      tileSize: 256,
      maxzoom: 20,
      attribution: "Imagery © Microsoft Corporation",
    },
  },
  layers: [{ id: "imagery", type: "raster", source: "bing" }],
};

const ESRI_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    esri: {
      type: "raster",
      scheme: "xyz",
      tiles: [
        "https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?blankTile=false",
        "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?blankTile=false",
      ],
      tileSize: 256,
      maxzoom: 20,
      attribution: "Imagery © Esri",
    },
  },
  layers: [{ id: "imagery", type: "raster", source: "esri" }],
};

export interface BasemapOption {
  id: string;
  name: string;
  /** Mapbox style URL, local JSON path, or inline MapLibre StyleSpecification */
  styleUrl: string | StyleSpecification;
  thumbnailUrl: string;
}

export const BASEMAP_OPTIONS: BasemapOption[] = [
  {
    id: "light",
    name: "Light",
    styleUrl: `${BASE_PATH}/basemap-style.json`,
    thumbnailUrl: thumbnail("mapbox/light-v11"),
  },
  {
    id: "dark",
    name: "Dark",
    styleUrl: `${BASE_PATH}/dark-basemap-style.json`,
    thumbnailUrl: thumbnail("mapbox/dark-v11"),
  },
  {
    id: "satellite",
    name: "Mapbox Satellite",
    styleUrl: "mapbox://styles/mapbox/satellite-v9",
    thumbnailUrl: thumbnail("mapbox/satellite-v9"),
  },
  {
    id: "bing",
    name: "Bing Satellite",
    styleUrl: BING_STYLE,
    thumbnailUrl: "https://ecn.t0.tiles.virtualearth.net/tiles/a1203.jpeg?g=587&mkt=en-gb&n=z",
  },
  {
    id: "esri",
    name: "Esri Satellite",
    styleUrl: ESRI_STYLE,
    thumbnailUrl: "https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/4/9/9",
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
          left="10px"
          size="xs"
          variant="surface"
          zIndex={zIndex.mapControl}
          bg={`url(${current.thumbnailUrl})`}
          bgSize="cover"
          borderWidth="0"
          color={["light"].includes(current.id) ? "fg.muted" : "white"}
          _hover={{ opacity: 0.85 }}
        >
          <LuMap />
        </IconButton>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content maxW="13rem" zIndex={zIndex.mapPopover}>
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
