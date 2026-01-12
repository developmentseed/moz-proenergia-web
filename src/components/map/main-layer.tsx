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
      id: main.id,
      ...scenario.layer,
      paint: {
        [getColorAttributeNamebyType(scenario.layer.type)]: [
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
        [getColorAttributeNamebyType(scenario.layer.type)]: '#CCCCCC',
      },
    }),
    [main.id, scenario.layer]
  );

  const selectedClusterLayer: LayerSpecification = useMemo(
    () => ({
      id: main.id + 'selected',
      ...scenario.layer,
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
      id: main.id + 'hovered',
      ...scenario.layer,
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
      <MapLayer {...backgroundMainLayer} />
      <MapLayer {...mainLayer} />
      <MapLayer {...selectedClusterLayer} />
      <MapLayer {...hoveredClusterLayer} />
    </Source>
  );
};
