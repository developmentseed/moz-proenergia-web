import type { RangeFilterConfig, CheckboxFilterConfig, CheckboxOptionConfig } from '@/types/sidebar';

export const layerOptionConfigs: CheckboxOptionConfig[] = [
  { label: 'Layer A', id: 'layer-a', defaultValue: false },
  { label: 'Layer B', id: 'layer-b' , defaultValue: false }
];

export const rangeFilterConfigs: RangeFilterConfig[] = [
  {
    id: 'range-filter-1',
    label: 'Range Filter 1',
    min: 0,
    max: 3000,
    defaultValue: [100, 2000],
    step: 10,
    minStepsBetweenThumbs: 10,
  },
  {
    id: 'range-filter-2',
    label: 'Range Filter 2',
    min: 0,
    max: 90,
    defaultValue: [0, 45],
    step: 1,
    minStepsBetweenThumbs: 5,
  }
];

/**
 * Configuration for all checkbox filters
 * Add or remove filters here to dynamically change the sidebar
 */
export const checkboxFilterConfigs: CheckboxFilterConfig[] = [
  {
    id: 'binary-filter-1',
    label: 'Binary Filter 1',
    defaultValue: false,
  },
  // Add more checkbox filters as needed
  // {
  //   id: 'showLabels',
  //   label: 'Show Labels',
  //   defaultValue: true,
  // },
];
