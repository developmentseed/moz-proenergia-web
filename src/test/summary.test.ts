import { describe, it, expect } from "vitest";
import { transformFieldSummary, isNestedGrouped } from "../utils/summary";
import type { BatchSummariesResponse, FlatRow, GroupRow, ChartRow, NestedGroupRow, NestedChartRow } from "@/app/types/summary";
import type { Field } from "@/app/types";

import oneColumnString from "./example-responses/one-column-string.json";
import twoColumnsNumeric from "./example-responses/two-columns-numeric.json";
import twoColumnsGroupby from "./example-responses/two-columns-groupby.json";
// import twoColumnsNumericString from "./example-responses/twol-columns-numeric-string.json";
import twoColumnsNumericStringGroupby from "./example-responses/two-columns-numeric-string-groupby.json";
import groupByCountZero from "./example-responses/group-by-count-zero.json";
import multiGroupBy from "./example-responses/multi-group-by.json";

// ── Response shape cases ────────────────────────────────────────────

describe("transformFieldSummary — response shapes", () => {
  it("Input: single column, type: string, no group_by // Output: GroupRow with value distribution", () => {
    const field: Field = { columns: ["MGCapacityBins"], label: "Capacity Bins" };
    const result = transformFieldSummary(
      oneColumnString as BatchSummariesResponse,
      field,
    );
    expect(result.type).toBe("group");
    const group = result as GroupRow;
    expect(group.value).toEqual([
      { key: "0-50", label: "0-50", value: 1597 },
      { key: "100-200", label: "100-200", value: 120 },
      { key: "50-100", label: "50-100", value: 454 },
      { key: ">200", label: ">200", value: 26 },
    ]);
  });

  it("Input: two columns, numeric, no group_by, method sum // Output: GroupRow with per-column sum", () => {
    const field: Field = {
      columns: ["NewHHConnectionsTotal", "travel_time_cities_h"],
      label: "Stats",
      method: "sum",
    };
    const result = transformFieldSummary(
      twoColumnsNumeric as BatchSummariesResponse,
      field,
    );
    expect(result.type).toBe("group");
    const group = result as GroupRow;
    expect(group.value).toHaveLength(2);
    expect(group.value[0]).toEqual({
      key: "NewHHConnectionsTotal",
      label: "NewHHConnectionsTotal",
      value: 439089.7747,
    });
    expect(group.value[1]).toEqual({
      key: "travel_time_cities_h",
      label: "travel_time_cities_h",
      value: 10741.6,
    });
  });

  // This case should not happen irl - but what should we do if this happens?
  // it("Input: two columns, numeric, with group_by // Output: GroupRow with top-level aggregates", () => {
  //   const field: Field = {
  //     columns: ["NewHHConnectionsTotal", "travel_time_cities_h"],
  //     label: "Stats",
  //     method: "sum",
  //     group_by: "MGCapacityBins",
  //   };
  //   const result = transformFieldSummary(
  //     twoColumnsGroupby as BatchSummariesResponse,
  //     field,
  //   );
  //   expect(result.type).toBe("group");
  //   const group = result as GroupRow;
  //   expect(group.value).toHaveLength(2);
  //   expect(group.value[0].value).toBe(439089.7747);
  //   expect(group.value[1].value).toBe(10741.6);
  // });
// This case should not happen irl - but what should we do if this happens?
  // it("Input: two columns, numeric + string, no group_by // Output: GroupRow (sum for numeric, count for string)", () => {
  //   const field: Field = {
  //     columns: ["MGInvestmentDistTotal", "MGCapacityBins"],
  //     label: "Mixed",
  //     method: "sum",
  //   };
  //   const result = transformFieldSummary(
  //     twoColumnsNumericString as BatchSummariesResponse,
  //     field,
  //   );
  //   expect(result.type).toBe("group");
  //   const group = result as GroupRow;
  //   expect(group.value[0].value).toBe(370762788.28038);
  //   // string column uses count
  //   expect(group.value[1].value).toBe(2197);
  // });

  // This case should not happen irl - but what should we do if this happens?
  it("two columns, numeric + string, with group_by → GroupRow with top-level aggregates", () => {
    const field: Field = {
      columns: ["MGInvestmentDistTotal", "MGCapacityBins"],
      label: "Mixed",
      method: "sum",
      group_by: "MGCapacityBins",
    };
    const result = transformFieldSummary(
      twoColumnsNumericStringGroupby as BatchSummariesResponse,
      field,
    );
    expect(result.type).toBe("group");
    const group = result as GroupRow;
    expect(group.value[0].value).toBe(370762788.28038);
    expect(group.value[1].value).toBe(2197);
  });

  it("Intput: single column, numeric, with group_by, count-zero groups // Output: zero for null groups", () => {
    const field: Field = {
      columns: ["LCOETotal"],
      label: "LCOE",
      method: "sum",
      group_by: "Technology2030",
    };
    const result = transformFieldSummary(
      groupByCountZero as BatchSummariesResponse,
      field,
    );
    expect(result.type).toBe("group");
    const group = result as GroupRow;
    const miniGridPV = group.value.find((v) => v.key === "MiniGrid_PV");
    expect(miniGridPV?.value).toBe(21.4107);
    // Zero-count groups should return 0, not null or NaN
    const existingGrid = group.value.find((v) => v.key === "ExistingGrid");
    expect(existingGrid?.value).toBe(0);
    const gridExtension = group.value.find(
      (v) => v.key === "GridExtension",
    );
    expect(gridExtension?.value).toBe(0);
    const shs = group.value.find((v) => v.key === "SHS");
    expect(shs?.value).toBe(0);
  });

  it("Input: single column, numeric, no group_by // Output: FlatRow", () => {
    const field: Field = {
      columns: ["NewHHConnectionsTotal"],
      label: "HH Connections",
      method: "sum",
      unit: "connections",
    };
    const result = transformFieldSummary(
      twoColumnsNumeric as BatchSummariesResponse,
      field,
    );
    expect(result.type).toBe("flat");
    const flat = result as FlatRow;
    expect(flat.value).toBe(439089.7747);
    expect(flat.unit).toBe("connections");
  });

  it("Input: single column, numeric, with group_by // Output: GroupRow with per-group stats", () => {
    const field: Field = {
      columns: ["NewHHConnectionsTotal"],
      label: "HH Connections",
      method: "sum",
      group_by: "MGCapacityBins",
    };
    const result = transformFieldSummary(
      twoColumnsGroupby as BatchSummariesResponse,
      field,
    );
    expect(result.type).toBe("group");
    const group = result as GroupRow;
    expect(group.value).toHaveLength(4);
    expect(group.value.find((v) => v.key === "0-50")?.value).toBe(210291.391);
    expect(group.value.find((v) => v.key === ">200")?.value).toBe(31885.6579);
  });

  it("Input: single column, string, with group_by // Output: GroupRow with per-group counts", () => {
    const field: Field = {
      columns: ["MGCapacityBins"],
      label: "Capacity Bins",
      group_by: "MGCapacityBins",
    };
    const result = transformFieldSummary(
      twoColumnsNumericStringGroupby as BatchSummariesResponse,
      field,
    );
    expect(result.type).toBe("group");
    const group = result as GroupRow;
    expect(group.value).toHaveLength(4);
    expect(group.value.find((v) => v.key === "0-50")?.value).toBe(1597);
    expect(group.value.find((v) => v.key === ">200")?.value).toBe(26);
  });
});

