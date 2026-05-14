import type { SourceProps } from "react-map-gl/maplibre";
export interface ItemUnit {
  id: string;
  label: string;
  description?: string | null;
}
export interface Field {
  columns: string[];
  label: string;
  label_pt?: string;
  description?: string;
  description_pt?: string;
  category?: string;
  group_by?: string[];
  method?: 'count' | 'min' | 'max' | 'sum' | 'average';
  unit?: string;
  chartType?: 'bar' | 'donut' | 'stacked' | 'highlight';
  colors?: Record<string, string>;
  showChartValueRows?: boolean;
  showBarChartAverage?: boolean;
  hasDecimal?: boolean;
}
export interface MapItemUnit extends ItemUnit {
  color?: string;
}

export enum FilterType { numeric = 'numeric', checkbox = 'checkbox', admin='admin'};

type BaseScenarioFilter = ItemUnit & { column: string; label_pt?: string; description_pt?: string | null };
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
  name: string;
  name_pt?: string;
  label: string;
  description?: string;
  description_pt?: string;
  source: SourceProps,
  layer: {
    "source": string;
    "source-layer": string;
    "type": "fill" | "line" | "circle";
  }
}

export interface Layer extends ItemUnit {
  filePath: string;
  label_pt?: string;
  description_pt?: string;
  downloadLink?: string;
  color?: string;
  layerType?: 'vector' | 'raster';
  rasterStats?: { min: number; max: number };
  isRgb?: boolean;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

export interface Main extends BaseScenarioFilter {
  options: MapItemUnit[];
}

export interface ModelMetadata {
  id: string;
  title: string;
  title_pt?: string;
  scenarios: Scenario[];
  main: Main;
  filters: Filter[];
  popupFields: Field[];
  summaryFields: Field[];
}

export interface ModelGroupMetadata {
  id: string;
  name: string;
  name_pt?: string;
  description: string;
  presentation_order?: number;
  scenarios: Array<{ vector_dataset: { id: number } | null }>;
  description_pt?: string;
}