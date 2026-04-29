import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleApiError } from "@/utils/api";

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

const makeError = (status: number, url = "/test") => ({
  response: { status },
  config: { url },
});

describe("handleApiError (Axios interceptor)", () => {
  it("always rejects the promise", async () => {
    await expect(handleApiError(makeError(404))).rejects.toMatchObject({
      response: { status: 404 },
    });
  });

  it("logs a console error on 500", async () => {
    await expect(handleApiError(makeError(500, "/broken"))).rejects.toBeDefined();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("[API] Server error 500"),
      expect.anything()
    );
  });

  it("logs a console error on 503", async () => {
    await expect(handleApiError(makeError(503, "/unavailable"))).rejects.toBeDefined();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("[API] Server error 503"),
      expect.anything()
    );
  });

  it("does not log on 404", async () => {
    await expect(handleApiError(makeError(404))).rejects.toBeDefined();
    expect(console.error).not.toHaveBeenCalled();
  });

  it("does not log on 401", async () => {
    await expect(handleApiError(makeError(401))).rejects.toBeDefined();
    expect(console.error).not.toHaveBeenCalled();
  });
});
