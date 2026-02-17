'use client';

import { createContext, useContext, ReactNode, useMemo, useState, useCallback } from 'react';
import { useQueryStates, parseAsArrayOf, parseAsString, parseAsInteger, type UseQueryStatesKeysMap, type SetValues } from 'nuqs';
import { type Filter, FilterType } from '@/app/types';

const createFilterParsers = (filters: Filter[]) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsers = filters.reduce<UseQueryStatesKeysMap<any>>((acc, filter) => {
    switch (filter.type) {
      case FilterType.numeric:
        acc[filter.id] = parseAsArrayOf(parseAsInteger)
          .withDefault(filter.options as [number, number]);
        return acc;
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

type FiltersContextType = {
  // Current URL state (for map display)
  filters: Record<string, [number, number] | string[] | null>;
  // Display values for UI controls (pending takes precedence)
  displayFilters: Record<string, [number, number] | string[] | null>;
  // Changed filter values to apply to summary queries
  updatedFilters: Record<string, [number, number] | string[] | null>;
  // Pending change handlers
  setPendingFilters: (updates: Record<string, unknown>) => void;
  // Apply action
  applyPendingChanges: () => void;
  hasPendingChanges: boolean;
  changedFilters: Record<string, unknown>;
  getFilterPendingStatus: (filterId: string) => boolean;
  setFilters: SetValues<DynamicFilterParsers>;
  resetAllFilters: () => void;
};

const FiltersContext = createContext<FiltersContextType | null>(null);

export function FiltersProvider({
  filterDefs,
  children
}: {
  filterDefs: Filter[];
  children: ReactNode;
}) {
  // Create parsers from filter definitions
  const filterParsers = useMemo(
    () => createFilterParsers(filterDefs),
    [filterDefs]
  );

  // Build default values from filter definitions to see which filters were updated
  const defaultFilters = useMemo(() => {
    const defaults: Record<string, unknown> = {};
    for (const filter of filterDefs) {
      switch (filter.type) {
        case FilterType.numeric:
          defaults[filter.id] = filter.options;
          break;
        case FilterType.checkbox:
          defaults[filter.id] = filter.options.map(o => o.value);
          break;
        case FilterType.admin:
          defaults[filter.id] = [];
          break;
      }
    }
    return defaults;
  }, [filterDefs]);

  // Filter state from URL
  const [filters, setFilters] = useQueryStates<DynamicFilterParsers>(filterParsers, {
    history: 'replace',
    shallow: true
  });

  // Pending state for batching changes
  const [pendingFilters, setPendingFiltersState] = useState<Record<string, unknown> | null>(null);

  // Sort-stable stringify for order-insensitive array comparison
  const stableStringify = useCallback((val: unknown) => {
    if (Array.isArray(val)) return JSON.stringify([...val].sort());
    return JSON.stringify(val);
  }, []);

  // Compute display values (pending takes precedence over URL state)
  const displayFilters = useMemo(() =>
    pendingFilters ? { ...filters, ...pendingFilters } : filters,
    [pendingFilters, filters]
  );

  // Detect if there are pending filter changes
  const hasPendingChanges = useMemo(() => {
    return pendingFilters !== null;
  }, [pendingFilters]);

  // Filters updated (visually) compared to the default ones
  const changedFilters = useMemo(() => {
    return Object.entries(displayFilters).reduce((acc, [key, val]) => {
      if (stableStringify(val) !== stableStringify(defaultFilters[key])) {
        acc[key] = val;
      }
      return acc;
    }, {} as Record<string, [number, number] | string[] | null>);
  }, [displayFilters, defaultFilters, stableStringify]);

    // Filters "applied" compared to the default ones
  const updatedFilters = useMemo(() => {
    return Object.entries(filters).reduce((acc, [key, val]) => {
      if (stableStringify(val) !== stableStringify(defaultFilters[key])) {
        acc[key] = val;
      }
      return acc;
    }, {} as Record<string, [number, number] | string[] | null>);
  }, [filters, defaultFilters, stableStringify]);

  // Check if a specific filter differs from its original default
  const getFilterPendingStatus = useCallback((filterId: string): boolean => {
    return filterId in changedFilters;
  }, [changedFilters]);

  // Pending change handlers — only stores keys that differ from applied state
  const setPendingFilters = useCallback((updates: Record<string, unknown>) => {
    setPendingFiltersState(prev => {
      const next = { ...(prev || {}), ...updates };
      // Only keep keys that actually differ from applied state
      const changed = Object.entries(next).reduce((acc, [key, val]) => {
        if (stableStringify(val) !== stableStringify(filters[key])) {
          acc[key] = val;
        }
        return acc;
      }, {} as Record<string, unknown>);
      return Object.keys(changed).length > 0 ? changed : null;
    });
  }, [filters, stableStringify]);

  // Apply pending filter changes
  const applyPendingChanges = useCallback(() => {
    if (pendingFilters) {
      setFilters(pendingFilters);
      setPendingFiltersState(null);
    }
  }, [pendingFilters, setFilters]);

  // Reset all filters to default
  const resetAllFilters = useCallback(() => {
    const resetState = Object.keys(filterParsers).reduce((acc, key) => {
      acc[key] = null;
      return acc;
    }, {} as Record<string, null>);
    setFilters(resetState);
    setPendingFiltersState(null);
  }, [filterParsers, setFilters]);

  const value = useMemo(() => ({
    filters,
    displayFilters,
    setPendingFilters,
    applyPendingChanges,
    hasPendingChanges,
    changedFilters,
    updatedFilters,
    getFilterPendingStatus,
    setFilters,
    resetAllFilters,
  }), [filters, displayFilters, setPendingFilters, applyPendingChanges, hasPendingChanges,updatedFilters, changedFilters, getFilterPendingStatus, setFilters, resetAllFilters]);

  return (
    <FiltersContext.Provider value={value}>
      {children}
    </FiltersContext.Provider>
  );
}

export const useFilters = () => {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error('useFilters must be used within FiltersProvider');
  }
  return context;
};
