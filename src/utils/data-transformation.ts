import { LayerProps } from "react-map-gl/maplibre";
import { Filter, FilterType, ModelMetadata, ModelGroupMetadata, MapItemUnit, Scenario, Layer, Main } from '@/app/types';
import { api, MEDIA_URL_PREFIX } from '@/utils/api';
import mapConfig from '@/config/map.json';
const ADMIN_COLUMNS = ['Admin_1', 'District', 'Posto', 'Localidade'];

// ----- API Response Types -----
export interface ApiFilterField {
  label: string;
  column: string;
  description: string;
}

export interface ApiScenario {
  id: number;
  name: string;
  model_file: string | null;
}
export interface ColorCoding {
  color: string;
  value: string;
}
export interface ApiModelResponse {
  id: number;
  name: string;
  filter_fields: ApiFilterField[];
  popup_fields: ApiFilterField[];
  summary_fields: ApiFilterField[];
  scenarios: ApiScenario[];
  visualization_column: string; // for main column
  color_coding: ColorCoding[]
}

export interface ApiVectorResult {
  id: number;
  name: string;
  description: string;
  source: string;
  created: string;
  updated: string;
  created_by: string;
  last_updated_by: string;
  is_public: boolean;
  is_approved: boolean;
  raw_file: string;
}

export interface ApiVectorsResponse {
  count: number;
  results: ApiVectorResult[];
}

export interface ApiModelsResponse {
  id: number;
  name: string;
  description?: string;
}

type ColormapEntry = { value: string; color: string };

// ----- Derivation Helpers -----

export function deriveFilterType(column: string, options: unknown): FilterType.numeric | FilterType.checkbox | FilterType.admin {
  if (ADMIN_COLUMNS.includes(column)) {
    return FilterType.admin;
  }
  if (Array.isArray(options) && options.length > 0 && options.every(v => typeof v === 'number')) {
    // @TODO: Boolean value should be fixed from original data
    if (options.every(v => [0, 1].includes(v))) return FilterType.checkbox;

    return FilterType.numeric;
  }
  return FilterType.checkbox;
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function makeLabel(value: string): string {
  return value
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/([a-z])([A-Z])/g, '$1 $2'); // Add space before capital letters
}

export function transformOptions(
  options: unknown,
  colormap?: ColormapEntry[] | null
): MapItemUnit[] {
  if (!Array.isArray(options)) return [];

  const colorLookup = colormap
    ? new Map(colormap.filter(c => c.value && c.color).map(c => [c.value, c.color]))
    : null;

  return options.map(opt => {
      return {
        value: String(opt),
        label: makeLabel(String(opt)),
        color: colorLookup?.get(opt) ?? undefined
      };
  });
}

export function deriveSource(id: string, filePath: string) {
  const pmtilesUrl = filePath.replace(/\.[^.]+$/, '.pmtiles');
  return {
    id,
    type: 'vector' as const,
    minzoom: mapConfig.minZoom,
    maxzoom: mapConfig.maxZoom,
    url: `pmtiles://${MEDIA_URL_PREFIX}${pmtilesUrl}`,
  };
}

export function deriveLayerStyles(sourceId: string): { circleLayer: LayerProps; lineLayer: LayerProps } {
  return {
    circleLayer: {
      id:`${sourceId}-circle-layer`,
      source: sourceId,
      'source-layer': mapConfig.sourceLayerName,
      type: 'circle',
      //@TODO: style
      "paint": {
        "circle-color":  "#377eb8",
        "circle-radius": 2
      }
    },
    lineLayer: {
      id:`${sourceId}-line-layer`,
      source: sourceId,
      'source-layer': mapConfig.sourceLayerName,
      type: 'line',
      //@TODO: style
      "paint": {
        "line-color":  "#377eb8"
      }
    },
  };
}

export async function fetchModels(): Promise<ModelGroupMetadata[]> {
  try {
    const { data } = await api.get('model/');
    // @TODO return models as it is. Returning lcoe and mini grids until data getting ingested.
    return [data.results[0], data.results[2]];
  } catch(e) {
    console.error(e);
    throw new Error('failed to fetch models');
  }
}

export async function fetchModelMetadata(slug: string): Promise<ApiModelResponse> {
  try {
    const { data } = await api.get(`model/${slug}/`);
    return data;
  } catch(e) {
    console.error(e);
    throw new Error('failed to fetch model metadata for model ID: ' + slug);
  }
}

