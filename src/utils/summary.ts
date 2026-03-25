import { type Field } from "@/app/types";
import { makeLabel } from "./data-transformation";
import { type SummaryItem, type GroupRow, type ChartRow, type HighlightRow, type NestedGroupRow, type NestedChartRow, type NestedGroupData, type BatchSummariesResponse, type SummaryRow, type NumericGroupStats } from "@/app/types/summary";
const DEFAULT_METHOD = "sum";

function makeGroupOrChartRow(
  field: Field,
  items: SummaryItem[],
  mainColorMap?: Record<string, string>,
  mainColumn?: string,
  methodTotal?: SummaryItem,
): GroupRow | ChartRow | HighlightRow {
  if (field.chartType === "highlight") {
    return {
      type: "highlight",
      label: field.label,
      description: field.description,
      unit: field.unit,
      value: items,
      methodTotal,
    };
  }
  if (field.chartType) {
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
      chartType: field.chartType,
      label: makeLabel(field.label),
      description: field.description,
      unit: field.unit,
      value: items,
      average,
      colorMap,
      methodTotal,
    };
  }
  return {
    type: "group",
    label: makeLabel(field.label),
    description: field.description,
    unit: field.unit,
    value: items,
    methodTotal,
  };
}

function makeNestedGroupOrChartRow(
  field: Field,
  groups: NestedGroupData[],
  methodTotal?: SummaryItem,
): NestedGroupRow | NestedChartRow {
  if (field.chartType) {
    return {
      type: "nested-chart",
      chartType: "pie",
      label: makeLabel(field.label),
      description: field.description,
      unit: field.unit,
      value: groups,
      methodTotal,
    };
  }
  return {
    type: "nested-group",
    label: makeLabel(field.label),
    description: field.description,
    unit: field.unit,
    value: groups,
    methodTotal,
  };
}

function getNumericValue(stats: NumericGroupStats, method: NonNullable<Field["method"]>): number {
  if (stats.count === 0) return 0;
  if (method === "average") return stats.sum! / stats.count;
  return stats[method] ?? 0;
}

function aggregateItems(items: SummaryItem[], method: NonNullable<Field["method"]>): number {
  const values = items.map((item) => (typeof item.value === "number" ? item.value : 0));
  if (values.length === 0) return 0;
  switch (method) {
    case "sum":
    case "count":
      return values.reduce((a, b) => a + b, 0);
    case "min":
      return Math.min(...values);
    case "max":
      return Math.max(...values);
    case "average":
      return values.reduce((a, b) => a + b, 0) / values.length;
  }
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
        return { key: col, label: makeLabel(col), value: 0 };
      }
      const value =
        summary.type === "numeric"
          ? getNumericValue(summary, methodName)
          : summary.count;
      return { key: col, label: makeLabel(col), value };
    });
    const methodTotal: SummaryItem = { key: methodName, label: makeLabel(methodName), value: aggregateItems(items, methodName) };
    return makeGroupOrChartRow(field, items, mainColorMap, mainColumn, methodTotal);
  }

  // Single column
  const column = field.columns[0];
  const summary = response.summaries[column];

  if (!summary || summary.count === 0) {
    return {
      type: "flat",
      key: column,
      label: field.label,
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
            label: makeLabel(l2Key),
            value: getNumericValue(stats, methodName),
          }));
          const total = items.reduce((sum, item) => sum + (typeof item.value === "number" ? item.value : 0), 0);
          return { key: l1Key, label: makeLabel(l1Key), total, items };
        });
        const methodTotal: SummaryItem = { key: methodName, label: makeLabel(methodName), value: getNumericValue(summary, methodName) };
        return makeNestedGroupOrChartRow(field, groups, methodTotal);
      }

      // Single-level grouping
      const singleGrouped = summary.grouped as Record<string, NumericGroupStats>;
      const methodTotal: SummaryItem = { key: methodName, label: makeLabel(methodName), value: getNumericValue(summary, methodName) };
      return makeGroupOrChartRow(field, Object.entries(singleGrouped).map(([key, stats]) => ({
        key,
        label: makeLabel(key),
        value: getNumericValue(stats, methodName),
      })), mainColorMap, mainColumn, methodTotal);
    }

    if (field.chartType === "highlight") {
      return {
        type: "highlight",
        label: field.label,
        description: field.description,
        unit: field.unit,
        value: [{ key: column, label: makeLabel(column), value: getNumericValue(summary, methodName) }],
      };
    }

    return {
      type: "flat",
      key: column,
      label: makeLabel(field.label),
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
          label: makeLabel(l2Key),
          value: group.count,
        }));
        const total = items.reduce((sum, item) => sum + (typeof item.value === "number" ? item.value : 0), 0);
        return { key: l1Key, label: makeLabel(l1Key), total, items };
      });
      const methodTotal: SummaryItem = { key: methodName, label: makeLabel(methodName), value: summary.count };
      return makeNestedGroupOrChartRow(field, groups, methodTotal);
    }

    // Single-level grouping
    type SingleStringGroup = { count: number; values: Record<string, number> };
    const singleGrouped = summary.grouped as Record<string, SingleStringGroup>;
    const methodTotal: SummaryItem = { key: methodName, label: makeLabel(methodName), value: summary.count };
    return makeGroupOrChartRow(field, Object.entries(singleGrouped).map(([key, group]) => ({
      key,
      label: key,
      // Only count is avaiable for string type columns grouped
      value: group.count,
    })), mainColorMap, mainColumn, methodTotal);
  }

  // String type — value distribution
  const methodTotal: SummaryItem = { key: methodName, label: makeLabel(methodName), value: summary.count };
  return makeGroupOrChartRow(field, Object.entries(summary.values).map(([key, count]) => ({
    key,
    label: key,
    value: count,
  })), mainColorMap, mainColumn, methodTotal);
}
