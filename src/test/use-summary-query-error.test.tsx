import { type ReactNode } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/utils/api", () => ({
  api: { get: vi.fn() },
}));

vi.mock("@/utils/query-string-builder", () => ({
  buildFilterQueryParam: vi.fn(() => ""),
}));

import { useSummaryQuery } from "@/hooks/use-summary-query";
import { api } from "@/utils/api";
import type { Field } from "@/app/types";

const mockGet = api.get as ReturnType<typeof vi.fn>;

const makeWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const fields: Field[] = [
  { columns: ["PopStartYear"], label: "Population", method: "sum" },
];

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});

describe("useSummaryQuery isError", () => {
  it("returns isError=false while loading", () => {
    mockGet.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(
      () => useSummaryQuery({ scenarioId: "s1", summaryFields: fields }),
      { wrapper: makeWrapper() }
    );

    expect(result.current.isError).toBe(false);
    expect(result.current.isLoading).toBe(true);
  });

  it("returns isError=true when all queries fail", async () => {
    mockGet.mockRejectedValue(new Error("500"));

    const { result } = renderHook(
      () => useSummaryQuery({ scenarioId: "s1", summaryFields: fields }),
      { wrapper: makeWrapper() }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isError).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("returns isError=false on success", async () => {
    mockGet.mockResolvedValue({
      data: { PopStartYear: { count: 100, sum: 5000 } },
    });

    const { result } = renderHook(
      () => useSummaryQuery({ scenarioId: "s1", summaryFields: fields }),
      { wrapper: makeWrapper() }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isError).toBe(false);
  });

  it("returns isError=false when disabled", () => {
    const { result } = renderHook(
      () =>
        useSummaryQuery({ scenarioId: "s1", summaryFields: fields, enabled: false }),
      { wrapper: makeWrapper() }
    );

    expect(result.current.isError).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
});
