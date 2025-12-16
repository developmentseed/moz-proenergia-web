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

export type ScenarioFilter = NumericScenarioFilter | CategoricalScenarioFilter | OptionScenarioFilter;

export interface ScenarioLayer {
  tileUrl: string[];
  id: string;
  label: string;
  description?: string;
}

export interface ModelMetadata {
  id: string;
  title: string;
  scenarios: ItemUnit[];
}

export interface ScenarioMetadata {
  name: string;
  id: string;
  tileUrl: string;
  filters: ScenarioFilter[];
  layers: ScenarioLayer[];
}