// ── Method cases ────────────────────────────────────────────────────

describe("transformFieldSummary — method variants", () => {
  it("method=sum uses sum value", () => {
    const field: Field = {
      columns: ["NewHHConnectionsTotal"],
      label: "HH",
      method: "sum",
    };
    const result = transformFieldSummary(
      twoColumnsNumeric as BatchSummariesResponse,
      field,
    ) as FlatRow;
    expect(result.value).toBe(439089.7747);
  });

  it("method=average computes sum / count", () => {
    const field: Field = {
      columns: ["NewHHConnectionsTotal"],
      label: "HH",
      method: "average",
    };
    const result = transformFieldSummary(
      twoColumnsNumeric as BatchSummariesResponse,
      field,
    ) as FlatRow;
    expect(result.value).toBeCloseTo(439089.7747 / 2197);
  });

  it("method=min uses min value", () => {
    const field: Field = {
      columns: ["NewHHConnectionsTotal"],
      label: "HH",
      method: "min",
    };
    const result = transformFieldSummary(
      twoColumnsNumeric as BatchSummariesResponse,
      field,
    ) as FlatRow;
    expect(result.value).toBe(0.1952);
  });

  it("method=max uses max value", () => {
    const field: Field = {
      columns: ["NewHHConnectionsTotal"],
      label: "HH",
      method: "max",
    };
    const result = transformFieldSummary(
      twoColumnsNumeric as BatchSummariesResponse,
      field,
    ) as FlatRow;
    expect(result.value).toBe(2368.6628);
  });

  it("method=average with group_by computes per-group average", () => {
    const field: Field = {
      columns: ["NewHHConnectionsTotal"],
      label: "HH",
      method: "average",
      group_by: "MGCapacityBins",
    };
    const result = transformFieldSummary(
      twoColumnsGroupby as BatchSummariesResponse,
      field,
    ) as GroupRow;
    const group050 = result.value.find((v) => v.key === "0-50");
    // 210291.391 / 1597
    expect(group050?.value).toBeCloseTo(210291.391 / 1597);
    const group100200 = result.value.find((v) => v.key === "100-200");
    // 67392.2084 / 120
    expect(group100200?.value).toBeCloseTo(67392.2084 / 120);
  });

  it("method=average with group_by and count-zero returns 0 (not NaN)", () => {
    const field: Field = {
      columns: ["LCOETotal"],
      label: "LCOE",
      method: "average",
      group_by: "Technology2030",
    };
    const result = transformFieldSummary(
      groupByCountZero as BatchSummariesResponse,
      field,
    ) as GroupRow;
    const miniGridPV = result.value.find((v) => v.key === "MiniGrid_PV");
    expect(miniGridPV?.value).toBeCloseTo(21.4107 / 7);
    // Zero-count groups: average should be 0, not NaN
    const existingGrid = result.value.find((v) => v.key === "ExistingGrid");
    expect(existingGrid?.value).toBe(0);
    expect(Number.isNaN(existingGrid?.value)).toBe(false);
  });
});

