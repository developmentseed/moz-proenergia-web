/**
 * Type definitions for sidebar form state management
 */

export interface SidebarFormState {
  layers: string[];
  rangeFilter1: [number, number];
  rangeFilter2: [number, number];
  binaryFilter: boolean;
}

export interface SidebarFormActions {
  /** Update selected layers */
  setLayers: (layers: string[]) => void;
  /** Update first range filter */
  setRangeFilter1: (range: [number, number]) => void;
  /** Update second range filter */
  setRangeFilter2: (range: [number, number]) => void;
  /** Update binary filter */
  setBinaryFilter: (value: boolean) => void;
  /** Reset all filters to initial values */
  resetFilters: () => void;
  /** Apply filters (for action button) */
  applyFilters: () => void;
}

export interface UseSidebarStateReturn {
  /** Current form state */
  state: SidebarFormState;
  /** Actions to update state */
  actions: SidebarFormActions;
}

export interface SidebarFormConfig {
  /** Initial layer selections */
  initialLayers?: string[];
  /** Initial range for filter 1 [min, max] */
  initialRangeFilter1?: [number, number];
  /** Initial range for filter 2 [min, max] */
  initialRangeFilter2?: [number, number];
  /** Initial binary filter value */
  initialBinaryFilter?: boolean;
  /** Optional callback when filters are applied */
  onApply?: (state: SidebarFormState) => void;
}
