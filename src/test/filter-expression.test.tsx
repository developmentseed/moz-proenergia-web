import { type ReactNode } from "react";
import { describe, it, expect } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { ModelProvider, useModel } from "@/utils/context/model";
import { FiltersProvider, useFilters } from "@/utils/context/filters";
import { buildExpressionWithFilter, buildMatchExpression } from "@/utils/map/filter";
import { DEFAULT_COL } from "@/utils/api";
import { type Main } from "@/app/types";
import { mockModel } from "./mock-data";

// Hook that combines useModel and useFilters for testing
const useModelWithFilters = () => {
  const model = useModel();
  const filters = useFilters();
  return { ...model, ...filters };
};

// Wrapper for renderHook
const createWrapper = () => {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <NuqsTestingAdapter>
        <FiltersProvider filterDefs={mockModel.filters}>
          <ModelProvider model={mockModel}>{children}</ModelProvider>
        </FiltersProvider>
      </NuqsTestingAdapter>
    );
  };
};

describe("Filter to Expression End-to-End", () => {
  describe("useFilters hook with default filters", () => {
    it("should initialize filters with default values", () => {
      const { result } = renderHook(() => useModelWithFilters(), { wrapper: createWrapper() });

      // Numeric filter defaults to full range
      expect(result.current.filters.population).toEqual([0, 1000]);

      // Checkbox filter defaults to all options selected
      expect(result.current.filters.energy_type).toEqual(["1", "2", "3"]);

      // Admin filter defaults to empty (show all)
      expect(result.current.filters.province).toEqual([]);
    });

    it("should build correct initial expression from filters", () => {
      const { result } = renderHook(() => useModelWithFilters(), { wrapper: createWrapper() });

      const expression = buildExpressionWithFilter(
        result.current.model.filters,
        result.current.filters
      );

      expect(expression).toEqual([
        "all",
        [
          "all",
          [">=", ["to-number", ["get", "pop_count"]], 0],
          ["<=", ["to-number", ["get", "pop_count"]], 1000],
        ],
        ["in", ["get", "type_id"], ["literal", ["1", "2", "3"]]],
      ]);
    });
  });

  describe("Filter state updates and expression changes", () => {
    it("should update pending filters and build correct expression after apply", async () => {
      const { result } = renderHook(() => useModelWithFilters(), { wrapper: createWrapper() });

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
        [
          "all",
          [">=", ["to-number", ["get", "pop_count"]], 0],
          ["<=", ["to-number", ["get", "pop_count"]], 1000],
        ],
        ["in", ["get", "type_id"], ["literal", ["1", "2"]]],
      ]);
    });

    it("should add admin condition when province is set", async () => {
      const { result } = renderHook(() => useModelWithFilters(), { wrapper: createWrapper() });

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
        [
          "all",
          [">=", ["to-number", ["get", "pop_count"]], 0],
          ["<=", ["to-number", ["get", "pop_count"]], 1000],
        ],
        ["in", ["get", "type_id"], ["literal", ["1", "2", "3"]]],
        ["in", ["get", "admin_name"], ["literal", ["Maputo"]]],
      ]);
    });

    it("should update numeric filter range and build correct expression", async () => {
      const { result } = renderHook(() => useModelWithFilters(), { wrapper: createWrapper() });

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
        [
          "all",
          [">=", ["to-number", ["get", "pop_count"]], 100],
          ["<=", ["to-number", ["get", "pop_count"]], 500],
        ],
        ["in", ["get", "type_id"], ["literal", ["1", "2", "3"]]],
      ]);
    });

    it("should combine multiple filter changes correctly", async () => {
      const { result } = renderHook(() => useModelWithFilters(), { wrapper: createWrapper() });

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
        [
          "all",
          [">=", ["to-number", ["get", "pop_count"]], 200],
          ["<=", ["to-number", ["get", "pop_count"]], 800],
        ],
        ["in", ["get", "type_id"], ["literal", ["2", "3"]]],
        ["in", ["get", "admin_name"], ["literal", ["Gaza", "Inhambane"]]],
      ]);
    });
  });

  describe("Main layer match expression with DEFAULT_COL", () => {
    it("should use ['literal', DEFAULT_COL] when column is DEFAULT_COL", () => {
      const main: Main = {
        id: "main",
        column: DEFAULT_COL,
        label: "Main",
        options: [
          { id: "a", label: "A", color: "#ff0000" },
          { id: "b", label: "B", color: "#00ff00" },
        ],
      };

      expect(buildMatchExpression(main, '#66ff')).toEqual([
        'match',
        ['literal', DEFAULT_COL],
        'a', '#ff0000',
        'b', '#00ff00',
        '#CCCCCC',
      ]);
    });

    it("should use ['get', column] when column is not DEFAULT_COL", () => {
      const main: Main = {
        id: "main",
        column: "technology",
        label: "Main",
        options: [
          { id: "solar", label: "Solar", color: "#ffcc00" },
          { id: "wind", label: "Wind", color: "#0066ff" },
        ],
      };

      expect(buildMatchExpression(main, '#66ff')).toEqual([
        'match',
        ['get', 'technology'],
        'solar', '#ffcc00',
        'wind', '#0066ff',
        '#CCCCCC',
      ]);
    });

    it("should return fallback color when options are empty", () => {
      const main: Main = {
        id: "main",
        column: DEFAULT_COL,
        label: "Main",
        options: [],
      };

      expect(buildMatchExpression(main, '#66ff')).toEqual('#66ff');
    });
  });

  describe("Reset filters", () => {
    it("should reset all filters to defaults", async () => {
      const { result } = renderHook(() => useModelWithFilters(), { wrapper: createWrapper() });

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
