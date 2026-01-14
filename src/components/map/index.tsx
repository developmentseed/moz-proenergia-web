import { useEffect, useMemo } from 'react';
import { Map, ViewStateChangeEvent } from 'react-map-gl/maplibre';
import { Box } from '@chakra-ui/react';
import * as pmtiles from 'pmtiles';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useModel } from "@/utils/context/model";
import { useCoordinates } from './hooks/use-coordinates';
import { useMouseEvent } from './hooks/use-mouse-event';
import { type Scenario, type Main } from '@/app/types';
import { buildExpressionWithFilter } from '@/utils/map/filter';
import SummaryPanel from './summary-panel';
import { Legend } from './legend';
import { ContextualLayer } from './contextual-layer';
import { MainLayer } from './main-layer';

interface MainMapProps {
scenario: Scenario;
 main: Main;
}

const MainMap = ({ scenario, main }: MainMapProps) => {
    const [{ lat, lng, zoom }, setCoordinates] = useCoordinates();
    const { selected, setSelected, hovered, onHover, onClick } = useMouseEvent();

  // Attach pmtile protocol to MapLibre
  useEffect(() => {
    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);
    return () => {
      maplibregl.removeProtocol('pmtiles');
    };
  },[]);

  const { model, filters, activeLayers } = useModel();

  const additionalLayers = model.layers.filter(l => activeLayers.includes(l.id));

  const mapFilter = useMemo(() => {
    return buildExpressionWithFilter(model.filters, filters);
  }, [filters, model.filters]);

  return <Box w='100%' h='100%' className="map-container" position="relative">
    <Legend items={main.options} />
    <Map
      initialViewState={{
            longitude: lng,
            latitude: lat,
            zoom: zoom
          }}
      style={{ width: '100%', height: '100%' }}
      onClick={onClick}
      onMouseMove={onHover}
      onMoveEnd={(e:ViewStateChangeEvent) => { setCoordinates({ lng: e.viewState.longitude, lat: e.viewState.latitude , zoom: e.viewState.zoom });}}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      interactiveLayerIds={[main.id]}
        >
      <ContextualLayer layers={additionalLayers} />
      <MainLayer
        scenario={scenario}
        main={main}
        mapFilter={mapFilter}
        clusterId={selected}
        hoveredCluster={hovered}
      />
    </Map>
    <SummaryPanel clusterId={selected} resetCluster={() => { setSelected(null); }} filters={filters}/>
  </Box>;
};

export default MainMap;