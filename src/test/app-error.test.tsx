import { type ReactNode } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { Provider } from "@/components/chakra/provider";
import { I18nProvider } from "@/i18n/provider";
import i18n from "@/i18n/config";
import AppError from "@/app/error";

vi.mock("@/components/localized-link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <NuqsTestingAdapter>
    <Provider>
      <I18nProvider>{children}</I18nProvider>
    </Provider>
  </NuqsTestingAdapter>
);

beforeEach(() => {
  i18n.changeLanguage("en");
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});

describe("AppError page", () => {
  it("renders the error message", () => {
    render(
      <Wrapper>
        <AppError error={new Error("Something broke")} reset={() => {}} />
      </Wrapper>
    );
    expect(screen.getByText("Something broke")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
  });

  it("renders a fallback message when error has no message", () => {
    const err = new Error("");
    render(
      <Wrapper>
        <AppError error={err} reset={() => {}} />
      </Wrapper>
    );
    expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
  });

  it("calls reset when Try again is clicked", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(
      <Wrapper>
        <AppError error={new Error("oops")} reset={reset} />
      </Wrapper>
    );
    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalledOnce();
  });

  it("logs the error on mount", () => {
    render(
      <Wrapper>
        <AppError error={new Error("logged")} reset={() => {}} />
      </Wrapper>
    );
    expect(console.error).toHaveBeenCalledWith(expect.objectContaining({ message: "logged" }));
  });

  it("has a link back to home", () => {
    render(
      <Wrapper>
        <AppError error={new Error("oops")} reset={() => {}} />
      </Wrapper>
    );
    expect(screen.getByRole("link", { name: /return to home/i })).toHaveAttribute("href", "/");
  });
});