// ── Chart cases ─────────────────────────────────────────────────────

describe("transformFieldSummary — chart row output", () => {
  it("Input: single column, string, no group_by, chart=bar // Output: ChartRow", () => {
    const field: Field = { columns: ["MGCapacityBins"], label: "Capacity Bins", chartType: "bar" };
    const result = transformFieldSummary(
      oneColumnString as BatchSummariesResponse,
      field,
    );
    expect(result.type).toBe("chart");
    const chart = result as ChartRow;
    expect(chart.value).toEqual([
      { key: "0-50", label: "0-50", value: 1597 },
      { key: "100-200", label: "100-200", value: 120 },
      { key: "50-100", label: "50-100", value: 454 },
      { key: ">200", label: ">200", value: 26 },
    ]);
  });

  it("Input: single column, numeric, with group_by, chart=bar // Output: ChartRow", () => {
    const field: Field = {
      columns: ["NewHHConnectionsTotal"],
      label: "HH Connections",
      method: "sum",
      group_by: "MGCapacityBins",
      chartType: "bar",
    };
    const result = transformFieldSummary(
      twoColumnsGroupby as BatchSummariesResponse,
      field,
    );
    expect(result.type).toBe("chart");
  });

  it("Input: single column, numeric, without group_by, chart=bar // Output: Ignroe chart, Flat row", () => {
    const field: Field = {
      columns: ["NewHHConnectionsTotal"],
      label: "HH Connections",
      method: "sum",
      chartType: "bar",
    };
    const result = transformFieldSummary(
      twoColumnsNumeric as BatchSummariesResponse,
      field,
    );
    expect(result.type).toBe("flat");
  });

  it("Input: single column, numeric, with group_by, count-zero, chart=bar // Output: ChartRow with 0 for null groups", () => {
    const field: Field = {
      columns: ["LCOETotal"],
      label: "LCOE",
      method: "sum",
      group_by: "Technology2030",
      chartType: "bar",
    };
    const result = transformFieldSummary(
      groupByCountZero as BatchSummariesResponse,
      field,
    );
    expect(result.type).toBe("chart");
    const chart = result as ChartRow;
    expect(chart.value.find((v) => v.key === "MiniGrid_PV")?.value).toBe(21.4107);
    expect(chart.value.find((v) => v.key === "ExistingGrid")?.value).toBe(0);
  });

  it("Input: multi-column, numeric, chart=bar // Output: ChartRow", () => {
    const field: Field = {
      columns: ["NewHHConnectionsTotal", "travel_time_cities_h"],
      label: "Stats",
      method: "sum",
      chartType: "bar",
    };
    const result = transformFieldSummary(
      twoColumnsNumeric as BatchSummariesResponse,
      field,
    );
    expect(result.type).toBe("chart");
    const chart = result as ChartRow;
    expect(chart.value[0].label).toBe("NewHHConnectionsTotal");
    expect(chart.value[1].label).toBe("travel_time_cities_h");
    expect(chart.value[0].value).toBe(439089.7747); //sum of NewHHConnectionsTotal
    expect(chart.value[1].value).toBe(10741.6); // sum of travel_time_cities_h
  });

  it("Input: without chart field // Output: GroupRow (not ChartRow)", () => {
    const field: Field = { columns: ["MGCapacityBins"], label: "Capacity Bins" };
    const result = transformFieldSummary(
      oneColumnString as BatchSummariesResponse,
      field,
    );
    expect(result.type).toBe("group");
  });
});

