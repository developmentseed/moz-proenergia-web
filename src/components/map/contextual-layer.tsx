import { Source, Layer as MapLayer } from 'react-map-gl/maplibre';
import { useContextualLayers } from "@/utils/context/contextual-layers";
import { deriveSource, deriveLayerStyles } from "@/utils/data-transformation";

interface ContextualLayerProps {
  mainId: string;
}

export const ContextualLayer = ({ mainId }:ContextualLayerProps) => {
    const { layers, activeLayers, layerOpacities } = useContextualLayers();
    const contextualLayers = layers.filter(l => activeLayers.includes(l.id));
  return <>
    {contextualLayers.map(layer => {
    const source = deriveSource(layer.id, layer.filePath);
    const opacity = (layerOpacities[layer.id] ?? 100) / 100;
    const { circleLayer, lineLayer, polygonLayer } = deriveLayerStyles(layer.id, layer.color!, opacity);
    return <Source key={layer.id} {...source} >
      <MapLayer {...circleLayer} beforeId={mainId} />
      <MapLayer {...lineLayer} beforeId={mainId} />
      <MapLayer {...polygonLayer} beforeId={mainId} />
    </Source>;
  })}
  </>;
};