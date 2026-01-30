import { type ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { FilterControl } from "@/components/ui/filters/filter-control";

import { Provider } from "@/components/chakra/provider";
import { mockModel } from "./mock-data";

// Wrapper for component render (includes Chakra)
const ComponentWrapper = ({ children }: { children: ReactNode }) => (
  <Provider>
    <NuqsTestingAdapter>{children}</NuqsTestingAdapter>
  </Provider>
);

describe("FilterControl component triggers correct filter updates", () => {
  beforeEach(cleanup);
  it("should call onChange with new value when checkbox is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const checkboxFilter = mockModel.filters.find((f) => f.id === "energy_type")!;

    render(
      <ComponentWrapper>
        <FilterControl
          config={checkboxFilter}
          value={["1", "2", "3"]}
          onChange={onChange}
        />
      </ComponentWrapper>
    );

    // Click Solar checkbox to uncheck it
    const solarCheckbox = screen.getByLabelText("Solar");
    await user.click(solarCheckbox);

    expect(onChange).toHaveBeenCalledWith(["2", "3"]);
  });
});