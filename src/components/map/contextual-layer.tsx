import { Source, Layer as MapLayer } from 'react-map-gl/maplibre';
import { type Layer } from '@/app/types';
import { useContextualLayers } from "@/utils/context/contextual-layers";
import { deriveSource, deriveLayerStyles } from "@/utils/data-transformation";
import { deriveRasterSource, deriveRasterLayerStyle } from "@/utils/map/cog";

export const RasterContextualLayer = ({ beforeId }: { beforeId?: string }) => {
  const { layers, activeLayers, layerOpacities } = useContextualLayers();
  const contextualLayers = layers.filter(l => activeLayers.includes(l.id)).filter(l => l.layerType === 'raster');
  return <>
    {contextualLayers.map((layer:Layer) => {
    const opacity = (layerOpacities[layer.id] ?? 100) / 100;

      const source = deriveRasterSource(layer.id, layer.filePath, layer.rasterStats, layer.isRgb);
      const rasterStyle = deriveRasterLayerStyle(layer.id, opacity);
      return <Source key={layer.id} {...source} >
        <MapLayer {...rasterStyle} beforeId={beforeId} />
      </Source>;

  })}
  </>;
};

export const VectorContextualLayer = () => {
  const { layers, activeLayers, layerOpacities } = useContextualLayers();
  const contextualLayers = layers.filter(l => activeLayers.includes(l.id)).filter(l => l.layerType === 'vector');
  return <>
    {contextualLayers.map((layer:Layer) => {
    const opacity = (layerOpacities[layer.id] ?? 100) / 100;

    const source = deriveSource(layer.id, layer.filePath);
    const { circleLayer, lineLayer, polygonLayer } = deriveLayerStyles(layer.id, layer.color!, opacity);
    return <Source key={layer.id} {...source} >
      <MapLayer {...circleLayer} />
      <MapLayer {...lineLayer} />
      <MapLayer {...polygonLayer} />
    </Source>;
  })}
  </>;
};