// ── Multi group_by cases ──────────────────────────────────────────

describe("isNestedGrouped", () => {
  it("detects single-level grouped (has count at first level)", () => {
    const singleLevel = { "0-50": { count: 1597, min: 0, max: 100, sum: 210291 } };
    expect(isNestedGrouped(singleLevel)).toBe(false);
  });

  it("detects two-level nested grouped", () => {
    const nested = {
      "ExistingGrid": {
        "Cabo Delgado": { count: 347, min: 4.9, max: 340273, sum: 2407733 },
      },
    };
    expect(isNestedGrouped(nested)).toBe(true);
  });

  it("returns false for empty object", () => {
    expect(isNestedGrouped({})).toBe(false);
  });
});

describe("transformFieldSummary — multi group_by", () => {
  it("single column, numeric, multi group_by → NestedGroupRow", () => {
    const field: Field = {
      columns: ["Pop2030"],
      label: "Population 2030",
      method: "sum",
      group_by: ["Technology2030", "Admin_1"],
    };
    const result = transformFieldSummary(
      multiGroupBy as BatchSummariesResponse,
      field,
    );
    expect(result.type).toBe("nested-group");
    const nested = result as NestedGroupRow;

    // Should have 4 L1 groups
    expect(nested.value).toHaveLength(4);
    const l1Keys = nested.value.map((g) => g.key);
    expect(l1Keys).toContain("ExistingGrid");
    expect(l1Keys).toContain("GridExtension");
    expect(l1Keys).toContain("MiniGrid_PV");
    expect(l1Keys).toContain("SHS");

    // ExistingGrid should have 10 L2 items (provinces)
    const existingGrid = nested.value.find((g) => g.key === "ExistingGrid")!;
    expect(existingGrid.items).toHaveLength(10);

    // Check a specific L2 value
    const caboDelgado = existingGrid.items.find((i) => i.key === "Cabo Delgado");
    expect(caboDelgado?.value).toBe(2407733.747);

    // Total should be sum of all L2 items
    expect(existingGrid.total).toBeCloseTo(24554622.6654, 1);
  });

  it("single column, numeric, multi group_by, chart=bar → NestedChartRow (pie)", () => {
    const field: Field = {
      columns: ["Pop2030"],
      label: "Population 2030",
      method: "sum",
      group_by: ["Technology2030", "Admin_1"],
      chartType: "bar",
    };
    const result = transformFieldSummary(
      multiGroupBy as BatchSummariesResponse,
      field,
    );
    expect(result.type).toBe("nested-chart");
    const nested = result as NestedChartRow;
    expect(nested.chartType).toBe("pie");
    expect(nested.value).toHaveLength(4);
  });

  it("single column, numeric, single group_by still produces GroupRow (not NestedGroupRow)", () => {
    const field: Field = {
      columns: ["NewHHConnectionsTotal"],
      label: "HH Connections",
      method: "sum",
      group_by: ["MGCapacityBins"],
    };
    const result = transformFieldSummary(
      twoColumnsGroupby as BatchSummariesResponse,
      field,
    );
    // Single-level grouped should still produce GroupRow
    expect(result.type).toBe("group");
  });
});

// ── bucketFieldsByGroupBy ───────────────────────────────────────────

import { bucketFieldsByGroupBy } from "@/hooks/use-summary-query";

