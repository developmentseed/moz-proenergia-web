import { useState, useCallback, useMemo } from 'react';
import type {
  SidebarFormState,
  SidebarFormActions,
  UseSidebarStateReturn,
  SidebarFormConfig,
} from '@/types/sidebar';

/**
 * Custom hook for managing sidebar form state with dynamic filters
 *
 * @param config - Configuration object with filter definitions and callbacks
 * @returns Object containing state and actions
 *
 * @example
 * ```tsx
 * const { state, actions } = useSidebarState({
 *   initialLayers: ['layer1', 'layer2'],
 *   rangeFilters: [
 *     { id: 'elevation', label: 'Elevation', min: 0, max: 3000, defaultValue: [100, 2000] },
 *     { id: 'slope', label: 'Slope', min: 0, max: 90, defaultValue: [0, 45] }
 *   ],
 *   checkboxFilters: [
 *     { id: 'showGrid', label: 'Show Grid', defaultValue: false }
 *   ],
 *   onApply: (state) => console.log('Filters applied:', state)
 * });
 * ```
 */
export const useSidebarState = (config: SidebarFormConfig = {}): UseSidebarStateReturn => {
  const {
    initialLayers = [],
    rangeFilters = [],
    checkboxFilters = [],
    onApply,
  } = config;

  // Build initial state from config
  const initialRangeFilters = useMemo(
    () =>
      rangeFilters.reduce(
        (acc, filter) => {
          acc[filter.id] = filter.defaultValue;
          return acc;
        },
        {} as Record<string, [number, number]>
      ),
    [rangeFilters]
  );

  const initialCheckboxFilters = useMemo(
    () =>
      checkboxFilters.reduce(
        (acc, filter) => {
          acc[filter.id] = filter.defaultValue;
          return acc;
        },
        {} as Record<string, boolean>
      ),
    [checkboxFilters]
  );

  // State management
  const [layers, setLayers] = useState<string[]>(initialLayers);
  const [rangeFilterValues, setRangeFilterValues] = useState<Record<string, [number, number]>>(
    initialRangeFilters
  );
  const [checkboxFilterValues, setCheckboxFilterValues] = useState<Record<string, boolean>>(
    initialCheckboxFilters
  );

  // Update a specific range filter
  const setRangeFilter = useCallback((id: string, value: [number, number]) => {
    setRangeFilterValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  }, []);

  // Update a specific checkbox filter
  const setCheckboxFilter = useCallback((id: string, value: boolean) => {
    setCheckboxFilterValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  }, []);

  // Memoized reset function
  const resetFilters = useCallback(() => {
    setLayers(initialLayers);
    setRangeFilterValues(initialRangeFilters);
    setCheckboxFilterValues(initialCheckboxFilters);
  }, [initialLayers, initialRangeFilters, initialCheckboxFilters]);

  // Memoized apply function
  const applyFilters = useCallback(() => {
    const currentState: SidebarFormState = {
      layers,
      rangeFilters: rangeFilterValues,
      checkboxFilters: checkboxFilterValues,
    };

    if (onApply) {
      onApply(currentState);
    }
  }, [layers, rangeFilterValues, checkboxFilterValues, onApply]);

  // Combine state
  const state: SidebarFormState = {
    layers,
    rangeFilters: rangeFilterValues,
    checkboxFilters: checkboxFilterValues,
  };

  // Combine actions
  const actions: SidebarFormActions = {
    setLayers,
    setRangeFilter,
    setCheckboxFilter,
    resetFilters,
    applyFilters,
  };

  return { state, actions };
};
