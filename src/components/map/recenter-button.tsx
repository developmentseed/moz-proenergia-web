import {
  useMap
} from "react-map-gl/maplibre";

import { useCallback } from "react";
import { IconButton } from "@chakra-ui/react";
import { LuScan } from "react-icons/lu";
import {
  DEFAULT_COORDS,
  DEFAULT_ZOOM,
} from "@/utils/context/map-coords";
import { useMapCoords } from "@/utils/context/map-coords";
import { controlZIndex } from "./control-constant";

export function CenterMapControl() {
  const { current: map } = useMap();
  const { coords } = useMapCoords();
  const { lat: viewLat, lng: viewLng, zoom: viewZoom } = coords;

  const resetCenter = useCallback(() => {
    if (!map) return;
    map.flyTo({
      center: [DEFAULT_COORDS[1], DEFAULT_COORDS[0]],
      zoom: DEFAULT_ZOOM,
    });
  }, [map]);

  const isInitialViewState =
    viewLng === DEFAULT_COORDS[1] &&
    viewLat === DEFAULT_COORDS[0] &&
    viewZoom === DEFAULT_ZOOM;

  return (
    <IconButton
      aria-label="Center map"
      bg="bg"
      position="absolute"
      bottom={28}
      left={2}
      size="xs"
      variant="surface"
      zIndex={controlZIndex}
      onClick={resetCenter}
      _hover={{ bg: "bg.muted" }}
      disabled={isInitialViewState}
    >
      <LuScan />
    </IconButton>
  );
}