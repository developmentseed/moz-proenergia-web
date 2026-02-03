import { useCallback } from 'react';
import { useQueryState, parseAsString } from 'nuqs';
import { type MapLayerMouseEvent } from 'react-map-gl/maplibre';

interface UseMouseEventReturn {
  selected: string | null;
  setSelected: (param: string| null) => void;
  onClick: (event: MapLayerMouseEvent) => void;
}

export const useMouseEvent = (): UseMouseEventReturn => {
  const [selected, setSelected] = useQueryState('cluster', parseAsString);

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
    setSelected,
    onClick,
  };
};
