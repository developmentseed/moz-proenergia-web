'use client';

import { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useQueryStates, parseAsArrayOf, parseAsString } from 'nuqs';
import { type Layer } from '@/app/types';

type ContextualLayersContextType = {
  layers: Layer[];
  activeLayers: string[];
  setActiveLayers: (layers: string[]) => void;
  toggleLayer: (param: { [x: string]: boolean }) => void;
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

  const value = useMemo(() => ({
    layers,
    activeLayers: layerState.layers,
    toggleLayer,
    setActiveLayers,
  }), [layers, layerState.layers, toggleLayer, setActiveLayers]);

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
