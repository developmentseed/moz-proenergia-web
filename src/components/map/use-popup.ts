import { useState, useCallback, useMemo, type Dispatch, type SetStateAction } from 'react';
import type { MapLayerMouseEvent } from 'react-map-gl/maplibre';
import type { ExpressionSpecification } from 'maplibre-gl';

interface ClusterProperties {
  id: number;
  MinimumOverall2027?: 'SA_PV2027'| 'MG_PV_Hybrid2027'| 'Grid2027';
  CurrentMVLineDist?: number;
  NewConnections2027?: number;
  Pop?: number;
}

interface HoverInfo {
  longitude: number;
  latitude: number;
  data: ClusterProperties
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
    const cluster = event.features && event.features[0];
    
    const featureInfo = cluster? {
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
      data: cluster.properties as ClusterProperties
    }: null;
    setHoverInfo(featureInfo)
  }, []);

  const selectedCluster = (hoverInfo && hoverInfo.data.id ) || '';

  // To show selected region
  const filter: ExpressionSpecification = useMemo(
    () => ['in', selectedCluster || 'N/A', ['get', 'name']],
    [selectedCluster]
  );

  return {
    hoverInfo,
    setHoverInfo,
    onHover,
    hoverFilter: filter
  };
}
