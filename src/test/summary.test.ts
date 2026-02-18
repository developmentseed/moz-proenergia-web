import { describe, it, expect } from "vitest";
import {
  transformFieldSummary,
  type BatchSummariesResponse,
  type FlatRow,
  type GroupRow,
} from "../utils/summary";
import type { Field } from "@/app/types";

import oneColumnString from "./example-responses/one-column-string.json";
import twoColumnsNumeric from "./example-responses/two-columns-numeric.json";
import twoColumnsGroupby from "./example-responses/two-columns-groupby.json";
import twoColumnsNumericString from "./example-responses/twol-columns-numeric-string.json";
import twoColumnsNumericStringGroupby from "./example-responses/two-columns-numeric-string-groupby.json";
import groupByCountZero from "./example-responses/group-by-count-zero.json";

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