describe("bucketFieldsByGroupBy", () => {
  it("all fields with no group_by → single bucket with empty groupBy", () => {
    const fields: Field[] = [
      { columns: ["Pop2030"], label: "Population", method: "sum" },
      { columns: ["HHConnections"], label: "Connections", method: "sum" },
    ];
    const buckets = bucketFieldsByGroupBy(fields);
    expect(buckets).toHaveLength(1);
    expect(buckets[0].groupBy).toEqual([]);
    expect(buckets[0].fields).toHaveLength(2);
    expect(buckets[0].columns).toEqual(["Pop2030", "HHConnections"]);
  });

  it("all fields with same group_by → single bucket", () => {
    const fields: Field[] = [
      { columns: ["Pop2030"], label: "Pop", method: "sum", group_by: ["Tech"] },
      { columns: ["HH"], label: "HH", method: "sum", group_by: ["Tech"] },
    ];
    const buckets = bucketFieldsByGroupBy(fields);
    expect(buckets).toHaveLength(1);
    expect(buckets[0].groupBy).toEqual(["Tech"]);
    expect(buckets[0].fields).toHaveLength(2);
    expect(buckets[0].columns).toEqual(["Pop2030", "HH"]);
  });

  it("no-group-by fields merge into first grouped bucket", () => {
    const fields: Field[] = [
      { columns: ["Pop2030"], label: "Pop", method: "sum" },
      { columns: ["HH"], label: "HH", method: "sum", group_by: ["Tech"] },
    ];
    const buckets = bucketFieldsByGroupBy(fields);
    expect(buckets).toHaveLength(1);
    expect(buckets[0].groupBy).toEqual(["Tech"]);
    // no-group-by field is prepended
    expect(buckets[0].fields[0].label).toBe("Pop");
    expect(buckets[0].fields[1].label).toBe("HH");
    expect(buckets[0].columns).toEqual(["Pop2030", "HH"]);
  });

  it("different single group_by values → separate buckets", () => {
    const fields: Field[] = [
      { columns: ["Pop2030"], label: "Pop", method: "sum", group_by: ["Tech"] },
      { columns: ["HH"], label: "HH", method: "sum", group_by: ["Admin"] },
    ];
    const buckets = bucketFieldsByGroupBy(fields);
    expect(buckets).toHaveLength(2);
    expect(buckets[0].groupBy).toEqual(["Tech"]);
    expect(buckets[0].columns).toEqual(["Pop2030"]);
    expect(buckets[1].groupBy).toEqual(["Admin"]);
    expect(buckets[1].columns).toEqual(["HH"]);
  });

  it("no-group-by fields merge into first bucket when multiple group_by values exist", () => {
    const fields: Field[] = [
      { columns: ["Total"], label: "Total", method: "sum" },
      { columns: ["Pop2030"], label: "Pop", method: "sum", group_by: ["Tech"] },
      { columns: ["HH"], label: "HH", method: "sum", group_by: ["Admin"] },
    ];
    const buckets = bucketFieldsByGroupBy(fields);
    expect(buckets).toHaveLength(2);
    // no-group-by merged into first bucket
    expect(buckets[0].fields).toHaveLength(2);
    expect(buckets[0].fields[0].label).toBe("Total");
    expect(buckets[0].fields[1].label).toBe("Pop");
    expect(buckets[0].groupBy).toEqual(["Tech"]);
    expect(buckets[1].groupBy).toEqual(["Admin"]);
  });

  it("single group_by and multi group_by → separate buckets", () => {
    const fields: Field[] = [
      { columns: ["Pop2030"], label: "Pop", method: "sum", group_by: ["Tech"] },
      { columns: ["HH"], label: "HH", method: "sum", group_by: ["Tech", "Admin"] },
    ];
    const buckets = bucketFieldsByGroupBy(fields);
    expect(buckets).toHaveLength(2);
    expect(buckets[0].groupBy).toEqual(["Tech"]);
    expect(buckets[1].groupBy).toEqual(["Tech", "Admin"]);
  });

  it("same multi group_by in different order → same bucket (sorted key)", () => {
    const fields: Field[] = [
      { columns: ["Pop2030"], label: "Pop", method: "sum", group_by: ["Admin", "Tech"] },
      { columns: ["HH"], label: "HH", method: "sum", group_by: ["Tech", "Admin"] },
    ];
    const buckets = bucketFieldsByGroupBy(fields);
    expect(buckets).toHaveLength(1);
    expect(buckets[0].fields).toHaveLength(2);
    expect(buckets[0].columns).toEqual(["Pop2030", "HH"]);
  });

  it("empty fields array → empty buckets", () => {
    const buckets = bucketFieldsByGroupBy([]);
    expect(buckets).toHaveLength(0);
  });
});
