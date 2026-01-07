import { Source, Layer as MapLayer } from 'react-map-gl/maplibre';
import { type Layer } from '@/app/types';

interface ContextualLayerProps {
  layers: Layer[];
}

export const ContextualLayer = ({ layers }:ContextualLayerProps) => {
  return <>
    {layers.map(layer => {
    return <Source key={layer.id} {...layer.source} >
      <MapLayer id={layer.id} {...layer.layer} />
    </Source>;
  })}
  </>;
};