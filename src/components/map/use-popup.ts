import { useState, useCallback, useMemo, type Dispatch, type SetStateAction } from 'react';
import type { MapLayerMouseEvent } from 'react-map-gl/maplibre';
import type { ExpressionSpecification } from 'maplibre-gl';

interface HoverInfo {
  longitude: number;
  latitude: number;
  fid: string;
  population: string;
}

interface UsePopupReturn {
  hoverInfo: HoverInfo | null;
  setHoverInfo: Dispatch<SetStateAction<HoverInfo | null>>
  onHover: (event: MapLayerMouseEvent) => void;
  hoverFilter: ExpressionSpecification;
}

export function usePopup(): UsePopupReturn {
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

  const onHover = useCallback((event: MapLayerMouseEvent) => {
    const county = event.features && event.features[0];
    setHoverInfo({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
      fid: county && county.properties.id, // fid from original data is float, use id instead
      population: county && county.properties.Population,
    });
  }, []);

  const selectedCounty = (hoverInfo && hoverInfo.fid ) || '';

  // To show selected region
  const filter: ExpressionSpecification = useMemo(
    () => ['in', selectedCounty || 'N/A', ['get', 'name']],
    [selectedCounty]
  );

  return {
    hoverInfo,
    setHoverInfo,
    onHover,
    hoverFilter: filter
  };
}
