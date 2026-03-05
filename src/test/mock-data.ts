import { type ModelMetadata, FilterType } from "@/app/types";

// Mock model with various filter types for testing
export const mockModel: ModelMetadata = {
  id: "test-model",
  title: "Test Model",
  scenarios: [
    {
      id: "baseline",
      label: "Baseline",
      source: { type: "vector", url: "test.pmtiles" },
      layer: { source: "test", "source-layer": "data", type: "fill" },
    },
  ],
  main: {
    id: "main",
    column: "main_col",
    label: "Main",
    options: [{ id: "a", label: "A", color: "#000" }],
  },
  filters: [
    {
      id: "population",
      column: "pop_count",
      label: "Population",
      type: FilterType.numeric,
      options: [0, 1000] as [number, number],
    },
    {
      id: "energy_type",
      column: "type_id",
      label: "Energy Type",
      type: FilterType.checkbox,
      options: [
        { id: "1", label: "Solar" },
        { id: "2", label: "Wind" },
        { id: "3", label: "Hydro" },
      ],
    },
    {
      id: "province",
      column: "admin_name",
      label: "Province",
      type: FilterType.admin,
      options: ["Maputo", "Gaza", "Inhambane"],
    },
  ],
  popupFields: [],
  summaryFields: [],
};
