/**
 * Type definitions for sidebar form state management
 */

/** Configuration for a single range filter, most of types derieved from Chakra */
export interface RangeFilterConfig {
  /** Unique identifier for this filter */
  id: string;
  /** Display label for the filter */
  label: string;
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** Initial value [min, max] */
  defaultValue: [number, number];
  /** Step increment (default: 1) */
  step?: number;
  /** Minimum steps between thumbs (default: 1) */
  minStepsBetweenThumbs?: number;
}

/** Configuration for a single checkbox filter */
export interface CheckboxOptionConfig {
  label: string;
  id: string;
  defaultValue: boolean;
}

/** Dynamic form state structure */
export interface SidebarFormState {
  /** Selected layer IDs */
  layers: string[];
  /** Range filters stored by ID */
  rangeFilters: Record<string, [number, number]>;
  /** Checkbox filters stored by ID */
  checkboxFilters: Record<string, boolean>;
}

/** Actions for updating form state */
export interface SidebarFormActions {
  /** Update selected layers */
  setLayers: (layers: string[]) => void;
  /** Update a specific range filter by ID */
  setRangeFilter: (id: string, value: [number, number]) => void;
  /** Update a specific checkbox filter by ID */
  setCheckboxFilter: (id: string, value: boolean) => void;
  /** Reset all filters to initial values */
  resetFilters: () => void;
  /** Apply filters (for action button) */
  applyFilters: () => void;
}

/** Return type of the hook */
export interface UseSidebarStateReturn {
  /** Current form state */
  state: SidebarFormState;
  /** Actions to update state */
  actions: SidebarFormActions;
}

/** Configuration for the sidebar form */
export interface SidebarFormConfig {
  /** Initial layer selections */
  initialLayers?: string[];
  /** Range filter configurations */
  rangeFilters?: RangeFilterConfig[];
  /** Checkbox filter configurations */
  checkboxFilters?: CheckboxOptionConfig[];
  /** Optional callback when filters are applied */
  onApply?: (state: SidebarFormState) => void;
}
