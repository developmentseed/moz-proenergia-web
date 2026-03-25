// ----- API response types -----

export interface NumericGroupStats {
  count: number;
  min: number | null;
  max: number | null;
  sum: number | null;
}

export type StringGroupStats = { count: number; values: Record<string, number> };

export interface BatchSummaryNumeric {
  type: "numeric";
  count: number;
  min: number | null;
  max: number | null;
  sum: number | null;
  grouped?: Record<string, NumericGroupStats | Record<string, NumericGroupStats>>;
}

export interface BatchSummaryString {
  type: "string";
  count: number;
  values: Record<string, number>;
  grouped?: Record<string, StringGroupStats | Record<string, StringGroupStats>>;
}

export type BatchFieldSummary = BatchSummaryNumeric | BatchSummaryString;

export interface BatchSummariesResponse {
  scenario_id: number;
  filters_applied: string;
  summaries: Record<string, BatchFieldSummary>;
  group_by?: string[];
}

// ----- Row types -----

export interface SummaryItem {
  key: string;
  label: string;
  value: number | string;
  [x: string]: string | number;
}

export interface FlatRow {
  type: "flat";
  label: string;
  key: string;
  description?: string;
  category?: string;
  unit?: string;
  value: number | string;
}

export interface GroupRow {
  type: "group";
  label: string;
  description?: string;
  category?: string;
  unit?: string;
  value: SummaryItem[];
  methodTotal?: SummaryItem;
}

export interface ChartRow {
  type: "chart";
  chartType: "bar" | "donut" | "stacked";
  label: string;
  description?: string;
  category?: string;
  unit?: string;
  value: SummaryItem[];
  average?: number;
  colorMap?: Record<string, string>;
  methodTotal?: SummaryItem;
}

export interface ErrorRow {
  type: "error";
  label: string;
  key: string;
  category?: string;
}

export interface NestedGroupData {
  key: string;
  label: string;
  total: number;
  items: SummaryItem[];
}

export interface NestedGroupRow {
  type: "nested-group";
  label: string;
  description?: string;
  category?: string;
  unit?: string;
  value: NestedGroupData[];
  methodTotal?: SummaryItem;
}

export interface HighlightRow {
  type: "highlight";
  label: string;
  description?: string;
  category?: string;
  unit?: string;
  value: SummaryItem[];
  methodTotal?: SummaryItem;
}

export type SummaryRow = FlatRow | GroupRow | ChartRow | ErrorRow | NestedGroupRow | HighlightRow;
export type SummaryData = SummaryRow[];