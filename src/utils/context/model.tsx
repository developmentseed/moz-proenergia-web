'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useQueryStates, parseAsArrayOf, parseAsString, parseAsInteger } from 'nuqs';
import { ModelMetadata, Filter } from '@/app/types';

type ModelContextType = {
  model: ModelMetadata
  mainAttribute: string | null;
  setMainAttribute: (value: string | null) => void;
  filters: Record<string, any>;
  setFilters: (updates: Record<string, any>) => void;
  clearAllFilters: () => void;
  activeLayers: string[];
  setActiveLayers: (layers: string[]) => void;
  toggleLayer: (layerId: string) => void;
};

const ModelContext = createContext<ModelContextType | null>(null);

const createFilterParsers = (filters: Record<string, Filter>) => {
  const parsers: Record<string, any> = {};

  Object.keys(filters).map(filterKey => {
    const filter = filters[filterKey];
    switch (filter.type) {
      case 'numeric':
        parsers[filter.id] = parseAsArrayOf(parseAsInteger)
          .withDefault(filter.values as [number, number]);
        break;
      case 'option':
        parsers[filter.id] = parseAsString.withDefault(filter.values[0].id);
        break;
      case 'categorical':
        parsers[filter.id] = parseAsString.withDefault(filter.values[0].id);
        break;
    }
  });
  
  return parsers;
};

export function ModelProvider({ 
  children,
  model
}: { 
  children: ReactNode;
  model: ModelMetadata;
}) {
  // Create parsers from scenario
  const filterParsers = useMemo(
    () => createFilterParsers(model.filters),
    [model.filters]
  );
  
  // Main attribute state
  const [mainAttribute, setMainAttribute] = useQueryStates({
    main: parseAsString.withDefault(model.main.id),
  });
  
  // Filter state - NOTE: These are separate from 'scenario' query param
  const [filters, setFilters] = useQueryStates(filterParsers, {
    history: 'replace',
    shallow: true
  });

  // Layer state
  const [layerState, setLayerState] = useQueryStates({
    layers: parseAsArrayOf(parseAsString).withDefault(Object.keys(model.layers)),
  });

  const clearAllFilters = () => {
    const resetState = Object.keys(filterParsers).reduce((acc, key) => {
      acc[key] = null;
      return acc;
    }, {} as Record<string, null>);
    setFilters(resetState);
  };

  const toggleLayer = (layerId: string) => {
    if (layerState.layers.includes(layerId)) {
      setLayerState({ 
        layers: layerState.layers.filter(id => id !== layerId) 
      });
    } else {
      setLayerState({ 
        layers: [...layerState.layers, layerId] 
      });
    }
  };

  return (
    <ModelContext.Provider
      value={{
        model,
        mainAttribute: mainAttribute.main,
        setMainAttribute: (value) => setMainAttribute({ main: value }),
        filters,
        setFilters,
        clearAllFilters,
        activeLayers: layerState.layers,
        setActiveLayers: (layers) => setLayerState({ layers }),
        toggleLayer,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
}

export const useModel = () => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useModel must be used within ModelProvider');
  }
  return context;
};
