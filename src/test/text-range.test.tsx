import { type ReactNode } from "react";
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { Provider } from "@/components/chakra/provider";
import TextRange from "@/components/ui/filters/text-range";

// jsdom doesn't provide ResizeObserver, which Chakra's Slider needs
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const ComponentWrapper = ({ children }: { children: ReactNode }) => (
  <Provider>
    <NuqsTestingAdapter>{children}</NuqsTestingAdapter>
  </Provider>
);

describe("TextRange component", () => {
  beforeEach(cleanup);

  it("should allow typing values greater than 9999 when range is 3 to 300000", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ComponentWrapper>
        <TextRange
          title="Test Range"
          min={3}
          max={300000}
          value={[3, 300000]}
          onChange={onChange}
        />
      </ComponentWrapper>
    );

    const minInput = document.getElementById("Test Range-min-text") as HTMLInputElement;
    expect(minInput).toBeInTheDocument();

    await user.clear(minInput);
    await user.type(minInput, "10000");

    expect(minInput.value).toBe("10,000");
  });

  it("should call onChange with updated value when min input is blurred", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ComponentWrapper>
        <TextRange
          title="Test Range"
          min={3}
          max={300000}
          value={[3, 300000]}
          onChange={onChange}
        />
      </ComponentWrapper>
    );

    const minInput = document.getElementById("Test Range-min-text") as HTMLInputElement;

    await user.clear(minInput);
    await user.type(minInput, "100");
    await user.tab(); // triggers blur

    expect(onChange).toHaveBeenCalledWith({ value: [100, 300000] });
  });

  it("should call onChange with updated value when max input is blurred", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ComponentWrapper>
        <TextRange
          title="Test Range"
          min={3}
          max={300000}
          value={[3, 300000]}
          onChange={onChange}
        />
      </ComponentWrapper>
    );

    const maxInput = document.getElementById("Test Range-max-text") as HTMLInputElement;

    await user.clear(maxInput);
    await user.type(maxInput, "5000");
    await user.tab(); // triggers blur

    expect(onChange).toHaveBeenCalledWith({ value: [3, 5000] });
  });
});
