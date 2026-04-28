import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Provide a real-ish localStorage for environments where it isn't available
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
};
vi.stubGlobal("localStorage", localStorageMock);
vi.stubGlobal("window", { location: { pathname: "/model/1", reload: vi.fn() } });

import { handleApiError } from "@/utils/api";

const TOKEN_KEY = "token";
const USERNAME_KEY = "username";

beforeEach(() => {
  localStorageMock.setItem(TOKEN_KEY, "test-token");
  localStorageMock.setItem(USERNAME_KEY, "testuser");
  localStorageMock.setItem(CACHE_KEY, "2026-01-01");
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(localStorageMock.removeItem).mockClear();
});

afterEach(() => {
  localStorageMock.clear();
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

  it("removes all three auth keys from localStorage on 401", async () => {
    await expect(handleApiError(makeError(401))).rejects.toBeDefined();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(TOKEN_KEY);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(USERNAME_KEY);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(CACHE_KEY);
  });

  it("token is gone from storage after 401", async () => {
    await expect(handleApiError(makeError(401))).rejects.toBeDefined();
    expect(localStorageMock.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorageMock.getItem(USERNAME_KEY)).toBeNull();
    expect(localStorageMock.getItem(CACHE_KEY)).toBeNull();
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

  it("does not touch localStorage on 404", async () => {
    await expect(handleApiError(makeError(404))).rejects.toBeDefined();
    expect(localStorageMock.removeItem).not.toHaveBeenCalled();
  });

  it("does not touch localStorage on 500", async () => {
    await expect(handleApiError(makeError(500))).rejects.toBeDefined();
    expect(localStorageMock.removeItem).not.toHaveBeenCalled();
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