export async function fetchVectors(): Promise<ApiVectorResult[]> {
  try {
    const { data } = await api.get('vector/');
    return data.results;
  } catch(e) {
    console.error(e);
    throw new Error('Failed to fetch vectors');
  }
}

interface FilterOptionsResponseString {
  key: string;
  type: 'string';
  count: number;
  values: Record<string, number>;
}

interface FilterOptionsResponseNumeric {
  key: string;
  type: 'numeric';
  count: number;
  min: number;
  max: number;
  sum: number;
}

export async function fetchFilterOptions(scenarioId: string | number, column: string): Promise<string[] | number[] | null> {
  try {
    const { data, status } = await api.get(`scenario/${scenarioId}/summary/${column}/`);
    if (status !== 200) {
      console.warn(`fetchFilterOptions: ${column} returned status ${status}, using fallback`);
      return [];
    }
    if (data.type === 'numeric') {
      return [Math.floor(data.min), Math.ceil(data.max)];
    }
    return Object.keys(data.values);
  } catch(e) {
    console.warn(`fetchFilterOptions: ${column} failed, using fallback`, e);
    return [];
  }
}

// Transform model metadata - give source definition to scenario
export function transformModelCore(apiModel: ApiModelResponse): Omit<ModelMetadata, 'filters' | 'layers'> & { filterFields: ApiFilterField[]; colorCoding: ColorCoding[] } {
  const modelId = String(apiModel.id);

  const scenarios: Scenario[] = apiModel.scenarios
    // @TODO: Filtering LCOE model until performance improvement
    .filter(s => s.id !== 1)
    .filter(s => s.model_file !== null)
    .map(s => ({
      id: String(s.id),
      label: s.name,
      source: deriveSource(String(s.id), s.model_file!),
      layer: {
        id: `${s.id}-main`,
        source: String(s.id),
        'source-layer': mapConfig.sourceLayerName,
        type: 'fill' as const,
      },
    }));

  const mainColumn = apiModel.visualization_column;
  const mainField = apiModel.filter_fields.find(f => f.column === mainColumn);

  const main: Main = {
    id: slugify(mainColumn) + 'main-ids',
    column: mainColumn,
    label: mainField?.label || mainColumn,
    description: mainField?.description,
    options: [], // Options fetched separately
  };

  return {
    id: modelId,
    title: apiModel.name,
    scenarios,
    main,
    popupFields: apiModel.popup_fields,
    summaryFields: apiModel.summary_fields,
    filterFields: apiModel.filter_fields,
    colorCoding: apiModel.color_coding ?? [],
  };
}

// Transform vectors to layers
export function transformVectorsToLayers(apiVectors: ApiVectorResult[]): Layer[] {
  return apiVectors.map(v => {
    const sourceId = String(v.id);
    return {
      id: sourceId,
      label: v.name,
      description: v.description,
      source: deriveSource(sourceId, v.raw_file),
      ...deriveLayerStyles(sourceId),
    };
  });
}

// Transform filter options response to Filter
export function transformFilterField(
  field: ApiFilterField,
  rawOptions: string[] | number[] | null
): Filter {
  const filterType = deriveFilterType(field.column, rawOptions);
  const options = filterType === 'checkbox' ? transformOptions(rawOptions) : rawOptions;
  return {
    id: slugify(field.column),
    column: field.column,
    label: field.label,
    description: field.description,
    type: filterType,
    options: options
  } as Filter;
}

// Transform main options using color_coding from backend
export function transformMainOptions(
  rawOptions: string[] | number[] | null,
  colorCoding: ColorCoding[]
): MapItemUnit[] {
  if (!Array.isArray(rawOptions)) return [];

  // Find default color (value: "any")
  const defaultColor = colorCoding.find(c => c.value === 'any')?.color;

  // Build color lookup map
  const colorLookup = new Map(
    colorCoding
      .filter(c => c.value && c.value !== 'any' && c.color)
      .map(c => [c.value, c.color])
  );

  return rawOptions.map(opt => ({
    value: String(opt),
    label: makeLabel(String(opt)),
    color: colorLookup.get(String(opt)) ?? defaultColor,
  }));
}

// @TODO: this will need to be filtered by scenario id
export async function getVectorData() {
  const apiVectors = await fetchVectors();
  return apiVectors;
}