// ----- API response types -----

export interface NumericGroupStats {
  count: number;
  min: number | null;
  max: number | null;
  sum: number | null;
}

export interface BatchSummaryNumeric {
  type: "numeric";
  count: number;
  min: number | null;
  max: number | null;
  sum: number | null;
  grouped?: Record<string, NumericGroupStats>;
}

export interface BatchSummaryString {
  type: "string";
  count: number;
  values: Record<string, number>;
  grouped?: Record<string, { count: number; values: Record<string, number> }>;
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
}

export interface FlatRow {
  type: "flat";
  label: string;
  key: string;
  description?: string;
  unit?: string;
  value: number | string;
}

export interface GroupRow {
  type: "group";
  label: string;
  description?: string;
  unit?: string;
  value: SummaryItem[];
}

export interface ChartRow {
  type: "chart";
  label: string;
  description?: string;
  unit?: string;
  value: SummaryItem[];
}

export interface ErrorRow {
  type: "error";
  label: string;
  key: string;
}

export type SummaryRow = FlatRow | GroupRow | ChartRow | ErrorRow;
export type SummaryData = SummaryRow[];