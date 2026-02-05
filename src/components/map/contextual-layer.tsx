import { Source, Layer as MapLayer } from 'react-map-gl/maplibre';
import { useContextualLayers } from "@/utils/context/contextual-layers";

interface ContextualLayerProps {
  mainId: string;
}

export const ContextualLayer = ({ mainId }:ContextualLayerProps) => {
    const { layers, activeLayers } = useContextualLayers();
    const contextualLayers = layers.filter(l => activeLayers.includes(l.id));
  return <>
    {contextualLayers.map(layer => {
    return <Source key={layer.id} {...layer.source} >
      <MapLayer id={layer.id} {...layer.circleLayer} beforeId={mainId} />
      <MapLayer id={layer.id} {...layer.lineLayer} beforeId={mainId} />
    </Source>;
  })}
  </>;
};