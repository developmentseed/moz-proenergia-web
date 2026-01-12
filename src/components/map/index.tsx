import { useState, useEffect, useMemo } from 'react';
import { Map, Source, Layer as MapLayer, ViewStateChangeEvent } from 'react-map-gl/maplibre';
import { type LayerSpecification } from 'maplibre-gl';
import { Box } from '@chakra-ui/react';
import * as pmtiles from 'pmtiles';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useModel } from "@/utils/context/model";
import { useCoordinates } from './hooks/use-coordinates';
import { useCluster } from './hooks/use-cluster';
import { type Scenario, type Main } from '@/app/types';
import { buildExpressionWithFilter } from '@/utils/map/filter';
import SummaryPanel from './summary-panel';
import { Legend } from './legend';
import { ContextualLayer } from './contextual-layer';

interface MainMapProps {
scenario: Scenario;
 main: Main;
}

const MainMap = ({ scenario, main }: MainMapProps) => {
    const [{ lat, lng, zoom }, setCoordinates] = useCoordinates();
    const [hoveredCluster, setHoveredCluster] = useState(null);
    const { clusterId, setClusterId } = useCluster();

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
  const backgroundMainLayer:LayerSpecification = {
    id: main.id + 'bg',
      ...scenario.layer,
      paint: {
        'fill-color': "#CCCCCC"
      }
  };
  const selectedClusterLayer:LayerSpecification = {
    id: main.id + 'selected',
      ...scenario.layer,
      "type": "line",
      paint: {
        'line-color': "#533",
        'line-width': 2
      },
      filter:  ['==', ['get', 'id'], clusterId]
  };

  const hoveredClusterLayer:LayerSpecification = {
    id: main.id + 'hovered',
      ...scenario.layer,
      "type": "line",
      paint: {
        'line-color': "#979",
        'line-width': 2
      },
      filter:  ['==', ['get', 'id'], hoveredCluster],

  };

  const onHover = (event: MapLayerMouseEvent) => {
    const cluster = event.features && event.features[0];
    if (cluster) setHoveredCluster(cluster.properties.id);
    else setHoveredCluster(null);

  };
  const onClick = (e) => {
    if (e.features.length) {
      setClusterId(e.features[0].properties.id);
    } else {
      setClusterId(null);
    }
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
      onClick={onClick}
      onMouseMove={onHover}
      onMoveEnd={(e:ViewStateChangeEvent) => { setCoordinates({ lng: e.viewState.longitude, lat: e.viewState.latitude , zoom: e.viewState.zoom });}}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      interactiveLayerIds={[main.id]}
        >
      <ContextualLayer layers={additionalLayers} />
      <Source
        id={scenario.id}
        {...scenario.source}
          >
        <MapLayer {...backgroundMainLayer}></MapLayer>
        <MapLayer {...mainLayer}></MapLayer>
        {clusterId && <MapLayer {...selectedClusterLayer}></MapLayer>}
        <MapLayer {...hoveredClusterLayer}></MapLayer>

      </Source>

    </Map>
    <SummaryPanel clusterId={clusterId} />
  </Box>;
};

export default MainMap;