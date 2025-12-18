export interface ItemUnit {
  id: string;
  label: string;
}

enum FilterType { numeric = 'numeric', categorical = 'categorical', option = 'option'};

interface BaseScenarioFilter {
  id: string;
  label: string;
  description?: string;
  type: FilterType,
}
interface NumericScenarioFilter extends BaseScenarioFilter {
  type: FilterType.numeric;
  values: [number, number]
}
interface CategoricalScenarioFilter extends BaseScenarioFilter {
  type: FilterType.categorical;
  values: ItemUnit[];
}

interface OptionScenarioFilter extends BaseScenarioFilter {
  type: FilterType.option;
  values: ItemUnit[];
}

export type Filter = NumericScenarioFilter | CategoricalScenarioFilter | OptionScenarioFilter;

export interface Scenario {
  tileUrl: string[];
  id: string;
  label: string;
  description?: string;
}

export interface Layer extends Scenario {
  downloadLink?: string;
  color?: string; // only main one? or also contextural layer?
}

export interface ModelMetadata {
  id: string;
  title: string;
  scenarios: Scenario[];
  main: Layer;
  filters: Record<string, Filter>,
  layers: Record<string, Layer>,
}
