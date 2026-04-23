import { type ReactNode } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { Provider } from "@/components/chakra/provider";

// Mock heavy dependencies that are irrelevant to the error state
vi.mock("@/utils/context/auth", () => ({
  useAuth: () => ({ token: null, isAuthenticated: false }),
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/utils/context/map-coords", () => ({
  useMapCoords: () => ({ coords: { lat: 0, lng: 0, zoom: 5 }, setCoords: vi.fn(), removeCoordinates: vi.fn() }),
  MapCoordsProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/utils/data-transformation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/utils/data-transformation")>()),
  fetchModelMetadata: vi.fn().mockRejectedValue(new Error("404 Not Found")),
  fetchVectors: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/utils/map/cog", () => ({
  fetchRasters: vi.fn().mockResolvedValue([]),
  fetchCogMetadata: vi.fn().mockResolvedValue(null),
  transformRastersToLayers: vi.fn().mockReturnValue([]),
}));

import ExplorerContent from "@/components/ui/explorer";

const makeWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <Provider>
      <QueryClientProvider client={queryClient}>
        <NuqsTestingAdapter>{children}</NuqsTestingAdapter>
      </QueryClientProvider>
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

describe("ExplorerContent error state", () => {
  it("shows error message when modelMetadata fetch fails", async () => {
    render(<ExplorerContent modelId="1" />, { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(screen.getByText("explorer.loadError")).toBeInTheDocument();
    });
  });

  it("shows a return to models link when modelMetadata fetch fails", async () => {
    render(<ExplorerContent modelId="1" />, { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "explorer.returnToModels" })).toHaveAttribute(
        "href",
        "/models"
      );
    });
  });
});
