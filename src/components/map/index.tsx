import { useEffect, useMemo, useCallback } from "react";
import {
  Map,
  ViewStateChangeEvent,
  NavigationControl,
  useMap,
  ScaleControl,
} from "react-map-gl/maplibre";
import { Box, IconButton } from "@chakra-ui/react";
import * as pmtiles from "pmtiles";
import * as maplibregl from "maplibre-gl";
import { type RequestTransformFunction } from "maplibre-gl";
import {
  isMapboxURL,
  transformMapboxUrl,
} from "maplibregl-mapbox-request-transformer";
import "maplibre-gl/dist/maplibre-gl.css";
import mapConfig from "@/config/map.json";
import { useModel } from "@/utils/context/model";
import { useFilters } from "@/utils/context/filters";
import { useCoordinates } from "./hooks/use-coordinates";
import { useMouseEvent } from "./hooks/use-mouse-event";
import { type Main } from "@/app/types";
import { buildExpressionWithFilter } from "@/utils/map/filter";
import SummaryPanel from "./summary-panel";
import { Legend } from "./legend";
import { ContextualLayer } from "./contextual-layer";
import { MainLayer } from "./main-layer";
import basemapStyle from "./basemap-style.json";
import { LuScan } from "react-icons/lu";

const transformRequest: RequestTransformFunction = (url, resourceType) => {
  if (isMapboxURL(url)) {
    return transformMapboxUrl(
      url,
      resourceType,
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    );
  }
  return { url };
};

interface MainMapProps {
  main: Main;
}
function CenterMapControl() {
  const [{ lat, lng, zoom }] = useCoordinates();
  const { current: map } = useMap();
  const resetCenter = useCallback(() => {
    if (!map) return;
    map.flyTo({
      center: [lng, lat],
      zoom: zoom,
    });
  }, [map]);

  return (
    <IconButton
      aria-label="Center map"
      bg="bg"
      position="absolute"
      bottom={28}
      left={2}
      size="xs"
      variant="surface"
      zIndex={1000}
      onClick={resetCenter}
    >
      <LuScan />
    </IconButton>
  );
}

const MainMap = ({ main }: MainMapProps) => {
  const [{ lat, lng, zoom }, setCoordinates] = useCoordinates();
  const { selected, setSelected, onClick } = useMouseEvent();

  // Attach pmtile protocol to MapLibre
  useEffect(() => {
    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  const { model, scenarioId } = useModel();
  const { updatedFilters } = useFilters();

  const mapFilter = useMemo(() => {
    return buildExpressionWithFilter(model.filters, updatedFilters);
  }, [updatedFilters, model.filters]);

  const scenario = model.scenarios.find((s) => s.id === scenarioId)!;

  const resetCluster = useCallback(() => {
    setSelected(null);
  }, [setSelected]);

  return (
    <Box w="100%" h="100%" className="map-container" position="relative">
      <Map
        initialViewState={{
          longitude: lng,
          latitude: lat,
          zoom: zoom,
          padding: { top: 20, bottom: 20, left: 20, right: 20 },
        }}
        dragRotate={false}
        touchZoomRotate={false}
        minZoom={mapConfig.minZoom}
        style={{ width: "100%", height: "100%" }}
        onClick={onClick}
        onMoveEnd={(e: ViewStateChangeEvent) => {
          setCoordinates({
            lng: e.viewState.longitude,
            lat: e.viewState.latitude,
            zoom: e.viewState.zoom,
          });
        }}
        // @ts-expect-error mapbox style to maplibre style
        mapStyle={basemapStyle}
        validateStyle={false}
        transformRequest={transformRequest}
        interactiveLayerIds={zoom > 9 ? [main.id] : []}
      >
        <ContextualLayer mainId={main.id} />
        <MainLayer
          scenario={scenario}
          main={main}
          mapFilter={mapFilter}
          clusterId={selected}
        />
        <ScaleControl position="bottom-left" />
        <NavigationControl showCompass={false} position="bottom-left" />
        <CenterMapControl />
      </Map>
      <Legend items={main.options} />
      <SummaryPanel
        clusterId={selected}
        scenarioId={scenarioId}
        popupFields={model.popupFields}
        summaryFields={model.summaryFields}
        filters={updatedFilters}
        filterDefs={model.filters}
        resetCluster={resetCluster}
      />
    </Box>
  );
};

export default MainMap;
