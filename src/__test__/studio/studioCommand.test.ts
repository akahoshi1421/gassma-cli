import { afterEach, describe, expect, it, vi } from "vitest";
import { openBrowser } from "../../studio/openBrowser";
import { resolveStudioUrl } from "../../studio/resolveStudioUrl";
import { studioCommand } from "../../studio/studioCommand";

vi.mock("../../studio/resolveStudioUrl");
vi.mock("../../studio/openBrowser");

const URL = "https://docs.google.com/spreadsheets/d/abc123/edit";

describe("studioCommand", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should print the resolved URL and open the browser", async () => {
    vi.mocked(resolveStudioUrl).mockReturnValue(URL);
    vi.mocked(openBrowser).mockResolvedValue(undefined);
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    await studioCommand();

    expect(log).toHaveBeenCalledWith(`🚀 Opening ${URL}`);
    expect(openBrowser).toHaveBeenCalledWith(URL);
  });
});
