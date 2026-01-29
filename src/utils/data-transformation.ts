import fs from 'fs';
import { Filter, FilterOptionValues, FilterType, ModelMetadata, ModelGroupMetadata, MapItemUnit, Scenario, Layer, Main } from '@/app/types';
import mapConfig from '@/config/map.json';
import colormap from '@/config/colormap';

const API_ENDPOINT = 'https://proenergia-staging.ds.io/api/v1/';
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
  scenarios: ApiScenario[];
  main_column?: string; // TODO: Backend needs to provide this
}

export interface ApiVectorResult {
  id: number;
  name: string;
  description: string;
  raw_file: string;
  geometry_type?: 'point' | 'line' | 'polygon'; // TODO: Backend needs to provide this
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
    if (typeof opt === 'string') {
      return {
        value: opt,
        label: makeLabel(opt),
        color: colorLookup?.get(opt) ?? null,
      };
    }
    return opt;
  });
}

export function deriveSource(id: string, filePath: string) {
  const pmtilesUrl = filePath.replace(/\.[^.]+$/, '.pmtiles');
  return {
    id,
    type: 'vector' as const,
    minzoom: mapConfig.minZom, // Note: typo in config file
    maxzoom: mapConfig.maxZoom,
    url: `pmtiles://${pmtilesUrl}`,
  };
}

export function geometryTypeToLayerType(geometryType?: string): 'fill' | 'line' | 'circle' {
  switch (geometryType) {
    case 'point': return 'circle';
    case 'line': return 'line';
    case 'polygon':
    default: return 'fill';
  }
}

// ----- Data Fetching -----
export async function fetchModels(): Promise<ModelGroupMetadata[]> {
  const res = await fetch(`${API_ENDPOINT}model/`);
  const json = await res.json();
  if (!res.ok) throw new Error('Failed to fetch models');
  return json.results;
}

export async function fetchModelMetadata(slug: string): Promise<ApiModelResponse> {
  const res = await fetch(`${API_ENDPOINT}model/${slug}/`);
  if (!res.ok) throw new Error('Failed to fetch model metadata');
  return res.json();
}

export async function fetchVectors(): Promise<ApiVectorsResponse> {
  const res = await fetch(`${API_ENDPOINT}vector/`);
  if (!res.ok) throw new Error('Failed to fetch vectors');
  return res.json();
}

export async function fetchFilterOptions(modelId: string, column: string): Promise<FilterOptionValues> {
  // @TODO: use actual endpoint: /mock/${modelId}/filters/${column}.json
  try {
    const filePath = `${process.cwd()}/public/mock/${modelId}/filters/${column}.json`;
    const file = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(file);
  } catch {
    throw Error('No matching filter found');
  }
}

export function getColormap(column: string): Array<{ value: string; color: string }> | null {
  return colormap[column as keyof typeof colormap] ?? null;
}

// ----- Transformation -----
export async function transformToModelMetadata(
  apiModel: ApiModelResponse,
  apiVectors: ApiVectorsResponse
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
        source: String(s.id),
        'source-layer': mapConfig.sourceLayerName,
        type: 'fill' as const,
      },
    }));

  // Transform filters with options fetched in parallel
  const filtersWithOptions = await Promise.all(
    apiModel.filter_fields.map(async (f): Promise<Filter> => {
      const rawOptions = await fetchFilterOptions(modelId, f.column);
      const filterType = deriveFilterType(f.column, rawOptions);
      const options = filterType === 'checkbox'? transformOptions(rawOptions): rawOptions;
      return {
        id: slugify(f.column),
        column: f.column,
        label: f.label,
        description: f.description,
        type: filterType,
        options: options
      } as Filter;
    })
  );

  // TODO: main_column should come from backend; using first non-admin filter as fallback
  const mainColumn = 'Technology2030';

  const mainField = filtersWithOptions.find(f => f.column === mainColumn);
  const mainOptions = await fetchFilterOptions(modelId, mainColumn);
  const mainColormap = getColormap(mainColumn);

  const main: Main = {
    id: slugify(mainColumn),
    column: mainColumn,
    label: mainField?.label || mainColumn,
    description: mainField?.description,
    options: transformOptions(mainOptions, mainColormap),
  };

  // Transform layers from vectors
  const layers: Layer[] = apiVectors.results.map(v => {
    const layerType = geometryTypeToLayerType(v.geometry_type);
    return {
      id: String(v.id),
      label: v.name,
      description: v.description,
      source: deriveSource(String(v.id), v.raw_file),
      layer: {
        source: String(v.id),
        'source-layer': mapConfig.sourceLayerName,
        type: layerType,
      },
    };
  });

  return {
    id: modelId,
    title: apiModel.name,
    scenarios,
    main,
    filters: filtersWithOptions,
    layers,
  };
}
