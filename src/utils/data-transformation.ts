import { LayerProps } from "react-map-gl/maplibre";
import { interpolateWarm } from 'd3-scale-chromatic';
import { Filter, FilterType, ModelMetadata, ModelGroupMetadata, Field, MapItemUnit, Scenario, Layer, Main } from '@/app/types';
import { api, MEDIA_URL_PREFIX, DEFAULT_COL } from '@/utils/api';
import { sortFilterOptions } from '@/config/filters';
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
  summary_fields: Field[];
  scenarios: ApiScenario[];
  visualization_column: string | null; // for main column
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
  color?: string;
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
    // maxzoom: mapConfig.maxZoom,
    url: `pmtiles://${MEDIA_URL_PREFIX}${pmtilesUrl}`,
  };
}

export function deriveLayerStyles(sourceId: string, color: string): { circleLayer: LayerProps; lineLayer: LayerProps, polygonLayer:LayerProps } {
  return {
    circleLayer: {
      id:`${sourceId}-circle-layer`,
      source: sourceId,
      'source-layer': mapConfig.sourceLayerName,
      type: 'circle',
      paint: {
        "circle-color": color,
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 2, 10, 5, 15, 6],
        "circle-opacity": 0.8,
        "circle-stroke-color": "#fff",
        "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 5, 0, 10, 0.5, 15, 1],
      },
      filter: ["==", ["geometry-type"], "Point"],
    },
    lineLayer: {
      id:`${sourceId}-line-layer`,
      source: sourceId,
      'source-layer': mapConfig.sourceLayerName,
      type: 'line',
      paint: {
        "line-color": color,
        "line-width": ["interpolate", ["linear"], ["zoom"], 5, 0.5, 10, 1.5, 15, 3],
        "line-opacity": 0.8,
      },
      filter: ["==", ["geometry-type"], "LineString"],
    },
    polygonLayer: {
      id:`${sourceId}-polygon-layer`,
      source: sourceId,
      'source-layer': mapConfig.sourceLayerName,
      type: 'fill',
      paint: {
        "fill-color": color,
        "fill-opacity": ["interpolate", ["linear"], ["zoom"], 5, 0.3, 10, 0.5, 15, 0.7],
        "fill-outline-color": color,
      },
      filter: ["==", ["geometry-type"], "Polygon"]
    },
  };
}

export async function fetchModels(signal?: AbortSignal): Promise<ModelGroupMetadata[]> {
  try {
    const { data } = await api.get('model/', { signal });
    // @TODO return models as it is. Returning lcoe and mini grids until data getting ingested.
    return data.results;
  } catch(e) {
    console.error(e);
    throw new Error('failed to fetch models');
  }
}

export async function fetchModelMetadata(slug: string, signal?: AbortSignal): Promise<ApiModelResponse> {
  try {
    const { data } = await api.get(`model/${slug}/`, { signal });
    return data;
  } catch(e) {
    console.error(e);
    throw new Error('failed to fetch model metadata for model ID: ' + slug);
  }
}

export async function fetchVectors({ modelId, token, signal }: { modelId?: string, token?: string | null, signal?: AbortSignal} = {}): Promise<ApiVectorResult[]> {
  try {
    const endpoint = `vector/`;
    const { data } = await api.get(endpoint, {
      signal,
      ...(token && {
        headers: { 'Authorization': `Token ${token}` }
      }),
      ...(modelId && {
        params: { 'model': modelId }
      })
    });
    const results: ApiVectorResult[] = data.results;

    return results.map((v, idx) => ({
      ...v,
      // @TODO would this come from endpoint at some point?
      color: interpolateWarm(idx / results.length),
    }));
  } catch(e) {
    console.error(e);
    throw new Error('Failed to fetch vectors');
  }
}

