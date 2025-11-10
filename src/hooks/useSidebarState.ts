import { useState, useCallback } from 'react';
import type {
  SidebarFormState,
  SidebarFormActions,
  UseSidebarStateReturn,
  SidebarFormConfig,
} from '@/types/sidebar';

/**
 * Custom hook for managing sidebar form state
 *
 * @param config - Configuration object with initial values and callbacks
 * @returns Object containing state and actions
 *
 * @example
 * ```tsx
 * const { state, actions } = useSidebarState({
 *   initialLayers: ['layer1', 'layer2'],
 *   initialRangeFilter1: [20, 60],
 *   initialRangeFilter2: [0, 100],
 *   initialBinaryFilter: false,
 *   onApply: (state) => console.log('Filters applied:', state)
 * });
 * ```
 */
export const useSidebarState = (config: SidebarFormConfig = {}): UseSidebarStateReturn => {
  const {
    initialLayers = [],
    initialRangeFilter1 = [20, 60],
    initialRangeFilter2 = [0, 100],
    initialBinaryFilter = false,
    onApply,
  } = config;

  // Store initial values for reset functionality
  const initialState: SidebarFormState = {
    layers: initialLayers,
    rangeFilter1: initialRangeFilter1,
    rangeFilter2: initialRangeFilter2,
    binaryFilter: initialBinaryFilter,
  };

  // State management
  const [layers, setLayers] = useState<string[]>(initialLayers);
  const [rangeFilter1, setRangeFilter1] = useState<[number, number]>(initialRangeFilter1);
  const [rangeFilter2, setRangeFilter2] = useState<[number, number]>(initialRangeFilter2);
  const [binaryFilter, setBinaryFilter] = useState<boolean>(initialBinaryFilter);

  // Memoized reset function
  const resetFilters = useCallback(() => {
    setLayers(initialState.layers);
    setRangeFilter1(initialState.rangeFilter1);
    setRangeFilter2(initialState.rangeFilter2);
    setBinaryFilter(initialState.binaryFilter);
  }, [
    initialState.layers,
    initialState.rangeFilter1,
    initialState.rangeFilter2,
    initialState.binaryFilter,
  ]);

  // Memoized apply function
  const applyFilters = useCallback(() => {
    const currentState: SidebarFormState = {
      layers,
      rangeFilter1,
      rangeFilter2,
      binaryFilter,
    };

    if (onApply) {
      onApply(currentState);
    }
  }, [layers, rangeFilter1, rangeFilter2, binaryFilter, onApply]);

  // Combine state
  const state: SidebarFormState = {
    layers,
    rangeFilter1,
    rangeFilter2,
    binaryFilter,
  };

  // Combine actions
  const actions: SidebarFormActions = {
    setLayers,
    setRangeFilter1,
    setRangeFilter2,
    setBinaryFilter,
    resetFilters,
    applyFilters,
  };

  return { state, actions };
};
