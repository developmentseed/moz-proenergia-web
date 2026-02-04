import { LayerProps } from "react-map-gl/maplibre";
import { Filter, FilterType, ModelMetadata, ModelGroupMetadata, MapItemUnit, Scenario, Layer, Main } from '@/app/types';
import { api, MEDIA_URL_PREFIX } from '@/utils/api';
import mapConfig from '@/config/map.json';
import colormap from '@/config/colormap';
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

export interface ApiModelResponse {
  id: number;
  name: string;
  filter_fields: ApiFilterField[];
  popup_fields: ApiFilterField[];
  summary_fields: ApiFilterField[];
  scenarios: ApiScenario[];
  visualization_column: string;
  main_column?: string; // TODO: Backend needs to provide this
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
        "circle-color":  "#377eb8"
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

export function getColormap(column: string): Array<{ value: string; color: string }> | null {
  return colormap[column as keyof typeof colormap] ?? null;
}

// ----- Transformation -----
export async function transformToModelMetadata(
  apiModel: ApiModelResponse,
  apiVectors: ApiVectorResult[]
): Promise<ModelMetadata> {
  const modelId = String(apiModel.id);

  // Transform scenarios
  const scenarios: Scenario[] = apiModel.scenarios
    .filter(s => s.model_file !== null)
    .map(s => ({
      id: String(s.id),
      label: s.name,
      source: deriveSource(String(s.id), s.model_file!),
      layer: {
        id:`${s.id}-main`,
        source: String(s.id),
        'source-layer': mapConfig.sourceLayerName,
        type: 'fill' as const,
      },
    }));

  // @TODO: use the first sceanrio id. Hardcoded 3 for now while summary endpoint is not stable.
  const defaultScenarioId = scenarios[0]?.id;
  if (!defaultScenarioId) {
    throw new Error('Model has no scenarios with valid model files');
  }

  // Transform filters with options fetched in parallel
  const filtersWithOptions = await Promise.all(
    apiModel.filter_fields.map(async (f): Promise<Filter> => {
      const rawOptions = await fetchFilterOptions(defaultScenarioId, f.column);
      const filterType = deriveFilterType(f.column, rawOptions);
      const options = filterType === 'checkbox' ? transformOptions(rawOptions) : rawOptions;
      return {
        id: f.column,
        column: f.column,
        label: f.label,
        description: f.description,
        type: filterType,
        options: options
      } as Filter;
    })
  );

  // TODO: main_column should come from backend; using first non-admin filter as fallback
  const mainColumn = apiModel.visualization_column;//'Technology2030';

  const mainField = filtersWithOptions.find(f => f.column === mainColumn);
  // Return empty options if there is no visualization column defined.
  const mainOptions =(!mainField)? await fetchFilterOptions(defaultScenarioId, mainColumn): [];
  const mainColormap = getColormap(mainColumn);

  const main: Main = {
    id: slugify(mainColumn) + 'main-ids',
    column: mainColumn,
    label: mainField?.label || mainColumn,
    description: mainField?.description,
    options: transformOptions(mainOptions, mainColormap),
  };

  // Transform layers from vectors with both circle and line styles
  const layers: Layer[] = apiVectors.map(v => {
    const sourceId = String(v.id);
    return {
      id: sourceId,
      label: v.name,
      description: v.description,
      source: deriveSource(sourceId, v.raw_file),
      ...deriveLayerStyles(sourceId),
    };
  });

  return {
    id: modelId,
    title: apiModel.name,
    scenarios,
    main,
    filters: filtersWithOptions,
    layers,
    popupFields: apiModel.popup_fields,
    summaryFields: apiModel.summary_fields
  };
}

export async function getModelData(slug: string) {
  const [apiModel, apiVectors] = await Promise.all([
    fetchModelMetadata(slug),
    fetchVectors(),
  ]);
  return transformToModelMetadata(apiModel, apiVectors);
}

// @TODO: this will need to be filtered by scenario id
export async function getVectorData() {
  const apiVectors = await fetchVectors();
  return apiVectors;
}