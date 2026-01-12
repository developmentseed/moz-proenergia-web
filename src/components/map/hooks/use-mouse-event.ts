import { useState, useCallback } from 'react';
import { useQueryState, parseAsString } from 'nuqs';
import { type MapLayerMouseEvent } from 'react-map-gl/maplibre';

interface UseMouseEventReturn {
  selected: string | null;
  hovered: string | null;
  onHover: (event: MapLayerMouseEvent) => void;
  onClick: (event: MapLayerMouseEvent) => void;
}

export const useMouseEvent = (): UseMouseEventReturn => {
  const [selected, setSelected] = useQueryState('cluster', parseAsString);
  const [hovered, setHovered] = useState<string | null>(null);

  const onHover = useCallback((event: MapLayerMouseEvent) => {
    const cluster = event.features && event.features[0];
    if (cluster) {
      setHovered(cluster.properties?.id ?? null);
    } else {
      setHovered(null);
    }
  }, [setHovered]);

  const onClick = useCallback((event: MapLayerMouseEvent) => {
    const cluster = event.features && event.features[0];
    if (cluster) {
      setSelected(cluster.properties.id ?? null);
    } else {
      setSelected(null);
    }
  }, [setSelected]);

  return {
    selected,
    hovered,
    onHover,
    onClick,
  };
};
