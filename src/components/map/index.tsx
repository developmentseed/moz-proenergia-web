import { useEffect, useMemo, useRef, useState } from "react";
import {
  Map,
  ViewStateChangeEvent,
  NavigationControl,
  ScaleControl,
  type MapLayerMouseEvent,
  type MapRef,
} from "react-map-gl/maplibre";
import { Box, Flex } from "@chakra-ui/react";
import * as pmtiles from "pmtiles";
import maplibregl from "maplibre-gl";
import { type RequestTransformFunction } from "maplibre-gl";
import {
  isMapboxURL,
  transformMapboxUrl,
} from "maplibregl-mapbox-request-transformer";
import * as COGProtocol from '@geomatico/maplibre-cog-protocol';
import "maplibre-gl/dist/maplibre-gl.css";
import "@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css";
import mapConfig from "@/config/map.json";
import { useModel } from "@/utils/context/model";
import { useFilters } from "@/utils/context/filters";
import { useMapCoords } from "@/utils/context/map-coords";
import { CenterMapControl } from './recenter-button';
import GeocoderControl from './geocoder-control';
import { type Main } from "@/app/types";
import { buildExpressionWithFilter } from "@/utils/map/filter";
import { Legend } from "./legend";
import { RasterContextualLayer, VectorContextualLayer } from "./contextual-layer";
import { MainLayer } from "./main-layer";
import { BasemapSelector, BASEMAP_OPTIONS } from "./basemap-selector";
import { useToggle } from "@/hooks/use-toggle";
import ShareButton from "./share-button";

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

export type FlyToFn = (lng: number, lat: number) => void;

interface MainMapProps {
  main: Main;
  onClick: (event: MapLayerMouseEvent) => void;
  clusterId: string | null;
  onFlyToRef: React.RefObject<FlyToFn | null>;
}

const MainMap = ({ main, onClick, clusterId, onFlyToRef }: MainMapProps) => {
  const { coords, setCoords } = useMapCoords();
  const { lat, lng, zoom } = coords;

  const { open } = useToggle(true);

  const mapRef = useRef<MapRef>(null);
  useEffect(() => {
    onFlyToRef.current = (lng, lat) =>
      mapRef.current?.flyTo({ center: [lng, lat], zoom: 14 });
  }, [onFlyToRef]);

  // Attach pmtile + cog protocol to MapLibre
  useEffect(() => {
    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    maplibregl.addProtocol('cog', COGProtocol.cogProtocol);
    return () => {
      maplibregl.removeProtocol("pmtiles");
      maplibregl.removeProtocol("cog");
    };
  }, []);

  const { model, scenarioId } = useModel();
  const { updatedFilters } = useFilters();

  const mapFilter = useMemo(() => {
    return buildExpressionWithFilter(model.filters, updatedFilters);
  }, [updatedFilters, model.filters]);

  const scenario = model.scenarios.find((s) => s.id === scenarioId)!;

  const [mainLayerOpacity, setMainLayerOpacity] = useState(100);
  const [currentBasemapId, setCurrentBasemapId] = useState("light");
  const selectedBasemap =
    BASEMAP_OPTIONS.find((o) => o.id === currentBasemapId) ?? BASEMAP_OPTIONS[0];

  useEffect(() => {
    if (clusterId !== null) {
      open();
    }
  }, [clusterId, open]);

  return (
    <Flex w="100%" h="100%" className="map-container" position="relative">
      {/* Map takes all remaining width */}
      <Box flex={1} h="full" position="relative" pb={{ base: 10, md: 0 }}>
        <Map
          ref={mapRef}
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
            setCoords({
              lng: e.viewState.longitude,
              lat: e.viewState.latitude,
              zoom: e.viewState.zoom,
            });
          }}
          mapStyle={selectedBasemap.styleUrl}
          transformRequest={transformRequest}
          interactiveLayerIds={zoom > 9 ? [main.id, main.id + '-line', main.id + '-circle'] : []}
      >
          <RasterContextualLayer beforeId={main.id + '-bg'} />
          <MainLayer
            scenario={scenario}
            main={main}
            mapFilter={mapFilter}
            clusterId={clusterId}
            opacity={mainLayerOpacity / 100}
        />
          <VectorContextualLayer />
          <ScaleControl position="bottom-left" />
          <NavigationControl showCompass={false} position="bottom-left" />
          <GeocoderControl
            position="bottom-left"
            collapsed={true}
            countries="mz"
            marker={false}
            showResultsWhileTyping={true}
            clearAndBlurOnEsc={true}
            zoom={12}
          />
          <CenterMapControl />
          <BasemapSelector
            currentBasemapId={currentBasemapId}
            onBasemapChange={setCurrentBasemapId}
          />
        </Map>
        <Legend items={main.options} main={main} onMainOpacityChange={setMainLayerOpacity} />
        <ShareButton />
      </Box>
    </Flex>
  );
};

export default MainMap;
