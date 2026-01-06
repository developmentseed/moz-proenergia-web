'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useQueryStates, parseAsArrayOf, parseAsString, parseAsInteger, type UseQueryStatesKeysMap, type SetValues } from 'nuqs';
import { ModelMetadata, Filter, FilterType } from '@/app/types';

const createFilterParsers = (filters: Filter[]) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsers = filters.reduce<UseQueryStatesKeysMap<any>>((acc, filter) => {
    switch (filter.type) {
      case FilterType.numeric:
        acc[filter.id] = parseAsArrayOf(parseAsInteger)
          .withDefault(filter.values as [number, number]);
        return acc;
      // Option and Categorical value doens't have default
      case FilterType.select:
        acc[filter.id] = parseAsString;
        return acc;
      case FilterType.checkbox:
        acc[filter.id] = parseAsArrayOf(parseAsString).withDefault(filter.options.map(o => o.value));
        return acc;
      default:
        return acc;
    }
  }, {});

  return parsers;
};

type DynamicFilterParsers = ReturnType<typeof createFilterParsers>;

type ModelContextType = {
  model: ModelMetadata
  mainAttribute: string | null;
  setMainAttribute: (value: string | null) => void;
  filters: Record<string, [number, number] | string[] | null>;
  setFilters: SetValues<DynamicFilterParsers>;
  resetAllFilters: () => void;
  activeLayers: string[];
  setActiveLayers: (layers: string[]) => void;
  toggleLayer: (param: { [x: string]: boolean; }) => void;
};

const ModelContext = createContext<ModelContextType | null>(null);

export function ModelProvider({
  model,
  children
}: {
  model: ModelMetadata;
  children: ReactNode;
}) {
  // Create parsers from scenario
  const filterParsers = useMemo(
    () => createFilterParsers(model.filters),
    [model.filters]
  );

  // Main attribute state (main visualization component - this won't be manipulated through UI)
  const [mainAttribute, setMainAttribute] = useQueryStates({
    main: parseAsString.withDefault(model.main.id),
  });

  // Filter state
  const [filters, setFilters] = useQueryStates<DynamicFilterParsers>(filterParsers, {
    history: 'replace',
    shallow: true
  });

  // Layer state
  const [layerState, setLayerState] = useQueryStates({
    layers: parseAsArrayOf(parseAsString).withDefault([]),
  });

  // @ TODO: There is no "clear" - this needs to be resetting to be default status
  const resetAllFilters = () => {
    const resetState = Object.keys(filterParsers).reduce((acc, key) => {
      acc[key] = null;
      return acc;
    }, {} as Record<string, null>);
    setFilters(resetState);
  };

  const toggleLayer = (layer: { [x: string]: boolean; }) => {
    const [layerId, displayValue] = Object.entries(layer)[0];
    if (displayValue) {
      setLayerState({
        layers: [...layerState.layers, layerId]
      });

    } else {
      setLayerState({
        layers: layerState.layers.filter(id => id !== layerId)
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
        resetAllFilters,
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
