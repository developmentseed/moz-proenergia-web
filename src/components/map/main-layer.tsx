import { useMemo } from 'react';
import { Source, Layer as MapLayer, type LayerProps } from 'react-map-gl/maplibre';
import {
  type LayerSpecification,
  type FilterSpecification
} from 'maplibre-gl';
import { type Scenario, type Main } from '@/app/types';

function getColorAttributeNamebyType(type: string) {
  switch (type){
    case('fill'):
      return 'fill-color';
    case('line'):
      return 'line-color';
    default:
      return 'fill-color';
  }
}

interface MainLayerProps {
  scenario: Scenario;
  main: Main;
  mapFilter?: FilterSpecification | null;
  clusterId: string | null;
  hoveredCluster: string | null;
}

export const MainLayer = ({
  scenario,
  main,
  mapFilter,
  clusterId,
  hoveredCluster,
}: MainLayerProps) => {
  const mainLayer: LayerSpecification = useMemo(
    () => ({
      ...scenario.layer,
      id: main.id,
      paint: {
        [getColorAttributeNamebyType('fill')]: [
          'match',
          ['get', main.column],
          ...main.options.flatMap((val) => [val.value, val.color]),
          '#CCCCCC',
        ],
      },
      ...(mapFilter ? { filter: mapFilter } : {}),
    }),
    [main.id, main.column, main.options, scenario.layer, mapFilter]
  );
  
  const backgroundMainLayer: LayerSpecification = useMemo(
    () => ({
      id: main.id + 'bg',
      ...scenario.layer,
      paint: {
        [getColorAttributeNamebyType('fill')]: '#CCCCCC',
      },
    }),
    [main.id, scenario.layer]
  );

  const selectedClusterLayer: LayerSpecification = useMemo(
    () => ({
      ...scenario.layer,
      id: main.id + 'selected',
      type: 'line',
      paint: {
        'line-color': '#533',
        'line-width': 2,
      },
      filter: ['==', ['get', 'id'], clusterId],
    }),
    [main.id, scenario.layer, clusterId]
  );

  const hoveredClusterLayer: LayerSpecification = useMemo(
    () => ({
      ...scenario.layer,
      id: main.id + 'hovered',
      type: 'line',
      paint: {
        'line-color': '#979',
        'line-width': 2,
      },
      filter: ['==', ['get', 'id'], hoveredCluster],
    }),
    [main.id, scenario.layer, hoveredCluster]
  );

  return (
    <Source id={scenario.id} {...scenario.source}>
      <MapLayer {...mainLayer} />
      <MapLayer {...backgroundMainLayer} beforeId={main.id} />
      <MapLayer {...selectedClusterLayer} />
      <MapLayer {...hoveredClusterLayer} />
    </Source>
  );
};
