import { type ReactNode } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { Provider } from "@/components/chakra/provider";
import { I18nProvider } from "@/i18n/provider";
import i18n from "@/i18n/config";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const Wrapper = ({ children }: { children: ReactNode }) => (
  <NuqsTestingAdapter>
    <Provider>
      <I18nProvider>{children}</I18nProvider>
    </Provider>
  </NuqsTestingAdapter>
);

// Component that throws on render
const Bomb = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error("Boom");
  return <div>OK</div>;
};

// Suppress jsdom console.error noise from intentional throws
beforeEach(() => {
  i18n.changeLanguage("en");
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});

describe("ErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <Wrapper>
        <ErrorBoundary>
          <div>healthy content</div>
        </ErrorBoundary>
      </Wrapper>
    );
    expect(screen.getByText("healthy content")).toBeInTheDocument();
  });

  it("shows error message when child throws", () => {
    render(
      <Wrapper>
        <ErrorBoundary>
          <Bomb shouldThrow />
        </ErrorBoundary>
      </Wrapper>
    );
    expect(screen.getByText("Boom")).toBeInTheDocument();
  });

  it("shows custom fallback when provided", () => {
    render(
      <Wrapper>
        <ErrorBoundary fallback={<div>custom fallback</div>}>
          <Bomb shouldThrow />
        </ErrorBoundary>
      </Wrapper>
    );
    expect(screen.getByText("custom fallback")).toBeInTheDocument();
    expect(screen.queryByText("Boom")).not.toBeInTheDocument();
  });

  it("resets and re-renders children after clicking Try again", async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <Wrapper>
        <ErrorBoundary>
          <Bomb shouldThrow />
        </ErrorBoundary>
      </Wrapper>
    );

    expect(screen.getByText("Boom")).toBeInTheDocument();

    // Update children so they won't re-throw when the boundary resets
    rerender(
      <Wrapper>
        <ErrorBoundary>
          <Bomb shouldThrow={false} />
        </ErrorBoundary>
      </Wrapper>
    );

    await user.click(screen.getByRole("button", { name: /try again/i }));

    expect(screen.getByText("OK")).toBeInTheDocument();
    expect(screen.queryByText("Boom")).not.toBeInTheDocument();
  });

  it("independent boundaries: one crash does not affect the other", () => {
    render(
      <Wrapper>
        <ErrorBoundary>
          <Bomb shouldThrow />
        </ErrorBoundary>
        <ErrorBoundary>
          <div>sibling ok</div>
        </ErrorBoundary>
      </Wrapper>
    );
    expect(screen.getByText("Boom")).toBeInTheDocument();
    expect(screen.getByText("sibling ok")).toBeInTheDocument();
  });
});
