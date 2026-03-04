import { useMemo, useState, useEffect } from 'react';
import { Source, Layer as MapLayer, useMap } from 'react-map-gl/maplibre';
import {
  type LayerSpecification,
  type FilterSpecification,
} from 'maplibre-gl';
import mapConfig from '@/config/map.json';
import { buildMatchExpression } from '@/utils/map/filter';
import { type Scenario, type Main } from '@/app/types';

// Combine geometry-type filter with an optional map filter
function withGeometryFilter(
  geometryType: string,
  extra?: FilterSpecification | null,
): FilterSpecification {
  const geo: FilterSpecification = ['==', ['geometry-type'], geometryType];
  return extra ? ['all', geo, extra] as FilterSpecification : geo;
}

interface MainLayerProps {
  scenario: Scenario;
  main: Main;
  mapFilter?: FilterSpecification | null;
  clusterId: string | null;
}

//@TODO different cartography per model
export const MainLayer = ({
  scenario,
  main,
  mapFilter,
  clusterId,
}: MainLayerProps) => {
  const { current: map } = useMap();
  const [hoveredCluster, setHoveredCluster] = useState<string | null>(null);

  const lineLayerId = main.id + '-line';
  const circleLayerId = main.id + '-circle';

  // Handle hover events on all geometry layer types
  useEffect(() => {
    if (!map) return;

    const handleMouseMove = (e: maplibregl.MapLayerMouseEvent) => {
      if (map.getZoom() <= 9) {
        setHoveredCluster(null);
        return;
      }
      const feature = e.features?.[0];
      setHoveredCluster(feature?.properties?.id ?? null);
    };

    const handleMouseLeave = () => {
      setHoveredCluster(null);
    };

    const layerIds = [main.id, lineLayerId, circleLayerId];
    for (const id of layerIds) {
      map.on('mousemove', id, handleMouseMove);
      map.on('mouseleave', id, handleMouseLeave);
    }

    return () => {
      for (const id of layerIds) {
        map.off('mousemove', id, handleMouseMove);
        map.off('mouseleave', id, handleMouseLeave);
      }
    };
  }, [map, main.id, lineLayerId, circleLayerId]);

  // --- Main visualization layers (one per geometry type) ---
  const mainFillLayer: LayerSpecification = useMemo(
    () => ({
      source: scenario.layer.source,
      'source-layer': scenario.layer['source-layer'],
      id: main.id,
      type: 'fill' as const,
      paint: {
        'fill-color': buildMatchExpression(main, '#66ff'),
      },
      filter: withGeometryFilter('Polygon', mapFilter),
    }),
    [main, scenario.layer, mapFilter],
  );

  const mainLineLayer: LayerSpecification = useMemo(
    () => ({
      source: scenario.layer.source,
      'source-layer': scenario.layer['source-layer'],
      id: lineLayerId,
      type: 'line' as const,
      paint: {
        'line-color': buildMatchExpression(main, '#66ff'),
        'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.5, 10, 1.5, 15, 3],
        'line-opacity': 0.8,
      },
      filter: withGeometryFilter('LineString', mapFilter),
    }),
    [main, lineLayerId, scenario.layer, mapFilter],
  );

  const mainCircleLayer: LayerSpecification = useMemo(
    () => ({
      source: scenario.layer.source,
      'source-layer': scenario.layer['source-layer'],
      id: circleLayerId,
      type: 'circle' as const,
      paint: {
        'circle-color': buildMatchExpression(main, '#66ff'),
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 2, 10, 5, 15, 6],
        'circle-opacity': 0.8,
        'circle-stroke-color': '#fff',
        'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 5, 0, 10, 0.5, 15, 1],
      },
      filter: withGeometryFilter('Point', mapFilter),
    }),
    [main, circleLayerId, scenario.layer, mapFilter],
  );

  // --- Background layers (muted, so users see which features are filtered out) ---
  const bgFillLayer: LayerSpecification = useMemo(
    () => ({
      id: main.id + '-bg',
      source: scenario.layer.source,
      'source-layer': scenario.layer['source-layer'],
      type: 'fill' as const,
      minzoom: mapConfig.polygonMinZoom,
      paint: { 'fill-color': '#CCCCCC' },
      filter: ['==', ['geometry-type'], 'Polygon'] as FilterSpecification,
    }),
    [main.id, scenario.layer],
  );

  const bgLineLayer: LayerSpecification = useMemo(
    () => ({
      id: main.id + '-bg-line',
      source: scenario.layer.source,
      'source-layer': scenario.layer['source-layer'],
      type: 'line' as const,
      minzoom: mapConfig.polygonMinZoom,
      paint: { 'line-color': '#CCCCCC', 'line-width': 1, 'line-opacity': 0.5 },
      filter: ['==', ['geometry-type'], 'LineString'] as FilterSpecification,
    }),
    [main.id, scenario.layer],
  );

  const bgCircleLayer: LayerSpecification = useMemo(
    () => ({
      id: main.id + '-bg-circle',
      source: scenario.layer.source,
      'source-layer': scenario.layer['source-layer'],
      type: 'circle' as const,
      minzoom: mapConfig.polygonMinZoom,
      paint: {
        'circle-color': '#CCCCCC',
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 2, 10, 5, 15, 6],
        'circle-opacity': 0.5,
      },
      filter: ['==', ['geometry-type'], 'Point'] as FilterSpecification,
    }),
    [main.id, scenario.layer],
  );

  // --- Selected cluster highlight layers ---
  const selectedFillLayer: LayerSpecification = useMemo(
    () => ({
      source: scenario.layer.source,
      'source-layer': scenario.layer['source-layer'],
      id: main.id + '-selected',
      type: 'line' as const,
      paint: { 'line-color': '#533', 'line-width': 2 },
      filter: ['all',
        ['==', ['geometry-type'], 'Polygon'],
        ['==', ['get', 'id'], clusterId],
      ] as FilterSpecification,
    }),
    [main.id, scenario.layer, clusterId],
  );

  const selectedLineLayer: LayerSpecification = useMemo(
    () => ({
      source: scenario.layer.source,
      'source-layer': scenario.layer['source-layer'],
      id: main.id + '-selected-line',
      type: 'line' as const,
      paint: { 'line-color': '#533', 'line-width': 4 },
      filter: ['all',
        ['==', ['geometry-type'], 'LineString'],
        ['==', ['get', 'id'], clusterId],
      ] as FilterSpecification,
    }),
    [main.id, scenario.layer, clusterId],
  );

  const selectedCircleLayer: LayerSpecification = useMemo(
    () => ({
      source: scenario.layer.source,
      'source-layer': scenario.layer['source-layer'],
      id: main.id + '-selected-circle',
      type: 'circle' as const,
      paint: {
        'circle-color': 'transparent',
        'circle-radius': 8,
        'circle-stroke-color': '#533',
        'circle-stroke-width': 2,
      },
      filter: ['all',
        ['==', ['geometry-type'], 'Point'],
        ['==', ['get', 'id'], clusterId],
      ] as FilterSpecification,
    }),
    [main.id, scenario.layer, clusterId],
  );

  // --- Hovered cluster highlight layers ---
  const hoveredFillLayer: LayerSpecification = useMemo(
    () => ({
      source: scenario.layer.source,
      'source-layer': scenario.layer['source-layer'],
      id: main.id + '-hovered',
      type: 'line' as const,
      paint: { 'line-color': '#979', 'line-width': 2 },
      filter: ['all',
        ['==', ['geometry-type'], 'Polygon'],
        ['==', ['get', 'id'], hoveredCluster],
      ] as FilterSpecification,
    }),
    [main.id, scenario.layer, hoveredCluster],
  );

  const hoveredLineLayer: LayerSpecification = useMemo(
    () => ({
      source: scenario.layer.source,
      'source-layer': scenario.layer['source-layer'],
      id: main.id + '-hovered-line',
      type: 'line' as const,
      paint: { 'line-color': '#979', 'line-width': 4 },
      filter: ['all',
        ['==', ['geometry-type'], 'LineString'],
        ['==', ['get', 'id'], hoveredCluster],
      ] as FilterSpecification,
    }),
    [main.id, scenario.layer, hoveredCluster],
  );

  const hoveredCircleLayer: LayerSpecification = useMemo(
    () => ({
      source: scenario.layer.source,
      'source-layer': scenario.layer['source-layer'],
      id: main.id + '-hovered-circle',
      type: 'circle' as const,
      paint: {
        'circle-color': 'transparent',
        'circle-radius': 8,
        'circle-stroke-color': '#979',
        'circle-stroke-width': 2,
      },
      filter: ['all',
        ['==', ['geometry-type'], 'Point'],
        ['==', ['get', 'id'], hoveredCluster],
      ] as FilterSpecification,
    }),
    [main.id, scenario.layer, hoveredCluster],
  );

  return (
    <Source key={scenario.id} id={scenario.id} {...scenario.source}>
      {/* Background layers (behind main) */}
      <MapLayer {...bgFillLayer} />
      <MapLayer {...bgLineLayer} />
      <MapLayer {...bgCircleLayer} />
      {/* Main visualization layers */}
      <MapLayer {...mainFillLayer} />
      <MapLayer {...mainLineLayer} />
      <MapLayer {...mainCircleLayer} />
      {/* Selected cluster highlights */}
      <MapLayer {...selectedFillLayer} />
      <MapLayer {...selectedLineLayer} />
      <MapLayer {...selectedCircleLayer} />
      {/* Hovered cluster highlights */}
      <MapLayer {...hoveredFillLayer} />
      <MapLayer {...hoveredLineLayer} />
      <MapLayer {...hoveredCircleLayer} />
    </Source>
  );
};
