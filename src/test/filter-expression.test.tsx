import { type ReactNode } from "react";
import { describe, it, expect } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { ModelProvider, useModel } from "@/utils/context/model";
import { buildExpressionWithFilter } from "@/utils/map/filter";
import { mockModel } from "./mock-data";

// Wrapper for renderHook
const createWrapper = () => {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <NuqsTestingAdapter>
        <ModelProvider model={mockModel}>{children}</ModelProvider>
      </NuqsTestingAdapter>
    );
  };
};

describe("Filter to Expression End-to-End", () => {
  describe("useModel hook with default filters", () => {
    it("should initialize filters with default values", () => {
      const { result } = renderHook(() => useModel(), { wrapper: createWrapper() });

      // Numeric filter defaults to full range
      expect(result.current.filters.population).toEqual([0, 1000]);

      // Checkbox filter defaults to all options selected
      expect(result.current.filters.energy_type).toEqual(["1", "2", "3"]);

      // Admin filter defaults to empty (show all)
      expect(result.current.filters.province).toEqual([]);
    });

    it("should build correct initial expression from filters", () => {
      const { result } = renderHook(() => useModel(), { wrapper: createWrapper() });

      const expression = buildExpressionWithFilter(
        result.current.model.filters,
        result.current.filters
      );

      expect(expression).toEqual([
        "all",
        ["all", [">=", ["get", "pop_count"], 0], ["<=", ["get", "pop_count"], 1000]],
        ["in", ["get", "type_id"], ["literal", [1, 2, 3]]],
      ]);
    });
  });

  describe("Filter state updates and expression changes", () => {
    it("should update pending filters and build correct expression after apply", async () => {
      const { result } = renderHook(() => useModel(), { wrapper: createWrapper() });

      // Update pending filters
      act(() => {
        result.current.setPendingFilters({ energy_type: ["1", "2"] }); // Remove Hydro
      });

      // Pending should be in displayFilters but not in filters (URL state)
      expect(result.current.displayFilters.energy_type).toEqual(["1", "2"]);
      expect(result.current.filters.energy_type).toEqual(["1", "2", "3"]); // Still original

      // Apply pending changes
      act(() => {
        result.current.applyPendingChanges();
      });

      // Wait for nuqs to update
      await waitFor(() => {
        expect(result.current.filters.energy_type).toEqual(["1", "2"]);
      });

      // Build expression with new filters
      const expression = buildExpressionWithFilter(
        result.current.model.filters,
        result.current.filters
      );

      expect(expression).toEqual([
        "all",
        ["all", [">=", ["get", "pop_count"], 0], ["<=", ["get", "pop_count"], 1000]],
        ["in", ["get", "type_id"], ["literal", [1, 2]]],
      ]);
    });

    it("should add admin condition when province is set", async () => {
      const { result } = renderHook(() => useModel(), { wrapper: createWrapper() });

      act(() => {
        result.current.setPendingFilters({ province: ["Maputo"] });
      });

      act(() => {
        result.current.applyPendingChanges();
      });

      await waitFor(() => {
        expect(result.current.filters.province).toEqual(["Maputo"]);
      });

      const expression = buildExpressionWithFilter(
        result.current.model.filters,
        result.current.filters
      );

      expect(expression).toEqual([
        "all",
        ["all", [">=", ["get", "pop_count"], 0], ["<=", ["get", "pop_count"], 1000]],
        ["in", ["get", "type_id"], ["literal", [1, 2, 3]]],
        ["in", ["get", "admin_name"], ["literal", ["Maputo"]]],
      ]);
    });

    it("should update numeric filter range and build correct expression", async () => {
      const { result } = renderHook(() => useModel(), { wrapper: createWrapper() });

      act(() => {
        result.current.setPendingFilters({ population: [100, 500] });
      });

      act(() => {
        result.current.applyPendingChanges();
      });

      await waitFor(() => {
        expect(result.current.filters.population).toEqual([100, 500]);
      });

      const expression = buildExpressionWithFilter(
        result.current.model.filters,
        result.current.filters
      );

      expect(expression).toEqual([
        "all",
        ["all", [">=", ["get", "pop_count"], 100], ["<=", ["get", "pop_count"], 500]],
        ["in", ["get", "type_id"], ["literal", [1, 2, 3]]],
      ]);
    });

    it("should combine multiple filter changes correctly", async () => {
      const { result } = renderHook(() => useModel(), { wrapper: createWrapper() });

      act(() => {
        result.current.setPendingFilters({
          population: [200, 800],
          energy_type: ["2", "3"],
          province: ["Gaza", "Inhambane"],
        });
      });

      act(() => {
        result.current.applyPendingChanges();
      });

      await waitFor(() => {
        expect(result.current.filters.population).toEqual([200, 800]);
        expect(result.current.filters.energy_type).toEqual(["2", "3"]);
        expect(result.current.filters.province).toEqual(["Gaza", "Inhambane"]);
      });

      const expression = buildExpressionWithFilter(
        result.current.model.filters,
        result.current.filters
      );

      expect(expression).toEqual([
        "all",
        ["all", [">=", ["get", "pop_count"], 200], ["<=", ["get", "pop_count"], 800]],
        ["in", ["get", "type_id"], ["literal", [2, 3]]],
        ["in", ["get", "admin_name"], ["literal", ["Gaza", "Inhambane"]]],
      ]);
    });
  });

  describe("Reset filters", () => {
    it("should reset all filters to defaults", async () => {
      const { result } = renderHook(() => useModel(), { wrapper: createWrapper() });

      // First, change some filters
      act(() => {
        result.current.setPendingFilters({
          population: [100, 500],
          energy_type: ["1"],
          province: ["Maputo"],
        });
      });

      act(() => {
        result.current.applyPendingChanges();
      });

      // Wait for filters to be applied
      await waitFor(() => {
        expect(result.current.filters.population).toEqual([100, 500]);
      });

      // Reset
      act(() => {
        result.current.resetAllFilters();
      });

      // Wait for reset to take effect
      await waitFor(() => {
        expect(result.current.filters.population).toEqual([0, 1000]);
      });

      expect(result.current.filters.energy_type).toEqual(["1", "2", "3"]);
      expect(result.current.filters.province).toEqual([]);
    });
  });
});
