import { useEffect, useMemo, useCallback, useState } from "react";
import {
  Map,
  ViewStateChangeEvent,
  NavigationControl,
  ScaleControl,
} from "react-map-gl/maplibre";
import { Box, Flex } from "@chakra-ui/react";
import * as pmtiles from "pmtiles";
import * as maplibregl from "maplibre-gl";
import { type RequestTransformFunction } from "maplibre-gl";
import {
  isMapboxURL,
  transformMapboxUrl,
} from "maplibregl-mapbox-request-transformer";
import "maplibre-gl/dist/maplibre-gl.css";
import "@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css";
import mapConfig from "@/config/map.json";
import { useModel } from "@/utils/context/model";
import { useFilters } from "@/utils/context/filters";
import { useMapCoords } from "@/utils/context/map-coords";
import { CenterMapControl } from './recenter-button';
import GeocoderControl from './geocoder-control';
import { useMouseEvent } from "./hooks/use-mouse-event";
import { type Main } from "@/app/types";
import { buildExpressionWithFilter } from "@/utils/map/filter";
import SummaryPanel from "./summary-panel";
import { Legend } from "./legend";
import { ContextualLayer } from "./contextual-layer";
import { MainLayer } from "./main-layer";
import { BasemapSelector, BASEMAP_OPTIONS } from "./basemap-selector";
import { AnimationTime, ControlPanelWidth } from "../ui/main-panel";
import { useToggle } from "@/hooks/use-toggle";
import { PanelToggleButton } from "../ui/panel-toggle-button";
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

interface MainMapProps {
  main: Main;
}

const MainMap = ({ main }: MainMapProps) => {
  const { coords, setCoords } = useMapCoords();
  const { lat, lng, zoom } = coords;
  const { selected, setSelected, onClick } = useMouseEvent();
  const { isOpen, toggle, open } = useToggle(true);

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

  const [mainLayerOpacity, setMainLayerOpacity] = useState(100);
  const [currentBasemapId, setCurrentBasemapId] = useState("light");
  const selectedBasemap =
    BASEMAP_OPTIONS.find((o) => o.id === currentBasemapId) ?? BASEMAP_OPTIONS[0];

  const resetCluster = useCallback(() => {
    setSelected(null);
  }, [setSelected]);

  useEffect(() => {
    if (selected !== null) {
      open();
    }
  }, [selected, open]);

  return (
    <Flex w="100%" h="100%" className="map-container" position="relative">
      {/* Map takes all remaining width */}
      <Box flex={1} h="full" position="relative">
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
          <MainLayer
            scenario={scenario}
            main={main}
            mapFilter={mapFilter}
            clusterId={selected}
            opacity={mainLayerOpacity / 100}
        />
          <ContextualLayer />
          <ScaleControl position="bottom-left" />
          <NavigationControl showCompass={false} position="bottom-left" />
          <GeocoderControl
            position="bottom-left"
            collapsed={true}
            countries="mz"
            reverseGeocode={true}
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

      <PanelToggleButton
        isOpen={isOpen}
        onToggle={toggle}
        side="right"
        label="analysis panel"
        panelWidth={ControlPanelWidth}
        animationTime={AnimationTime}
      />

      {/* Summary panel slides in/out from the right */}
      <SummaryPanel
        clusterId={selected}
        scenarioId={scenarioId}
        popupFields={model.popupFields}
        summaryFields={model.summaryFields}
        filters={updatedFilters}
        filterDefs={model.filters}
        resetCluster={resetCluster}
        main={main}
        isOpen={isOpen}
      />
    </Flex>
  );
};

export default MainMap;
