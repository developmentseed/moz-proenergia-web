import { type Field } from "@/app/types";
import { type SummaryItem, type GroupRow, type ChartRow, type BatchSummariesResponse, type SummaryRow, type NumericGroupStats } from "@/app/types/summary";
const DEFAULT_METHOD = "sum";

function makeGroupOrChartRow(
  field: Field,
  items: SummaryItem[],
): GroupRow | ChartRow {
  if (field.chart) {
    const numericValues = items
      .map((item) => item.value)
      .filter((v): v is number => typeof v === "number");
    const average =
      numericValues.length > 0
        ? numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length
        : undefined;
    return {
      type: "chart",
      chartType: field.chart,
      label: field.label,
      description: field.description,
      unit: field.unit,
      value: items,
      average,
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

function getNumericValue(stats: NumericGroupStats, method: NonNullable<Field["method"]>): number {
  if (stats.count === 0) return 0;
  if (method === "average") return stats.sum! / stats.count;
  return stats[method] ?? 0;
}

export function transformFieldSummary(
  response: BatchSummariesResponse,
  field: Field,
): SummaryRow {
  const methodName = field.method || DEFAULT_METHOD;

  if (field.columns.length > 1 && field.group_by) console.warn("Multiple columns + groupby case, might result in unexected values");
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
    return makeGroupOrChartRow(field, items);
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
      return makeGroupOrChartRow(field, Object.entries(summary.grouped).map(([key, stats]) => ({
        key,
        label: key,
        value: getNumericValue(stats, methodName),
      })));
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
    return makeGroupOrChartRow(field, Object.entries(summary.grouped).map(([key, group]) => ({
      key,
      label: key,
      // Only count is avaiable for string type columns grouped
      value: group.count,
    })));
  }

  // String type — value distribution
  return makeGroupOrChartRow(field, Object.entries(summary.values).map(([key, count]) => ({
    key,
    label: key,
    value: count,
  })));
}
