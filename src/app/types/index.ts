import type { SourceProps } from "react-map-gl/maplibre";
export interface ItemUnit {
  value: string;
  label: string;
  description?: string;
}
export interface Field {
  columns: string[];
  label: string;
  description?: string;
  group_by?: string[];
  method?: 'count' | 'min' | 'max' | 'sum' | 'average';
  unit?: string;
  chart?: 'bar' | 'line';
  colors?: Record<string, string>;
}
export interface MapItemUnit extends ItemUnit {
  color?: string;
}

export enum FilterType { numeric = 'numeric', checkbox = 'checkbox', admin='admin'};

interface BaseScenarioFilter {
  id: string;
  column: string;
  label: string;
  description?: string;
}
interface NumericScenarioFilter extends BaseScenarioFilter {
  type: FilterType.numeric;
  options: [number, number]
}
interface OptionScenarioFilter extends BaseScenarioFilter {
  type: FilterType.checkbox;
  options: ItemUnit[];
}

interface AdminScenarioFilter extends BaseScenarioFilter {
  type: FilterType.admin;
  options: string[];
}

export type Filter = NumericScenarioFilter | OptionScenarioFilter | AdminScenarioFilter;
export type FilterOptionValues = [number, number] | string[] | ItemUnit[];

export interface Scenario {
  id: string;
  label: string;
  description?: string;
  source: SourceProps,
  layer: {
    "source": string;
    "source-layer": string;
    "type": "fill" | "line" | "circle";
  }
}

export interface Layer {
  id: string;
  label: string;
  description?: string;
  filePath: string;
  downloadLink?: string;
  color?: string;
}

export interface Main extends BaseScenarioFilter {
  options: MapItemUnit[];
}

export interface ModelMetadata {
  id: string;
  title: string;
  scenarios: Scenario[];
  main: Main;
  filters: Filter[];
  popupFields: Field[];
  summaryFields: Field[];
}

export interface ModelGroupMetadata {
  id: string;
  name: string;
  description: string;
}