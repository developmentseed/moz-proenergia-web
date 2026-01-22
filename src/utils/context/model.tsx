'use client';

import { createContext, useContext, ReactNode, useMemo, useState } from 'react';
import { useQueryStates, useQueryState, parseAsArrayOf, parseAsString, parseAsInteger, type UseQueryStatesKeysMap, type SetValues } from 'nuqs';
import { ModelMetadata, Filter, FilterType } from '@/app/types';

const createFilterParsers = (filters: Filter[]) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsers = filters.reduce<UseQueryStatesKeysMap<any>>((acc, filter) => {
    switch (filter.type) {
      case FilterType.numeric:
        acc[filter.id] = parseAsArrayOf(parseAsInteger)
          .withDefault(filter.options as [number, number]);
        return acc;
      // Select has string value, empty string shows everything
      case FilterType.select:
        acc[filter.id] = parseAsString.withDefault('');
        return acc;
      // Admin has string array value, empty array shows everything
      case FilterType.admin:
        acc[filter.id] = parseAsArrayOf(parseAsString).withDefault([]);
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
  // Current URL state (for map display - NO PREVIEW)
  filters: Record<string, [number, number] | string[] | null>;

  // Scenario ID
  scenarioId: string;
  setScenarioId: (param:string) => void;

  // Display values for UI controls (pending takes precedence)
  displayFilters: Record<string, [number, number] | string[] | null>;
  // Pending change handlers
  setPendingFilters: (updates: Record<string, unknown>) => void;
  // Apply action
  applyPendingChanges: () => void;
  hasPendingChanges: boolean;

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
  // Create parsers from model
  const filterParsers = useMemo(
    () => createFilterParsers(model.filters),
    [model.filters]
  );

  const initialScenario = model.scenarios[0];
  // Main attribute state (main visualization component - this won't be manipulated through UI)
  const [scenarioId, setScenarioId] = useQueryState('scenario', parseAsString.withDefault(initialScenario.id));

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

  // Pending state for batching changes
  const [pendingFilters, setPendingFilters] = useState<Record<string, unknown> | null>(null);
  // const [pendingLayers, setPendingLayers] = useState<string[] | null>(null);

  // Compute display values (pending takes precedence over URL state)
  const displayFilters = useMemo(() =>
    pendingFilters || filters,
    [pendingFilters, filters]
  );

  // Detect if there are pending filter changes (layers apply instantly)
  const hasPendingChanges = useMemo(() => {
    return pendingFilters !== null;
  }, [pendingFilters]);

  // Pending change handlers
  const setPendingFiltersWrapper = (updates: Record<string, unknown>) => {
    setPendingFilters(prev => ({ ...(prev || filters), ...updates }));
  };

  // Apply pending filter changes (layers apply instantly)
  const applyPendingChanges = () => {
    if (pendingFilters) {
      setFilters(pendingFilters);
      setPendingFilters(null);
    }
  };

  // @ TODO: There is no "clear" - this needs to be resetting to be default status
  const resetAllFilters = () => {
    const resetState = Object.keys(filterParsers).reduce((acc, key) => {
      acc[key] = null;
      return acc;
    }, {} as Record<string, null>);
    setFilters(resetState);
    // Also clear any pending filter state
    setPendingFilters(null);
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

        scenarioId,
        setScenarioId,
        mainAttribute: mainAttribute.main,
        setMainAttribute: (value) => setMainAttribute({ main: value }),
        // URL state, map
        filters,
        activeLayers: layerState.layers,
        // Display values (for UI controls)
        displayFilters,
        // Pending change handlers
        setPendingFilters: setPendingFiltersWrapper,
        // Apply action
        applyPendingChanges,
        hasPendingChanges,
        setFilters,
        resetAllFilters,
        setActiveLayers: (layers) => setLayerState({ layers }),
        toggleLayer
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