export async function fetchAllFilterOptions(
  scenarioId: string | number,
  columns: string[],
  signal?: AbortSignal,
): Promise<Record<string, string[] | number[] | null>> {
  try {
    const fields = columns.join(',');
    const { data, status } = await api.get(
      `scenario/${scenarioId}/summaries/`,
      { signal, params: { fields } },
    );
    if (status !== 200) {
      console.warn(`fetchAllFilterOptions: returned status ${status}, using fallback`);
      return Object.fromEntries(columns.map(c => [c, []]));
    }
    const result: Record<string, string[] | number[] | null> = {};
    for (const column of columns) {
      const summary = data.summaries?.[column];
      if (!summary) {
        result[column] = [];
      } else if (summary.type === 'numeric') {
        result[column] = [Math.floor(summary.min), Math.ceil(summary.max)];
      } else {
        result[column] = sortFilterOptions(Object.keys(summary.values));
      }
    }
    return result;
  } catch(e) {
    console.warn(`fetchAllFilterOptions failed, using fallback`, e);
    return Object.fromEntries(columns.map(c => [c, []]));
  }
}

// Replace 'id' in summary field columns with the main visualization column
export function replaceSummaryIdColumn(fields: Field[], mainColumn: string): Field[] {
  return fields.map(f => {
    const groupBy = typeof f.group_by === 'string' ? [f.group_by] : f.group_by;
    const idField = f.columns.includes('id');
    if (idField) {
      const newFields = [...f.columns.filter(c => c !== 'id'), mainColumn];
      return { ...f, columns: newFields, group_by: groupBy };
    }
    return groupBy !== f.group_by ? { ...f, group_by: groupBy } : f;
  });
}

// Transform model metadata - give source definition to scenario
export function transformModelCore(apiModel: ApiModelResponse): Omit<ModelMetadata, 'filters' | 'layers'> & { filterFields: ApiFilterField[]; colorCoding: ColorCoding[] } {
  const modelId = String(apiModel.id);

  const scenarios: Scenario[] = apiModel.scenarios
    // @TODO: Filtering LCOE model until performance improvement
    // .filter(s => s.id !== 1)
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
  // whwen visuaslization column is empty or null
  const mainColumn = (!apiModel.visualization_column || apiModel.visualization_column === '')? DEFAULT_COL: apiModel.visualization_column;
  const mainField = apiModel.filter_fields.find(f => f.column === mainColumn);
  const filedNameToReplace = apiModel.popup_fields[1].column;

  //@NOTE: ID column should be replaced to something else to make summary work
  const summaryFields = replaceSummaryIdColumn(apiModel.summary_fields, filedNameToReplace);

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
    popupFields: apiModel.popup_fields.map(f => ({
      columns: [f.column],
      label: f.label,
      description: f.description,
    })),
    summaryFields: summaryFields,
    filterFields: apiModel.filter_fields,
    colorCoding: apiModel.color_coding ?? [],
  };
}

// Transform vectors to layers
export function transformVectorsToLayers(apiVectors: ApiVectorResult[]): Layer[] {
  return apiVectors.map(v => {
    const sourceId = String(v.id) + 'vector-source';
    return {
      id: sourceId,
      label: v.name,
      description: v.description,
      filePath: v.raw_file,
      color: v.color,
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
  rawOptions: MapItemUnit[] | null,
  colorCoding: ColorCoding[]
): MapItemUnit[] {

  if (!Array.isArray(rawOptions)) return [];

  // Find default color (value: "any")
  const defaultColor = colorCoding.find(c => c.value === DEFAULT_COL)?.color;
  // When options are missing (ex. no column to visualize)
  if (rawOptions.length === 0) {
    return [{
      value: DEFAULT_COL,
      label: DEFAULT_COL,
      color: defaultColor,
    }];
  }
  // Build color lookup map
  const colorLookup = new Map(
    colorCoding
      .filter(c => c.value && c.color)
      .map(c => [c.value, c.color])
  );

  return rawOptions.map(opt => ({
    value: String(opt.value),
    label: opt.label,
    color: colorLookup.get(String(opt.value)) ?? defaultColor,
  }));
}
