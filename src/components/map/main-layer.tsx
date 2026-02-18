import { useMemo, useState, useEffect } from 'react';
import { Source, Layer as MapLayer, useMap } from 'react-map-gl/maplibre';
import {
  type LayerSpecification,
  type FilterSpecification,
  type ExpressionSpecification,
} from 'maplibre-gl';
import mapConfig from '@/config/map.json';
import { DEFAULT_COL } from '@/utils/api';
import { buildMatchExpression } from '@/utils/map/filter';
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
}

export const MainLayer = ({
  scenario,
  main,
  mapFilter,
  clusterId,
}: MainLayerProps) => {
  const { current: map } = useMap();
  const [hoveredCluster, setHoveredCluster] = useState<string | null>(null);

  // Handle hover events directly on the map - so we can avoid re-render of the whole map related components
  useEffect(() => {
    if (!map) return;

    const handleMouseMove = (e: maplibregl.MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      setHoveredCluster(feature?.properties?.id ?? null);
    };

    const handleMouseLeave = () => {
      setHoveredCluster(null);
    };

    map.on('mousemove', main.id, handleMouseMove);
    map.on('mouseleave', main.id, handleMouseLeave);

    return () => {
      map.off('mousemove', main.id, handleMouseMove);
      map.off('mouseleave', main.id, handleMouseLeave);
    };
  }, [map, main.id]);
  const symbolImageIds = useMemo(
    () => main.options.map((opt) => ({
      value: opt.value,
      imageId: `${main.id}-symbol-${opt.value}`,
      color: opt.color || '#CCCCCC',
    })),
    [main.id, main.options]
  );

  useEffect(() => {
    if (!map || symbolImageIds.length === 0) return;

    const addedIds: string[] = [];

    for (const { imageId, color } of symbolImageIds) {
      if (map.hasImage(imageId)) continue;
      const svgText = `<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="5" fill="${color}" /></svg>`;
      const src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText);
      const image = new Image();
      image.onload = () => {
        if (!map.hasImage(imageId)) {
          map.addImage(imageId, image);
          addedIds.push(imageId);
        }
      };
      image.src = src;
    }

    return () => {
      try {
        for (const id of addedIds) {
          if (map.hasImage(id)) {
            map.removeImage(id);
          }
        }
      } catch {
        // Map already removed
      }
    };
  }, [map, symbolImageIds]);

  const mainLayer: LayerSpecification = useMemo(
    () => ({
      ...scenario.layer,
      id: main.id,
      minzoom: mapConfig.polygonMinZoom,
      paint: {
        [getColorAttributeNamebyType('fill')]: buildMatchExpression(main, '#66ff'),
      },
      ...(mapFilter ? { filter: mapFilter } : {}),
    }),
    [main, scenario.layer, mapFilter]
  );

  // To show clusters on low zoom
  const symbolMainLayer:LayerSpecification = useMemo(
    () => ({
      source: scenario.layer.source,
      "source-layer": scenario.layer['source-layer'],
      id: main.id + '-symbol',
      type: 'symbol' as const,
      minzoom: mapConfig.minZoom,
      maxzoom: mapConfig.polygonMinZoom,
      layout: {
        'symbol-placement': 'point',
        'icon-image': symbolImageIds.length ? [
          'match',
          main.column === DEFAULT_COL ? ['literal', DEFAULT_COL] : ['get', main.column],
          ...symbolImageIds.flatMap(({ value, imageId }) => [value, imageId]),
          '',
        ] as ExpressionSpecification : '',
        'icon-overlap': 'always',
        'icon-size': ["interpolate", ["linear"], ["zoom"], mapConfig.minZoom, 0.02, mapConfig.polygonMinZoom, 0.03],
      },
      ...(mapFilter ? { filter: mapFilter } : {}),
    }),
    [main.id, main.column, scenario.layer, symbolImageIds, mapFilter]
  );

  // Show all the data with muted colors so users know which ones are filtered
  const backgroundMainLayer: LayerSpecification = useMemo(
    () => ({
      id: main.id + 'bg',
      ...scenario.layer,
      minzoom: mapConfig.polygonMinZoom,
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
    <Source key={scenario.id} id={scenario.id} {...scenario.source}>
      <MapLayer {...mainLayer} />
      <MapLayer {...backgroundMainLayer} beforeId={main.id} />
      <MapLayer {...symbolMainLayer} />
      <MapLayer {...selectedClusterLayer} />
      <MapLayer {...hoveredClusterLayer} />
    </Source>
  );
};
