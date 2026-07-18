import { afterEach, describe, expect, it, vi } from "vitest";

const openMock = vi.hoisted(() => vi.fn(async () => undefined));

vi.mock("open", () => ({ default: openMock }));

import { openBrowser } from "../../studio/openBrowser";

const URL = "https://docs.google.com/spreadsheets/d/abc123/edit";

describe("openBrowser", () => {
  afterEach(() => {
    openMock.mockClear();
  });

  it("should call open once with the resolved url", async () => {
    await openBrowser(URL);

    expect(openMock).toHaveBeenCalledTimes(1);
    expect(openMock).toHaveBeenCalledWith(URL);
  });
});
