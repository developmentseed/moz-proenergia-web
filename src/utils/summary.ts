import { type Field } from "@/app/types";

// ----- API response types -----

export interface NumericGroupStats {
  count: number;
  min: number;
  max: number;
  sum: number;
}

export interface BatchSummaryNumeric {
  type: "numeric";
  count: number;
  min: number;
  max: number;
  sum: number;
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
  group_by?: string;
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

export interface ErrorRow {
  type: "error";
  label: string;
  key: string;
}

export type SummaryRow = FlatRow | GroupRow | ErrorRow;
export type SummaryData = SummaryRow[];

// ----- Transformation -----

const DEFAULT_METHOD = "sum";

function getNumericValue(stats: NumericGroupStats, method: NonNullable<Field["method"]>): number {
  if (method === "average") return stats.sum / stats.count;
  return stats[method] ?? stats[DEFAULT_METHOD];
}

export function transformFieldSummary(
  response: BatchSummariesResponse,
  field: Field,
): SummaryRow {
  const methodName = field.method || "sum";

  // Multi-column → always GroupRow, one sub-row per column
  if (field.columns.length > 1) {
    const items: SummaryItem[] = field.columns.map((col) => {
      const summary = response.summaries[col];
      if (!summary || summary.count === 0) {
        return { key: col, label: col, value: 0 };
      }
      const value =
        summary.type === "numeric"
          ? getNumericValue(summary, methodName)
          : summary.count;
      return { key: col, label: col, value };
    });
    return {
      type: "group",
      label: field.label,
      description: field.description,
      unit: field.unit,
      value: items,
    };
  }

  // Single column
  const column = field.columns[0];
  const summary = response.summaries[column];

  if (!summary || summary.count === 0) {
    return {
      type: "flat",
      key: column,
      label: `${field.label} (Total)`,
      description: field.description,
      value: 0,
      unit: field.unit,
    };
  }

  if (summary.type === "numeric") {
    if (summary.grouped) {
      return {
        type: "group",
        label: field.label,
        description: field.description,
        unit: field.unit,
        value: Object.entries(summary.grouped).map(([key, stats]) => ({
          key,
          label: key,
          value: getNumericValue(stats, methodName),
        })),
      };
    }
    return {
      type: "flat",
      key: column,
      label: `${field.label} (Total)`,
      description: field.description,
      value: getNumericValue(summary, methodName),
      unit: field.unit,
    };
  }

  // String type → GroupRow with value distribution
  return {
    type: "group",
    label: field.label,
    description: field.description,
    unit: field.unit,
    value: Object.entries(summary.values).map(([key, count]) => ({
      key,
      label: key,
      value: count,
    })),
  };
}
