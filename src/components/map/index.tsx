import { useEffect, useMemo } from 'react';
import { Map, Source, Layer as MapLayer, ViewStateChangeEvent } from 'react-map-gl/maplibre';
import { type LayerSpecification } from 'maplibre-gl';
import { Box } from '@chakra-ui/react';
import * as pmtiles from 'pmtiles';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useModel } from "@/utils/context/model";
import { useCoordinates } from './hooks/use-coordinates';
import { type Scenario, type Main } from '@/app/types';
import { buildExpressionWithFilter } from '@/utils/map/filter';
import { Legend } from './legend';

interface MainMapProps {
scenario: Scenario;
 main: Main;
}

const MainMap = ({ scenario, main }: MainMapProps) => {
    const [{ lat, lng, zoom }, setCoordinates] = useCoordinates();

  // Attach pmtile protocol to MapLibre
  useEffect(() => {
    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);
    return () => {
      maplibregl.removeProtocol('pmtiles');
    };
  },[]);

  const { model, filters } = useModel();
  const mapFilter = useMemo(() => {
    return buildExpressionWithFilter(model.filters, filters);
  }, [filters, model.filters]);

  const mainLayer:LayerSpecification = {
    id: main.id,
      ...scenario.layer,
      paint: {
        // @ts-expect-error how should I handle this?
        'fill-color': [
          "match",
          ["get", main.column],
          ...main.options.flatMap (val => [val.value, val.color]),
          "#CCCCCC"
        ]
      },
      ...(mapFilter ? { filter: mapFilter } : {})
  };

  return <Box w='100%' h='100%' className="map-container" position="relative">
    <Legend items={main.options} />
    <Map
      initialViewState={{
            longitude: lng,
            latitude: lat,
            zoom: zoom
          }}
      style={{ width: '100%', height: '100%' }}
          // onClick={onHover}
      onMoveEnd={(e:ViewStateChangeEvent) => { setCoordinates({ lng: e.viewState.longitude, lat: e.viewState.latitude , zoom: e.viewState.zoom });}}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      interactiveLayerIds={[main.id]}
        >
      <Source
        id={scenario.id}
        {...scenario.source}
          >
        <MapLayer {...mainLayer}></MapLayer>
      </Source>
    </Map>
  </Box>;
};

export default MainMap;