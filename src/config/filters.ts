import type { RangeFilterConfig, CheckboxOptionConfig } from '@/types/sidebar';

export const layerOptionConfigs: CheckboxOptionConfig[] = [
  { label: 'Substations', id: 'substation', defaultValue: false },
  { label: 'Transmission Network', id: 'transmission-network' , defaultValue: false }
];
export const rangeFilterConfigs: RangeFilterConfig[] = [
  // This is from tile
  {
    id: 'Pop',
    label: 'Population',
    min: 0,
    max: 300000,
    defaultValue: [0, 150000],
    step: 100,
    minStepsBetweenThumbs: 100,
  },
  // This is from a separate file
  {
    id: 'CurrentMVLineDist',
    label: 'Current Distance to MV Line',
    min: 0,
    max: 115,
    defaultValue: [0, 45],
    step: 1,
    minStepsBetweenThumbs: 5,
  },
  {
    id: 'NewConnections2027',
    label: 'New Connections',
    min: 0,
    max: 70000,
    defaultValue: [0, 70000],
    step: 100,
    minStepsBetweenThumbs: 50,
  }
];

/**
 * Configuration for all checkbox filters
 * Add or remove filters here to dynamically change the sidebar
 */
export const checkboxFilterConfigs: CheckboxOptionConfig[] = [
  // {
  //   id: 'binary-filter-1',
  //   label: 'Binary Filter 1',
  //   defaultValue: false,
  // },
  // Add more checkbox filters as needed
  // {
  //   id: 'binary-filter-2',
  //   label: 'Binary Filter 2',
  //   defaultValue: true,
  // },
];
