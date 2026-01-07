import { type LayerProps, type SourceProps } from "react-map-gl/maplibre";
export interface ItemUnit {
  value: string;
  label: string;
  description?: string;
}

export interface MapItemUnit extends ItemUnit {
  color: string;
}

export enum FilterType { numeric = 'numeric', select = 'select', checkbox = 'checkbox'};
enum MainType {categorical = 'categorical', linear='linear'};

interface BaseScenarioFilter {
  id: string;
  column: string;
  label: string;
  description?: string;
}
interface NumericScenarioFilter extends BaseScenarioFilter {
  type: FilterType.numeric;
  values: [number, number]
}
interface CategoricalScenarioFilter extends BaseScenarioFilter {
  type: FilterType.select;
  options: ItemUnit[];
}

interface OptionScenarioFilter extends BaseScenarioFilter {
  type: FilterType.checkbox;
  options: ItemUnit[];
}

export type Filter = NumericScenarioFilter | CategoricalScenarioFilter | OptionScenarioFilter;

export type FilterEventValueType = number[] | string[] | string;

export interface Scenario {
  id: string;
  label: string;
  description?: string;
  source: SourceProps,
  layer: LayerProps
}

export interface Layer extends Scenario {
  downloadLink?: string;
  color?: string; // only main one? or also contextural layer?
}

export interface Main extends BaseScenarioFilter {
  type: MainType;
  options: MapItemUnit[];
}

export interface ModelMetadata {
  id: string;
  title: string;
  scenarios: Scenario[];
  main: Main;
  filters: Filter[],
  layers: Layer[]
}

export interface ModelGroupMetadata {
  id: string;
  name: string;
  description: string;
}