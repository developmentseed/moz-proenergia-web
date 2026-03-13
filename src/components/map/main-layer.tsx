import { useMemo, useState, useEffect } from 'react';
import { Source, Layer as MapLayer, useMap } from 'react-map-gl/maplibre';
import {
  LngLatBounds,
  type LayerSpecification,
  type FilterSpecification,
} from 'maplibre-gl';
import mapConfig from '@/config/map.json';
import { buildMatchExpression } from '@/utils/map/filter';
import { type Scenario, type Main } from '@/app/types';
import { MOZ_BOUNDS } from './hooks/use-coordinates';

// Compute a LngLatBounds from any supported GeoJSON geometry type
function geometryBounds(geometry: GeoJSON.Geometry): LngLatBounds | null {
  const bounds = new LngLatBounds();
  const extend = (c: GeoJSON.Position) => bounds.extend([c[0], c[1]]);

  if (geometry.type === 'Point') {
    extend(geometry.coordinates);
  } else if (geometry.type === 'LineString' || geometry.type === 'MultiPoint') {
    geometry.coordinates.forEach(extend);
  } else if (geometry.type === 'Polygon') {
    geometry.coordinates[0].forEach(extend);
  } else if (geometry.type === 'MultiLineString') {
    geometry.coordinates.forEach((line) => line.forEach(extend));
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach((poly) => poly[0].forEach(extend));
  } else {
    return null;
  }
  return bounds.isEmpty() ? null : bounds;
}

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
  opacity?: number; // 0–1
}

//@TODO different cartography per model
export const MainLayer = ({
  scenario,
  main,
  mapFilter,
  clusterId,
  opacity = 1,
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

  // Pan/zoom the map to the selected cluster.
  //
  // querySourceFeatures only searches tiles currently in MapLibre's cache
  // (the visible viewport), so we use a three-step strategy:
  //
  //   1. Attempt immediately — works when the feature is already on screen.
  //   2. Wait for the map to finish loading its initial tiles, then retry —
  //      handles the URL-load case where tiles are still in flight.
  //   3. If still not found, snap the viewport to the full country extent
  //      (no animation) so MapLibre loads tiles for all of Mozambique, then
  //      do one final attempt — handles searching for off-screen clusters.
  //
  // NOTE: `idle` only fires on a transition *to* idle, not if the map is
  // already idle (the common case after the user types in the search box).
  // We detect this with map.loaded() and skip straight to step 3 when needed.
  useEffect(() => {
    if (!map || !clusterId) return;

    // Query the vector tile source for a feature matching the given id value.
    // The id property is stored as a number in the tiles but arrives as a
    // string from URL state, so both types are tried by the caller.
    const queryFeatureById = (idValue: string | number) =>
      map.querySourceFeatures(scenario.id, {
        sourceLayer: scenario.layer['source-layer'],
        filter: ['==', ['get', 'id'], idValue],
      });

    // Fly to or fit the map to the given GeoJSON geometry.
    const flyToGeometry = (geometry: GeoJSON.Geometry) => {
      const bounds = geometryBounds(geometry);
      if (!bounds) return;
      if (geometry.type === 'Point') {
        map.flyTo({ center: bounds.getCenter(), zoom: Math.max(map.getZoom(), 12) });
      } else {
        map.fitBounds(bounds, { padding: 80, maxZoom: 14 });
      }
    };

    // Find the cluster in loaded tiles and navigate to it. Returns true if
    // the feature was found (regardless of whether it had usable geometry).
    const findClusterAndNavigate = () => {
      // Try string id first (URL state), then numeric (tile storage format).
      const features =
        queryFeatureById(clusterId).length > 0
          ? queryFeatureById(clusterId)
          : queryFeatureById(Number(clusterId));

      if (features.length === 0) return false;
      const { geometry } = features[0];
      if (geometry) flyToGeometry(geometry);
      return true;
    };

    // Step 1: immediate attempt.
    if (findClusterAndNavigate()) return;

    let canceled = false;
    let onCountryTilesLoaded: (() => void) | null = null;

    // Step 3: snap to country extent (no animation) so MapLibre fetches tiles
    // for all of Mozambique, then do one final query once those tiles settle.
    const loadCountryTilesAndRetry = () => {
      onCountryTilesLoaded = () => {
        if (!canceled) findClusterAndNavigate();
      };
      map.fitBounds(MOZ_BOUNDS, { animate: false, maxZoom: 5 });
      map.once('idle', onCountryTilesLoaded);
    };

    // Step 2: called once the current viewport's tiles have finished loading.
    const onViewportTilesLoaded = () => {
      if (canceled) return;
      if (!findClusterAndNavigate()) loadCountryTilesAndRetry();
    };

    if (map.loaded()) {
      onViewportTilesLoaded();
    } else {
      map.once('idle', onViewportTilesLoaded);
    }

    return () => {
      canceled = true;
      map.off('idle', onViewportTilesLoaded);
      if (onCountryTilesLoaded) map.off('idle', onCountryTilesLoaded);
    };
  }, [clusterId, map, scenario.id, scenario.layer]);

  // --- Main visualization layers (one per geometry type) ---
  const mainFillLayer: LayerSpecification = useMemo(
    () => ({
      source: scenario.layer.source,
      'source-layer': scenario.layer['source-layer'],
      id: main.id,
      type: 'fill' as const,
      paint: {
        'fill-color': buildMatchExpression(main, '#66ff'),
        'fill-opacity': opacity,
      },
      filter: withGeometryFilter('Polygon', mapFilter),
    }),
    [main, scenario.layer, mapFilter, opacity],
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
        'line-opacity': opacity
      },
      filter: withGeometryFilter('LineString', mapFilter),
    }),
    [main, lineLayerId, scenario.layer, mapFilter, opacity],
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
        'circle-opacity': opacity,
        'circle-stroke-color': '#fff',
        'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 5, 0, 10, 0.5, 15, 1],
      },
      filter: withGeometryFilter('Point', mapFilter),
    }),
    [main, circleLayerId, scenario.layer, mapFilter, opacity],
  );

  // --- Background layers (muted, so users see which features are filtered out) ---
  const bgFillLayer: LayerSpecification = useMemo(
    () => ({
      id: main.id + '-bg',
      source: scenario.layer.source,
      'source-layer': scenario.layer['source-layer'],
      type: 'fill' as const,
      minzoom: mapConfig.polygonMinZoom,
      paint: { 'fill-color': '#CCCCCC', 'fill-opacity': opacity },
      filter: ['==', ['geometry-type'], 'Polygon'] as FilterSpecification,
    }),
    [main.id, scenario.layer, opacity],
  );

  const bgLineLayer: LayerSpecification = useMemo(
    () => ({
      id: main.id + '-bg-line',
      source: scenario.layer.source,
      'source-layer': scenario.layer['source-layer'],
      type: 'line' as const,
      minzoom: mapConfig.polygonMinZoom,
      paint: { 'line-color': '#CCCCCC', 'line-width': 1, 'line-opacity': opacity },
      filter: ['==', ['geometry-type'], 'LineString'] as FilterSpecification,
    }),
    [main.id, scenario.layer, opacity],
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
        'circle-opacity': opacity,
      },
      filter: ['==', ['geometry-type'], 'Point'] as FilterSpecification,
    }),
    [main.id, scenario.layer, opacity],
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
