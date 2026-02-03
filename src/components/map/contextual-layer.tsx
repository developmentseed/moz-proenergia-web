import { Source, Layer as MapLayer } from 'react-map-gl/maplibre';
import { type Layer } from '@/app/types';

interface ContextualLayerProps {
  layers: Layer[];
  mainId: string;
}

export const ContextualLayer = ({ layers, mainId }:ContextualLayerProps) => {
  return <>
    {layers.map(layer => {
    return <Source key={layer.id} {...layer.source} >
      <MapLayer id={layer.id} {...layer.circleLayer} beforeId={mainId} />
      <MapLayer id={layer.id} {...layer.lineLayer} beforeId={mainId} />
    </Source>;
  })}
  </>;
};