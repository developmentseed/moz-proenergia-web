import { useEffect, useMemo, useCallback } from 'react';
import { Map, ViewStateChangeEvent, NavigationControl } from 'react-map-gl/maplibre';
import { Box } from '@chakra-ui/react';
import * as pmtiles from 'pmtiles';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useModel } from "@/utils/context/model";
import { useFilters } from "@/utils/context/filters";
import { useCoordinates } from './hooks/use-coordinates';
import { useMouseEvent } from './hooks/use-mouse-event';
import { type Main } from '@/app/types';
import { buildExpressionWithFilter } from '@/utils/map/filter';
import SummaryPanel from './summary-panel';
import { Legend } from './legend';
import { ContextualLayer } from './contextual-layer';
import { MainLayer } from './main-layer';

interface MainMapProps {
 main: Main;
}

const MainMap = ({ main }: MainMapProps) => {
    const [{ lat, lng, zoom }, setCoordinates] = useCoordinates();
    const { selected, setSelected, onClick } = useMouseEvent();

  // Attach pmtile protocol to MapLibre
  useEffect(() => {
    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);
    return () => {
      maplibregl.removeProtocol('pmtiles');
    };
  },[]);

  const { model, scenarioId } = useModel();
  const { filters } = useFilters();

  const mapFilter = useMemo(() => {
    return buildExpressionWithFilter(model.filters, filters);
  }, [filters, model.filters]);

  const scenario = model.scenarios.find(s => s.id === scenarioId)!;

  const resetCluster = useCallback(() => {
    setSelected(null);
  }, [setSelected]);

  return <Box w='100%' h='100%' className="map-container" position="relative">
    <Map
      initialViewState={{
            longitude: lng,
            latitude: lat,
            zoom: zoom
          }}
      style={{ width: '100%', height: '100%' }}
      onClick={onClick}
      onMoveEnd={(e:ViewStateChangeEvent) => { setCoordinates({ lng: e.viewState.longitude, lat: e.viewState.latitude , zoom: e.viewState.zoom });}}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      interactiveLayerIds={[main.id, main.id + 'bg']}
        >
      <ContextualLayer mainId={main.id} />
      <MainLayer
        scenario={scenario}
        main={main}
        mapFilter={mapFilter}
        clusterId={selected}
      />
      <NavigationControl position='bottom-left' />
    </Map>
    <Legend items={main.options} />
    <SummaryPanel clusterId={selected} scenarioId={scenarioId} popupFields={model.popupFields} summaryFields={model.summaryFields} filters={filters} filterDefs={model.filters} resetCluster={resetCluster} />
  </Box>;
};

export default MainMap;