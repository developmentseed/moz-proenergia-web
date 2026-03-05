import { type Field } from "@/app/types";
import { type SummaryItem, type GroupRow, type ChartRow, type NestedGroupRow, type NestedChartRow, type NestedGroupData, type BatchSummariesResponse, type SummaryRow, type NumericGroupStats } from "@/app/types/summary";
const DEFAULT_METHOD = "sum";

function makeGroupOrChartRow(
  field: Field,
  items: SummaryItem[],
  mainColorMap?: Record<string, string>,
  mainColumn?: string,
): GroupRow | ChartRow {
  if (field.chart) {
    const numericValues = items
      .map((item) => item.value)
      .filter((v): v is number => typeof v === "number");
    const average =
      numericValues.length > 0
        ? numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length
        : undefined;
    const colorMap = field.colors
      ?? (field.group_by && mainColumn && field.group_by.includes(mainColumn) && mainColorMap ? mainColorMap : undefined);
    return {
      type: "chart",
      chartType: field.chart,
      label: field.label,
      description: field.description,
      unit: field.unit,
      value: items,
      average,
      colorMap,
    };
  }
  return {
    type: "group",
    label: field.label,
    description: field.description,
    unit: field.unit,
    value: items,
  };
}

function makeNestedGroupOrChartRow(
  field: Field,
  groups: NestedGroupData[],
): NestedGroupRow | NestedChartRow {
  if (field.chart) {
    return {
      type: "nested-chart",
      chartType: "pie",
      label: field.label,
      description: field.description,
      unit: field.unit,
      value: groups,
    };
  }
  return {
    type: "nested-group",
    label: field.label,
    description: field.description,
    unit: field.unit,
    value: groups,
  };
}

function getNumericValue(stats: NumericGroupStats, method: NonNullable<Field["method"]>): number {
  if (stats.count === 0) return 0;
  if (method === "average") return stats.sum! / stats.count;
  return stats[method] ?? 0;
}

/** Detect if grouped data has two-level nesting (multi group_by) */
export function isNestedGrouped(grouped: Record<string, unknown>): boolean {
  const firstValue = Object.values(grouped)[0];
  return firstValue != null && typeof firstValue === "object" && !("count" in (firstValue as object));
}

export function transformFieldSummary(
  response: BatchSummariesResponse,
  field: Field,
  mainColorMap?: Record<string, string>,
  mainColumn?: string,
): SummaryRow {
  const methodName = field.method || DEFAULT_METHOD;

  // Multi-columns - treat each column as a sub-row of group
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
    return makeGroupOrChartRow(field, items, mainColorMap, mainColumn);
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

    if (field.group_by && summary.grouped) {
      // Two-level nested grouping (multi group_by)
      if (isNestedGrouped(summary.grouped)) {
        const nestedGrouped = summary.grouped as Record<string, Record<string, NumericGroupStats>>;
        const groups: NestedGroupData[] = Object.entries(nestedGrouped).map(([l1Key, l2Map]) => {
          const items: SummaryItem[] = Object.entries(l2Map).map(([l2Key, stats]) => ({
            key: l2Key,
            label: l2Key,
            value: getNumericValue(stats, methodName),
          }));
          const total = items.reduce((sum, item) => sum + (typeof item.value === "number" ? item.value : 0), 0);
          return { key: l1Key, label: l1Key, total, items };
        });
        return makeNestedGroupOrChartRow(field, groups);
      }

      // Single-level grouping
      const singleGrouped = summary.grouped as Record<string, NumericGroupStats>;
      return makeGroupOrChartRow(field, Object.entries(singleGrouped).map(([key, stats]) => ({
        key,
        label: key,
        value: getNumericValue(stats, methodName),
      })), mainColorMap, mainColumn);
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

  // response type string
  // String type with grouped → per-group counts
  if (field.group_by && summary.grouped) {
    // Two-level nested grouping (multi group_by)
    if (isNestedGrouped(summary.grouped)) {
      type StringGroupStats = { count: number; values: Record<string, number> };
      const nestedGrouped = summary.grouped as Record<string, Record<string, StringGroupStats>>;
      const groups: NestedGroupData[] = Object.entries(nestedGrouped).map(([l1Key, l2Map]) => {
        const items: SummaryItem[] = Object.entries(l2Map).map(([l2Key, group]) => ({
          key: l2Key,
          label: l2Key,
          value: group.count,
        }));
        const total = items.reduce((sum, item) => sum + (typeof item.value === "number" ? item.value : 0), 0);
        return { key: l1Key, label: l1Key, total, items };
      });
      return makeNestedGroupOrChartRow(field, groups);
    }

    // Single-level grouping
    type SingleStringGroup = { count: number; values: Record<string, number> };
    const singleGrouped = summary.grouped as Record<string, SingleStringGroup>;
    return makeGroupOrChartRow(field, Object.entries(singleGrouped).map(([key, group]) => ({
      key,
      label: key,
      // Only count is avaiable for string type columns grouped
      value: group.count,
    })), mainColorMap, mainColumn);
  }

  // String type — value distribution
  return makeGroupOrChartRow(field, Object.entries(summary.values).map(([key, count]) => ({
    key,
    label: key,
    value: count,
  })), mainColorMap, mainColumn);
}
