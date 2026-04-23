import { type ReactNode } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "@/components/chakra/provider";

vi.mock("@/utils/context/auth", () => ({
  useAuth: () => ({ token: "test-token", isAuthenticated: true }),
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/hooks/use-models", () => ({
  useModels: () => ({ data: [{ id: "1", name: "Model A" }] }),
}));

vi.mock("@/utils/data-transformation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/utils/data-transformation")>()),
  fetchVectors: vi.fn().mockRejectedValue(new Error("Network error")),
  fetchReferences: vi.fn().mockRejectedValue(new Error("Network error")),
}));

vi.mock("@/utils/map/cog", () => ({
  fetchRasters: vi.fn().mockRejectedValue(new Error("Network error")),
}));

import { DownloadList } from "@/app/downloads/download-list";

const makeWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <Provider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
};

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});

describe("DownloadList error state", () => {
  it("shows error message when dataset fetches fail", async () => {
    render(<DownloadList />, { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(screen.getByText("downloads.loadError")).toBeInTheDocument();
    });
  });

  it("does not show any dataset cards when errored", async () => {
    render(<DownloadList />, { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(screen.getByText("downloads.loadError")).toBeInTheDocument();
    });

    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});
