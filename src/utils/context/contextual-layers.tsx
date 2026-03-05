'use client';

import { createContext, useContext, ReactNode, useCallback, useMemo, useState } from 'react';
import { useQueryStates, parseAsArrayOf, parseAsString } from 'nuqs';
import { type Layer } from '@/app/types';

type ContextualLayersContextType = {
  layers: Layer[];
  activeLayers: string[];
  layerOpacities: Record<string, number>;
  setActiveLayers: (layers: string[]) => void;
  toggleLayer: (param: { [x: string]: boolean }) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;
};

const ContextualLayersContext = createContext<ContextualLayersContextType | null>(null);

export function ContextualLayersProvider({
  layers,
  children
}: {
  layers: Layer[];
  children: ReactNode;
}) {
  const [layerState, setLayerState] = useQueryStates({
    layers: parseAsArrayOf(parseAsString).withDefault([]),
  });

  const [layerOpacities, setLayerOpacities] = useState<Record<string, number>>({});

  const toggleLayer = useCallback((layer: { [x: string]: boolean }) => {
    const [layerId, displayValue] = Object.entries(layer)[0];
    if (displayValue) {
      setLayerState({ layers: [...layerState.layers, layerId] });
    } else {
      setLayerState({ layers: layerState.layers.filter(id => id !== layerId) });
    }
  }, [layerState.layers, setLayerState]);

  const setActiveLayers = useCallback((newLayers: string[]) => {
    setLayerState({ layers: newLayers });
  }, [setLayerState]);

  const setLayerOpacity = useCallback((layerId: string, opacity: number) => {
    setLayerOpacities(prev => ({ ...prev, [layerId]: opacity }));
  }, []);

  const value = useMemo(() => ({
    layers,
    activeLayers: layerState.layers,
    layerOpacities,
    toggleLayer,
    setActiveLayers,
    setLayerOpacity,
  }), [layers, layerState.layers, layerOpacities, toggleLayer, setActiveLayers, setLayerOpacity]);

  return (
    <ContextualLayersContext.Provider value={value}>
      {children}
    </ContextualLayersContext.Provider>
  );
}

export const useContextualLayers = () => {
  const context = useContext(ContextualLayersContext);
  if (!context) {
    throw new Error('useContextualLayers must be used within ContextualLayersProvider');
  }
  return context;
};
